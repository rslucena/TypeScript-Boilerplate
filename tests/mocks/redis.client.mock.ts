import { mock } from "bun:test";

export const createRedisClientMock = () => ({
	get: mock((...args: unknown[]) => Promise.resolve(null)),
	set: mock((...args: unknown[]) => Promise.resolve("OK")),
	del: mock((...args: unknown[]) => Promise.resolve(1 )),
	scan: mock((...args: unknown[]) => Promise.resolve({ cursor: "0", keys: [] as unknown[] })),
	expire: mock((...args: unknown[]) => Promise.resolve(true)),
	json: {
		get: mock((...args: unknown[]) => Promise.resolve(null as unknown)),
		set: mock((...args: unknown[]) => Promise.resolve("OK")),
	},
	ping: mock(() => Promise.resolve("PONG")),
});

export const redisClientMock = createRedisClientMock();
