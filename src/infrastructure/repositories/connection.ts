import { env } from "@infrastructure/settings/environment";

const connection = {
	port: env.POSTGRES_PORT,
	host: env.POSTGRES_SERVER,
	password: env.POSTGRES_PASSWORD,
	username: env.POSTGRES_USER,
	database: env.POSTGRES_DATABASE,
};

export default connection;
