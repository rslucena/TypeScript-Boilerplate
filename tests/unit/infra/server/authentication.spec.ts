import { describe, expect, it } from "bun:test";
// Using ?v=unit to bypass potential global mocks from other test files
import AuthenticationHandler from "@infrastructure/server/authentication?v=unit";
import { container } from "@infrastructure/server/interface";

describe("Authentication Handler", () => {
	it("should return false if no plugins succeed", async () => {
		const mockPlugins = {
			authentication: {
				testPlugin: {
					active: true,
					priority: 1,
					strategy: async () => undefined,
				},
			},
		};

		// @ts-expect-error: mocking internal plugins
		const handler = new AuthenticationHandler(mockPlugins);
		const receiver = new container({});

		const result = await handler.session(receiver);
		expect(result).toBe(false);
	});

	it("should return true and set session if a plugin succeeds", async () => {
		const mockSessionData = { userId: "123" };
		const mockPlugins = {
			authentication: {
				testPlugin: {
					active: true,
					priority: 1,
					strategy: async () => mockSessionData,
				},
			},
		};

		// @ts-expect-error: mocking internal plugins
		const handler = new AuthenticationHandler(mockPlugins);
		const receiver = new container({});

		const result = await handler.session(receiver);
		expect(result).toBe(true);
		expect(receiver.session()).toEqual({ testPlugin: mockSessionData });
	});

	it("should sort plugins by priority", async () => {
		const complexPlugins = {
			authentication: {
				lowPriority: {
					active: true,
					priority: 10,
					strategy: async () => ({ id: "low" }),
				},
				highPriority: {
					active: true,
					priority: 1,
					strategy: async () => ({ id: "high" }),
				},
			},
		};

		// @ts-expect-error: mocking internal plugins
		const handler = new AuthenticationHandler(complexPlugins);
		const receiver = new container({});

		const result = await handler.session(receiver);
		expect(result).toBe(true);

		const session = receiver.session() as Record<string, unknown>;
		expect(session).toHaveProperty("highPriority");
		expect(session).toHaveProperty("lowPriority");

		expect(session.highPriority).toEqual({ id: "high" });
		expect(session.lowPriority).toEqual({ id: "low" });
	});
});
