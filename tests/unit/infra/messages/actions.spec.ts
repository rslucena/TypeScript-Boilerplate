import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";

const redisClientMock = createRedisClientMock();
const publisherMock = redisClientMock;
const subscriberMock = createRedisClientMock();

const eventEmitterMock = {
	publish: mock(() => 1),
	subscribe: mock(() => {}),
};

mock.module("@infrastructure/messages/connections", () => ({
	eventEmitter: eventEmitterMock,
	publisher: publisherMock,
	subscriber: subscriberMock,
}));

describe("Messaging Infrastructure", () => {
	let messages: typeof import("@infrastructure/messages/actions").messages;

	beforeAll(async () => {
		const module = await import("@infrastructure/messages/actions");
		messages = module.messages;
	});

	afterEach(() => {
		publisherMock.isOpen = true;
		subscriberMock.isOpen = true;
		publisherMock.publish.mockClear();
		subscriberMock.subscribe.mockClear();
		subscriberMock.ping.mockClear();
		eventEmitterMock.publish.mockClear();
		eventEmitterMock.subscribe.mockClear();
	});

	describe("Resilience (Graceful Degradation)", () => {
		it("should fallback to internal events when Redis is offline (pub)", async () => {
			publisherMock.isOpen = false;
			const data = { foo: "bar" };
			await messages.pub("test-topic", data);

			expect(publisherMock.publish).not.toHaveBeenCalled();
			expect(eventEmitterMock.publish).toHaveBeenCalledWith("test-topic", JSON.stringify(data));
		});

		it("should fallback to internal events when Redis is offline (sub)", async () => {
			subscriberMock.isOpen = false;
			const callback = async () => {};
			await messages.sub("test-topic", callback);

			expect(subscriberMock.subscribe).not.toHaveBeenCalled();
			expect(eventEmitterMock.subscribe).toHaveBeenCalledWith("test-topic", callback);
		});

		it("should return PONG even if Redis is offline (ping)", async () => {
			subscriberMock.isOpen = false;
			const result = await messages.ping();

			expect(result).toBe("PONG");
			expect(subscriberMock.ping).not.toHaveBeenCalled();
		});
	});

	describe("Distributed (Redis Online)", () => {
		it("should use Redis when online (pub)", async () => {
			publisherMock.isOpen = true;
			const data = { foo: "bar" };
			await messages.pub("test-topic", data);

			expect(publisherMock.publish).toHaveBeenCalledWith("test-topic", JSON.stringify(data));
			expect(eventEmitterMock.publish).not.toHaveBeenCalled();
		});

		it("should use Redis when online (sub)", async () => {
			subscriberMock.isOpen = true;
			const callback = async () => {};
			await messages.sub("test-topic", callback);

			expect(subscriberMock.subscribe).toHaveBeenCalledWith("test-topic", callback);
			expect(eventEmitterMock.subscribe).not.toHaveBeenCalled();
		});
	});
});
