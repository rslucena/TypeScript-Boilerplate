import cache from "@infrastructure/cache/actions";
import { hash, tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/interface";
import { eq } from "drizzle-orm";
import credentials from "../entity";
import { default as schema } from "../schema";
import getById from "./get-by-id";

export default async function putUpdateEntity(request: container) {
	request.status(200);

	const validParams = await schema.actions.id.safeParseAsync(request.params());
	if (!validParams.success) throw request.badRequest(request.language(), tag("credentials", "update{id}"));

	const validBody = await schema.actions.update.safeParseAsync(request.body());
	if (!validBody.success) throw request.badRequest(request.language(), tag("credentials", "update{id}"));

	const content = await repository
		.update(credentials)
		.set({
			...validBody.data,
			updatedAt: new Date(),
			...(validBody.data.password && { password: hash(validBody.data.password) }),
		})
		.where(eq(credentials.id, validParams.data.id))
		.returning();

	if (!content.length) throw request.notFound(request.language(), tag("credentials", "update{id}"));

	await cache.json.del(tag("credentials", "find*"));

	return getById(new container({ params: { id: content[0].id } }));
}
