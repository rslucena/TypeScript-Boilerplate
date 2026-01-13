import type { SwaggerOptions } from "@fastify/swagger";
import type { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { env } from "@infrastructure/settings/environment";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export const SettingOptions: SwaggerOptions = {
	openapi: {
		info: {
			title: env.APP_NAME,
			description: env.APP_DESCRIPTION,
			version: env.APP_VERSION,
		},
		components: {
			securitySchemes: {
				jwt: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	transform: jsonSchemaTransform,
};

export const SettingOptionsUI: FastifySwaggerUiOptions = {
	routePrefix: "/documentation",
	theme: {
		title: env.APP_NAME,
	},
	uiConfig: {
		docExpansion: "list",
		deepLinking: false,
		displayRequestDuration: true,
		persistAuthorization: true,
		showExtensions: false,
	},
	staticCSP: false,
	transformStaticCSP: undefined,
	transformSpecificationClone: false,
};
