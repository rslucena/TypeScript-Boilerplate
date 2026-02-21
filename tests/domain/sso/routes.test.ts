import { afterEach, beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";

mock.module("@infrastructure/cache/connection", () => ({ default: createRedisClientMock() }));

import { providers } from "@domain/credentials/constants";
import ssoRoutes from "@domain/sso/routes";
import webserver from "@infrastructure/server/webserver";
import * as oidc from "@infrastructure/sso/oidc";
import { oidcProviders } from "@infrastructure/sso/providers";

let exchangeSpy: any;
let userSpy: any;

beforeAll(() => {
	const google = oidcProviders[providers.GOOGLE];
	if (google) {
		google.clientId = "mock-client-id";
		google.clientSecret = "mock-client-secret";
		google.redirectUri = "http://localhost/callback";
	}
});

afterEach(() => {
	if (exchangeSpy) exchangeSpy.mockRestore();
	if (userSpy) userSpy.mockRestore();
});

describe("Domain - SSO Routes", () => {
	it("Should redirect on /authorize with valid provider", async () => {
		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/authorize",
			query: {
				provider: "GOOGLE",
			},
			headers: { "accept-language": "en" },
		});

		expect(response.statusCode).toBe(302);
		expect(response.headers.location).toInclude("accounts.google.com");
	});

	it("Should fail on /authorize with invalid provider", async () => {
		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/authorize",
			query: {
				provider: "INVALID",
			},
			headers: { "accept-language": "en" },
		});

		expect(response.statusCode).toBe(400);
	});

	it("Should process /callback and return normalized user on success", async () => {
		exchangeSpy = spyOn(oidc, "exchangeToken").mockResolvedValue({
			access_token: "mock-access",
			id_token: "mock-id-token",
			token_type: "Bearer",
		});

		userSpy = spyOn(oidc, "getNormalizedUser").mockResolvedValue({
			subject: "12345",
			email: "mock@google.com",
			name: "Mock User",
		});

		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/callback",
			query: {
				provider: "GOOGLE",
				code: "mock-auth-code",
			},
			headers: { "accept-language": "en" },
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.subject).toBe("12345");
		expect(body.email).toBe("mock@google.com");
		expect(body.name).toBe("Mock User");
	});

	it("Should fail on /callback if missing code", async () => {
		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/callback",
			query: {
				provider: "GOOGLE",
			},
			headers: { "accept-language": "en" },
		});

		expect(response.statusCode).toBe(400);
	});
});
