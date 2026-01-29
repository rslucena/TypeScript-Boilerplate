import identityRoutes from "@domain/identity/routes";
import webserver from "@infrastructure/server/webserver";
import { env } from "@infrastructure/settings/environment";

(async () => {
	const server = await webserver.create();
	server.register(identityRoutes, { prefix: "/api/v1/identities" });
	await webserver.start(server, env.PROCESS_PORT);
})();
