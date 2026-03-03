import { afterEach, beforeEach, describe, expect, it, type Mock, mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { repositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";

const redisClientMock = createRedisClientMock();
mock.module("@infrastructure/cache/connection", () => ({ default: redisClientMock }));
mock.module("@infrastructure/repositories/repository", () => ({ default: repositoryMock }));

import cache from "@infrastructure/cache/actions";
import getReadiness from "../../../../src/domain/health/actions/get-readiness";

describe("Health Domain Actions : getReadiness", () => {
	let req: any;

	beforeEach(() => {
		req = createContainerMock();
		repositoryMock.execute.mockClear();
		redisClientMock.ping.mockClear();
		redisClientMock.info.mockClear();
		redisClientMock.isOpen = true;
	});

	afterEach(() => {
		mock.restore();
	});

	it("should return active and 200 when all dependencies are healthy", async () => {
		repositoryMock.execute.mockResolvedValueOnce([{ version: "PostgreSQL 15.0" }]);
		redisClientMock.ping.mockResolvedValue("PONG");
		redisClientMock.info.mockResolvedValue("redis_version:7.2.0");

		const result = await getReadiness(req);

		expect(req.status).toHaveBeenCalledWith(200);
		expect(result.status).toBe("active");
		expect(result.dependencies.database.status).toBe("connected");
		expect(result.dependencies.database.version).toBe("PostgreSQL 15.0");
		expect(result.dependencies.cache.status).toBe("connected");
		expect(result.dependencies.cache.version).toBe("7.2.0");
	});

	it("should return degraded and 503 when database is down", async () => {
		repositoryMock.execute.mockRejectedValueOnce(new Error("DB Connection Error"));
		redisClientMock.ping.mockResolvedValue("PONG");
		redisClientMock.info.mockResolvedValue("redis_version:7.2.0");

		const result = await getReadiness(req);

		expect(req.status).toHaveBeenCalledWith(503);
		expect(result.status).toBe("degraded");
		expect(result.dependencies.database.status).toBe("disconnected");
		expect(result.dependencies.cache.status).toBe("connected");
	});

	it("should return degraded and 503 when cache is down", async () => {
		repositoryMock.execute.mockResolvedValueOnce([{ version: "PostgreSQL 15.0" }]);
		redisClientMock.ping.mockRejectedValueOnce(new Error("Cache Error"));

		const result = await getReadiness(req);

		expect(req.status).toHaveBeenCalledWith(503);
		expect(result.status).toBe("degraded");
		expect(result.dependencies.database.status).toBe("connected");
		expect(result.dependencies.cache.status).toBe("disconnected");
	});

	it("should handle cache ping timeout/null correctly", async () => {
		repositoryMock.execute.mockResolvedValueOnce([{ version: "PostgreSQL 15.0" }]);
		redisClientMock.ping.mockRejectedValueOnce(new Error("Timeout"));

		const result = await getReadiness(req);

		expect(req.status).toHaveBeenCalledWith(503);
		expect(result.status).toBe("degraded");
		expect(result.dependencies.cache.status).toBe("disconnected");
	});

	it("should handle info failure gracefully providing no version", async () => {
		repositoryMock.execute.mockResolvedValueOnce([{ version: "PostgreSQL 15.0" }]);
		redisClientMock.ping.mockResolvedValue("PONG");
		redisClientMock.info.mockRejectedValueOnce(new Error("Command not allowed"));

		const result = await getReadiness(req);

		expect(req.status).toHaveBeenCalledWith(200);
		expect(result.status).toBe("active");
		expect(result.dependencies.cache.status).toBe("connected");
		expect(result.dependencies.cache.version).toBeUndefined();
	});
});
