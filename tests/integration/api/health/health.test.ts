import { beforeEach, describe, expect, it, mock } from "bun:test";
import healthRoutes from "@domain/health/routes";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { serverRequestMock } from "@tests/mocks/server.mock";
import fastify, { type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";

const redisClientMock = createRedisClientMock();
const repositoryMock = createRepositoryMock();

mock.module("@infrastructure/cache/connection", () => ({ default: redisClientMock }));
mock.module("@infrastructure/repositories/repository", () => ({ default: repositoryMock }));

import * as requestModule from "@infrastructure/server/request";

mock.module("@infrastructure/server/request", () => ({
	...requestModule,
	default: serverRequestMock,
}));

describe("Health API Routes", () => {
	let instance: FastifyInstance;

	beforeEach(async () => {
		instance = fastify().withTypeProvider<ZodTypeProvider>();
		instance.setValidatorCompiler(validatorCompiler);
		instance.setSerializerCompiler(serializerCompiler);
		instance.register(healthRoutes, { prefix: "/api/v1/health" });

		repositoryMock.execute.mockClear();
		redisClientMock.ping.mockClear();
		redisClientMock.info.mockClear();
		redisClientMock.isOpen = true;
		redisClientMock.ping.mockResolvedValue("PONG");
		redisClientMock.info.mockResolvedValue("redis_version:7.0.0");

		await instance.ready();
	});

	describe("GET /api/v1/health/liveness", () => {
		it("should return 200 and liveness data", async () => {
			const response = await instance.inject({
				method: "GET",
				url: "/api/v1/health/liveness",
			});
			expect(response.statusCode).toBe(200);
			const payload = response.json();
			expect(payload.status).toBe("active");
			expect(payload.version).toBe("1.0.0");
			expect(payload.date).toBeDefined();
		});
	});

	describe("GET /api/v1/health/readiness", () => {
		it("should return 200 and readiness data when healthy", async () => {
			repositoryMock.execute.mockResolvedValueOnce([{ version: "PostgreSQL 14.0" }]);
			redisClientMock.ping.mockResolvedValue("PONG");
			redisClientMock.scan.mockResolvedValue({ cursor: "0", keys: ["key"] });
			redisClientMock.get.mockResolvedValue("true");
			redisClientMock.isOpen = true;

			const response = await instance.inject({
				method: "GET",
				url: "/api/v1/health/readiness",
				headers: {
					authorization: "Bearer valid-token",
				},
			});

			expect(response.statusCode).toBe(200);
			const payload = response.json();
			expect(payload.status).toBe("active");
			expect(payload.uptime).toBeDefined();
			expect(payload.memory).toBeDefined();
			expect(payload.disk).toBeDefined();
			expect(payload.dependencies.database.status).toBe("connected");
			expect(payload.dependencies.database.version).toBe("PostgreSQL 14.0");
			expect(payload.dependencies.cache.status).toBe("connected");
			expect(payload.dependencies.cache.version).toBe("7.0.0");
		});

		it("should return 503 and degraded status when database fails", async () => {
			repositoryMock.execute.mockRejectedValueOnce(new Error("DB Connection Error"));
			redisClientMock.isOpen = true;
			redisClientMock.ping.mockResolvedValue("PONG");

			const response = await instance.inject({
				method: "GET",
				url: "/api/v1/health/readiness",
				headers: {
					authorization: "Bearer valid-token",
				},
			});
			expect(response.statusCode).toBe(503);
			const payload = response.json();
			expect(payload.status).toBe("degraded");
			expect(payload.dependencies.database.status).toBe("disconnected");
		});

		it("should return 503 and degraded status when cache fails", async () => {
			repositoryMock.execute.mockResolvedValueOnce([{ version: "PostgreSQL 14.0" }]);
			redisClientMock.isOpen = true;
			redisClientMock.ping.mockRejectedValueOnce(new Error("Cache Error"));

			const response = await instance.inject({
				method: "GET",
				url: "/api/v1/health/readiness",
				headers: {
					authorization: "Bearer valid-token",
				},
			});
			expect(response.statusCode).toBe(503);
			const payload = response.json();
			expect(payload.status).toBe("degraded");
			expect(payload.dependencies.cache.status).toBe("disconnected");
		});
	});
});
