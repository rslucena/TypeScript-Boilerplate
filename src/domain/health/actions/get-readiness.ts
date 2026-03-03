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
	try {
		const startDb = performance.now();
		await manager.execute(sql`SELECT 1`);
		dbLatency = performance.now() - startDb;
		dbStatus = "connected";
	} catch (_error) {
		isHealthy = false;
		request.status(503); // Service Unavailable if DB is down
	}

	// Check Redis Connection
	let redisStatus = "disconnected";
	let redisLatency = -1;
	try {
		const startRedis = performance.now();
		const isOpen = cache.status();
		const response = await cache.ping();
		redisLatency = performance.now() - startRedis;
		if (isOpen && response === "PONG") {
			redisStatus = "connected";
		} else {
			isHealthy = false;
			request.status(503); // Service Unavailable if Redis is down
		}
	} catch (_error) {
		isHealthy = false;
		request.status(503);
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
			},
			cache: {
				status: redisStatus,
				latency: redisLatency,
			},
		},
	};
}
