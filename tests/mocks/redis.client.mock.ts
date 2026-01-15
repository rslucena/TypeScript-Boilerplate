import { mock } from "bun:test";

export const createRedisClientMock = () => ({
	// biome-ignore lint/suspicious/noExplicitAny: mock
	get: mock((..._args: unknown[]) => Promise.resolve(null as any)),
	set: mock((..._args: unknown[]) => Promise.resolve("OK")),
	del: mock((..._args: unknown[]) => Promise.resolve(1)),
	sMembers: mock((..._args: unknown[]) => Promise.resolve([] as string[])),
	sAdd: mock((..._args: unknown[]) => Promise.resolve(1)),
	scan: mock((..._args: unknown[]) => Promise.resolve({ cursor: "0", keys: [] as unknown[] })),
	expire: mock((..._args: unknown[]) => Promise.resolve(true)),
	json: {
		// biome-ignore lint/suspicious/noExplicitAny: mock
		get: mock((..._args: unknown[]) => Promise.resolve(null as any)),
		set: mock((..._args: unknown[]) => Promise.resolve("OK")),
	},
	ping: mock(() => Promise.resolve("PONG")),
});

export const redisClientMock = createRedisClientMock();
