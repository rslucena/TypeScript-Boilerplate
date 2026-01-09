import { describe, expect, it } from "bun:test";
import jwt from "@infrastructure/authentication/strategies/jwt?v=unit";
import authentication from "@infrastructure/server/authentication";
import { container } from "@infrastructure/server/interface?v=unit";

describe("Authentication Handler", () => {
	it("should return false if no plugins succeed", async () => {
		const handler = new authentication();
		const receiver = new container({});
		const result = await handler.session(receiver);
		expect(result).toBe(false);
	});

	it("should return true and set session if a plugin succeeds", async () => {
		const handler = new authentication();
		const token = jwt.create({ id: "test-user" });
		const receiver = new container({
			headers: { authorization: `Bearer ${token}` },
		});

		const result = await handler.session(receiver);
		expect(result).toBe(true);
		expect(receiver.session()).toEqual({
			JWT: expect.objectContaining({ id: "test-user" }),
		});
	});
});
