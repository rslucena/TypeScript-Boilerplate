import { describe, expect, it } from "bun:test";
import { env } from "@infrastructure/settings/environment";

describe("Environment Configuration Transformation", () => {
	it("should correctly handle APP_TRUST_PROXY", () => {
		// Coverage for lines 44-48 is often achieved by the main import, but we ensure basic sanity
		expect(env).toHaveProperty("APP_TRUST_PROXY");
	});

	it("should verify build and test flags", () => {
		expect(env.isTest).toBe(true);
		expect(env.isBuild).toBeBoolean();
	});
});
