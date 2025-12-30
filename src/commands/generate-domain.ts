import path from "node:path";

if (!process.argv[2]) {
	console.error("Please provide a name name: bun gen:name <name>");
	process.exit(1);
}

const name = process.argv[2];
const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
const domain = path.join(process.cwd(), "src", "domain", name);
const tests = path.join(process.cwd(), "tests", "unit", "domain", name);

const entity = `import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { pgTable, varchar } from "drizzle-orm/pg-core";

const columns = {
	name: varchar("name", { length: 255 }).notNull(),
};

const ${name} = pgTable("${name}", { ...columns, ...identifier }, (table) => pgIndex("${name}", table, ["name"]));

type ${name} = typeof ${name}.$inferSelect;

export default ${name};
`;

const schema = `import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array, object } from "zod/v4";
import ${name} from "./entity";

const create = createInsertSchema(${name}, {
	name: (schema) => schema.min(1).max(255),
});

const select = createSelectSchema(${name}, {
	...zodIdentifier,
}).partial();

const actions = {
	headers,
	id: select.pick({ id: true }).required(),
	read: object({
		...select.omit({ id: true }).shape,
		...withPagination.shape,
	}),
	create: create.omit({ id: true }),
	update: create.omit({ id: true }).partial(),
	delete: create.pick({ id: true }),
};

export default { actions, entity: array(select) };
`;

const routes = `import request from "@infrastructure/server/request";
import type { FastifyInstance } from "fastify";
import deleteEntity from "./actions/delete-entity";
import getById from "./actions/get-by-id";
import getFindByParams from "./actions/get-find-by-params";
import postNewEntity from "./actions/post-new-entity";
import putUpdateEntity from "./actions/put-update-entity";
import schema from "./schema";

export default async function ${name}Routes(api: FastifyInstance) {
	api.get("/ping", { schema: { tags: ["${capitalized}"] } }, (_, reply) => reply.code(200).send());
	
	api.get(
		"/:id",
		{
			schema: {
				tags: ["${capitalized}"],
				summary: "Find ${name} by id",
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
				summary: "Find ${name}",
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
				summary: "Create new ${name}",
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
				summary: "Update ${name}",
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
				summary: "Delete ${name}",
				params: schema.actions.id,
				response: { 204: {}, ...request.reply.schemas },
			},
		},
		request.restricted(deleteEntity),
	);
}
`;

const id = `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { desc, eq, sql } from "drizzle-orm";
import ${name} from "../entity";
import { default as schema } from "../schema";

export default async function getById(request: container) {
	request.status(200);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("${name}", "find{id}"));

	const { id } = validRequest.data;
	const reference = tag("${name}", "find{id}", { id });

	const cached = await cache.json.get<{ [key: string]: typeof ${name}[] }>(reference);
	if (cached?.[reference]) return cached[reference];

	const prepare = repository
		.select()
		.from(${name})
		.where(eq(${name}.id, sql.placeholder("id")))
		.limit(1)
		.orderBy(desc(${name}.id))
		.prepare("/${name}/id");

	const content = await prepare.execute({ id });

	if (!content.length) throw request.notFound(request.language(), tag("${name}", "find{id}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
`;

const find = `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository, { withPagination } from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import ${name} from "../entity";
import { default as schema } from "../schema";

export default async function getFindByParams(request: container) {
	request.status(200);

	const validRequest = await schema.actions.read.safeParseAsync(request.query());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("${name}", "find{params}"));

	const { data } = validRequest;
	const reference = tag("${name}", "find{params}", data);

	const cached = await cache.json.get<{ [key: string]: typeof ${name}.$inferSelect[] }>(reference);
	if (cached?.[reference]) return cached[reference];

	if (data.name) data.name = \`%\${data.name}%\`;

	const prepare = repository
		.select()
		.from(${name})
		.where(
			and(
				data.name ? ilike(${name}.name, sql.placeholder("name")) : undefined,
				data.activated !== undefined ? eq(${name}.activated, sql.placeholder("activated")) : undefined,
			),
		)
		.orderBy(desc(${name}.id))
		.$dynamic();

	withPagination(prepare, data["req.page"][0], data["req.page"][1]);

	const content = await prepare.execute(validRequest.data);

	if (!content.length) throw request.notFound(request.language(), tag("${name}", "find{params}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
`;

const create = `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/request";
import ${name} from "../entity";
import { default as schema } from "../schema";
import getById from "./get-by-id";

export default async function postNewEntity(request: container) {
	request.status(201);

	const validRequest = await schema.actions.create.safeParseAsync(request.body());
	if (!validRequest.success) throw request.badRequest(request.language(), "post/${name}/{params}");

	const content = await repository
		.insert(${name})
		.values(validRequest.data)
		.onConflictDoNothing()
		.returning();

	if (!content.length) throw request.unprocessableEntity(request.language(), tag("${name}", "create"));

	await cache.json.del(tag("${name}", "find*"));

	return getById(new container({ params: { id: content[0].id } }));
}
`;

