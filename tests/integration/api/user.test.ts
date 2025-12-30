import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { referencesMock } from "@tests/mocks/references.mock";
import { repositoryMock } from "@tests/mocks/repository.mock";
import { serverRequestMock } from "@tests/mocks/server.mock";
import { z } from "zod/v4";

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
mock.module("@infrastructure/server/request", () => ({ default: serverRequestMock }));

import userRoutes from "@domain/user/routes";
import { createUserBuilder } from "@tests/builders/user.builder";
import fastify, { type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";

describe("User API Routes", () => {
	let server: FastifyInstance;

	beforeEach(async () => {
		server = fastify().withTypeProvider<ZodTypeProvider>();
		server.setValidatorCompiler(validatorCompiler);
		server.setSerializerCompiler(serializerCompiler);
		server.register(userRoutes, { prefix: "/api/v1/users" });

		repositoryMock.execute.mockResolvedValue([createUserBuilder()]);
		repositoryMock.returning.mockResolvedValue([createUserBuilder()]);
		redisClientMock.json.get.mockClear();
		redisClientMock.json.set.mockClear();

		await server.ready();
	});

	describe("GET /ping", () => {
		it("should return 200", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/api/v1/users/ping",
			});
			expect(response.statusCode).toBe(200);
		});
	});

	describe("GET /api/v1/users/:id", () => {
		it("should return 401 if unauthorized", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/api/v1/users/550e8400-e29b-41d4-a716-446655440000",
				headers: {
					authorization: "Bearer invalid-token",
				},
			});
			expect(response.statusCode).toBe(401);
		});

		it("should return user if authorized", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/api/v1/users/550e8400-e29b-41d4-a716-446655440000",
				headers: {
					authorization: "Bearer valid-token",
				},
			});
			expect(response.statusCode).toBe(200);
			expect(repositoryMock.execute).toHaveBeenCalled();
		});
	});

	describe("POST /api/v1/users", () => {
		it("should return 200/201 and create user", async () => {
			const userData = {
				name: "John",
				lastName: "Doe",
				email: "john@example.com",
				password: "password123",
			};
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/users/",
				body: userData,
			});
			expect(response.statusCode).toBeLessThan(300);
			expect(repositoryMock.execute).toHaveBeenCalled();
		});

		it("should return 400 if validation fails", async () => {
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/users/",
				body: { name: "" },
			});
			expect(response.statusCode).toBe(400);
		});
	});

	describe("POST /api/v1/users/auth", () => {
		it("should return 200/201 and auth token", async () => {
			const authData = {
				email: "john@example.com",
				password: "password123",
			};
			const response = await server.inject({
				method: "POST",
				url: "/api/v1/users/auth",
				headers: {
					authorization: "Bearer valid-token",
				},
				body: authData,
			});
			expect(response.statusCode).toBeLessThan(300);
			expect(repositoryMock.execute).toHaveBeenCalled();
		});
	});
});
