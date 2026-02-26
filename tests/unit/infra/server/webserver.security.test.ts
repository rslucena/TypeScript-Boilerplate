import { describe, expect, it, mock } from "bun:test";
import { createEnvMock, fsMock } from "@tests/mocks/environment.mock";
import { redisClientMock } from "@tests/mocks/redis.client.mock";

mock.module("@infrastructure/settings/environment", () => createEnvMock());
mock.module("node:fs", () => fsMock);
mock.module("@infrastructure/cache/connection", () => ({ default: redisClientMock }));

import webserver from "@infrastructure/server/webserver";

describe("Webserver Security: Error Handling", () => {
	it("should NOT leak internal error messages in the response", async () => {
		const server = await webserver.create();

		server.get("/vulnerable-error", async () => {
			throw new Error("INTERNAL_DATABASE_FAILURE: secret_db_password_123");
		});

		const response = await server.inject({
			method: "GET",
			url: "/vulnerable-error",
		});

		const payload = JSON.parse(response.payload);

		expect(response.statusCode).toBe(500);
		expect(payload.message).not.toContain("secret_db_password_123");
		expect(payload.message).toBe("An internal server error occurred. Please try again later.");
	});

	it("should handle 'Unsupported Media Type' safely", async () => {
		const server = await webserver.create();

		server.get("/unsupported-media", async () => {
			throw new Error("Unsupported Media Type; additional sensitive info");
		});

		const response = await server.inject({
			method: "GET",
			url: "/unsupported-media",
		});

		const payload = JSON.parse(response.payload);

		expect(payload.message).toBe("Unsupported Media Type");
		expect(payload.message).not.toContain("additional sensitive info");
	});
});
