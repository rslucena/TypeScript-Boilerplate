import cache from "@infrastructure/cache/actions";
import { hash, tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/interface";
import user from "../entity";
import { default as schema } from "../schema";
import getById from "./get-by-id";

export default async function postNewEntity(request: container) {
	request.status(201);

	const validRequest = await schema.actions.create.entity.safeParseAsync(request.body());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("user", "post/user/{params}").hash);

	const content = await repository
		.insert(user)
		.values({
			...validRequest.data,
			password: hash(validRequest.data.password),
		})
		.onConflictDoNothing()
		.returning();

	if (!content.length) throw request.conflict(request.language(), tag("user", "post/user/{params}").hash);

	await cache.invalidate("user");

	return getById(new container({ params: { id: content[0].id } }));
}
