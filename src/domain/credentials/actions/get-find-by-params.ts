import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository, { withPagination } from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { and, desc, eq, sql } from "drizzle-orm";
import credentials from "../entity";
import schema from "../schema";

export default async function getFindByParams(request: container) {
	request.status(200);

	const validRequest = await schema.actions.read.safeParseAsync(request.query());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("credentials", "find{params}"));

	const { data } = validRequest;
	const reference = tag("credentials", "find{params}", data);

	const cached = await cache.json.get<(typeof credentials.$inferSelect)[]>(reference);
	if (cached) return cached;

	const prepare = repository
		.select()
		.from(credentials)
		.where(and(data.activated !== undefined ? eq(credentials.activated, sql.placeholder("activated")) : undefined))
		.orderBy(desc(credentials.id))
		.$dynamic();

	withPagination(prepare, data["req.page"][0], data["req.page"][1]);

	const content = await prepare.execute(validRequest.data);

	if (!content.length) throw request.notFound(request.language(), tag("credentials", "find{params}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
