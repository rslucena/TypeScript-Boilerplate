import { mock } from "bun:test";

export const createRedisClientMock = () => ({
	get: mock((..._args: unknown[]) => Promise.resolve(null)),
	set: mock((..._args: unknown[]) => Promise.resolve("OK")),
	del: mock((..._args: unknown[]) => Promise.resolve(1)),
	scan: mock((..._args: unknown[]) => Promise.resolve({ cursor: "0", keys: [] as unknown[] })),
	expire: mock((..._args: unknown[]) => Promise.resolve(true)),
	json: {
		get: mock((..._args: unknown[]) => Promise.resolve(null as unknown)),
		set: mock((..._args: unknown[]) => Promise.resolve("OK")),
	},
	ping: mock(() => Promise.resolve("PONG")),
});

export const redisClientMock = createRedisClientMock();
