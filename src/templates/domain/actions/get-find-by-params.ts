import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository, { withPagination } from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import __name__ from "../entity";
import { default as schema } from "../schema";

export default async function getFindByParams(request: container) {
	request.status(200);

	const validRequest = await schema.actions.read.safeParseAsync(request.query());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("__name__", "find{params}"));

	const { data } = validRequest;
	const reference = tag("__name__", "find{params}", data);

	const cached = await cache.json.get<{ [key: string]: (typeof __name__.$inferSelect)[] }>(reference);
	if (cached?.[reference]) return cached[reference];

	if (data.name) data.name = `%${data.name}%`;

	const prepare = repository
		.select()
		.from(__name__)
		.where(
			and(
				data.name ? ilike(__name__.name, sql.placeholder("name")) : undefined,
				data.activated !== undefined ? eq(__name__.activated, sql.placeholder("activated")) : undefined,
			),
		)
		.orderBy(desc(__name__.id))
		.$dynamic();

	withPagination(prepare, data["req.page"][0], data["req.page"][1]);

	const content = await prepare.execute(validRequest.data);

	if (!content.length) throw request.notFound(request.language(), tag("__name__", "find{params}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
