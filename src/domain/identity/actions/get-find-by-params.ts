import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository, { withPagination } from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import identity from "../entity";
import { default as schema } from "../schema";

export default async function getFindByParams(request: container) {
	request.status(200);

	const validRequest = await schema.actions.read.safeParseAsync(request.query());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("identity", "find{params}"));

	const { data } = validRequest;
	const reference = tag("identity", "find{params}", data);

	const cached = await cache.json.get<identity[]>(reference);
	if (cached) return cached;

	if (data.name) data.name = `%${data.name}%`;
	if (data.lastName) data.lastName = `%${data.lastName}%`;
	if (data.email) data.email = `%${data.email}%`;
	if (data.createdAt) data.createdAt = `${data.createdAt}%`;
	if (data.deletedAt) data.deletedAt = `${data.deletedAt}%`;
	if (data.updatedAt) data.updatedAt = `${data.updatedAt}%`;

	const prepare = repository
		.select()
		.from(identity)
		.where(
			and(
				data.name ? ilike(identity.name, sql.placeholder("name")) : undefined,
				data.lastName ? ilike(identity.lastName, sql.placeholder("lastName")) : undefined,
				data.email ? ilike(identity.email, sql.placeholder("email")) : undefined,
				data.createdAt ? ilike(identity.createdAt, sql.placeholder("createdAt")) : undefined,
				data.updatedAt ? ilike(identity.updatedAt, sql.placeholder("updatedAt")) : undefined,
				data.deletedAt ? ilike(identity.deletedAt, sql.placeholder("deletedAt")) : undefined,
				data.activated !== undefined ? eq(identity.activated, sql.placeholder("activated")) : undefined,
			),
		)
		.orderBy(desc(identity.id))
		.$dynamic();

	withPagination(prepare, data["req.page"][0], data["req.page"][1]);

	const content = await prepare.execute(validRequest.data);

	if (!content.length) throw request.notFound(request.language(), tag("identity", "find{params}"));

	await cache.json.set(reference, content, 60 * 10);

	return content;
}
