import cache from "@infrastructure/cache/actions";
import { hash, tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import { authentication, type container } from "@infrastructure/server/request";
import { desc, eq, sql } from "drizzle-orm";
import user from "../entity";
import { default as schema } from "../schema";

export default async function postNewAuth(request: container) {
	request.status(201);

	const validRequest = await schema.actions.create.auth.safeParseAsync(request.body());
	if (!validRequest.success) throw request.badRequest(tag("user", "auth{params}"));

	const { data } = validRequest;
	const reference = tag("user", "auth{params}", { email: data.email });

	const cached = await cache.json.get<{ token: string; refresh: string }>(reference);
	if (cached) {
		request.headers({ authorization: `Bearer ${cached.token}` });
		return cached;
	}

	const prepare = repository
		.select({
			id: user.id,
			email: user.email,
			password: user.password,
		})
		.from(user)
		.where(eq(user.email, sql.placeholder("email")))
		.limit(1)
		.orderBy(desc(user.id))
		.prepare("post/user/auth");

	const content = await prepare.execute(validRequest.data);

	const errMessage = tag("user", "auth{params}", { email: validRequest.data.email });
	if (!content.length) throw request.unprocessableEntity(errMessage);
	if (!hash(validRequest.data.password, content[0].password)) throw request.notFound(errMessage);

	const secrets = {
		token: new authentication().create({
			id: content[0].id,
			email: content[0].email,
		}),
		refresh: hash(content[0].password),
	};

	request.headers({ authorization: `Bearer ${secrets.token}` });

	await cache.json.set(reference, secrets, 60 * 10);

	return secrets;
}
