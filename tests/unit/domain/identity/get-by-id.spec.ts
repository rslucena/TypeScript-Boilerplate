import { mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";
import { z } from "zod";

const redisClientMock = createRedisClientMock();
const repositoryMock = createRepositoryMock();
const containerMock = createContainerMock();
const referencesMock = createReferencesMock();

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
	container: mock(() => containerMock),
	authentication: mock(() => ({ create: mock().mockReturnValue("token") })),
}));

mock.module("@infrastructure/repositories/references", () => ({
	tag: referencesMock.tag,
	hash: referencesMock.hash,
	withPagination: referencesMock.withPagination,
	identifier: { id: mock().mockReturnValue("some-string") },
	pgIndex: mock(() => []),
	zodIdentifier: { id: z.string() },
}));

import "@domain/identity/schema";
import { beforeEach, describe, expect, it } from "bun:test";

describe("Identity Domain Actions : getById", () => {
	let getById: CallableFunction;

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.headers.mockClear();
		containerMock.params.mockReturnValue({});
		containerMock.query.mockReturnValue({});
		containerMock.body.mockReturnValue({});
		redisClientMock.get.mockClear();
		redisClientMock.set.mockClear();
		redisClientMock.del.mockClear();
		redisClientMock.scan.mockClear();
		redisClientMock.expire.mockClear();
		redisClientMock.json.get.mockClear();
		redisClientMock.json.set.mockClear();
		redisClientMock.ping.mockClear();
		repositoryMock.execute.mockClear();
		repositoryMock.insert.mockClear();
		repositoryMock.values.mockClear();
		repositoryMock.returning.mockClear();
		getById = (await import("@domain/identity/actions/get-by-id")).default;
	});

	const validId = "123e4567-e89b-12d3-a456-426614174000";

	it("should return cached identity if available", async () => {
		const cachedData = [{ id: 1, name: "Test" }];
		const reference = referencesMock.tag("identity", "find{id}", { id: validId });
		redisClientMock.scan.mockResolvedValueOnce({ cursor: "0", keys: [reference] });
		redisClientMock.json.get.mockResolvedValueOnce(cachedData);
		containerMock.params.mockReturnValue({ id: validId });

		const result = await getById(containerMock);
		expect(result).toEqual([{ id: 1, name: "Test" }]);
		expect(redisClientMock.json.get).toHaveBeenCalled();
		expect(repositoryMock.execute).not.toHaveBeenCalled();
	});

	it("should return identity from repository if not cached", async () => {
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([{ id: 1, name: "Test" }]);
		containerMock.params.mockReturnValue({ id: validId });

		const result = await getById(containerMock);
		expect(result).toEqual([{ id: 1, name: "Test" }]);
		expect(repositoryMock.execute).toHaveBeenCalled();
		expect(redisClientMock.json.set).toHaveBeenCalled();
	});

	it("should throw error if identity not found", async () => {
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([]);
		containerMock.params.mockReturnValue({ id: validId });

		expect(getById(containerMock)).rejects.toThrow();
	});
});
