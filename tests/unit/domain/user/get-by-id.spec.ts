import "@domain/user/schema";
import { redisClientMock } from "@tests/mocks/redis.client.mock";
import { referencesMock } from "@tests/mocks/references.mock";
import { repositoryMock } from "@tests/mocks/repository.mock";
import { containerMock } from "@tests/mocks/server.mock";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { z } from "zod/v4";

mock.module("@infrastructure/cache/connection", () => ({
	__esModule: true,
	default: redisClientMock,
}));

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
	withPagination: referencesMock.withPagination,
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
	zodIdentifier: z.object({ id: z.string() }),
}));

describe("User Domain Actions : getById", () => {
	let getById: CallableFunction

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
		getById = (await import("@domain/user/actions/get-by-id")).default;
	});

	const validId = "123e4567-e89b-12d3-a456-426614174000";

	it("should return cached user if available", async () => {
		const cachedData = [{ id: 1, name: "Test" }];
		const reference = referencesMock.tag("user", "find{id}", { id: validId });
		redisClientMock.scan.mockResolvedValueOnce({ cursor: "0", keys: [reference] });
		redisClientMock.json.get.mockResolvedValueOnce(cachedData);
		containerMock.params.mockReturnValue({ id: validId });

		const result = await getById(containerMock);
		expect(result).toEqual([{ id: 1, name: "Test" }]);
		expect(redisClientMock.json.get).toHaveBeenCalled();
		expect(repositoryMock.execute).not.toHaveBeenCalled();
	});

	it("should return user from repository if not cached", async () => {
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([{ id: 1, name: "Test" }]);
		containerMock.params.mockReturnValue({ id: validId });

		const result = await getById(containerMock);
		expect(result).toEqual([{ id: 1, name: "Test" }]);
		expect(repositoryMock.execute).toHaveBeenCalled();
		expect(redisClientMock.json.set).toHaveBeenCalled();
	});

	it("should throw error if user not found", async () => {
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([]);
		containerMock.params.mockReturnValue({ id: validId });

		expect(getById(containerMock)).rejects.toThrow();
	});
});
