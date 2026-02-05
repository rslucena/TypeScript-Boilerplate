import { describe, expect, it } from "bun:test";
import credentials from "@domain/credentials/entity";

describe("Credentials Entity", () => {
	it("should be defined", () => {
		expect(credentials).toBeDefined();
	});

	it("should have field 'identityId'", () => {
		expect(credentials.identityId).toBeDefined();
	});

	it("should have field 'password'", () => {
		expect(credentials.password).toBeDefined();
	});
});
