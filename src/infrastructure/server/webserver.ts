import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Logs from "@infrastructure/logs/handler";
import cors from "@infrastructure/settings/cors";
import helmet from "@infrastructure/settings/helmet";
import { SettingOptions, SettingOptionsUI } from "@infrastructure/settings/swagger";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import type { server } from "./interface";
import { convertRequestTypes, err } from "./request";

const logger = Logs.handler("webserver");

async function webserver(): Promise<server> {
	const instance = fastify({
		logger: Logs.settings("webserver"),
		caseSensitive: false,
		pluginTimeout: 20000,
		requestTimeout: 20000,
		disableRequestLogging: true,
	}).withTypeProvider<ZodTypeProvider>();
	instance.addHook("onRequest", convertRequestTypes);
	instance.setValidatorCompiler(validatorCompiler);
	instance.setSerializerCompiler(serializerCompiler);
	instance.register(fastifyCors, cors);
	instance.register(fastifyHelmet, helmet);
	instance.setNotFoundHandler((_request, reply) => reply.code(510).send());
	instance.register(fastifySwagger, SettingOptions);
	instance.register(fastifySwaggerUi, SettingOptionsUI);
  instance.setErrorHandler((error: unknown, request, reply) => {
    const er = new err().badRequest(request.headers["accept-language"]);
    er.message = "An unknown error occurred";
    if (error instanceof Error) {
      if (error.message.startsWith("Unsupported Media Type")) {
        request.headers["content-type"] = "application/json";
        error.message = error.message.split(";")[0];
      }
      er.message = error.message;
    }
    return reply.headers(request.headers).code(er.statusCode).send(er);
  });

	const safeExit = (message: string) => {
		logger.error(message);
		process.emit("SIGTERM");
		process.emit("SIGINT");
	};

	process.on("SIGTERM", () => process.exit(1));
	process.on("SIGINT", () => process.exit(1));
	process.on("SIGILL", () => safeExit("Illegal Instruction"));
	process.on("SIGFPE", () => safeExit("Divided by 0"));
	process.on("uncaughtException", () => safeExit("Uncaught Exception"));
	process.on("unhandledRejection", () => safeExit("Unhandled Rejection"));
	return instance;
}

async function start(instance: server, port: number): Promise<void> {
	instance.ready((err) => {
		if (err) return logger.error(err.message);
		instance.swagger();
	});
	instance.listen({ port, host: "0.0.0.0" }, (err, address) => {
		if (err) return logger.error(err.message);
		Logs.console.info(`Server listening on ${address}`);
		Logs.console.info(`${instance.printRoutes({ commonPrefix: false })}`);
	});
}

export default {
	create: () => webserver(),
	start: (instance: server, port: number) => start(instance, port),
};
