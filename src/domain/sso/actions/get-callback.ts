import { tag } from "@infrastructure/repositories/references";
import type { container } from "@infrastructure/server/interface";
import { exchangeToken, getNormalizedUser } from "@infrastructure/sso/oidc";
import schema from "../schema";

export default async function getCallback(request: container) {
	const valid = await schema.actions.callback.safeParseAsync(request.query());
	if (!valid.success) throw request.badRequest(request.language(), tag("sso", "callback/schema"));

	const tokens = await exchangeToken(valid.data.provider, valid.data.code);
	const user = await getNormalizedUser(valid.data.provider, tokens);

	request.status(200);
	return user;
}
