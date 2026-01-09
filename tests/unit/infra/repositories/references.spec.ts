import { describe, expect, it } from "bun:test";
import { hash, identifier, pgIndex, tag } from "@infrastructure/repositories/references?v=unit";
import { columnBuilder } from "@tests/builders/column.builders";

describe("Repository References", () => {
	describe("hash", () => {
		it("should hash a string", () => {
			const data = "test-password";
			const hashed = hash(data);
			expect(hashed).toBeString();
			expect(hashed).not.toBe(data);
		});

		it("should compare correctly", () => {
			const data = "test-password";
			const hashed = hash(data);
			expect(hash(data, hashed)).toBe("OK");
			expect(hash("wrong-password", hashed)).toBe("");
		});

		it("should hash an object", () => {
			const data = { foo: "bar" };
			const hashed = hash(data);
			expect(hashed).toBeString();
			expect(hash(data, hashed)).toBe("OK");
		});
	});

	describe("tag", () => {
		it("should generate a simple tag", () => {
			const result = tag("User", "findById");
			expect(result).toBe("user/findbyid");
		});

		it("should generate a tag with conditions", () => {
			const result = tag("User", "findById", { id: "123", status_active: "true" });
			expect(result).toBe("user/findbyid/{id:123}{statusactive:true}");
		});
	});

	describe("pgIndex", () => {
		it("should generate index configurations", () => {
			const columns: Record<string, ReturnType<typeof columnBuilder>> = {
				id: columnBuilder(),
				name: columnBuilder(),
				email: columnBuilder(),
				activated: columnBuilder(),
				createdAt: columnBuilder(),
				updatedAt: columnBuilder(),
				deletedAt: columnBuilder(),
			};
			const indexes = pgIndex("users", columns as unknown as Record<string, unknown>, ["name", "email"]);

			expect(indexes).toHaveLength(3);
			expect(indexes[0]).toBeDefined();
		});
	});

	describe("identifier", () => {
		it("should have correct fields", () => {
			expect(identifier).toHaveProperty("id");
			expect(identifier).toHaveProperty("activated");
			expect(identifier).toHaveProperty("createdAt");
		});
	});
});
