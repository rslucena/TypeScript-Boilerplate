import { uuid } from "@infrastructure/pipes/crypto";
import { tag } from "@infrastructure/repositories/references";
import type { container } from "@infrastructure/server/interface";
import { getAuthorizationUrl } from "@infrastructure/sso/oidc";
import schema from "../schema";

export default async function getAuthorize(request: container) {
	const valid = await schema.actions.authorize.safeParseAsync(request.query());
	if (!valid.success) throw request.badRequest(request.language(), tag("sso", "authorize/schema"));

	const state = uuid();
	const url = getAuthorizationUrl(valid.data.provider, state);

	request.status(302);
	request.headers({ Location: url });
	return null;
}
