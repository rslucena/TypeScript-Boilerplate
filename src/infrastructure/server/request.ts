import { safeParse } from "@infrastructure/pipes/safe-parse";
import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import authentication from "./authentication";
import { type AnyType, container, type guise, replyErrorSchema } from "./interface";

export function convertRequestTypes(req: FastifyRequest, _reply: FastifyReply, done: HookHandlerDoneFunction) {
	if (req.url.startsWith("/documentation")) {
		done();
		return;
	}
	const transform = (vl: string | unknown): unknown => {
		if (vl === "null") return null;
		if (vl === "true") return true;
		if (vl === "false") return false;
		const num = Number(vl);
		if (!Number.isNaN(num) && !vl?.toString().includes("-")) return num;
		if (typeof vl === "string" && vl.startsWith("[") && vl.endsWith("]")) return safeParse(vl);
		return vl;
	};

	const convert = (params: Record<string, unknown> | undefined) => {
		if (!params) return {};
		for (const key in params) {
			const vl = params[key];
			if (!vl || vl === "") continue;
			params[key] = transform(vl);
		}
		return params;
	};
	req.body = convert(req.body as Record<string, unknown>);
	req.params = convert(req.params as Record<string, unknown>);
	req.query = convert(req.query as Record<string, unknown>);
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
			const authenticated = await new authentication().session(receiver);
			if (!authenticated) return reply.code(401).send(receiver.unauthorized(receiver.language()));
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
