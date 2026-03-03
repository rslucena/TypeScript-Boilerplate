import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createReferencesModuleMock, referencesMock } from "@tests/mocks/references.mock";
import { repositoryMock } from "@tests/mocks/repository.mock";
import { serverRequestMock } from "@tests/mocks/server.mock";
import { z } from "zod";

const redisClientMock = createRedisClientMock();
mock.module("@infrastructure/cache/connection", () => ({ default: redisClientMock }));
mock.module("@infrastructure/repositories/repository", () => ({
	default: repositoryMock,
	withPagination: referencesMock.withPagination,
}));
mock.module("@infrastructure/repositories/references", () =>
	createReferencesModuleMock({
		identifier: { id: mock(() => "test-id") } as never,
		zodIdentifier: { id: z.string() } as never,
	}),
);

import * as requestModule from "@infrastructure/server/request";

mock.module("@infrastructure/server/request", () => ({
	...requestModule,
	default: serverRequestMock,
}));

import healthRoutes from "@domain/health/routes";
import fastify, { type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";

describe("Health API Routes", () => {
	let server: FastifyInstance;

	beforeEach(async () => {
		server = fastify().withTypeProvider<ZodTypeProvider>();
		server.setValidatorCompiler(validatorCompiler);
		server.setSerializerCompiler(serializerCompiler);
		server.register(healthRoutes, { prefix: "/api/v1/health" });

		repositoryMock.execute.mockClear();
		repositoryMock.select.mockClear();
		repositoryMock.from.mockClear();
		repositoryMock.limit.mockClear();
		redisClientMock.ping.mockClear();
		redisClientMock.info.mockClear();
		redisClientMock.isOpen = true;
		redisClientMock.ping.mockResolvedValue("PONG");
		redisClientMock.info.mockResolvedValue("redis_version:7.0.0");

		await server.ready();
	});

	describe("GET /api/v1/health/liveness", () => {
		it("should return 200 and liveness data", async () => {
			const response = await server.inject({
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
			repositoryMock.execute.mockResolvedValueOnce([{ id: "123" }]);
			redisClientMock.ping.mockResolvedValue("PONG");
			redisClientMock.scan.mockResolvedValue({ cursor: "0", keys: ["key"] });
			redisClientMock.get.mockResolvedValue("true");
			redisClientMock.isOpen = true;

			const response = await server.inject({
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
			expect(payload.features.identity.status).toBe("active");
			expect(payload.features.identity.latency).toBeDefined();
			expect(payload.dependencies.database.status).toBe("connected");
			expect(payload.dependencies.database.version).toBe("PostgreSQL 14.0");
			expect(payload.dependencies.cache.status).toBe("connected");
			expect(payload.dependencies.cache.version).toBe("7.0.0");
		});

		it("should return 503 and degraded status when database fails", async () => {
			repositoryMock.execute.mockRejectedValueOnce(new Error("DB Connection Error"));
			repositoryMock.execute.mockResolvedValueOnce([{ id: "123" }]);
			redisClientMock.isOpen = true;
			redisClientMock.ping.mockResolvedValue("PONG");

			const response = await server.inject({
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
			repositoryMock.execute.mockResolvedValueOnce([{ id: "123" }]);
			redisClientMock.isOpen = true;
			redisClientMock.ping.mockRejectedValueOnce(new Error("Cache Error"));

			const response = await server.inject({
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

		it("should return 503 and degraded status when identity internal feature check fails", async () => {
			repositoryMock.execute.mockResolvedValueOnce([{ version: "PostgreSQL 14.0" }]); // db check ok
			repositoryMock.execute.mockImplementationOnce(() => Promise.reject(new Error("Internal API Error")));
			redisClientMock.isOpen = true;
			redisClientMock.ping.mockResolvedValue("PONG");

			const response = await server.inject({
				method: "GET",
				url: "/api/v1/health/readiness",
				headers: {
					authorization: "Bearer valid-token",
				},
			});
			expect(response.statusCode).toBe(503);
			const payload = response.json();
			expect(payload.status).toBe("degraded");
			expect(payload.features.identity.status).toBe("degraded");
		});
	});
});
