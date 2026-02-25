import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { referencesMock } from "@tests/mocks/references.mock";
import { repositoryMock } from "@tests/mocks/repository.mock";
import { serverRequestMock } from "@tests/mocks/server.mock";
import { z } from "zod";

const redisClientMock = createRedisClientMock();
mock.module("@infrastructure/cache/connection", () => ({ default: redisClientMock }));
mock.module("@infrastructure/repositories/repository", () => ({
	default: repositoryMock,
	withPagination: referencesMock.withPagination,
}));
mock.module("@infrastructure/repositories/references", () => ({
	...referencesMock,
	identifier: { id: mock(() => "test-id") },
	pgIndex: mock(() => []),
	zodIdentifier: { id: z.string() },
}));

import * as requestModule from "@infrastructure/server/request";

mock.module("@infrastructure/server/request", () => ({
	...requestModule,
	default: serverRequestMock,
}));

import identityRoutes from "@domain/identity/routes";
import { createIdentityBuilder } from "@tests/builders/identity.builder";
import fastify, { type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";

describe("Identity API Routes", () => {
	let server: FastifyInstance;

	beforeEach(async () => {
		server = fastify().withTypeProvider<ZodTypeProvider>();
		server.setValidatorCompiler(validatorCompiler);
		server.setSerializerCompiler(serializerCompiler);
		server.register(identityRoutes, { prefix: "/api/v1/identities" });

		repositoryMock.execute.mockResolvedValue([createIdentityBuilder()]);
		repositoryMock.returning.mockResolvedValue([createIdentityBuilder()]);
		redisClientMock.json.get.mockClear();
		redisClientMock.json.set.mockClear();

		await server.ready();
	});

	describe("GET /health", () => {
		it("should return 200", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/api/v1/identities/health",
				headers: {
					authorization: "Bearer valid-token",
				},
			});
			expect(response.statusCode).toBe(200);
		});
	});

	describe("GET /api/v1/identities/:id", () => {
		it("should return 401 if unauthorized", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/api/v1/identities/550e8400-e29b-41d4-a716-446655440000",
				headers: {
					authorization: "Bearer invalid-token",
				},
			});
			expect(response.statusCode).toBe(401);
		});

		it("should return identity if authorized", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/api/v1/identities/550e8400-e29b-41d4-a716-446655440000",
				headers: {
					authorization: "Bearer valid-token",
				},
			});
			expect(response.statusCode).toBe(200);
			expect(repositoryMock.execute).toHaveBeenCalled();
		});
	});

	describe("POST /api/v1/identities", () => {
		it("should return 200/201 and create identity", async () => {
			const identityData = {
				name: "John",
				lastName: "Doe",
				email: "john@example.com",
			};
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/identities/",
				headers: {
					authorization: "Bearer valid-token",
				},
				body: identityData,
			});
			expect(response.statusCode).toBeLessThan(300);
			expect(repositoryMock.execute).toHaveBeenCalled();
		});

		it("should return 400 if validation fails", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/identities/",
				body: { name: "" },
			});
			expect(response.statusCode).toBe(400);
		});
	});
});
