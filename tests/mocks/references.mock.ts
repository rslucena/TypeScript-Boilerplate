import { mock } from "bun:test";
import { columnBuilder } from "@tests/builders/column.builders";
import { z } from "zod";

export const createReferencesMock = () => ({
	tag: mock((domain, method, conditions) => {
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

export const referencesMock = createReferencesMock();
