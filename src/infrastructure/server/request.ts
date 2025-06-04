import * as crypto from "node:crypto";
import translate from "@infrastructure/languages/translate";
import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { type AnyType, type JWT, type guise, replyErrorSchema } from "./interface";
import { safeParse } from "./transforms";

export class authentication {
	create(content: guise["session"], exp?: number) {
		const header = {
			alg: "HS256",
			typ: "JWT",
			exp: Math.floor(Date.now() / 1000) + (exp ?? 60 * 60),
		};
		const encodedHeader = Buffer.from(JSON.stringify(header))
			.toString("base64")
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");
		const encodedPayload = Buffer.from(JSON.stringify(content))
			.toString("base64")
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");
		const signature = crypto
			.createHmac("sha256", String(process.env.AUTH_SALT))
			.update(`${encodedHeader}.${encodedPayload}`)
			.digest("base64")
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");
		return `${encodedHeader}.${encodedPayload}.${signature}`;
	}
	session(request: container) {
		const { authorization } = request.headers();
		if (!authorization) return false;

		const jwt = authorization.replace("Bearer", "").replace(" ", "");

		const parts = jwt.split(".");
		if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return false;

		const encodedHeader = parts[0];
		const encodedPayload = parts[1];
		const signature = parts[2];

		const header = safeParse<JWT>(Buffer.from(encodedHeader, "base64").toString());
		if (!header) return false;
		if (header.typ !== "JWT" || header.alg !== "HS256") return false;

		const body = safeParse<{ [key: string]: unknown }>(Buffer.from(encodedPayload, "base64").toString());
		if (!body) return false;

		const expectedSignature = crypto
			.createHmac("sha256", String(process.env.AUTH_SALT))
			.update(`${encodedHeader}.${encodedPayload}`)
			.digest("base64")
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");

		if (signature !== expectedSignature) return false;

		const Now = Math.floor(Date.now() / 1000);
		return Now > header.exp ? false : body;
	}
}

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

export function convertRequestTypes(req: FastifyRequest, _reply: FastifyReply, done: HookHandlerDoneFunction) {
	const convert = (params: { [key: string]: AnyType } | undefined) => {
		if (!params) return {};
		for (const key in params) {
			const vl = params[key];
			if (!vl) continue;
			if (vl === "") continue;
			if (vl === "null") params[key] = null;
			if (vl === "true") params[key] = true;
			if (vl === "false") params[key] = false;
			if (!Number.isNaN(vl)) params[key] = Number(vl);
			if (typeof vl === "string" && vl.startsWith("[") && vl.endsWith("]")) params[key] = safeParse(vl);
		}
		return params;
	};
	req.body = convert(req.body as { [key: string]: AnyType });
	req.params = convert(req.params as { [key: string]: AnyType });
	req.query = convert(req.query as { [key: string]: AnyType });
	done();
}

function execute(
	callback: CallableFunction,
	isRestricted = false,
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
	return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
		const receiver = new container({
			url: req.routeOptions.config.url,
			status: reply.statusCode,
			language: req.headers["accept-language"],
			headers: req.headers as guise["headers"],
			query: req.query,
			body: req.body,
			params: req.params,
			method: req.routeOptions.config.method as guise["method"],
			raw: req.raw,
		});

		if (isRestricted) {
			const auth = new authentication().session(receiver);
			if (!auth) return reply.code(401).send(receiver.unauthorized(receiver.language()));
			receiver.session(auth);
		}

		let context: AnyType | unknown;

		try {
			context = await callback(receiver);
			receiver.body(context);
		} catch (err: unknown) {
			context = receiver.badRequest(receiver.language());
			context = typeof err === "string" ? { ...(context as Record<string, unknown>), message: err } : err;
			receiver.body(context);
		}

		if (context && typeof context === "object" && "statusCode" in context) receiver.status(Number(context.statusCode));

		return reply
			.headers(receiver.headers())
			.code(receiver.status())
			.send(receiver.body() ?? "");
	};
}

export default {
	reply: replyErrorSchema,
	restricted: (fn: CallableFunction) => execute(fn, true),
	noRestricted: (fn: CallableFunction) => execute(fn),
};
