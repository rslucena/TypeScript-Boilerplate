import { defineConfig } from "drizzle-kit";
import connection from "./src/infrastructure/repositories/connection";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/domain/**/entity.ts",
	out: "./src/infrastructure/migrations",
	dbCredentials: {
		database: connection.database,
		host: connection.host,
		port: connection.port,
		password: connection.password,
		user: connection.username,
	},
	strict: true,
});
