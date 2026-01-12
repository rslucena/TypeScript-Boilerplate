import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { FastifyReply, FastifyRequest } from "fastify";

const mockRedis = {
	incr: mock(),
	expire: mock(),
};

mock.module("@infrastructure/cache/connection", () => ({
	default: mockRedis,
}));

import { rateLimit } from "@infrastructure/server/rate-limit";

describe("Rate Limit Middleware", () => {
	let mockRequest: FastifyRequest;
	let mockReply: FastifyReply;

	beforeEach(() => {
		mockRedis.incr.mockReset();
		mockRedis.expire.mockReset();

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
		mockRedis.incr.mockResolvedValue(1);
		mockRedis.expire.mockResolvedValue(1);
		await rateLimit(mockRequest, mockReply);
		expect(mockRedis.incr).toHaveBeenCalledWith("rate-limit/check/{ip:127.0.0.1}");
		expect(mockRedis.expire).toHaveBeenCalled();
		expect(mockReply.header).toHaveBeenCalledWith("X-RateLimit-Remaining", 99);
		expect(mockReply.code).not.toHaveBeenCalledWith(429);
	});

	it("should block request over limit", async () => {
		mockRedis.incr.mockResolvedValue(101);
		await rateLimit(mockRequest, mockReply);
		expect(mockRedis.incr).toHaveBeenCalled();
		expect(mockReply.code).toHaveBeenCalledWith(429);
	});

	it("should throw on redis error", async () => {
		mockRedis.incr.mockRejectedValue(new Error("Redis down"));
		expect(rateLimit(mockRequest, mockReply)).rejects.toThrow("Redis down");
	});
});
