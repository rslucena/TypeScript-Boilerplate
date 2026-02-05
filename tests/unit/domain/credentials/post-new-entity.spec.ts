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

mock.module("@domain/credentials/schema", () => ({
	__esModule: true,
	default: {
		actions: {
			create: {
				safeParseAsync: mock((data: any) => Promise.resolve({ success: true, data })),
			},
			id: {
				safeParseAsync: mock((data: any) => Promise.resolve({ success: true, data })),
			},
			read: {
				safeParseAsync: mock((data: any) => Promise.resolve({ success: true, data })),
			},
		},
	},
}));

import { beforeEach, describe, expect, it } from "bun:test";

describe("Credentials Domain Actions : postNewEntity", () => {
	let postNewEntity: CallableFunction;
	const validId = "550e8400-e29b-41d4-a716-446655440000";
	const credentialData = createCredentialsBuilder({ id: validId });

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.body.mockClear();
		containerMock.badRequest.mockClear();
		containerMock.conflict.mockClear();
		redisClientMock.json.get.mockClear();
		redisClientMock.json.del.mockClear();
		repositoryMock.insert.mockClear();
		repositoryMock.select.mockClear();
		postNewEntity = (await import("@domain/credentials/actions/post-new-entity")).default;
	});

	it("should create new credential and return it", async () => {
		const input = { identityId: credentialData.identityId, password: "strongpassword" };
		containerMock.body.mockReturnValue(input);

		const returningMock = mock().mockResolvedValueOnce([credentialData]);
		const onConflictMock = mock().mockReturnValue({ returning: returningMock });
		const valuesMock = mock().mockReturnValue({ onConflictDoNothing: onConflictMock });
		repositoryMock.insert.mockReturnValue({ values: valuesMock });

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

		const result = await postNewEntity(containerMock);

		expect(result).toEqual([credentialData]);
		expect(repositoryMock.insert).toHaveBeenCalled();
		expect(redisClientMock.json.del).toHaveBeenCalled();
	});

	it("should throw 409 if conflict", async () => {
		const input = { identityId: credentialData.identityId, password: "strongpassword" };
		containerMock.body.mockReturnValue(input);

		const returningMock = mock().mockResolvedValueOnce([]);
		const onConflictMock = mock().mockReturnValue({ returning: returningMock });
		const valuesMock = mock().mockReturnValue({ onConflictDoNothing: onConflictMock });
		repositoryMock.insert.mockReturnValue({ values: valuesMock });

		containerMock.conflict.mockReturnValue(new Error("Conflict"));

		expect(postNewEntity(containerMock)).rejects.toThrow("Conflict");
	});

	it("should throw 400 if validation fails", async () => {
		const { default: schema } = await import("@domain/credentials/schema");
		(schema.actions.create.safeParseAsync as any).mockResolvedValueOnce({ success: false });

		containerMock.body.mockReturnValue({ password: "short" });
		containerMock.badRequest.mockReturnValue(new Error("Bad Request"));

		expect(postNewEntity(containerMock)).rejects.toThrow("Bad Request");
	});
});
