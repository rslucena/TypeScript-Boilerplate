import { safeParse } from "@infrastructure/server/transforms";
import { describe, expect, it } from "bun:test";

describe("Transforms", () => {
	describe("safeParse", () => {
		it("should parse valid JSON string correctly", () => {
			const validJson = '{"foo": "bar"}';
			const result = safeParse<{ foo: string }>(validJson);
			expect(result).toEqual({ foo: "bar" });
		});

		it("should return undefined for invalid JSON string", () => {
			const invalidJson = '{"foo": "bar"';
			const result = safeParse(invalidJson);
			expect(result).toBeUndefined();
		});

		it("should return undefined for non-JSON string", () => {
			const invalidJson = "foo";
			const result = safeParse(invalidJson);
			expect(result).toBeUndefined();
		});
	});
});
