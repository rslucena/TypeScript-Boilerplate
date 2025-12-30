import cache from "@infrastructure/cache/actions";
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
	if (!validParams.success) throw request.badRequest(request.language(), tag("user", "put{id}"));
	
	const validBody = await schema.actions.update.safeParseAsync(request.body());
	if (!validBody.success) throw request.badRequest(request.language(), tag("user", "put{id}"));

	const content = await repository
		.update(entity)
		.set({ ...validBody.data, updatedAt: new Date() })
		.where(eq(entity.id, validParams.data.id))
		.returning();

	if (!content.length) throw request.notFound(request.language(), tag("user", "put{id}"));

	await cache.json.del(tag("user", "find*"));

	return getById(new container({ params: { id: content[0].id } }));
}
