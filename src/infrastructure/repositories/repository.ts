import Logs from "@infrastructure/logs/handler";
import { env } from "@infrastructure/settings/environment";
import { DefaultLogger } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import connection from "./connection";

const handler = Logs.handler("database");
const logger = new DefaultLogger({ writer: { write: (message) => handler.info(message) } });

export function withPagination<T extends PgSelect>(qb: T, page: number, size = 10) {
	return qb.limit(size).offset((page - 1) * size);
}

const primaryDb = postgres({
	...connection,
	prepare: true,
	idle_timeout: 5,
	max_lifetime: 60,
	max: env.POSTGRES_POOL,
});

const manager = drizzle(primaryDb, { logger: logger });

export default manager;
