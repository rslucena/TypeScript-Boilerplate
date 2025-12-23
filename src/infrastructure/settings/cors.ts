import type { FastifyCorsOptions } from "@fastify/cors";

export default (<FastifyCorsOptions>{
	credentials: true,
	maxAge: 2 * 60 * 60,
	preflightContinue: false,
	optionsSuccessStatus: 204,
	hook: "onRequest",
	origin: (origin, cb) => {
		if (process.env.NODE_ENV !== "production") return cb(null, true);
		const allowedOrigins = process.env.PROCESS_CORS_ORIGIN?.split(",") || [];
		const allowed = !origin || allowedOrigins.some((allowedOrigin) => origin.startsWith(allowedOrigin.trim()));
		cb(null, allowed);
	},
	exposedHeaders: ["set-cookie", "authorization"],
	allowedHeaders: ["content-type", "authorization", "x-requested-with"],
	methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
});
