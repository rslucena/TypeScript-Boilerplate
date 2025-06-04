import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { FastifyBaseLogger, FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod/v4";

interface guise {
	status?: number;
	url?: string;
	language?: string;
	raw?: { [key: string]: object } | unknown;
	session?: { [key: string]: unknown };
	headers?: { [key: string]: string | undefined };
	query?: { [key: string]: object } | unknown;
	body?: { [key: string]: object } | unknown;
	params?: { [key: string]: object } | unknown;
	method?: "GET" | "POST" | "PUT" | "DELETE";
}

const headers = z.object({
	authorization: z
		.string()
		.startsWith("Bearer")
		.regex(/^Bearer [a-zA-Z0-9-._~+/]+=*$/),
	"accept-language": z.string().default("en"),
});

type server = FastifyInstance<
	Server<typeof IncomingMessage, typeof ServerResponse>,
	IncomingMessage,
	ServerResponse,
	FastifyBaseLogger,
	ZodTypeProvider
>;

const errorSchema = (code: number) =>
	z.object({
		statusCode: z.number().default(code),
		code: z.string(),
		error: z.string(),
		message: z.string(),
	});

const replyErrorSchema = {
	schemas: {
		400: errorSchema(400),
		401: errorSchema(401),
		404: errorSchema(404),
		500: errorSchema(500),
		503: errorSchema(503),
	},
};

type JWT = { typ: string; alg: string; exp: number };

type AnyType = string | object | boolean | number | null | undefined;

export { type JWT, errorSchema, type guise, headers, replyErrorSchema, type server, type AnyType };
