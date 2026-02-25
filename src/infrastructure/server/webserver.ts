import { readFileSync } from "node:fs";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Logs from "@infrastructure/logs/handler";
import cors from "@infrastructure/settings/cors";
import { env } from "@infrastructure/settings/environment";
import helmet from "@infrastructure/settings/helmet";
import { SettingOptions, SettingOptionsUI } from "@infrastructure/settings/swagger";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { err, type server } from "./interface";
import { rateLimit } from "./rate-limit";
import { convertRequestTypes } from "./request";

const logger = Logs.handler("webserver");

async function webserver(): Promise<server> {
	const http2 = env.APP_HTTP2
		? {
				http2: true,
				https: {
					key: readFileSync(env.APP_KEY),
					cert: readFileSync(env.APP_CERT),
				},
			}
		: {};

	const instance = fastify({
		...http2,
		logger: Logs.settings("webserver"),
		pluginTimeout: 20000,
		requestTimeout: 20000,
		disableRequestLogging: true,
		routerOptions: {
			caseSensitive: false,
			ignoreDuplicateSlashes: false,
		},
	}).withTypeProvider<ZodTypeProvider>();
	instance.addHook("onRequest", rateLimit);
	instance.addHook("preValidation", convertRequestTypes);
	instance.setValidatorCompiler(validatorCompiler);
	instance.setSerializerCompiler(serializerCompiler);
	instance.register(fastifySwagger, SettingOptions);
	instance.register(fastifySwaggerUi, SettingOptionsUI);
	instance.register(fastifyCors, cors);
	instance.register(fastifyHelmet, helmet);
	instance.setNotFoundHandler((_request, reply) => reply.code(404).send());
	instance.setErrorHandler((error: unknown, request, reply) => {
		const lang = request.headers["accept-language"];
		logger.error(error);

		const errorMessage = error instanceof Error ? error.message : String(error);

		if (errorMessage.startsWith("Unsupported Media Type")) {
			const er = new err().badRequest(lang);
			request.headers["content-type"] = "application/json";
			er.message = errorMessage.split(";")[0];
			return reply.headers(request.headers).code(er.statusCode).send(er);
		}

		if (
			error &&
			typeof error === "object" &&
			("validation" in error || ("statusCode" in error && error.statusCode === 400))
		) {
			const er = new err().badRequest(lang);
			er.message = errorMessage;
			return reply.headers(request.headers).code(er.statusCode).send(er);
		}

		const er = new err().internalServerError(lang);
		if (process.env.NODE_ENV === "development" && error instanceof Error) {
			er.message = error.message;
		}

		return reply.headers(request.headers).code(er.statusCode).send(er);
	});

	const safeExit = (message: string, err?: unknown) => {
		logger.error({ message, err });
		process.emit("SIGTERM");
		process.emit("SIGINT");
	};

	process.on("SIGTERM", () => process.exit(1));
	process.on("SIGINT", () => process.exit(1));
	process.on("SIGILL", (err) => safeExit("Illegal Instruction", err));
	process.on("SIGFPE", (err) => safeExit("Divided by 0", err));
	process.on("uncaughtException", (err) => safeExit("Uncaught Exception", err));
	process.on("unhandledRejection", (err) => safeExit("Unhandled Rejection", err));
	return instance;
}

async function start(instance: server, port: number): Promise<void> {
	await instance.ready();
	instance.swagger();
	const address = await instance.listen({ port, host: "0.0.0.0" }).catch((err) => {
		logger.error(err.message);
		process.exit(1);
	});
	Logs.console.info(`Server listening on ${address}`);
	Logs.console.info(`${instance.printRoutes({ commonPrefix: false })}`);
}

export default {
	create: () => webserver(),
	start: (instance: server, port: number) => start(instance, port),
};
