import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/request";
import { eq } from "drizzle-orm";
import __name__ from "../entity";
import { default as schema } from "../schema";

export default async function deleteEntity(request: container) {
	request.status(204);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("__name__", "delete{id}"));

	const content = await repository.delete(__name__).where(eq(__name__.id, validRequest.data.id)).returning();

	if (!content.length) throw request.notFound(request.language(), tag("__name__", "delete"));

	await cache.json.del(tag("__name__", "find*"));

	return {};
}
