import identity from "@domain/identity/entity";
import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

const columns = {
	identityId: uuid("identityId")
		.references(() => identity.id)
		.notNull(),
	type: varchar("type", { length: 50 }).notNull(),
	provider: varchar("provider", { length: 100 }),
	subject: varchar("subject", { length: 255 }),
	login: varchar("login", { length: 255 }),
	secret: text("secret"),
	revokedAt: timestamp("revoked_at", { withTimezone: true }),
	revokedReason: varchar("revoked_reason", { length: 255 }),
};

const credentials = pgTable("credentials", { ...columns, ...identifier }, (table) => [
	index("credentials_login_provider_idx").on(table.login, table.provider),
	index("credentials_provider_subject_idx").on(table.provider, table.subject),
	uniqueIndex("credentials_identity_provider_unique_idx").on(table.identityId, table.provider),
	...pgIndex("credentials", table, ["identityId", "provider", "subject", "type"]),
]);

type credentials = typeof credentials.$inferSelect;

export default credentials;
