import identity from "@domain/identity/entity";
import { identifier } from "@infrastructure/repositories/references";
import { index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

const columns = {
	identityId: uuid("identityId")
		.references(() => identity.id)
		.notNull()
		.unique(),
	password: varchar("password", { length: 100 }).notNull(),
};

const credentials = pgTable("credentials", { ...columns, ...identifier }, (table) => [
	index("credentials_identityId_idx").on(table.identityId),
	index("credentials_activated_idx").on(table.activated),
]);

type credentials = typeof credentials.$inferSelect;

export default credentials;
