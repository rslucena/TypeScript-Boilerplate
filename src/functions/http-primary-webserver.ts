import userRoutes from "@domain/user/routes";
import webserver from "@infrastructure/server/webserver";
import { env } from "@infrastructure/settings/environment";

(async () => {
	const server = await webserver.create();
	server.register(userRoutes, { prefix: "/api/v1/users" });
	await webserver.start(server, env.PROCESS_PORT);
})();
