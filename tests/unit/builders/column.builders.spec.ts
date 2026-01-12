import { describe, expect, it } from "bun:test";
import { columnBuilder, pgIndexBuilder, pgTableBuilder, varcharBuilder } from "@tests/builders/column.builders";

describe("Column Builders", () => {
	describe("columnBuilder", () => {
		it("should have all expected methods and properties", () => {
			const col = columnBuilder();
			expect(col).toHaveProperty("name");
			expect(col).toHaveProperty("notNull");
			expect(col).toHaveProperty("unique");
			expect(col).toHaveProperty("primaryKey");
			expect(col).toHaveProperty("defaultRandom");
			expect(col).toHaveProperty("defaultNow");
			expect(col).toHaveProperty("default");
		});

		it("should update values when methods are called", () => {
			const col = columnBuilder();

			col.notNull();
			expect(col.notNullValue).toBe(true);

			col.unique();
			expect(col.uniqueValue).toBe(true);

			col.primaryKey();
			expect(col.primaryKeyValue).toBe(true);

			col.defaultRandom();
			expect(col.defaultRandomValue).toBe(true);

			col.defaultNow();
			expect(col.defaultNowValue).toBe(true);
		});
	});

	describe("pgTableBuilder", () => {
		it("should create a table object and call callback", () => {
			const columns = { id: {} };
			let callbackCalled = false;
			const table = pgTableBuilder("users", columns, (t: Record<string, unknown>) => {
				callbackCalled = true;
				expect(t).toHaveProperty("id");
			});

			expect(table).toHaveProperty("id");
			expect(table).toHaveProperty("$inferSelect");
			expect(callbackCalled).toBe(true);
		});
	});

	describe("varcharBuilder", () => {
		it("should create a varchar column", () => {
			const col = varcharBuilder("name", { length: 50 });
			expect(col.name).toBe("name");
		});
	});

	describe("pgIndexBuilder", () => {
		it("should return an empty object", () => {
			expect(pgIndexBuilder()).toEqual({});
		});
	});
});
