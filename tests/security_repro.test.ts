import { describe, expect, it } from "bun:test";
import webserver from "../src/infrastructure/server/webserver";

describe("Webserver Security: Error Handling", () => {
	it("should NOT leak internal error messages in the response", async () => {
		const server = await webserver.create();

		// Create a route that throws a sensitive error
		server.get("/vulnerable-error", async () => {
			throw new Error("INTERNAL_DATABASE_FAILURE: secret_db_password_123");
		});

		const response = await server.inject({
			method: "GET",
			url: "/vulnerable-error",
		});

		const payload = JSON.parse(response.payload);

		// The vulnerability is that the message contains the sensitive string
		// We expect the message to be generic after the fix
		expect(payload.message).not.toContain("secret_db_password_123");
		expect(payload.message).toBe("An unknown error occurred");
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

		// It should be truncated/generic enough
		expect(payload.message).toBe("Unsupported Media Type");
		expect(payload.message).not.toContain("additional sensitive info");
	});
});
