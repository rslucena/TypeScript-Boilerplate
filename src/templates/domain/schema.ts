import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array } from "zod";
import __name__ from "./entity";

const create = createInsertSchema(__name__, {
	name: (schema) => schema.min(1).max(255),
});

const select = createSelectSchema(__name__, {
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
