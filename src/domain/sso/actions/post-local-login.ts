import getByProviderSubject from "@domain/credentials/actions/find-by-provider-subject";
import { providers } from "@domain/credentials/constants";
import getByEmail from "@domain/identity/actions/get-by-email";
import * as jwt from "@infrastructure/authentication/jwt";
import { hash, tag } from "@infrastructure/repositories/references";
import type { container } from "@infrastructure/server/interface";
import schema from "../schema";

export default async function postLocalLogin(request: container) {
	const valid = await schema.actions.local.safeParseAsync(request.body());
	if (!valid.success) throw request.badRequest(request.language(), tag("sso", "local/schema"));

	const identities = await getByEmail(valid.data.email);
	if (!identities.length) throw request.unauthorized(request.language());

	const identity = identities[0];

	const credentials = await getByProviderSubject(providers.LOCAL, valid.data.email);
	if (!credentials.length) throw request.unauthorized(request.language());

	const credential = credentials[0];
	if (!credential.secret) throw request.unauthorized(request.language());

	const isValid = hash(valid.data.password, credential.secret) === "OK";
	if (!isValid) throw request.unauthorized(request.language());

	const session = { id: identity.id, name: identity.name };
	const token = jwt.create(session);

	request.status(200);
	return { session, token };
}
