import client from "@infrastructure/cache/connection";
import { tag } from "@infrastructure/repositories/references";
import { env } from "@infrastructure/settings/environment";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function rateLimit(request: FastifyRequest, reply: FastifyReply) {
	const { RATE_LIMIT_MAX: limit, RATE_LIMIT_WINDOW: window } = env;

	const ip = request.ip;
	const key = tag("rate-limit", "check", { ip });

	const current = await client.incr(key);
	if (current === 1) await client.expire(key, window);

	reply.header("X-RateLimit-Limit", limit);
	reply.header("X-RateLimit-Remaining", Math.max(0, limit - current));
	reply.header("X-RateLimit-Reset", window);

	if (current > limit) reply.code(429).send({ error: "Too Many Requests", message: "Rate limit exceeded" });
}
