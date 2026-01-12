import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import client from "@infrastructure/cache/connection";
import { rateLimit } from "@infrastructure/server/rate-limit";
import type { FastifyReply, FastifyRequest } from "fastify";

describe("Rate Limit Middleware", () => {
	let mockRequest: FastifyRequest;
	let mockReply: FastifyReply;

	beforeEach(() => {
		mockRequest = {
			ip: "127.0.0.1",
		} as FastifyRequest;

		mockReply = {
			header: mock(() => mockReply),
			code: mock(() => mockReply),
			send: mock(() => mockReply),
			status: mock(() => mockReply),
		} as unknown as FastifyReply;
	});

	it("should allow request under limit", async () => {
		spyOn(client, "incr").mockResolvedValue(1);
		spyOn(client, "expire").mockResolvedValue(1);
		await rateLimit(mockRequest, mockReply);
		expect(client.incr).toHaveBeenCalledWith("rate-limit/check/{ip:127.0.0.1}");
		expect(client.expire).toHaveBeenCalled();
		expect(mockReply.header).toHaveBeenCalledWith("X-RateLimit-Remaining", 99);
		expect(mockReply.code).not.toHaveBeenCalledWith(429);
	});

	it("should block request over limit", async () => {
		spyOn(client, "incr").mockResolvedValue(101);
		await rateLimit(mockRequest, mockReply);
		expect(client.incr).toHaveBeenCalled();
		expect(mockReply.code).toHaveBeenCalledWith(429);
	});

	it("should throw on redis error", async () => {
		spyOn(client, "incr").mockRejectedValue(new Error("Redis down"));
		expect(rateLimit(mockRequest, mockReply)).rejects.toThrow("Redis down");
	});
});
