import { mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";

const redisClientMock = createRedisClientMock();
const repositoryMock = createRepositoryMock();
const containerMock = createContainerMock();
const referencesMock = createReferencesMock();

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
	withPagination: mock((qb) => qb),
}));

mock.module("@infrastructure/server/request", () => ({
	__esModule: true,
	container: mock((...args) => {
		const instance = Object.create(containerMock);
		if (args[0]?.params) instance.params = mock().mockReturnValue(args[0].params);
		if (args[0]?.body) instance.body = mock().mockReturnValue(args[0].body);
		return instance;
	}),
}));

mock.module("@infrastructure/repositories/references", () => ({
	__esModule: true,
	tag: referencesMock.tag,
	hash: referencesMock.hash,
	identifier: referencesMock.identifier,
	pgIndex: referencesMock.pgIndex,
	zodIdentifier: referencesMock.zodIdentifier,
}));

const validId = "123e4567-e89b-12d3-a456-426614174000";

import cache from "@infrastructure/cache/actions";
import "@domain/identity/schema";
import { afterEach, beforeEach, describe, expect, it, type Mock, spyOn } from "bun:test";

describe("Identity Domain Actions : postNewEntity", () => {
	let postNewEntity: CallableFunction;
	let mockJsonDel: Mock<any>;

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.body.mockReturnValue({});
		repositoryMock.insert.mockReturnThis();
		repositoryMock.values.mockReturnThis();
		repositoryMock.onConflictDoNothing.mockReturnThis();
		repositoryMock.returning.mockClear();
		repositoryMock.execute.mockClear();

		mockJsonDel = spyOn(cache.json, "del").mockResolvedValue(1);
		spyOn(cache.json, "get").mockResolvedValue(null);
		spyOn(cache.json, "set").mockResolvedValue("");

		postNewEntity = (await import("@domain/identity/actions/post-new-entity")).default;
	});

	afterEach(() => {
		mock.restore();
	});

	it("should create new identity and return it", async () => {
		const identityData = { name: "John", lastName: "Doe", email: "john@example.com" };
		containerMock.body.mockReturnValue(identityData);
		repositoryMock.returning.mockResolvedValueOnce([{ id: validId }]);
		repositoryMock.execute.mockResolvedValueOnce([{ id: validId, ...identityData }]);

		const result = await postNewEntity(containerMock);
		expect(result).toEqual([{ id: validId, ...identityData }]);
		expect(repositoryMock.insert).toHaveBeenCalled();
		expect(mockJsonDel).toHaveBeenCalled();
	});

	it("should throw 409 if conflict (duplicate email)", async () => {
		const identityData = { name: "John", lastName: "Doe", email: "john@example.com" };
		containerMock.body.mockReturnValue(identityData);
		repositoryMock.returning.mockResolvedValueOnce([]);
		containerMock.conflict.mockReturnValue(new Error("Conflict"));

		expect(postNewEntity(containerMock)).rejects.toThrow("Conflict");
	});

	it("should throw 400 if validation fails", async () => {
		containerMock.body.mockReturnValue({ email: "invalid-email" });

		expect(postNewEntity(containerMock)).rejects.toThrow();
	});
});
