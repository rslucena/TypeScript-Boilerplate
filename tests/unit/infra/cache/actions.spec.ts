import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";

const redisClientMock = createRedisClientMock();
mock.module("@infrastructure/cache/connection", () => ({ default: redisClientMock }));

describe("Cache Infrastructure", () => {
	let cache: typeof import("@infrastructure/cache/actions").default;

	beforeAll(async () => {
		const module = await import("@infrastructure/cache/actions");
		cache = module.default;
	});
	afterEach(() => {
		mock.restore();
		redisClientMock.get.mockClear();
		redisClientMock.get.mockResolvedValue(null);
		redisClientMock.set.mockClear();
		redisClientMock.set.mockResolvedValue("OK");
		redisClientMock.del.mockClear();
		redisClientMock.sMembers.mockClear();
		redisClientMock.sAdd.mockClear();
		redisClientMock.scan.mockClear();
		redisClientMock.expire.mockClear();
		redisClientMock.json.get.mockClear();
		redisClientMock.json.get.mockResolvedValue(null);
		redisClientMock.json.set.mockClear();
		redisClientMock.json.set.mockResolvedValue("OK");
	});

	describe("Text Actions", () => {
		it("should set value correctly", async () => {
			const result = await cache.text.set("key", "value");
			expect(result).toBe("OK");
			if (process.env.REDIS_STACK === "true") {
				expect(redisClientMock.json.set).toHaveBeenCalledTimes(1);
				expect(redisClientMock.json.set).toHaveBeenCalledWith("key", "$", "value");
			} else {
				expect(redisClientMock.set).toHaveBeenCalledTimes(1);
				expect(redisClientMock.set).toHaveBeenCalledWith("key", "value");
			}
		});

		it("should handle set error correctly", async () => {
			if (process.env.REDIS_STACK === "true") {
				redisClientMock.json.set.mockRejectedValue(new Error("Redis error"));
			} else {
				redisClientMock.set.mockRejectedValue(new Error("Redis error"));
			}
			const result = await cache.text.set("key", "value");
			expect(result).toBe("");
		});

		it("should set value with TTL", async () => {
			await cache.text.set("key", "value", 60);
			if (process.env.REDIS_STACK === "true") {
				expect(redisClientMock.json.set).toHaveBeenCalledWith("key", "$", "value");
			} else {
				expect(redisClientMock.set).toHaveBeenCalledWith("key", "value");
			}
			expect(redisClientMock.expire).toHaveBeenCalledWith("key", 60);
		});

		it("should get value correctly", async () => {
			if (process.env.REDIS_STACK === "true") {
				redisClientMock.json.get.mockResolvedValue("value");
			} else {
				redisClientMock.get.mockResolvedValue("value");
			}
			const result = await cache.text.get("key");
			expect(result).toEqual("value");
		});

		it("should delete value correctly", async () => {
			const result = await cache.text.del("key");
			expect(result).toBe(1);
			expect(redisClientMock.del).toHaveBeenCalledWith("key");
		});
	});

	describe("JSON Actions", () => {
		it("should set json value correctly", async () => {
			const data = { foo: "bar" };
			const result = await cache.json.set("key", data);
			expect(result).toBe("OK");
			expect(redisClientMock.json.set).toHaveBeenCalledWith("key", "$", JSON.parse(JSON.stringify(data)));
		});

		it("should handle json set error correctly", async () => {
			redisClientMock.json.set.mockRejectedValue(new Error("Redis error"));
			const data = { foo: "bar" };
			const result = await cache.json.set("key", data);
			expect(result).toBe("");
			expect(redisClientMock.json.set).toHaveBeenCalledTimes(1);
		});

		it("should get json value correctly", async () => {
			const data = { foo: "bar" };
			redisClientMock.json.get.mockResolvedValue(data);
			const result = await cache.json.get("key");
			expect(result).toEqual(data);
			expect(redisClientMock.json.get).toHaveBeenCalledWith("key");
		});

		it("should delete json value correctly", async () => {
			const result = await cache.json.del("key");
			expect(result).toBe(1);
			expect(redisClientMock.del).toHaveBeenCalledWith("key");
		});

		it("should invalidate a tag correctly", async () => {
			redisClientMock.sMembers.mockResolvedValueOnce(["key1", "key2"]);
			const result = await cache.invalidate("tag");
			expect(result).toBe(2);
			expect(redisClientMock.sMembers).toHaveBeenCalledWith("tags:tag");
			expect(redisClientMock.del).toHaveBeenCalledWith(["key1", "key2"]);
			expect(redisClientMock.del).toHaveBeenCalledWith("tags:tag");
		});
	});

	it("should ping correctly", async () => {
		const result = await cache.ping();
		expect(result).toBe("PONG");
		expect(redisClientMock.ping).toHaveBeenCalledTimes(1);
	});
});
