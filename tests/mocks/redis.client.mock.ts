import { mock } from "bun:test";

export const redisClientMock = {
	get: mock((...args: any[]) => Promise.resolve(null as any)),
	set: mock((...args: any[]) => Promise.resolve("OK" as any)),
	del: mock((...args: any[]) => Promise.resolve(1 as any)),
	scan: mock((...args: any[]) => Promise.resolve({ cursor: "0", keys: [] } as any)),
	expire: mock((...args: any[]) => Promise.resolve(true as any)),
	json: {
		get: mock((...args: any[]) => Promise.resolve(null as any)),
		set: mock((...args: any[]) => Promise.resolve("OK" as any)),
	},
	ping: mock(() => Promise.resolve("PONG")),
};
