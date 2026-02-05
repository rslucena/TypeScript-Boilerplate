import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array, uuid } from "zod";
import credentials from "./entity";

const create = createInsertSchema(credentials, {
	identityId: uuid(),
	password: (schema) => schema.min(8).max(100),
});

const select = createSelectSchema(credentials, {
	identityId: uuid(),
	...zodIdentifier,
}).partial();

const actions = {
	headers,
	id: select.pick({ id: true }).required(),
	read: select.omit({ id: true }).extend(withPagination.shape),
	create: create.omit({ id: true }),
	update: create.omit({ id: true }).partial(),
	delete: create.pick({ id: true }),
};

export default { actions, entity: array(select) };
