import cache from "@infrastructure/cache/actions";
import { credential } from "@infrastructure/pipes/credential";
import { hash, tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { container } from "@infrastructure/server/interface";
import credentials from "../entity";
import { default as schema } from "../schema";
import getById from "./get-by-id";

export default async function postNewEntity(request: container) {
	request.status(201);

	const valid = await schema.actions.create.safeParseAsync(request.body());
	if (!valid.success) throw request.badRequest(request.language(), tag("credentials", "create/schema"));

	const roles = credential({
		type: valid.data.type,
		provider: valid.data.provider,
		subject: valid.data.subject,
		secret: valid.data.secret,
	});

	if (!roles) throw request.badRequest(request.language(), tag("credentials", "create/validation"));

	const content = await repository
		.insert(credentials)
		.values({
			...valid.data,
			...(valid.data.secret && { secret: hash(valid.data.secret) }),
		})
		.onConflictDoNothing()
		.returning();

	if (!content.length) throw request.conflict(request.language(), tag("credentials", "create"));

	await cache.json.del(tag("credentials", "find*"));

	return getById(new container({ params: { id: content[0].id } }));
}
