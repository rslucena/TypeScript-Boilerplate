import { describe, expect, it, mock } from "bun:test";
import type { AnyType, guise } from "@infrastructure/server/interface";
// @ts-expect-error: Bun runtime supports query parameters for imports
import { container, err } from "@infrastructure/server/interface?v=unit";
import type { FastifyReply, FastifyRequest } from "fastify";

describe("Request Infrastructure", () => {
	describe("err class", () => {
		const errorManager = new err();

		it("should return unauthorized error", () => {
			const result = errorManager.unauthorized();
			expect(result.statusCode).toBe(401);
			expect(result.code).toBe("ERR_UNAUTHORIZED");
		});

		it("should return notFound error", () => {
			const result = errorManager.notFound();
			expect(result.statusCode).toBe(404);
		});

		it("should return badRequest error", () => {
			const result = errorManager.badRequest();
			expect(result.statusCode).toBe(400);
		});

		it("should return unprocessableEntity error", () => {
			const result = errorManager.unprocessableEntity();
			expect(result.statusCode).toBe(422);
		});

		it("should return conflict error", () => {
			const result = errorManager.conflict();
			expect(result.statusCode).toBe(409);
		});
	});

	describe("container class", () => {
		const initialArgs: guise = {
			url: "/test",
			status: 200,
			language: "en",
			headers: { "x-test": "value" },
			query: { q: "search" },
			body: { name: "test" },
			params: { id: "1" },
			method: "GET",
		};

		it("should initialize with correct values", () => {
			const instance = new container(initialArgs);
			expect(instance.language()).toBe("en");
			expect(instance.status()).toBe(200);
			expect(instance.headers()).toEqual(initialArgs.headers || {});
		});

		it("should update and return session", () => {
			const instance = new container(initialArgs);
			const sessionData = { userId: "123" };
			const result = instance.session(sessionData);
			expect(result).toEqual(sessionData);
			expect(instance.session()).toEqual(sessionData);
		});

		it("should update and return status", () => {
			const instance = new container(initialArgs);
			expect(instance.status(201)).toBe(201);
			expect(instance.status()).toBe(201);
		});

		it("should update and return body", () => {
			const instance = new container(initialArgs);
			const newBody = { result: "ok" };
			expect(instance.body(newBody)).toEqual(newBody);
			expect(instance.body()).toEqual(newBody);
		});

		it("should update and return headers", () => {
			const instance = new container(initialArgs);
			const newHeaders = { "x-new": "value" };
			const result = instance.headers(newHeaders);
			expect(result).toEqual({ ...initialArgs.headers, ...newHeaders });
		});

		it("should update and return query", () => {
			const instance = new container(initialArgs);
			const newQuery = { search: "test" };
			expect(instance.query(newQuery)).toEqual(newQuery);
			expect(instance.query()).toEqual(newQuery);
		});

		it("should update and return params", () => {
			const instance = new container(initialArgs);
			const newParams = { id: "123" };
			expect(instance.params(newParams)).toEqual(newParams);
			expect(instance.params()).toEqual(newParams);
		});

		it("should return session context if passed to session()", () => {
			const instance = new container(initialArgs);
			const ctx = { user: "me" };
			expect(instance.session(ctx)).toEqual(ctx);
		});

		it("should return default language if not provided", () => {
			const instance = new container({ ...initialArgs, language: undefined });
			expect(instance.language()).toBe("en");
		});

		it("should return default status if not provided", () => {
			const instance = new container({ ...initialArgs, status: undefined });
			expect(instance.status()).toBe(200);
		});
	});

	describe("convertRequestTypes", () => {
		const { convertRequestTypes } = require("@infrastructure/server/request?v=unit");

		it("should skip documentation routes", () => {
			const req = { url: "/documentation/static" } as unknown as FastifyRequest;
			const done = mock();
			convertRequestTypes(req, {} as FastifyReply, done);
			expect(done).toHaveBeenCalled();
		});

		it("should convert types correctly", () => {
			const body = {
				isTrue: "true",
				isFalse: "false",
				isNull: "null",
				isNum: "123",
				isArray: "[1,2,3]",
				isString: "hello",
				isEmpty: "",
			};
			const req = {
				url: "/api",
				body,
				query: {},
				params: {},
			} as unknown as FastifyRequest;
			const done = mock();
			convertRequestTypes(req, {} as FastifyReply, done);

			const typedBody = req.body as Record<string, AnyType>;
			expect(typedBody.isTrue).toBe(true);
			expect(typedBody.isFalse).toBe(false);
			expect(typedBody.isNull).toBe(null);
			expect(typedBody.isNum).toBe(123);
			expect(typedBody.isArray).toEqual([1, 2, 3]);
			expect(typedBody.isString).toBe("hello");
			expect(typedBody.isEmpty).toBe("");
			expect(done).toHaveBeenCalled();
		});

		it("should handle missing body/query/params", () => {
			const req = { url: "/api", body: undefined, query: undefined, params: undefined } as unknown as FastifyRequest;
			const done = mock();
			convertRequestTypes(req, {} as FastifyReply, done);
			expect(req.body).toEqual({});
			expect(done).toHaveBeenCalled();
		});
	});

	describe("execute wrapper", () => {
		const requestModule = require("@infrastructure/server/request?v=unit").default;

		it("should execute noRestricted callback successfully", async () => {
			const callback = mock(() => ({ data: "ok" }));
			const route = requestModule.noRestricted(callback);

			const req = {
				routeOptions: { config: { url: "/test", method: "GET" } },
				headers: {},
				query: {},
				body: {},
				params: {},
				raw: {},
			} as unknown as FastifyRequest;

			const reply = {
				statusCode: 200,
				code: mock(() => reply),
				headers: mock(() => reply),
				send: mock(),
			} as unknown as FastifyReply;

			await route(req, reply);

			expect(callback).toHaveBeenCalled();
			expect(reply.code).toHaveBeenCalledWith(200);
			expect(reply.send).toHaveBeenCalledWith({ data: "ok" });
		});

		it("should handle errors in callback and return 200 if error has no statusCode", async () => {
			const callback = mock(() => {
				throw new Error("test error");
			});
			const route = requestModule.noRestricted(callback);

			const req = {
				routeOptions: { config: { url: "/test", method: "GET" } },
				headers: {},
				query: {},
				body: {},
				params: {},
				raw: {},
			} as unknown as FastifyRequest;

			const reply = {
				statusCode: 200,
				code: mock(() => reply),
				headers: mock(() => reply),
				send: mock(),
			} as unknown as FastifyReply;

			await route(req, reply);
			expect(reply.code).toHaveBeenCalledWith(200);
		});

		it("should handle errors in callback with statusCode", async () => {
			const callback = mock(() => {
				throw { statusCode: 403, message: "Forbidden" };
			});
			const route = requestModule.noRestricted(callback);

			const req = {
				routeOptions: { config: { url: "/test", method: "GET" } },
				headers: {},
				query: {},
				body: {},
				params: {},
				raw: {},
			} as unknown as FastifyRequest;

			const reply = {
				statusCode: 200,
				code: mock(() => reply),
				headers: mock(() => reply),
				send: mock(),
			} as unknown as FastifyReply;

			await route(req, reply);
			expect(reply.code).toHaveBeenCalledWith(403);
		});

		it("should handle restricted routes and unauthorized access", async () => {
			const callback = mock();
			const route = requestModule.restricted(callback);

			mock.module("@infrastructure/server/authentication", () => {
				return {
					default: class {
						async session() {
							return false;
						}
					},
				};
			});

			const req = {
				routeOptions: { config: { url: "/test", method: "POST" } },
				headers: {},
				query: {},
				body: {},
				params: {},
				raw: {},
			} as unknown as FastifyRequest;

			const reply = {
				statusCode: 200,
				code: mock(() => reply),
				headers: mock(() => reply),
				send: mock(),
			} as unknown as FastifyReply;

			await route(req, reply);

			expect(reply.code).toHaveBeenCalledWith(401);
		});
	});
});
