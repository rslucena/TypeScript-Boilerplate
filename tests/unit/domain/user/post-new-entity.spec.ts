import { mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";
import { z } from "zod/v4";

const redisClientMock = createRedisClientMock();
const repositoryMock = createRepositoryMock();
const containerMock = createContainerMock();
const referencesMock = createReferencesMock();

const cacheMock = {
	invalidate: mock(() => Promise.resolve(1)),
	json: {
		get: mock(() => Promise.resolve(null)),
		set: mock(() => Promise.resolve("OK")),
	},
};

mock.module("@infrastructure/cache/actions", () => ({
	__esModule: true,
	default: cacheMock,
}));

mock.module("@infrastructure/cache/connection", () => ({
	__esModule: true,
	default: redisClientMock,
}));

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
	withPagination: mock((qb) => qb),
}));

mock.module("@infrastructure/server/request", () => ({
	__esModule: true,
	container: mock(() => containerMock),
}));

mock.module("@infrastructure/repositories/references", () => ({
	__esModule: true,
	tag: referencesMock.tag,
	hash: referencesMock.hash,
	identifier: { id: mock().mockReturnValue("some-string") },
	pgIndex: mock(() => []),
	zodIdentifier: { id: z.uuid() },
}));

const validId = "123e4567-e89b-12d3-a456-426614174000";

import "@domain/user/schema";
import { beforeEach, describe, expect, it } from "bun:test";

describe("User Domain Actions : postNewEntity", () => {
	let postNewEntity: CallableFunction;

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.body.mockReturnValue({});
		redisClientMock.del.mockClear();
		redisClientMock.scan.mockClear();
		cacheMock.invalidate.mockClear();
		cacheMock.json.get.mockClear();
		cacheMock.json.set.mockClear();
		repositoryMock.insert.mockReturnThis();
		repositoryMock.values.mockReturnThis();
		repositoryMock.onConflictDoNothing.mockReturnThis();
		repositoryMock.returning.mockClear();
		repositoryMock.execute.mockClear();
		redisClientMock.sMembers.mockClear();
		redisClientMock.sAdd.mockClear();
		postNewEntity = (await import("@domain/user/actions/post-new-entity")).default;
	});

	it("should create new user and return it", async () => {
		const userData = { name: "John", lastName: "Doe", email: "john@example.com", password: "password123" };
		containerMock.body.mockReturnValue(userData);
		repositoryMock.returning.mockResolvedValueOnce([{ id: validId }]);
		repositoryMock.execute.mockResolvedValueOnce([{ id: validId, ...userData }]);

		const result = await postNewEntity(containerMock);
		expect(result).toEqual({ id: validId, ...userData });
		expect(repositoryMock.insert).toHaveBeenCalled();
		expect(cacheMock.invalidate).toHaveBeenCalledWith("user");
	});

	it("should throw 409 if conflict (duplicate email)", async () => {
		const userData = { name: "John", lastName: "Doe", email: "john@example.com", password: "password123" };
		containerMock.body.mockReturnValue(userData);
		repositoryMock.returning.mockResolvedValueOnce([]);
		containerMock.conflict.mockReturnValue(new Error("Conflict"));

		expect(postNewEntity(containerMock)).rejects.toThrow("Conflict");
	});

	it("should throw 400 if validation fails", async () => {
		containerMock.body.mockReturnValue({ email: "invalid-email" });

		expect(postNewEntity(containerMock)).rejects.toThrow();
	});
});
