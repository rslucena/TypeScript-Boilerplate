import identity from "@domain/identity/entity";
import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

const columns = {
	userId: uuid("userId")
		.references(() => identity.id)
		.notNull(),
	provider: varchar("provider", { length: 50 }).notNull(),
	providerId: varchar("providerId", { length: 255 }).notNull(),
	email: varchar("email", { length: 400 }),
};

const sso = pgTable("sso", { ...columns, ...identifier }, (table) => [
	...pgIndex("sso", table, ["userId", "provider"]),
]);

type sso = typeof sso.$inferSelect;

export default sso;
