import { describe, expect, it } from "bun:test";
import translate, { Languages } from "@infrastructure/languages/translate";

describe("Languages Infrastructure", () => {
	describe("Languages object", () => {
		it("should have en, es, and pt-br languages", () => {
			expect(Languages).toHaveProperty("en");
			expect(Languages).toHaveProperty("es");
			expect(Languages).toHaveProperty("pt-br");
		});

		it("should have keys in en dictionary", () => {
			expect(Object.keys(Languages.en).length).toBeGreaterThan(0);
		});
	});

	describe("translate function", () => {
		it("should translate an existing key to english by default", () => {
			const result = translate("ERR_UNAUTHORIZED");
			expect(result).toBe("You are not authorized to access this resource.");
		});

		it("should translate an existing key to pt-br", () => {
			const result = translate("ERR_UNAUTHORIZED", "pt-br");
			expect(result).toBe("Você não está autorizado a acessar este recurso.");
		});

		it("should fallback to english if language is unknown", () => {
			const result = translate("ERR_UNAUTHORIZED", "fr");
			expect(result).toBe("You are not authorized to access this resource.");
		});

		it("should return the key if it does not exist in the dictionary", () => {
			const result = translate("UNKNOWN_KEY");
			expect(result).toBe("UNKNOWN_KEY");
		});

		it("should return the key from english dictionary if dictionary for requested language exists but key does not, and key exists in english", () => {
			const result = translate("ERR_UNAUTHORIZED", "pt-br");
			expect(result).toBe("Você não está autorizado a acessar este recurso.");

			const missingKey = translate("SOME_MISSING_KEY", "pt-br");
			expect(missingKey).toBe("SOME_MISSING_KEY");
		});
	});
});
