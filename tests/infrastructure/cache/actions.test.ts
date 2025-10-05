import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

process.env.REDIS_STACK = "true";
vi.mock("@infrastructure/cache/connection", () => {
	const mockRedis = {
		connect: vi.fn().mockResolvedValue(undefined),
		on: vi.fn(),
		get: vi.fn(),
		set: vi.fn(),
		json: {
			get: vi.fn(),
			set: vi.fn(),
		},
		ping: vi.fn().mockResolvedValue("PONG"),
		expire: vi.fn().mockResolvedValue(1),
		scan: vi.fn().mockResolvedValue({ cursor: "0", keys: ["test:key"] }),
		scanIterator: vi.fn().mockImplementation(function* () {
			yield "test:key";
		}),
		del: vi.fn().mockResolvedValue(1),
		isOpen: true,
		disconnect: vi.fn().mockResolvedValue(undefined),
		reset() {
			this.connect.mockClear();
			this.on.mockClear();
			this.get.mockClear();
			this.set.mockClear();
			this.json.get.mockClear();
			this.json.set.mockClear();
			this.ping.mockClear();
			this.expire.mockClear();
			this.scan.mockClear();
			this.scanIterator.mockClear();
			this.del.mockClear();
			this.disconnect.mockClear();
		},
	};
	return {
		__esModule: true,
		default: mockRedis,
	};
});

vi.mock("@infrastructure/server/transforms", () => ({
	safeParse: vi.fn((v: string) => {
		try {
			return JSON.parse(v);
		} catch {
			return null;
		}
	}),
}));

import cache from "@infrastructure/cache/actions";
import client from "@infrastructure/cache/connection";

describe("Cache Actions", () => {
	const content = "test";
	const testKey = "test:key";
	const testValue = { "test:key": content };
	const testTtl = 3600;

	beforeEach(() => {
		client.reset();
		client.get.mockResolvedValue(content);
		client.json.get.mockResolvedValue(testValue);
		client.set.mockResolvedValue("OK");
		client.json.set.mockResolvedValue("OK");
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should set a value with TTL", async () => {
		await cache.text.set(testKey, testValue, testTtl);
		expect(client.set).toHaveBeenCalledWith(testKey, JSON.stringify(testValue));
		expect(client.expire).toHaveBeenCalledWith(testKey, testTtl);
	});

	it("should get a value", async () => {
		const result = await cache.text.get<typeof testValue>(testKey);
		expect(result).toBeDefined();
		expect(client.get).toHaveBeenCalledWith(testKey);
	});

	it("should return null when key does not exist", async () => {
		client.get.mockResolvedValueOnce(null);
		const result = await cache.text.get("nonexistent:key");
		expect(result).toEqual({ "nonexistent:key": null });
	});

	it("should set a JSON value", async () => {
		await cache.json.set(testKey, testValue, testTtl);
		expect(client.expire).toHaveBeenCalledWith(testKey, testTtl);
	});

	it("should get a JSON value", async () => {
		const result = await cache.json.get<typeof testValue>(testKey);
		expect(result).toEqual(testValue);
	});

	it("should delete a key", async () => {
		await cache.text.del(testKey);
		expect(client.del).toHaveBeenCalledWith(testKey);
	});

	it("should ping the Redis server", async () => {
		const result = await cache.ping();
		expect(result).toBe("PONG");
		expect(client.ping).toHaveBeenCalled();
	});

	it("should handle errors when setting a value", async () => {
		client.set.mockRejectedValueOnce(new Error("Redis error"));
		await expect(cache.text.set(testKey, testValue)).resolves.toBe("");
	});

	it("should return null when force is true", async () => {
		const result = await cache.text.get(testKey, true);
		expect(result).toBeNull();
		expect(client.get).not.toHaveBeenCalled();
	});
});
