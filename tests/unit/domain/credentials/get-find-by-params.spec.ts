import { mock } from "bun:test";
import { createCredentialsBuilder } from "@tests/builders/credentials.builder";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";

const redisClientMock = createRedisClientMock();
const repositoryMock = createRepositoryMock();
const containerMock = createContainerMock();

mock.module("@infrastructure/cache/actions", () => ({
	__esModule: true,
	default: {
		json: redisClientMock.json,
	},
}));

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
	withPagination: mock(() => ({})),
}));

// Mock both entity and schema to break circular dependency
mock.module("@domain/credentials/entity", () => ({
	__esModule: true,
	default: {
		id: { setName: mock(() => ({})) },
		identityId: { setName: mock(() => ({})) },
		password: { setName: mock(() => ({})) },
		activated: { setName: mock(() => ({})) },
		createdAt: { setName: mock(() => ({})) },
		updatedAt: { setName: mock(() => ({})) },
		deletedAt: { setName: mock(() => ({})) },
	},
}));

mock.module("@domain/credentials/schema", () => ({
	__esModule: true,
	default: {
		actions: {
			read: {
				safeParseAsync: mock((data: unknown) => Promise.resolve({ success: true, data })),
			},
		},
	},
}));

import { beforeEach, describe, expect, it } from "bun:test";

describe("Credentials Domain Actions : getFindByParams", () => {
	let getFindByParams: CallableFunction;
	const credentialData = createCredentialsBuilder();

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.query.mockClear();
		containerMock.notFound.mockClear();
		containerMock.badRequest.mockClear();
		redisClientMock.json.get.mockClear();
		redisClientMock.json.set.mockClear();
		repositoryMock.select.mockClear();

		getFindByParams = (await import("@domain/credentials/actions/get-find-by-params")).default;
	});

	it("should return cached credentials if available", async () => {
		containerMock.query.mockReturnValue({ "req.page": [0, 10] });
		redisClientMock.json.get.mockResolvedValueOnce([credentialData]);

		const result = await getFindByParams(containerMock);

		expect(result).toEqual([credentialData]);
		expect(redisClientMock.json.get).toHaveBeenCalled();
		expect(repositoryMock.select).not.toHaveBeenCalled();
	});

	it("should return credentials from repository if not cached", async () => {
		containerMock.query.mockReturnValue({ "req.page": [0, 10] });
		redisClientMock.json.get.mockResolvedValueOnce(null);

		const dynamicMock = { execute: mock().mockResolvedValueOnce([credentialData]) };
		repositoryMock.select.mockReturnValue({
			from: mock().mockReturnValue({
				where: mock().mockReturnValue({
					orderBy: mock().mockReturnValue({
						$dynamic: mock().mockReturnValue(dynamicMock),
					}),
				}),
			}),
		});

		const result = await getFindByParams(containerMock);

		expect(result).toEqual([credentialData]);
		expect(repositoryMock.select).toHaveBeenCalled();
		expect(redisClientMock.json.set).toHaveBeenCalled();
	});

	it("should throw error if no credentials found", async () => {
		containerMock.query.mockReturnValue({ "req.page": [0, 10] });
		redisClientMock.json.get.mockResolvedValueOnce(null);

		const dynamicMock = { execute: mock().mockResolvedValueOnce([]) };
		repositoryMock.select.mockReturnValue({
			from: mock().mockReturnValue({
				where: mock().mockReturnValue({
					orderBy: mock().mockReturnValue({
						$dynamic: mock().mockReturnValue(dynamicMock),
					}),
				}),
			}),
		});

		containerMock.notFound.mockReturnValue(new Error("Not Found"));

		expect(getFindByParams(containerMock)).rejects.toThrow("Not Found");
	});
});
