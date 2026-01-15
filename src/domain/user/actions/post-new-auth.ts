import jwt from "@infrastructure/authentication/strategies/jwt";
import cache from "@infrastructure/cache/actions";
import { hash, tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { desc, eq, sql } from "drizzle-orm";
import user from "../entity";
import { default as schema } from "../schema";

export default async function postNewAuth(request: container) {
	request.status(201);

	const validRequest = await schema.actions.create.auth.safeParseAsync(request.body());
	if (!validRequest.success) throw request.badRequest(request.language(), tag("user", "auth{params}"));

	const { data } = validRequest;
	const reference = tag("user", "auth{params}", { email: data.email });

	const cached = await cache.json.get<{ [key: string]: { token: string; refresh: string } }>(reference);
	if (cached?.[reference]) {
		request.headers({ authorization: `Bearer ${cached[reference].token}` });
		return cached[reference];
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
	if (!content.length) throw request.unprocessableEntity(request.language(), errMessage);
	if (!hash(validRequest.data.password, content[0].password)) throw request.notFound(request.language(), errMessage);

	const secrets = {
		token: jwt.create({
			id: content[0].id,
			email: content[0].email,
		}),
		refresh: hash(content[0].password),
	};

	request.headers({ authorization: `Bearer ${secrets.token}` });

	await cache.json.set(reference, secrets, 60 * 10);

	return secrets;
}
