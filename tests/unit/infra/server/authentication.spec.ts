import { describe, expect, it, mock } from "bun:test";
import authentication from "@infrastructure/server/authentication";
import { container } from "@infrastructure/server/interface";

describe("Authentication Handler", () => {
	const mockPlugins = {
		authentication: {
			testPlugin: {
				active: true,
				priority: 1,
				strategy: mock(),
			},
		},
	};

	// @ts-expect-error: Bun runtime supports query parameters for imports
	const handler = new authentication(mockPlugins);

	it("should return false if no plugins succeed", async () => {
		const receiver = new container({});

		mockPlugins.authentication.testPlugin.strategy.mockResolvedValue(undefined);

		const result = await handler.session(receiver);
		expect(result).toBe(false);
	});
});
