import { mock } from "bun:test";

export const createRedisClientMock = () => {
	const redisMock = {
		isOpen: true,
		get: mock((..._args: unknown[]) => Promise.resolve(null as unknown)),
		mGet: mock((..._args: unknown[]) => Promise.resolve([] as unknown[])),
		set: mock((..._args: unknown[]) => Promise.resolve("OK")),
		del: mock((..._args: unknown[]) => Promise.resolve(1)),
		scan: mock((..._args: unknown[]) => Promise.resolve({ cursor: "0", keys: [] as unknown[] })),
		sMembers: mock((..._args: unknown[]) => Promise.resolve([] as unknown[])),
		sAdd: mock((..._args: unknown[]) => Promise.resolve(1)),
		expire: mock((..._args: unknown[]) => Promise.resolve(true)),
		incr: mock((..._args: unknown[]) => Promise.resolve(1)),
		json: {
			get: mock((..._args: unknown[]) => Promise.resolve(null as unknown)),
			mGet: mock((..._args: unknown[]) => Promise.resolve([] as unknown[])),
			set: mock((..._args: unknown[]) => Promise.resolve("OK")),
			del: mock((..._args: unknown[]) => Promise.resolve(1)),
		},
		ping: mock(() => Promise.resolve("PONG")),
		info: mock(() => Promise.resolve("redis_version:7.0.0")),
		duplicate: mock(() => redisMock),
		connect: mock(() => Promise.resolve()),
		publish: mock((..._args: unknown[]) => Promise.resolve(1)),
		subscribe: mock((..._args: unknown[]) => Promise.resolve()),
		unsubscribe: mock((..._args: unknown[]) => Promise.resolve()),
	};
	return redisMock;
};

const globalMock = globalThis as unknown as { redisMockSingleton: ReturnType<typeof createRedisClientMock> };

if (!globalMock.redisMockSingleton) {
	globalMock.redisMockSingleton = createRedisClientMock();
}

export const redisClientMock = globalMock.redisMockSingleton;
