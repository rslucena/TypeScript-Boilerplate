import { beforeEach, describe, expect, it, mock } from "bun:test";
import { readFileSync } from "node:fs";

const mockEnv = {
	APP_HTTP2: false,
	APP_KEY: "./keys/private.pem",
	APP_CERT: "./keys/cert.pem",
	APP_NAME: "Test",
	APP_DESCRIPTION: "Test",
	APP_VERSION: "1.0",
	LOG_LEVEL: "error",
};

mock.module("@infrastructure/settings/environment", () => ({
	env: mockEnv,
}));

mock.module("node:fs", () => ({
	readFileSync: mock((path: string) => {
		if (path === "./keys/private.pem") return "fake-key";
		if (path === "./keys/cert.pem") return "fake-cert";
		return readFileSync(path);
	}),
}));

import webserver from "@infrastructure/server/webserver";

describe("Webserver HTTP/2 Configuration", () => {
	beforeEach(() => {
		mockEnv.APP_HTTP2 = false;
	});

	it("should configure HTTP/2 and HTTPS when APP_HTTP2 is true", async () => {
		mockEnv.APP_HTTP2 = true;
		const server = await webserver.create();
		expect(server.initialConfig.http2).toBe(true);
		expect(server.initialConfig.https).toBeDefined();
		await server.close();
	});

	it("should NOT configure HTTP/2 when APP_HTTP2 is false", async () => {
		mockEnv.APP_HTTP2 = false;
		const server = await webserver.create();
		expect(server.initialConfig.http2).toBeUndefined();
		expect(server.initialConfig.https).toBeUndefined();
		await server.close();
	});
});
