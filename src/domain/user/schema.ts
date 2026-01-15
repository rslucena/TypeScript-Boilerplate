import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array, object, string } from "zod";
import { default as users } from "./entity";

const create = createInsertSchema(users, {
	name: (schema) => schema.min(1).max(50),
	email: (schema) => schema.min(1).max(400),
	lastName: (schema) => schema.min(1).max(100),
	password: (schema) => schema.min(8).max(50),
	activated: (schema) => schema.default(true),
});

const select = createSelectSchema(users, {
	email: (schema) => schema.min(1).max(400),
	...zodIdentifier,
}).partial();

const auth = object({
	token: string(),
	refresh: string(),
});

const actions = {
	headers,
	id: select.pick({ id: true }).required(),
	read: select.omit({ id: true, password: true }).extend(withPagination.shape),
	create: {
		entity: create.omit({ id: true }),
		auth: create.pick({ email: true, password: true }),
	},
	update: create.omit({ id: true }).partial(),
	delete: create.pick({ id: true }),
};

const entity = select.omit({ password: true });
const read = array(entity);

export default { actions, entity, read, auth };
