import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers, health } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array, object, string, type ZodString } from "zod";
import { default as identity } from "./entity";

const transform = (schema: ZodString) => schema.transform((v) => v.toLowerCase());

const create = createInsertSchema(identity, {
	name: (schema) => schema.min(1).max(50),
	email: (schema) => transform(schema.min(1).max(400)),
	lastName: (schema) => schema.min(1).max(100),
	activated: (schema) => schema.default(true),
});

const select = createSelectSchema(identity, {
	email: (schema) => transform(schema.min(1).max(400)),
	...zodIdentifier,
}).partial();

const auth = object({
	token: string(),
	refresh: string(),
});

const actions = {
	headers,
	health,
	id: select.pick({ id: true }).required(),
	read: select.omit({ id: true }).extend(withPagination.shape),
	create: create.omit({ id: true }),
	update: create.omit({ id: true }).partial(),
	delete: create.pick({ id: true }),
};

const entity = array(select);

export default { actions, entity, auth };
