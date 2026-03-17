import { providers } from "@domain/credentials/constants";
import credentials from "@domain/credentials/entity";
import identity from "@domain/identity/entity";
import * as jwt from "@infrastructure/authentication/jwt";
import { hash, tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { and, eq, sql } from "drizzle-orm";
import schema from "../schema";

export default async function postLocalLogin(request: container) {
	const valid = await schema.actions.local.safeParseAsync(request.body());
	if (!valid.success) throw request.badRequest(request.language(), tag("sso", "local/schema"));

	const prepare = repository
		.select({
			id: identity.id,
			name: identity.name,
			secret: credentials.secret,
		})
		.from(identity)
		.innerJoin(credentials, eq(identity.id, credentials.identityId))
		.where(and(eq(identity.email, sql.placeholder("email")), eq(credentials.provider, providers.LOCAL)))
		.limit(1)
		.prepare("sso_local_login");

	const content = await prepare.execute({ email: valid.data.email });

	if (!content.length) throw request.unauthorized(request.language());

	const credential = content[0];
	if (!credential.secret) throw request.unauthorized(request.language());

	const isValid = hash(valid.data.password, credential.secret) === "OK";
	if (!isValid) throw request.unauthorized(request.language());

	const session = { id: credential.id, name: credential.name };
	const token = jwt.create(session);

	request.status(200);
	return { session, token };
}
