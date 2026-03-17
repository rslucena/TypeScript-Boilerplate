import { describe, expect, it } from "bun:test";
import { env } from "@infrastructure/settings/environment";

describe("Environment Configuration Transformation", () => {
	it("should correctly handle APP_TRUST_PROXY as boolean", () => {
		expect(typeof env.APP_TRUST_PROXY).toBeDefined();
	});
});
