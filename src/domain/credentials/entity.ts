import identity from "@domain/identity/entity";
import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

const columns = {
	userId: uuid("userId")
		.references(() => identity.id)
		.notNull()
		.unique(),
	password: varchar("password", { length: 100 }).notNull(),
};

const credentials = pgTable("credentials", { ...columns, ...identifier }, (table) =>
	pgIndex("credentials", table, ["userId"]),
);

type credentials = typeof credentials.$inferSelect;

export default credentials;
