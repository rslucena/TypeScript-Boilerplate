import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { desc, eq, sql } from "drizzle-orm";
import __name__ from "../entity";
import { default as schema } from "../schema";

export default async function getById(request: container) {
	request.status(200);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("__name__", "find{id}").hash);

	const { id } = validRequest.data;
	const { hash: reference } = tag("__name__", "find{id}", { id });

	const cached = await cache.json.get<{ [key: string]: (typeof __name__)[] }>(reference);
	if (cached?.[reference]) return cached[reference];

	const prepare = repository
		.select()
		.from(__name__)
		.where(eq(__name__.id, sql.placeholder("id")))
		.limit(1)
		.orderBy(desc(__name__.id))
		.prepare("/__name__/id");

	const content = await prepare.execute({ id });

	if (!content.length) throw request.notFound(request.language(), tag("__name__", "find{id}").hash);

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
