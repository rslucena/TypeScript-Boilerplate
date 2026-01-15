import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";
import { z } from "zod/v4";
import "@domain/user/schema";
import { authenticationMock } from "@tests/mocks/authentication.mock";

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
	__esModule: true,
	container: mock(() => containerMock),
}));

mock.module("@infrastructure/authentication/strategies/jwt", () => ({
	__esModule: true,
	default: authenticationMock,
}));

mock.module("@infrastructure/repositories/references", () => ({
	__esModule: true,
	tag: referencesMock.tag,
	hash: referencesMock.hash,
	identifier: { id: mock().mockReturnValue("some-string") },
	pgIndex: mock(() => []),
	zodIdentifier: { id: z.string() },
}));

describe("User Domain Actions : postNewAuth", () => {
	let postNewAuth: CallableFunction;

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.headers.mockClear();
		containerMock.body.mockReturnValue({});
		redisClientMock.json.get.mockClear();
		redisClientMock.json.set.mockClear();
		redisClientMock.scan.mockClear();
		repositoryMock.execute.mockClear();
		postNewAuth = (await import("@domain/user/actions/post-new-auth")).default;
	});

	it("should return cached auth if available", async () => {
		const cachedData = { token: "cached-token", refresh: "cached-refresh" };
		redisClientMock.json.get.mockResolvedValueOnce(cachedData);
		containerMock.body.mockReturnValue({ email: "john@example.com", password: "password123" });

		const result = await postNewAuth(containerMock);
		expect(result).toEqual(cachedData);
		expect(redisClientMock.json.get).toHaveBeenCalled();
		expect(containerMock.headers).toHaveBeenCalledWith({ authorization: "Bearer cached-token" });
		expect(repositoryMock.execute).not.toHaveBeenCalled();
	});

	it("should return auth from repository and update cache", async () => {
		redisClientMock.scan.mockResolvedValueOnce({ cursor: "0", keys: [] });
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([{ id: 1, email: "john@example.com", password: "hashed-password" }]);
		referencesMock.hash.mockReturnValueOnce("OK");
		containerMock.body.mockReturnValue({ email: "john@example.com", password: "password123" });

		const result = await postNewAuth(containerMock);
		expect(result).toHaveProperty("token", "test-token");
		expect(repositoryMock.execute).toHaveBeenCalled();
		expect(redisClientMock.json.set).toHaveBeenCalled();
		expect(containerMock.headers).toHaveBeenCalledWith({ authorization: "Bearer test-token" });
	});

	it("should throw 422 if user not found", async () => {
		redisClientMock.scan.mockResolvedValueOnce({ cursor: "0", keys: [] });
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([]);
		containerMock.body.mockReturnValue({ email: "john@example.com", password: "password123" });

		expect(postNewAuth(containerMock)).rejects.toThrow();
	});

	it("should throw 404 if password mismatch", async () => {
		redisClientMock.scan.mockResolvedValueOnce({ cursor: "0", keys: [] });
		redisClientMock.json.get.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([{ id: 1, email: "john@example.com", password: "hashed-password" }]);
		referencesMock.hash.mockReturnValueOnce("");
		containerMock.body.mockReturnValue({ email: "john@example.com", password: "wrong-password" });

		expect(postNewAuth(containerMock)).rejects.toThrow();
	});
});
