import credentialsRoutes from "@domain/credentials/routes";
import identityRoutes from "@domain/identity/routes";
import Logs from "@infrastructure/logs/handler";
import webserver from "@infrastructure/server/webserver";
import { env } from "@infrastructure/settings/environment";

const logger = Logs.handler("webserver");

(async () => {
	const server = await webserver.create();
	server.register(identityRoutes, { prefix: "/api/v1/identities" });
	server.register(credentialsRoutes, { prefix: "/api/v1/credentials" });
	await webserver.start(server, env.PROCESS_PORT).catch((err) => {
		logger.error("Server startup failed:", err);
		process.exit(1);
	});
})();
