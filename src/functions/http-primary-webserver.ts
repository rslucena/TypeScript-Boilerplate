import userRoutes from "@domain/user/routes";
import webserver from "@infrastructure/server/webserver";

(async () => {
	const server = await webserver.create();
	server.register(userRoutes, { prefix: "/api/v1/users" });
	await webserver.start(server, Number(process.env.PROCESS_PORT));
})();
