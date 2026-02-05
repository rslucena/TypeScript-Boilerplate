import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { eq } from "drizzle-orm";
import credentials from "../entity";
import schema from "../schema";

export default async function deleteEntity(request: container) {
	request.status(204);

	const validRequest = await schema.actions.id.safeParseAsync(request.params());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("credentials", "delete{id}"));

	const content = await repository.delete(credentials).where(eq(credentials.id, validRequest.data.id)).returning();

	if (!content.length) throw request.notFound(request.language(), tag("credentials", "delete"));

	await cache.json.del(tag("credentials", "find*"));

	return {};
}
