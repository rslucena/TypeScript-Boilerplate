import type { IncomingMessage, Server, ServerResponse } from "node:http";
import translate from "@infrastructure/languages/translate";
import type { FastifyBaseLogger, FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

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

const health = z.object({
	status: z.string(),
	version: z.string(),
	date: z.string(),
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
		409: errorSchema(409),
		500: errorSchema(500),
		503: errorSchema(503),
	},
};

type JWT = { typ: string; alg: string; exp: number };

type AnyType = string | object | boolean | number | null | undefined;

export class err {
	unauthorized(language?: string) {
		return {
			statusCode: 401,
			code: "ERR_UNAUTHORIZED",
			error: "Unauthorized",
			message: translate("ERR_UNAUTHORIZED", language),
		};
	}
	notFound(language?: string, resource?: string) {
		return {
			statusCode: 404,
			code: "ERR_NOT_FOUND",
			error: `Not Found ${resource || ""}`,
			message: translate("ERR_NOT_FOUND", language),
		};
	}
	badRequest(language?: string, resource?: string) {
		return {
			statusCode: 400,
			code: "ERR_REQUEST",
			error: `Bad Request ${resource ?? ""}`,
			message: translate("ERR_REQUEST", language),
		};
	}
	unprocessableEntity(language?: string, resource?: string) {
		return {
			statusCode: 422,
			code: "UNPROCESSABLE_ENTITY",
			error: `Unprocessable Entity ${resource ?? ""}`,
			message: translate("UNPROCESSABLE_ENTITY", language),
		};
	}
	conflict(language?: string, resource?: string) {
		return {
			statusCode: 409,
			code: "CONFLICT",
			error: `Conflict ${resource ?? ""}`,
			message: translate("CONFLICT", language),
		};
	}
}

export class container<t = unknown> extends err {
	protected _url: guise["url"];
	protected _status: guise["status"];
	protected _language: guise["language"];
	protected _raw: guise["raw"];
	protected _session: guise["session"];
	protected _headers: guise["headers"];
	protected _query: guise["query"];
	protected _body: guise["body"];
	protected _params: guise["params"];
	protected _method: guise["method"];
	constructor(args: guise) {
		super();
		this._url = args.url;
		this._status = args.status || 200;
		this._language = args.language || "en";
		this._session = args.session;
		this._headers = args.headers;
		this._query = args.query;
		this._body = args.body;
		this._params = args.params;
		this._method = args.method;
		this._raw = args.raw;
	}
	session<T extends t>(context?: { [key: string]: unknown } | undefined) {
		this._session = context || this._session;
		return this._session as T;
	}
	language(context?: string) {
		this._language = context || this._language;
		return this._language;
	}
	headers(context?: guise["headers"]) {
		this._headers = { ...this._headers, ...context };
		return this._headers;
	}
	query<T>(context?: guise["query"]) {
		this._query = context || this._query;
		return this._query as T;
	}
	body<T>(context?: guise["body"]) {
		this._body = context || this._body;
		return this._body as T;
	}
	params<T>(context?: guise["params"]) {
		this._params = context || this._params;
		return this._params as T;
	}
	status(context?: guise["status"]) {
		this._status = context || this._status;
		return this._status ?? 200;
	}
}

export { type JWT, errorSchema, type guise, headers, health, replyErrorSchema, type server, type AnyType };