const update = `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/request";
import { eq } from "drizzle-orm";
import ${name} from "../entity";
import { default as schema } from "../schema";
import getById from "./get-by-id";

export default async function putUpdateEntity(request: container) {
	request.status(200);

	const validParams = await schema.actions.id.safeParseAsync(request.params());
	if (!validParams.success) throw request.badRequest(request.language(), tag("${name}", "update{id}"));

	const validBody = await schema.actions.update.safeParseAsync(request.body());
	if (!validBody.success) throw request.badRequest(request.language(), tag("${name}", "update{id}"));

	const content = await repository
		.update(${name})
		.set({ ...validBody.data, updatedAt: new Date() })
		.where(eq(${name}.id, validParams.data.id))
		.returning();

	if (!content.length) throw request.notFound(request.language(), tag("${name}", "update{id}"));

	await cache.json.del(tag("${name}", "find*"));

	return getById(new container({ params: { id: content[0].id } }));
}
`;

const remove = `import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { eq } from "drizzle-orm";
import ${name} from "../entity";
import { default as schema } from "../schema";

export default async function deleteEntity(request: container) {
	request.status(204);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("${name}", "delete{id}"));

	const content = await repository
		.delete(${name})
		.where(eq(${name}.id, validRequest.data.id))
		.returning();

	if (!content.length) throw request.notFound(request.language(), tag("${name}", "delete"));

	await cache.json.del(tag("${name}", "find*"));

	return {};
}
`;

console.log(`🚀 Generating domain: ${name}...`);

const writers = [
	Bun.write(path.join(domain, "entity.ts"), entity),
	Bun.write(path.join(domain, "schema.ts"), schema),
	Bun.write(path.join(domain, "routes.ts"), routes),

	Bun.write(path.join(domain, "actions", "get-by-id.ts"), id),
	Bun.write(path.join(domain, "actions", "get-find-by-params.ts"), find),
	Bun.write(path.join(domain, "actions", "post-new-entity.ts"), create),
	Bun.write(path.join(domain, "actions", "put-update-entity.ts"), update),
	Bun.write(path.join(domain, "actions", "delete-entity.ts"), remove),
];

await Bun.spawn(["mkdir", "-p", tests]);

await Promise.all(writers);

const webserverPath = path.join(process.cwd(), "src", "functions", "http-primary-webserver.ts");
const webserverFile = Bun.file(webserverPath);

if (await webserverFile.exists()) {
	let content = await webserverFile.text();
	const importStatement = `import ${name}Routes from "@domain/${name}/routes";`;
	const registerStatement = `	server.register(${name}Routes, { prefix: "/api/v1/${name}s" });`;
	
	if (!content.includes(importStatement)) {
		const lastImportIndex = content.lastIndexOf("import ");
		const endOfLastImport = content.indexOf("\n", lastImportIndex);
		content = `${content.slice(0, endOfLastImport + 1) + importStatement}\n${content.slice(endOfLastImport + 1)}`;

		const lastRegisterIndex = content.lastIndexOf("server.register(");
		
		if (lastRegisterIndex !== -1) {
			const endOfLastRegister = content.indexOf(");", lastRegisterIndex);
			const endOfLine = content.indexOf("\n", endOfLastRegister);
			content = `${content.slice(0, endOfLine + 1) + registerStatement}\n${content.slice(endOfLine + 1)}`;
		}
		
		if (lastRegisterIndex === -1) {
			const serverCreate = content.indexOf("webserver.create()");
			
			if (serverCreate !== -1) {
				const endOfLine = content.indexOf("\n", serverCreate);
				content = `${content.slice(0, endOfLine + 1) + registerStatement}\n${content.slice(endOfLine + 1)}`;
			}

		}

		await Bun.write(webserverPath, content);
		console.log(`🔗 Injected route into http-primary-webserver.ts`);
	} 
} 

console.log(`\n✅ Domain "${name}" generated successfully!`);
console.log(`\n📂 Created Files:`);
console.log(`   - src/domain/${name}/entity.ts`);
console.log(`   - src/domain/${name}/schema.ts`);
console.log(`   - src/domain/${name}/routes.ts`);
console.log(`   - src/domain/${name}/actions/...`);
console.log(`   - tests/unit/domain/${name}/crud.spec.ts`);

console.log(`\n📍 Location: src/domain/${name}`);
console.log(`\n👇 Next Steps:`);
console.log(`   1. Review the generated schema in src/domain/${name}/schema.ts`);
console.log(`   2. Run migration if necessary: bun run db:migrate`);
console.log(`   3. Run tests: bun test tests/unit/domain/${name}/crud.spec.ts`);

console.log(`\n🎨 Running formatter...`);

await Bun.spawn(["bunx", "biome", "check", "--write", domain, tests, webserverPath]);

console.log(`✨ Formatting complete!`);
