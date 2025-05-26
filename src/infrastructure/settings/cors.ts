import type { FastifyCorsOptions } from "@fastify/cors";

export default (<FastifyCorsOptions>{
	credentials: true,
	maxAge: 2 * 60 * 60,
	preflightContinue: false,
	optionsSuccessStatus: 204,
	origin: process.env.PROCESS_CORS_ORIGIN,
	exposedHeaders: ["set-cookie", "authorization"],
	allowedHeaders: ["content-type", "authorization"],
	methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
});
