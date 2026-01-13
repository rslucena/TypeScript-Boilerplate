import Logs from "@infrastructure/logs/handler";
import { env } from "@infrastructure/settings/environment";
import { createClient, type RedisClientOptions } from "redis";

const connection: RedisClientOptions = {
	password: env.REDIS_PASSWORD ?? undefined,
	socket: {
		servername: env.REDIS_SSL ? "rediss" : "redis",
		host: env.REDIS_SERVER,
		port: env.REDIS_PORT,
		reconnectStrategy: 10000,
	},
};

const client = createClient(connection);

client.on("error", (err) => Logs.console.error("redis error", err));

if (env.NODE_ENV !== "test") await client.connect();

export default client;
