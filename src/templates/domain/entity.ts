import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { pgTable, varchar } from "drizzle-orm/pg-core";

const columns = {
	name: varchar("name", { length: 255 }).notNull(),
};

const __name__ = pgTable("__name__", { ...columns, ...identifier }, (table) => pgIndex("__name__", table, ["name"]));

type __name__ = typeof __name__.$inferSelect;

export default __name__;
