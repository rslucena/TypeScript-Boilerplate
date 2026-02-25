import request from "@infrastructure/server/request";
import type { FastifyInstance } from "fastify";
import getAuthorize from "./actions/get-authorize";
import getCallback from "./actions/get-callback";
import postLocalLogin from "./actions/post-local-login";
import schema from "./schema";

export default async function ssoRoutes(api: FastifyInstance) {
	api.get(
		"/authorize",
		{
			schema: {
				tags: ["SSO"],
				description: "Redirects the user to the chosen Identity Provider for authentication.",
				querystring: schema.actions.authorize,
				headers: schema.actions.headers.omit({ authorization: true }),
			},
		},
		request.noRestricted(getAuthorize),
	);

	api.get(
		"/callback",
		{
			schema: {
				tags: ["SSO"],
				description: "Handles the callback from Identity Providers, exchanging the code for a token.",
				querystring: schema.actions.callback,
				headers: schema.actions.headers.omit({ authorization: true }),
				response: {
					200: schema.responses.profile,
					...request.reply.schemas,
				},
			},
		},
		request.noRestricted(getCallback),
	);
	api.post(
		"/local",
		{
			schema: {
				tags: ["SSO"],
				description: "Handles local login with email and password.",
				body: schema.actions.local,
				headers: schema.actions.headers.omit({ authorization: true }),
				response: {
					200: schema.responses.profile,
					...request.reply.schemas,
				},
			},
		},
		request.noRestricted(postLocalLogin),
	);
}
