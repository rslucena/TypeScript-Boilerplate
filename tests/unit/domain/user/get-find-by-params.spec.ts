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

mock.module("@infrastructure/cache/connection", () => ({
	default: redisClientMock,
}));

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
	withPagination: mock((qb) => qb),
}));

mock.module("@infrastructure/server/request", () => ({
	container: mock(() => containerMock),
}));

mock.module("@infrastructure/repositories/references", () => ({
	tag: referencesMock.tag,
	hash: referencesMock.hash,
	withPagination: referencesMock.withPagination,
	identifier: { id: mock().mockReturnValue("some-string") },
	pgIndex: mock(() => []),
	zodIdentifier: { id: z.string() },
}));

import "@domain/user/schema";
import { beforeEach, describe, expect, it } from "bun:test";

describe("User Domain Actions : getFindByParams", () => {
	let getFindByParams: CallableFunction;

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.query.mockReturnValue({});
		redisClientMock.json.get.mockClear();
		redisClientMock.json.set.mockClear();
		redisClientMock.scan.mockClear();
		repositoryMock.execute.mockClear();
		getFindByParams = (await import("@domain/user/actions/get-find-by-params")).default;
	});

	it("should return cached users if available", async () => {
		const reference = "user:find{params}:[object Object]";
		const cachedData = [{ id: 1, name: "Test" }];
		redisClientMock.scan.mockResolvedValueOnce({ cursor: "0", keys: [reference] });
		redisClientMock.json.get.mockResolvedValueOnce(cachedData);
		containerMock.query.mockReturnValue({ "req.page": [1, 10] });

		const result = await getFindByParams(containerMock);
		expect(result).toEqual(cachedData);
		expect(redisClientMock.json.get).toHaveBeenCalled();
		expect(repositoryMock.execute).not.toHaveBeenCalled();
	});

	it("should return users from repository if not cached", async () => {
		redisClientMock.scan.mockResolvedValueOnce({ cursor: "0", keys: [] });
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([{ id: 1, name: "Test" }]);
		containerMock.query.mockReturnValue({ name: "John", "req.page": [1, 10] });

		const result = await getFindByParams(containerMock);
		expect(result).toEqual([{ id: 1, name: "Test" }]);
		expect(repositoryMock.execute).toHaveBeenCalled();
		expect(redisClientMock.json.set).toHaveBeenCalled();
	});

	it("should throw error if no users found", async () => {
		redisClientMock.scan.mockResolvedValueOnce({ cursor: "0", keys: [] });
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([]);
		containerMock.query.mockReturnValue({ "req.page": [1, 10] });

		expect(getFindByParams(containerMock)).rejects.toThrow();
	});

	it("should throw error if validation fails", async () => {
		containerMock.query.mockReturnValue({ "req.page": "invalid" });

		expect(getFindByParams(containerMock)).rejects.toThrow();
	});
});
