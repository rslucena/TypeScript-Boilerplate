import { mock } from "bun:test";
import { columnBuilder, pgIndexBuilder, pgTableBuilder, varcharBuilder } from "@tests/builders/column.builders";

mock.module("drizzle-orm/pg-core", () => {
	return {
		pgTable: pgTableBuilder,
		varchar: varcharBuilder,
		timestamp: mock(() => columnBuilder()),
		puuid: mock(() => columnBuilder()),
		boolean: mock(() => columnBuilder()),
	};
});

mock.module("@infrastructure/repositories/references", () => {
	return {
		identifier: {
			id: columnBuilder(),
			createdAt: columnBuilder(),
			updatedAt: columnBuilder(),
			deletedAt: columnBuilder(),
		},
		pgIndex: pgIndexBuilder,
	};
});

import { describe, expect, it } from "bun:test";
import identity from "@domain/identity/entity";

describe("Identity Entity", () => {
	it("should be defined", () => {
		expect(identity).toBeDefined();
	});

	it("should have field 'name'", () => {
		expect(identity.name).toBeDefined();
	});
});
