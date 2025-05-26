import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import user from "../entity";
import { default as schema } from "../schema";

export default async function getById(request: container) {
	request.status(200);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(tag("user", "find{id}"));

	const { id } = validRequest.data;
	const reference = tag("user", "find{id}", { id });

	const cached = await cache.json.get<user[]>(reference);
	if (cached) return cached;

	const { password, ...outhers } = getTableColumns(user);

	const prepare = repository
		.select(outhers)
		.from(user)
		.where(eq(user.id, sql.placeholder("id")))
		.limit(1)
		.orderBy(desc(user.id))
		.prepare("/user/id");

	const content = await prepare.execute({ id });

	if (!content.length) throw request.notFound(tag("user", "find{id}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
