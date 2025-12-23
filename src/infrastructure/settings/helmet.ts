import type { FastifyHelmetOptions } from "@fastify/helmet";

const helmetConfig: FastifyHelmetOptions = {
	xPoweredBy: false,
	xXssProtection: true,
	xDownloadOptions: true,
	originAgentCluster: false,
	xFrameOptions: { action: "deny" },
	xDnsPrefetchControl: { allow: true },
	crossOriginEmbedderPolicy: false,
	crossOriginOpenerPolicy: false,
	crossOriginResourcePolicy: false,
	contentSecurityPolicy: {
		useDefaults: true,
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
			styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.jsdelivr.net"],
			fontSrc: ["'self'", "fonts.gstatic.com", "data:"],
			imgSrc: ["'self'", "data:", "validator.swagger.io"],
			connectSrc: ["'self'", "http:", "https:"],
			objectSrc: ["'none'"],
			upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
		},
	},
	referrerPolicy: {
		policy: "no-referrer",
	},
	xPermittedCrossDomainPolicies: {
		permittedPolicies: "none",
	},
};

export default helmetConfig;
