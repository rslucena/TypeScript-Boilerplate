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
			id: {
				safeParseAsync: mock((data: unknown) => Promise.resolve({ success: true, data })),
			},
		},
	},
}));

import { beforeEach, describe, expect, it } from "bun:test";

describe("Credentials Domain Actions : getById", () => {
	let getById: CallableFunction;
	const validId = "550e8400-e29b-41d4-a716-446655440000";
	const credentialData = createCredentialsBuilder({ id: validId });

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.params.mockClear();
		containerMock.notFound.mockClear();
		containerMock.badRequest.mockClear();
		redisClientMock.json.get.mockClear();
		redisClientMock.json.set.mockClear();
		repositoryMock.select.mockClear();

		getById = (await import("@domain/credentials/actions/get-by-id")).default;
	});

	it("should return cached credential if available", async () => {
		containerMock.params.mockReturnValue({ id: validId });
		redisClientMock.json.get.mockResolvedValueOnce([credentialData]);

		const result = await getById(containerMock);

		expect(result).toEqual([credentialData]);
		expect(redisClientMock.json.get).toHaveBeenCalled();
		expect(repositoryMock.select).not.toHaveBeenCalled();
	});

	it("should return credential from repository if not cached", async () => {
		containerMock.params.mockReturnValue({ id: validId });
		redisClientMock.json.get.mockResolvedValueOnce(null);

		const prepareMock = { execute: mock().mockResolvedValueOnce([credentialData]) };
		repositoryMock.select.mockReturnValue({
			from: mock().mockReturnValue({
				where: mock().mockReturnValue({
					limit: mock().mockReturnValue({
						orderBy: mock().mockReturnValue({
							prepare: mock().mockReturnValue(prepareMock),
						}),
					}),
				}),
			}),
		});

		const result = await getById(containerMock);

		expect(result).toEqual([credentialData]);
		expect(repositoryMock.select).toHaveBeenCalled();
		expect(redisClientMock.json.set).toHaveBeenCalled();
	});

	it("should throw error if credential not found", async () => {
		containerMock.params.mockReturnValue({ id: validId });
		redisClientMock.json.get.mockResolvedValueOnce(null);

		const prepareMock = { execute: mock().mockResolvedValueOnce([]) };
		repositoryMock.select.mockReturnValue({
			from: mock().mockReturnValue({
				where: mock().mockReturnValue({
					limit: mock().mockReturnValue({
						orderBy: mock().mockReturnValue({
							prepare: mock().mockReturnValue(prepareMock),
						}),
					}),
				}),
			}),
		});

		containerMock.notFound.mockReturnValue(new Error("Not Found"));

		expect(getById(containerMock)).rejects.toThrow("Not Found");
	});
});
