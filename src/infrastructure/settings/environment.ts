import { z } from "zod";

const schema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PROCESS_DOMAIN: z.url(),
	PROCESS_PORT: z.coerce.number(),
	APP_NAME: z.string(),
	APP_DESCRIPTION: z.string(),
	APP_VERSION: z.string(),
	REDIS_SERVER: z.string().min(1),
	REDIS_PORT: z.coerce.number(),
	REDIS_PASSWORD: z.string().optional().nullable(),
	REDIS_SSL: z.string().transform((val) => val === "true"),
	REDIS_STACK: z.string().transform((val) => val === "true"),
	POSTGRES_SERVER: z.string().min(1),
	POSTGRES_PORT: z.coerce.number(),
	POSTGRES_USER: z.string().min(1),
	POSTGRES_PASSWORD: z.string().min(1),
	POSTGRES_DATABASE: z.string().min(1),
	POSTGRES_POOL: z.coerce.number().default(10),
	UPTIME_SERVER: z.string().optional().nullable(),
	UPTIME_PORT: z.coerce.number().optional().nullable(),
	RATE_LIMIT_MAX: z.coerce.number().positive(),
	RATE_LIMIT_WINDOW: z.coerce.number().positive(),
	AUTH_SALT: z.string().min(1),
	SHOW_LOG: z.string().transform((val) => val === "true"),
	LOG_LEVEL: z.string(),
	PROCESS_CORS_ORIGIN: z.string(),
	APP_FOLDER_KEY: z.string(),
	APP_HTTP2: z.string().transform((val) => val === "true"),
	APP_CERT: z.string().refine((val) => val.endsWith(".crt") || val.endsWith(".pem")),
	APP_KEY: z.string().refine((val) => val.endsWith(".key") || val.endsWith(".pem")),
	SSO_GOOGLE_CLIENT_ID: z.string().optional(),
	SSO_GOOGLE_CLIENT_SECRET: z.string().optional(),
	SSO_GOOGLE_REDIRECT_URI: z.string().url().optional(),
	SSO_GITHUB_CLIENT_ID: z.string().optional(),
	SSO_GITHUB_CLIENT_SECRET: z.string().optional(),
	SSO_GITHUB_REDIRECT_URI: z.string().url().optional(),
});

const result = schema.safeParse(process.env);

if (!result.success) {
	const isTest = process.env.NODE_ENV === "test";
	const isBuild = process.argv.some((arg) => arg.includes("exec-builder.ts") || arg.includes("generate-keys.ts"));

	if (!isTest && !isBuild) {
		const { fieldErrors } = result.error.flatten();
		const errorMessages = Object.entries(fieldErrors)
			.map(([field, errors]) => `  - ${field}: ${errors?.join(", ")}`)
			.join("\n");

		console.error(`❌ Invalid environment variables:\n${errorMessages}`);
		process.exit(1);
	}
}

export const env = result.success ? result.data : (process.env as unknown as z.infer<typeof schema>);
