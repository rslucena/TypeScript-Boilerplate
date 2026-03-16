import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createMutableEnvMock, fsMock } from "@tests/mocks/environment.mock";
import { redisClientMock } from "@tests/mocks/redis.client.mock";

const { env: mockEnv, reset: resetEnv } = createMutableEnvMock();

mock.module("@infrastructure/settings/environment", () => ({ env: mockEnv }));
mock.module("node:fs", () => fsMock);
mock.module("@infrastructure/cache/connection", () => ({ default: redisClientMock }));

import webserver from "@infrastructure/server/webserver";

describe("Webserver HTTP/2 Configuration", () => {
	beforeEach(() => resetEnv());
	afterEach(() => resetEnv());

	it("should configure HTTP/2 and HTTPS when APP_HTTP2 is true", async () => {
		mockEnv.APP_HTTP2 = true;
		const server = await webserver.create();
		expect(server.initialConfig.http2).toBe(true);
		expect(server.initialConfig.https).toBeDefined();
		await server.close();
	});

	it("should NOT configure HTTP/2 when APP_HTTP2 is false", async () => {
		const server = await webserver.create();
		expect(server.initialConfig.http2).not.toBe(true);
		expect(server.initialConfig.https).toBeUndefined();
		await server.close();
	});

	it("should configure trustProxy to true when APP_TRUST_PROXY is 'true'", async () => {
		mockEnv.APP_TRUST_PROXY = "true";
		const server = await webserver.create();

		server.get("/ip", (req) => req.ip);

		const response = await server.inject({
			method: "GET",
			url: "/ip",
			headers: {
				"x-forwarded-for": "192.168.1.1",
			},
		});

		expect(response.payload).toBe("192.168.1.1");
		await server.close();
	});

	it("should NOT trust proxy when APP_TRUST_PROXY is 'false'", async () => {
		mockEnv.APP_TRUST_PROXY = "false";
		const server = await webserver.create();

		server.get("/ip", (req) => req.ip);

		const response = await server.inject({
			method: "GET",
			url: "/ip",
			headers: {
				"x-forwarded-for": "192.168.1.1",
			},
		});

		expect(response.payload).toBe("127.0.0.1");
		await server.close();
	});

	it("should configure trustProxy with specific IPs when APP_TRUST_PROXY contains IPs", async () => {
		mockEnv.APP_TRUST_PROXY = "10.0.0.1,10.0.0.2";
		const server = await webserver.create();

		server.get("/ip", (req) => req.ip);

		const response1 = await server.inject({
			method: "GET",
			url: "/ip",
			headers: {
				"x-forwarded-for": "192.168.1.1",
			},
			remoteAddress: "10.0.0.1",
		});

		// When proxy is trusted, it should use x-forwarded-for
		expect(response1.payload).toBe("192.168.1.1");

		const response2 = await server.inject({
			method: "GET",
			url: "/ip",
			headers: {
				"x-forwarded-for": "192.168.1.1",
			},
			remoteAddress: "192.168.1.2",
		});

		// When proxy is NOT trusted, it should fall back to the remoteAddress
		expect(response2.payload).toBe("192.168.1.2");
		await server.close();
	});
});
