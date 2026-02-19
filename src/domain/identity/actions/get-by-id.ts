import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { desc, eq, sql } from "drizzle-orm";
import identity from "../entity";
import { default as schema } from "../schema";

export default async function getById(request: container) {
	request.status(200);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("identity", "find{id}"));

	const { id } = validRequest.data;
	const reference = tag("identity", "find{id}", { id });

	const cached = await cache.json.get<identity[]>(reference);
	if (cached) return cached;

	const prepare = repository
		.select()
		.from(identity)
		.where(eq(identity.id, sql.placeholder("id")))
		.limit(1)
		.orderBy(desc(identity.id))
		.prepare("/identity/id");

	const content = await prepare.execute({ id });

	if (!content.length) throw request.notFound(request.language(), tag("identity", "find{id}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
