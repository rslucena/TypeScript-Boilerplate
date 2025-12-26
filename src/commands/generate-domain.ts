import fs from "node:fs";
import path from "node:path";

const domainName = process.argv[2];

if (!domainName) {
	console.error("Please provide a domain name: bun gen:domain <name>");
	process.exit(1);
}

const capitalized = domainName.charAt(0).toUpperCase() + domainName.slice(1);
const domainPath = path.join(process.cwd(), "src", "domain", domainName);
const testPath = path.join(process.cwd(), "tests", "unit", "domain", domainName);

const templates = {
	entity: `import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { pgTable, varchar } from "drizzle-orm/pg-core";

const columns = {
	name: varchar("name", { length: 255 }).notNull(),
};

const ${domainName} = pgTable("${domainName}", { ...columns, ...identifier }, (table) => pgIndex("${domainName}", table, ["name"]));

type ${domainName} = typeof ${domainName}.$inferSelect;

export default ${domainName};
`,
	schema: `import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array, object } from "zod/v4";
import { default as entity } from "./entity";

const create = createInsertSchema(entity, {
	name: (schema) => schema.min(1).max(255),
});

const select = createSelectSchema(entity, {
	...zodIdentifier,
}).partial();

const actions = {
	headers,
	id: select.pick({ id: true }),
	read: object({
		...select.omit({ id: true }).shape,
		...withPagination.shape,
	}),
	create: create.omit({ id: true }),
	update: create.omit({ id: true }).partial(),
	delete: create.pick({ id: true }),
};

const response = array(select);

export default { actions, entity: response };
`,
	routes: `import request from "@infrastructure/server/request";
import type { FastifyInstance } from "fastify";
import deleteEntity from "./actions/delete-entity";
import getById from "./actions/get-by-id";
import getFindByParams from "./actions/get-find-by-params";
import postNewEntity from "./actions/post-new-entity";
import putUpdateEntity from "./actions/put-update-entity";
import schema from "./schema";

export default async function ${domainName}Routes(api: FastifyInstance) {
	api.get("/ping", { schema: { tags: ["${capitalized}"] } }, (_, reply) => reply.code(200).send());
	
	api.get(
		"/:id",
		{
			schema: {
				tags: ["${capitalized}"],
				summary: "Find ${domainName} by id",
				params: schema.actions.id,
				headers: schema.actions.headers,
				response: { 200: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(getById),
	);

	api.get(
		"/",
		{
			schema: {
				tags: ["${capitalized}"],
				summary: "Find ${domainName}s",
				headers: schema.actions.headers,
				querystring: schema.actions.read,
				response: { 200: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(getFindByParams),
	);

	api.post(
		"/",
		{
			schema: {
				tags: ["${capitalized}"],
				summary: "Create new ${domainName}",
				body: schema.actions.create,
				response: { 201: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(postNewEntity),
	);

	api.put(
		"/:id",
		{
			schema: {
				tags: ["${capitalized}"],
				summary: "Update ${domainName}",
				params: schema.actions.id,
				body: schema.actions.update,
				response: { 200: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(putUpdateEntity),
	);

	api.delete(
		"/:id",
		{
			schema: {
				tags: ["${capitalized}"],
				summary: "Delete ${domainName}",
				params: schema.actions.id,
				response: { 204: {}, ...request.reply.schemas },
			},
		},
		request.restricted(deleteEntity),
	);
}
`,
	getById: `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { desc, eq, sql } from "drizzle-orm";
import entity from "../entity";
import { default as schema } from "../schema";

export default async function getById(request: container) {
	request.status(200);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("${domainName}", "find{id}"));

	const { id } = validRequest.data;
	const reference = tag("${domainName}", "find{id}", { id });

	const cached = await cache.json.get<{ [key: string]: typeof entity.$inferSelect[] }>(reference);
	if (cached?.[reference]) return cached[reference];

	const prepare = repository
		.select()
		.from(entity)
		.where(eq(entity.id, sql.placeholder("id")))
		.limit(1)
		.orderBy(desc(entity.id))
		.prepare("/${domainName}/id");

	const content = await prepare.execute({ id });

	if (!content.length) throw request.notFound(request.language(), tag("${domainName}", "find{id}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
`,
	getFindByParams: `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository, { withPagination } from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import entity from "../entity";
import { default as schema } from "../schema";

export default async function getFindByParams(request: container) {
	request.status(200);

	const validRequest = await schema.actions.read.safeParseAsync(request.query());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("${domainName}", "find{params}"));

	const { data } = validRequest;
	const reference = tag("${domainName}", "find{params}", data);

	const cached = await cache.json.get<{ [key: string]: typeof entity.$inferSelect[] }>(reference);
	if (cached?.[reference]) return cached[reference];

	if (data.name) data.name = \`%\${data.name}%\`;

	const prepare = repository
		.select()
		.from(entity)
		.where(
			and(
				data.name ? ilike(entity.name, sql.placeholder("name")) : undefined,
				data.activated !== undefined ? eq(entity.activated, sql.placeholder("activated")) : undefined,
			),
		)
		.orderBy(desc(entity.id))
		.$dynamic();

	withPagination(prepare, data["req.page"][0], data["req.page"][1]);

	const content = await prepare.execute(validRequest.data);

	if (!content.length) throw request.notFound(request.language(), tag("${domainName}", "find{params}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
`,
	postNewEntity: `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/request";
import entity from "../entity";
import { default as schema } from "../schema";
import getById from "./get-by-id";

export default async function postNewEntity(request: container) {
	request.status(201);

	const validRequest = await schema.actions.create.safeParseAsync(request.body());
	if (!validRequest.success) throw request.badRequest(request.language(), "post/${domainName}/{params}");

	const content = await repository
		.insert(entity)
		.values(validRequest.data)
		.onConflictDoNothing()
		.returning();

	if (!content.length) throw request.unprocessableEntity(request.language(), tag("${domainName}", "create"));

	await cache.json.del(tag("${domainName}", "find*"));

	return getById(new container({ params: { id: content[0].id } }));
}
`,
	putUpdateEntity: `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/request";
import { eq } from "drizzle-orm";
import entity from "../entity";
import { default as schema } from "../schema";
import getById from "./get-by-id";

export default async function putUpdateEntity(request: container) {
	request.status(200);

	const validParams = await schema.actions.id.safeParseAsync(request.params());
	if (!validParams.success) throw request.badRequest(request.language(), tag("${domainName}", "update{params}"));

	const validBody = await schema.actions.update.safeParseAsync(request.body());
	if (!validBody.success) throw request.badRequest(request.language(), tag("${domainName}", "update{body}"));

	const content = await repository
		.update(entity)
		.set({ ...validBody.data, updatedAt: new Date() })
		.where(eq(entity.id, validParams.data.id))
		.returning();

	if (!content.length) throw request.notFound(request.language(), tag("${domainName}", "update"));

	await cache.json.del(tag("${domainName}", "find*"));

	return getById(new container({ params: { id: content[0].id } }));
}
`,
	deleteEntity: `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { eq } from "drizzle-orm";
import entity from "../entity";
import { default as schema } from "../schema";

export default async function deleteEntity(request: container) {
	request.status(204);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("${domainName}", "delete{id}"));

	const content = await repository
		.delete(entity)
		.where(eq(entity.id, validRequest.data.id))
		.returning();

	if (!content.length) throw request.notFound(request.language(), tag("${domainName}", "delete"));

	await cache.json.del(tag("${domainName}", "find*"));

	return {};
}
`,
	test: `import { describe, expect, it } from "bun:test";
import { container } from "@infrastructure/server/request";

describe("${capitalized} Domain", () => {
	it("should have tests implemented", () => {
		expect(true).toBe(true);
	});
});
`
};

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

