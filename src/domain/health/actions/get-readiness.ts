import cache from "@infrastructure/cache/actions";
import manager from "@infrastructure/repositories/repository";
import type { container } from "@infrastructure/server/interface";
import { sql } from "drizzle-orm";

export default async function getReadiness(request: container) {
	request.status(200);

	const memoryData = process.memoryUsage();

	let isHealthy = true;

	// Check Postgres Connection
	let dbStatus = "disconnected";
	let dbLatency = -1;
	let dbVersion: string | undefined;
	const startDb = performance.now();

	const dbResult = await manager.execute(sql`SELECT version()`).catch((error) => error);
	if (dbResult && !(dbResult instanceof Error)) {
		dbLatency = performance.now() - startDb;
		dbStatus = "connected";
		dbVersion = dbResult[0]?.version as string;
	} else {
		isHealthy = false;
		request.status(503); // Service Unavailable if DB is down
	}

	// Check Redis Connection
	let redisStatus = "disconnected";
	let redisLatency = -1;
	let redisVersion: string | undefined;
	const startRedis = performance.now();
	const isOpen = cache.status();

	const response = await cache.ping().catch(() => null);
	if (isOpen && response === "PONG") {
		redisLatency = performance.now() - startRedis;
		redisStatus = "connected";

		const info = await cache.info().catch(() => "");
		const versionMatch = info.match(/redis_version:([0-9.]+)/);
		if (versionMatch) {
			redisVersion = versionMatch[1];
		}
	} else {
		isHealthy = false;
		request.status(503); // Service Unavailable if Redis is down
	}

	return {
		status: isHealthy ? "active" : "degraded",
		version: "1.0.0", // Mocked version
		date: new Date().toISOString(),
		uptime: process.uptime(),
		memory: {
			rss: memoryData.rss,
			heapTotal: memoryData.heapTotal,
			heapUsed: memoryData.heapUsed,
			external: memoryData.external,
		},
		dependencies: {
			database: {
				status: dbStatus,
				latency: dbLatency,
				version: dbVersion,
			},
			cache: {
				status: redisStatus,
				latency: redisLatency,
				version: redisVersion,
			},
		},
	};
}
