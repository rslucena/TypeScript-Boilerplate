import request from "@infrastructure/server/request";
import type { FastifyInstance } from "fastify";
import getById from "./actions/get-by-id";
import getFindByParams from "./actions/get-find-by-params";
import getHealth from "./actions/get-health";
import postNewEntity from "./actions/post-new-entity";
import schema from "./schema";

export default async function identityRoutes(api: FastifyInstance) {
	api.get(
		"/health",
		{
			schema: {
				tags: ["identity"],
				summary: "Get application health",
				headers: schema.actions.headers,
				response: { 200: schema.actions.health },
			},
		},
		request.restricted(getHealth),
	);

	api.get(
		"/:id",
		{
			schema: {
				tags: ["identity"],
				summary: "Find identity by id",
				params: schema.actions.id,
				headers: schema.actions.headers,
				response: { 200: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(getById),
	);

	api.get(
		"/",
		{
			schema: {
				tags: ["identity"],
				summary: "Find identities",
				headers: schema.actions.headers,
				querystring: schema.actions.read,
				response: { 200: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(getFindByParams),
	);
	api.post(
		"/",
		{
			schema: {
				tags: ["identity"],
				summary: "Create new identity",
				body: schema.actions.create,
				headers: schema.actions.headers,
				response: { 201: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(postNewEntity),
	);
}
