import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array, uuid, z } from "zod";
import { providers, types } from "./constants";
import credentials from "./entity";

const create = createInsertSchema(credentials, {
	type: () => z.enum(types),
	provider: () => z.enum(providers),
	subject: (schema) => schema.min(1).max(255),
	login: (schema) => schema.trim().optional(),
	secret: (schema) => schema.trim().optional(),
	revokedReason: (schema) => schema.trim().min(3).max(255).optional(),
});

const select = createSelectSchema(credentials, {
	identityId: uuid(),
	...zodIdentifier,
}).partial();

const actions = {
	headers,
	id: select.pick({ id: true }).required(),
	read: select.omit({ id: true }).extend(withPagination.shape),
	create: create
		.omit({ id: true })
		.extend({ type: z.enum(types), provider: z.enum(providers) })
		.superRefine((data, ctx) => {
			if (data.type === types.PASSWORD && !data.secret) {
				ctx.addIssue({
					code: "custom",
					message: "Secret is required for PASSWORD type",
					path: ["secret"],
				});
			}
			if (data.type === types.OIDC && !data.subject) {
				ctx.addIssue({
					code: "custom",
					message: "Subject is required for OIDC type",
					path: ["subject"],
				});
			}
		}),
	update: create.pick({ login: true, secret: true }),
	delete: create.pick({ revokedReason: true }).required(),
	find: z.object({
		provider: z.enum(providers).optional(),
		subject: z.string().optional(),
		identityId: uuid().optional(),
	}),
};

export default { actions, entity: array(select) };
