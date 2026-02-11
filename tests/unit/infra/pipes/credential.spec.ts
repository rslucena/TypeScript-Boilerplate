import { describe, expect, it } from "bun:test";
import { providers, types } from "@domain/credentials/constants";
import { credential } from "@infrastructure/pipes/credential";

describe("Infrastructure: Pipes -> Credential", () => {
	it("should return true for valid PASSWORD credential", () => {
		const result = credential({
			type: types.PASSWORD,
			provider: providers.LOCAL,
			secret: "some-secret",
		});
		expect(result).toBe(true);
	});

	it("should return false for PASSWORD without secret", () => {
		const result = credential({
			type: types.PASSWORD,
			provider: providers.LOCAL,
			secret: null,
		});
		expect(result).toBe(false);
	});

	it("should return false for PASSWORD with GOOGLE provider", () => {
		const result = credential({
			type: types.PASSWORD,
			provider: providers.GOOGLE,
			secret: "some-secret",
		});
		expect(result).toBe(false);
	});

	it("should return true for valid OIDC credential", () => {
		const result = credential({
			type: types.OIDC,
			provider: providers.GOOGLE,
			subject: "some-subject",
		});
		expect(result).toBe(true);
	});

	it("should return false for OIDC without subject", () => {
		const result = credential({
			type: types.OIDC,
			provider: providers.GOOGLE,
			subject: null,
		});
		expect(result).toBe(false);
	});

	it("should return false for OIDC with subject but invalid provider (LOCAL)", () => {
		const result = credential({
			type: types.OIDC,
			provider: providers.LOCAL,
			subject: "some-subject",
		});
		expect(result).toBe(false);
	});

	it("should return false for PASSWORD with subject (strictly forbidden if not required)", () => {
		const result = credential({
			type: types.PASSWORD,
			provider: providers.LOCAL,
			secret: "some-secret",
			subject: "some-subject",
		});
		expect(result).toBe(false);
	});
});