console.log(`🚀 Generating domain: ${domainName}...`);

ensureDir(domainPath);
ensureDir(path.join(domainPath, "actions"));
ensureDir(testPath);

fs.writeFileSync(path.join(domainPath, "entity.ts"), templates.entity);
fs.writeFileSync(path.join(domainPath, "schema.ts"), templates.schema);
fs.writeFileSync(path.join(domainPath, "routes.ts"), templates.routes);

fs.writeFileSync(path.join(domainPath, "actions", "get-by-id.ts"), templates.getById);
fs.writeFileSync(path.join(domainPath, "actions", "get-find-by-params.ts"), templates.getFindByParams);
fs.writeFileSync(path.join(domainPath, "actions", "post-new-entity.ts"), templates.postNewEntity);
fs.writeFileSync(path.join(domainPath, "actions", "put-update-entity.ts"), templates.putUpdateEntity);
fs.writeFileSync(path.join(domainPath, "actions", "delete-entity.ts"), templates.deleteEntity);

fs.writeFileSync(path.join(testPath, "crud.spec.ts"), templates.test);

console.log(`✅ Domain ${domainName} generated successfully!`);
console.log(`📍 Location: src/domain/${domainName}`);
console.log(`🧪 Test: tests/unit/domain/${domainName}/crud.spec.ts`);
