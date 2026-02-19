import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { pgTable, varchar } from "drizzle-orm/pg-core";

const columns = {
	name: varchar("name", { length: 50 }).notNull(),
	lastName: varchar("lastName", { length: 100 }),
	email: varchar("email", { length: 400 }).unique().notNull(),
};

const identity = pgTable("identity", { ...columns, ...identifier }, (table) =>
	pgIndex("identity", table, ["name", "email"]),
);

type identity = typeof identity.$inferSelect;

export default identity;
