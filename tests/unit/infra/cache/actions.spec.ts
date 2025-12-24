import { mockClient } from "@tests/mocks/redis";
import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";

mock.module("@infrastructure/cache/connection", () => ({ default: mockClient }));

describe("Cache Infrastructure", () => {
	let cache: typeof import("@infrastructure/cache/actions").default;

	beforeAll(async () => {
		const originalEnv = process.env;
		process.env = { ...originalEnv, REDIS_STACK: "true" };
		const module = await import("@infrastructure/cache/actions");
		cache = module.default;
	});
	afterEach(() => {
		mock.restore();
		mockClient.get.mockClear();
		mockClient.set.mockClear();
		mockClient.del.mockClear();
		mockClient.scan.mockClear();
		mockClient.expire.mockClear();
		mockClient.json.get.mockClear();
		mockClient.json.set.mockClear();
	});

	describe("Text Actions", () => {
		it("should set value correctly", async () => {
			// Removed explicit mockResolvedValue to test default mock in redis.ts
			const result = await cache.text.set("key", "value");
			expect(result).toBe("OK");
			expect(mockClient.set).toHaveBeenCalledTimes(1);
			expect(mockClient.set).toHaveBeenCalledWith("key", "value");
		});

		it("should handle set error correctly", async () => {
			mockClient.set.mockRejectedValue(new Error("Redis error"));
			const result = await cache.text.set("key", "value");
			expect(result).toBe("");
			expect(mockClient.set).toHaveBeenCalledTimes(1);
		});

		it("should set value with TTL", async () => {
			// Removed explicit mockResolvedValue
			await cache.text.set("key", "value", 60);
			expect(mockClient.set).toHaveBeenCalledWith("key", "value");
			expect(mockClient.expire).toHaveBeenCalledWith("key", 60);
		});

		it("should get value correctly", async () => {
			mockClient.scan.mockResolvedValue({ cursor: "0", keys: ["key"] });
			mockClient.get.mockResolvedValue("value");
			const result = await cache.text.get("key");
			expect(result).toEqual({ key: "value" });
			expect(mockClient.get).toHaveBeenCalledWith("key");
		});

		it("should delete value correctly", async () => {
			mockClient.scan.mockResolvedValue({ cursor: "0", keys: ["key"] });
			// Removed explicit mockResolvedValue to test default mock in redis.ts
			const result = await cache.text.del("key");
			expect(result).toBe(1);
			expect(mockClient.del).toHaveBeenCalledWith("key");
		});
	});

	describe("JSON Actions", () => {
		it("should set json value correctly", async () => {
			// Removed explicit mockResolvedValue to test default mock in redis.ts
			const data = { foo: "bar" };
			const result = await cache.json.set("key", data);
			expect(result).toBe("OK");
			expect(mockClient.json.set).toHaveBeenCalledWith("key", "$", JSON.parse(JSON.stringify(data)));
		});

		it("should handle json set error correctly", async () => {
			mockClient.json.set.mockRejectedValue(new Error("Redis error"));
			const data = { foo: "bar" };
			const result = await cache.json.set("key", data);
			expect(result).toBe("");
			expect(mockClient.json.set).toHaveBeenCalledTimes(1);
		});

		it("should get json value correctly", async () => {
			mockClient.scan.mockResolvedValue({ cursor: "0", keys: ["key"] });
			const data = { foo: "bar" };
			mockClient.json.get.mockResolvedValue(data);
			const result = await cache.json.get("key");
			expect(result).toEqual({ key: data });
			expect(mockClient.json.get).toHaveBeenCalledWith("key");
		});

		it("should delete json value correctly", async () => {
			mockClient.scan.mockResolvedValue({ cursor: "0", keys: ["key"] });
			// Default mock for del returns 1
			const result = await cache.json.del("key");
			expect(result).toBe(1);
			expect(mockClient.del).toHaveBeenCalledWith("key");
		});
	});



	it("should ping correctly", async () => {
		const result = await cache.ping();
		expect(result).toBe("PONG");
		expect(mockClient.ping).toHaveBeenCalledTimes(1);
	});
});
