import cache from "@infrastructure/cache/actions";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/interface";
import __name__ from "../entity";
import { default as schema } from "../schema";
import getById from "./get-by-id";

export default async function postNewEntity(request: container) {
	request.status(201);

	const validRequest = await schema.actions.create.safeParseAsync(request.body());
	if (!validRequest.success) throw request.badRequest(request.language(), "post/__name__/{params}");

	const content = await repository.insert(__name__).values(validRequest.data).onConflictDoNothing().returning();

	if (!content.length) throw request.conflict(request.language(), tag("__name__", "create"));

	await cache.json.del(tag("__name__", "find*"));

	return getById(new container({ params: { id: content[0].id } }));
}
