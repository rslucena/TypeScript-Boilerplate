import getFindByParams from "@domain/credentials/actions/get-find-by-params";
import { types } from "@domain/credentials/constants";
import credentialsEntity from "@domain/credentials/entity";
import getByEmail from "@domain/identity/actions/get-by-email";
import identityEntity from "@domain/identity/entity";
import * as jwt from "@infrastructure/authentication/jwt";
import { tag } from "@infrastructure/repositories/references";
import repository from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { exchangeToken, getNormalizedUser } from "@infrastructure/sso/oidc";
import schema from "../schema";

export default async function getCallback(request: container) {
	const valid = await schema.actions.callback.safeParseAsync(request.query());
	if (!valid.success) throw request.badRequest(request.language(), tag("sso", "callback/schema"));

	const tokens = await exchangeToken(valid.data.provider, valid.data.code);
	const user = await getNormalizedUser(valid.data.provider, tokens);

	const credentialsList = await getFindByParams({ provider: valid.data.provider, subject: user.subject });
	const credential = credentialsList[0];

	if (credential) {
		const session = { id: credential.identityId, name: user.name || "User" };
		const token = jwt.create(session);
		request.status(200);
		return { session, token };
	}

	let identity = user.email ? (await getByEmail(user.email))[0] : null;

	if (!identity) {
		const newIdentity = await repository
			.insert(identityEntity)
			.values({
				name: user.name || "User",
				email: user.email || `${user.subject}@${valid.data.provider.toLowerCase()}.com`,
			})
			.returning();
		identity = newIdentity[0];
	}

	await repository
		.insert(credentialsEntity)
		.values({
			identityId: identity.id,
			type: types.OIDC,
			provider: valid.data.provider,
			subject: user.subject,
			login: user.email,
		})
		.execute();

	const session = { id: identity.id, name: user.name || "User" };
	const token = jwt.create(session);

	request.status(200);
	return { session, token };
}
