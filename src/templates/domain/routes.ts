import request from "@infrastructure/server/request";
import type { FastifyInstance } from "fastify";
import deleteEntity from "./actions/delete-entity";
import getById from "./actions/get-by-id";
import getFindByParams from "./actions/get-find-by-params";
import postNewEntity from "./actions/post-new-entity";
import putUpdateEntity from "./actions/put-update-entity";
import schema from "./schema";

export default async function __name__Routes(api: FastifyInstance) {
	api.get("/ping", { schema: { tags: ["__Capitalized__"] } }, (_, reply) => reply.code(200).send());

	api.get(
		"/:id",
		{
			schema: {
				tags: ["__Capitalized__"],
				summary: "Find __name__ by id",
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
				tags: ["__Capitalized__"],
				summary: "Find __name__",
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
				tags: ["__Capitalized__"],
				summary: "Create new __name__",
				body: schema.actions.create,
				headers: schema.actions.headers,
				response: { 201: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(postNewEntity),
	);

	api.put(
		"/:id",
		{
			schema: {
				tags: ["__Capitalized__"],
				summary: "Update __name__",
				params: schema.actions.id,
				body: schema.actions.update,
				headers: schema.actions.headers,
				response: { 200: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(putUpdateEntity),
	);

	api.delete(
		"/:id",
		{
			schema: {
				tags: ["__Capitalized__"],
				summary: "Delete __name__",
				params: schema.actions.id,
				headers: schema.actions.headers,
				response: { 204: {}, ...request.reply.schemas },
			},
		},
		request.restricted(deleteEntity),
	);
}
