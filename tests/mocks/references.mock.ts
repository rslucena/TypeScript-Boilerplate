import type { Mock } from "bun:test";
import { mock } from "bun:test";
import type { Column } from "@tests/builders/column.builders";
import { columnBuilder } from "@tests/builders/column.builders";
import { z } from "zod";

export interface ReferencesMockType {
	tag: Mock<(domain: string, method: string, conditions?: Record<string, string>) => string>;
	hash: Mock<(val: string) => string>;
	pgIndex: Mock<() => unknown[]>;
	identifier: Record<string, Column>;
	zodIdentifier: Record<string, z.ZodTypeAny>;
	withPagination: { shape: { "req.page": z.ZodTypeAny } };
}

export const createReferencesMock = (): ReferencesMockType => ({
	tag: mock((domain: string, method: string, conditions?: Record<string, string>) => {
		let collection = `${domain}/${method}`;
		if (!conditions) return collection.toLowerCase().trim();
		collection += "/";
		for (const [key, value] of Object.entries(conditions)) collection += `{${key.replace("_", "")}:${value}}`;
		return collection.toLowerCase().trim();
	}),
	hash: mock((val) => `hashed-${val}`),
	pgIndex: mock(() => []),
	identifier: {
		id: columnBuilder(),
		activated: columnBuilder(),
		createdAt: columnBuilder(),
		updatedAt: columnBuilder(),
		deletedAt: columnBuilder(),
	},
	zodIdentifier: {
		id: z.uuid(),
		activated: z.boolean(),
		createdAt: z.date(),
		updatedAt: z.date().nullable(),
		deletedAt: z.date().nullable(),
	},
	withPagination: {
		shape: {
			"req.page": z.array(z.number()),
		},
	},
});

export const referencesMock: ReferencesMockType = createReferencesMock();
