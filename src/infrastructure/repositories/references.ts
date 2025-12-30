import type { refer } from "@infrastructure/repositories/interface";
import * as bcrypt from "bcrypt";
import {
	boolean,
	index,
	type IndexBuilder,
	type PgColumn,
	type PgTimestampConfig,
	uuid as puuid,
	timestamp,
} from "drizzle-orm/pg-core";
import { array, number, z } from "zod/v4";

const dateSettings: PgTimestampConfig = { mode: "date", precision: 6 };

const identifier = {
	id: puuid("id").primaryKey().defaultRandom().notNull(),
	activated: boolean("activated").default(true).notNull(),
	createdAt: timestamp("created_at", dateSettings).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", dateSettings),
	deletedAt: timestamp("deleted_at", dateSettings),
};

const zodIdentifier = {
	id: z.uuid(),
	activated: z.boolean().default(true),
	createdAt: z.date().or(z.string()).nullable(),
	updatedAt: z.date().or(z.string()).nullable(),
	deletedAt: z.date().or(z.string()).nullable(),
};

const withPagination = z.object({
	"req.page": array(number().min(1)).length(2).default([1, 10]),
});

function pgIndex(table: string, columns: { [key: string]: PgColumn }, keys: string[]) {
	const configs: IndexBuilder[] = [];
	for (const column of keys) configs.push(index(`${table}_${column}_idx`).on(columns[column]));
	configs.push(index(`${table}_activated_idx`).on(columns.activated));
	return configs;
}

function hash(data: object | string, compare?: string) {
	const dump = JSON.stringify(data);
	if (compare) return bcrypt.compareSync(dump, compare) ? "OK" : "";
	return bcrypt.hashSync(dump, 10);
}

function tag(domain: refer["domain"], method: refer["method"], conditions?: refer["conditions"]): string {
	let collection = `${domain}/${method}`;
	if (!conditions) return collection.toLowerCase().trim();
	collection += "/";
	for (const [key, value] of Object.entries(conditions)) collection += `{${key.replace("_", "")}:${value}}`;
	return collection.toLowerCase().trim();
}

export { hash, identifier, pgIndex, tag, withPagination, zodIdentifier };
