import { describe, expect, it } from "bun:test";
import { container, err } from "@infrastructure/server/request?v=unit";

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
		const initialArgs = {
			url: "/test",
			status: 200,
			language: "en",
			headers: { "x-test": "value" },
			query: { q: "search" },
			body: { name: "test" },
			params: { id: "1" },
			method: "GET" as const,
		};

		it("should initialize with correct values", () => {
			const instance = new container(initialArgs);
			expect(instance.language()).toBe("en");
			expect(instance.status()).toBe(200);
			expect(instance.headers()).toEqual(initialArgs.headers);
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
	});
});
