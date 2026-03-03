import request from "@infrastructure/server/request";
import type { FastifyInstance } from "fastify";
import getLiveness from "./actions/get-liveness";
import getReadiness from "./actions/get-readiness";
import schema from "./schema";

export default async function healthRoutes(api: FastifyInstance) {
	api.get(
		"/liveness",
		{
			schema: {
				tags: ["health"],
				summary: "Get application liveness health check",
				headers: schema.actions.headers.omit({ authorization: true }),
				response: { 200: schema.actions.livenessHealth },
			},
		},
		request.noRestricted(getLiveness),
	);

	api.get(
		"/readiness",
		{
			schema: {
				tags: ["health"],
				summary: "Get application readiness health check",
				headers: schema.actions.headers,
				response: {
					200: schema.actions.readinessHealth,
					503: schema.actions.readinessHealth,
				},
			},
		},
		request.restricted(getReadiness),
	);
}
