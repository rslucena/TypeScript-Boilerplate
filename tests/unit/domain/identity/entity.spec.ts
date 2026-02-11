import { describe, expect, it } from "bun:test";
import identity from "@domain/identity/entity";

describe("Identity Entity", () => {
	it("should be defined", () => {
		expect(identity).toBeDefined();
	});

	it("should have field 'name'", () => {
		expect(identity.name).toBeDefined();
	});

	it("should have field 'email'", () => {
		expect(identity.email).toBeDefined();
	});

	it("should have field 'lastName'", () => {
		expect(identity.lastName).toBeDefined();
	});
});
