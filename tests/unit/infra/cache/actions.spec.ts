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
		redisClientMock.get.mockClear();
		redisClientMock.get.mockResolvedValue(null);
		redisClientMock.mGet.mockClear();
		redisClientMock.mGet.mockResolvedValue([]);
		redisClientMock.set.mockClear();
		redisClientMock.set.mockResolvedValue("OK");
		redisClientMock.del.mockClear();
		redisClientMock.del.mockResolvedValue(1);
		redisClientMock.sMembers.mockClear();
		redisClientMock.sMembers.mockResolvedValue([]);
		redisClientMock.sAdd.mockClear();
		redisClientMock.sAdd.mockResolvedValue(1);
		redisClientMock.expire.mockClear();
		redisClientMock.json.get.mockClear();
		redisClientMock.json.get.mockResolvedValue(null);
		redisClientMock.json.mGet.mockClear();
		redisClientMock.json.mGet.mockResolvedValue([]);
		redisClientMock.json.set.mockClear();
		redisClientMock.json.set.mockResolvedValue("OK");
	});

	describe("Text Actions", () => {
		it("should set value correctly", async () => {
			const result = await cache.text.set("key", "value");
			expect(result).toBe("OK");
			expect(redisClientMock.set).toHaveBeenCalledTimes(1);
			expect(redisClientMock.set).toHaveBeenCalledWith("key", "value");
		});

		it("should handle set error correctly", async () => {
			redisClientMock.set.mockRejectedValue(new Error("Redis error"));
			const result = await cache.text.set("key", "value");
			expect(result).toBe("");
			expect(redisClientMock.set).toHaveBeenCalledTimes(1);
		});

		it("should set value with TTL", async () => {
			await cache.text.set("key", "value", 60);
			expect(redisClientMock.set).toHaveBeenCalledWith("key", "value");
			expect(redisClientMock.expire).toHaveBeenCalledWith("key", 60);
		});

		it("should get value correctly", async () => {
			redisClientMock.get.mockResolvedValue("value");
			const result = await cache.text.get("key");
			expect(result).toEqual("value");
			expect(redisClientMock.get).toHaveBeenCalledWith("key");
		});

		it("should return null if force is true", async () => {
			const result = await cache.text.get("key", true);
			expect(result).toBeNull();
		});

		it("should return null if scan returns no keys", async () => {
			redisClientMock.sMembers.mockResolvedValue([]);
			const result = await cache.text.get("key*");
			expect(result).toBeNull();
		});

		it("should return null if action fails", async () => {
			redisClientMock.get.mockRejectedValue(new Error("Redis error"));
			const result = await cache.text.get("key");
			expect(result).toBeNull();
		});

		it("should return object containing multiple keys", async () => {
			redisClientMock.sMembers.mockResolvedValue(["key1", "key2"]);
			redisClientMock.mGet.mockResolvedValue(["value1", "value2"]);
			const result = await cache.text.get("key*");
			expect(result).toEqual({ key1: "value1", key2: "value2" });
		});

		it("should delete value correctly", async () => {
			const result = await cache.text.del("key");
			expect(result).toBe(1);
			expect(redisClientMock.del).toHaveBeenCalledWith("key");
		});

		it("should return 0 when nothing to delete", async () => {
			redisClientMock.del.mockResolvedValue(0);
			const result = await cache.text.del("invalid_key");
			expect(result).toBe(0);
		});

		it("should delete pattern values correctly", async () => {
			redisClientMock.sMembers.mockResolvedValue(["key1"]);
			const result = await cache.text.del("key*");
			expect(result).toBe(1);
			expect(redisClientMock.del).toHaveBeenCalledWith(["key1", "key:keys"]);
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

		it("should return 0 when json nothing to delete", async () => {
			redisClientMock.del.mockResolvedValue(0);
			const result = await cache.json.del("invalid_key");
			expect(result).toBe(0);
		});

		it("should return null if json scan returns no keys", async () => {
			redisClientMock.sMembers.mockResolvedValue([]);
			const result = await cache.json.get("key*");
			expect(result).toBeNull();
		});

		it("should return multiple keys for json if scan returns multiple", async () => {
			redisClientMock.sMembers.mockResolvedValue(["key1", "key2"]);
			redisClientMock.json.mGet.mockResolvedValue([[{ foo: "bar" }], [{ foo: "bar" }]]);
			const result = await cache.json.get("key*");
			expect(result).toEqual({ key1: { foo: "bar" }, key2: { foo: "bar" } });
		});
	});

	it("should ping correctly", async () => {
		const result = await cache.ping();
		expect(result).toBe("PONG");
		expect(redisClientMock.ping).toHaveBeenCalledTimes(1);
	});
});
