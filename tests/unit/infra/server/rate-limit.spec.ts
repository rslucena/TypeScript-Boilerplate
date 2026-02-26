import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { redisClientMock } from "@tests/mocks/redis.client.mock";
import type { FastifyReply, FastifyRequest } from "fastify";

mock.module("@infrastructure/cache/connection", () => ({
	default: redisClientMock,
}));

describe("Rate Limit Middleware", () => {
	let mockRequest: FastifyRequest;
	let mockReply: FastifyReply;
	let rateLimit: typeof import("@infrastructure/server/rate-limit").rateLimit;

	beforeAll(async () => {
		const module = await import("@infrastructure/server/rate-limit");
		rateLimit = module.rateLimit;
	});

	beforeEach(() => {
		redisClientMock.incr.mockClear();
		redisClientMock.expire.mockClear();

		mockRequest = {
			ip: "127.0.0.1",
		} as FastifyRequest;

		mockReply = {
			header: mock(() => mockReply),
			code: mock(() => mockReply),
			send: mock(() => mockReply),
		} as unknown as FastifyReply;
	});

	it("should allow request under limit", async () => {
		redisClientMock.incr.mockResolvedValue(1);
		redisClientMock.expire.mockResolvedValue(true);
		await rateLimit(mockRequest, mockReply);
		expect(redisClientMock.incr).toHaveBeenCalledWith("rate-limit/check/{ip:127.0.0.1}");
		expect(redisClientMock.expire).toHaveBeenCalled();
	});

	it("should block request over limit", async () => {
		redisClientMock.incr.mockResolvedValue(101);
		await rateLimit(mockRequest, mockReply);
		expect(redisClientMock.incr).toHaveBeenCalled();
	});

	it("should throw on redis error", async () => {
		redisClientMock.incr.mockRejectedValue(new Error("Redis down"));
		expect(rateLimit(mockRequest, mockReply)).rejects.toThrow("Redis down");
	});
});
