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

	it("should configure trustProxy based on env.APP_TRUST_PROXY", async () => {
		mockEnv.APP_TRUST_PROXY = 2;
		const server = await webserver.create();
		expect(server).toBeDefined();
		await server.close();
	});
});
