import request from "@infrastructure/server/request";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import deleteEntity from "./actions/delete-entity";
import getById from "./actions/get-by-id";
import getFindByParams from "./actions/get-find-by-params";
import postNewEntity from "./actions/post-new-entity";
import putUpdateEntity from "./actions/put-update-entity";
import schema from "./schema";

export default async function credentialsRoutes(api: FastifyInstance) {
	api.get("/ping", { schema: { tags: ["Credentials"] } }, (_, reply) => reply.code(200).send());

	api.get(
		"/:id",
		{
			schema: {
				tags: ["Credentials"],
				summary: "Find credentials by id",
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
				tags: ["Credentials"],
				summary: "Find credentials",
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
				tags: ["Credentials"],
				summary: "Create new credentials",
				body: schema.actions.create,
				headers: schema.actions.headers.omit({ authorization: true }),
				response: { 201: schema.entity, ...request.reply.schemas },
			},
		},
		request.noRestricted(postNewEntity),
	);

	api.put(
		"/:id",
		{
			schema: {
				tags: ["Credentials"],
				summary: "Update credentials",
				params: schema.actions.id,
				body: schema.actions.update,
				headers: schema.actions.headers.omit({ authorization: true }),
				response: { 200: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(putUpdateEntity),
	);

	api.delete(
		"/:id",
		{
			schema: {
				tags: ["Credentials"],
				summary: "Delete credentials",
				params: schema.actions.id,
				headers: schema.actions.headers,
				response: { 204: z.null(), ...request.reply.schemas },
			},
		},
		request.restricted(deleteEntity),
	);
}
