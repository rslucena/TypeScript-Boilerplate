import { columnBuilder, pgIndexBuilder, pgTableBuilder, varcharBuilder } from "@tests/builders/column.builders";
import { mock } from "bun:test";

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

import user from "@domain/user/entity";
import { describe, expect, it } from "bun:test";

describe("User Entity", () => {
	it("should be defined", () => {
		expect(user).toBeDefined();
	});

	it("should have field 'name'", () => {
		expect(user.name).toBeDefined();
	});
});
