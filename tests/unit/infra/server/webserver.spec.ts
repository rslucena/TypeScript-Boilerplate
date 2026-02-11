import { describe, expect, it, mock } from "bun:test";
import { readFileSync } from "node:fs";
import webserver from "@infrastructure/server/webserver";
import { env } from "@infrastructure/settings/environment";

mock.module("node:fs", () => ({
	readFileSync: mock((path: string) => {
		if (path === "./keys/private.pem") return "fake-key";
		if (path === "./keys/cert.pem") return "fake-cert";
		return readFileSync(path);
	}),
}));

describe("Webserver HTTP/2 Configuration", () => {
	it("should configure HTTP/2 and HTTPS when APP_HTTP2 is true", async () => {
		env.APP_HTTP2 = true;
		env.APP_KEY = "./keys/private.pem";
		env.APP_CERT = "./keys/cert.pem";
		const server = await webserver.create();
		expect(server.initialConfig.http2).toBe(true);
		expect(server.initialConfig.https).toBeDefined();
		await server.close();
	});

	it("should NOT configure HTTP/2 when APP_HTTP2 is false", async () => {
		env.APP_HTTP2 = false;
		const server = await webserver.create();
		expect(server.initialConfig.http2).toBe(false);
		expect(server.initialConfig.https).toBeUndefined();
		await server.close();
	});
});
