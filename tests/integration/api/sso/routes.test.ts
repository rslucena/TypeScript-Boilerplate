import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import ssoRoutes from "@domain/sso/routes";
import * as jwt from "@infrastructure/authentication/jwt";
import * as references from "@infrastructure/repositories/references";
import type { server } from "@infrastructure/server/interface";
import webserver from "@infrastructure/server/webserver";
import * as oidc from "@infrastructure/sso/oidc";
import { createEnvMock, fsMock } from "@tests/mocks/environment.mock";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";

const repositoryMock = createRepositoryMock();

mock.module("node:fs", () => fsMock);
mock.module("@infrastructure/settings/environment", () => createEnvMock());
mock.module("@infrastructure/repositories/repository", () => ({ default: repositoryMock }));
mock.module("@infrastructure/cache/connection", () => ({ default: createRedisClientMock() }));

mock.module("@infrastructure/sso/providers", () => ({
	oidcProviders: {
		GOOGLE: {
			clientId: "mock-client-id",
			clientSecret: "mock-client-secret",
			redirectUri: "http://localhost/callback",
			authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
			tokenEndpoint: "https://oauth2.googleapis.com/token",
			jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
			userinfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
			issuer: "https://accounts.google.com",
			scopes: ["openid", "profile", "email"],
		},
		GITHUB: {
			clientId: "mock-github-id",
			clientSecret: "mock-github-secret",
			redirectUri: "http://localhost/callback/github",
			authorizationEndpoint: "https://github.com/login/oauth/authorize",
			tokenEndpoint: "https://github.com/login/oauth/access_token",
			jwksUri: undefined,
			userinfoEndpoint: "https://api.github.com/user",
			issuer: "https://github.com",
			scopes: ["read:user", "user:email"],
		},
	},
}));

describe("Domain - SSO Routes", () => {
	let server: server;

	beforeEach(async () => {
		server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		spyOn(jwt, "create").mockReturnValue("mock-token-123");
		spyOn(references, "hash").mockReturnValue("OK");
	});

	afterEach(async () => {
		await server.close();
		mock.restore();
	});

	it("Should fail on /authorize with invalid provider", async () => {
		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/authorize",
			query: { provider: "INVALID" },
		});

		expect(response.statusCode).toBe(400);
	});

	it("Should process /callback and return normalized user on success", async () => {
		spyOn(oidc, "exchangeToken").mockResolvedValue({ access_token: "mock", token_type: "Bearer" });
		spyOn(oidc, "getNormalizedUser").mockResolvedValue({
			subject: "12345",
			email: "mock@google.com",
			name: "Mock User",
		});

		repositoryMock.execute.mockResolvedValue([]);
		repositoryMock.returning.mockResolvedValue([{ id: "uuid-123" }]);

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/callback",
			query: { provider: "GOOGLE", code: "mock-code" },
		});

		expect(response.statusCode).toBe(200);
		expect(response.json().token).toBe("mock-token-123");
	});

	it("Should fail on /callback if missing code", async () => {
		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/callback",
			query: { provider: "GOOGLE" },
		});

		expect(response.statusCode).toBe(400);
	});

	it("Should process /local login successfully with valid credentials", async () => {
		repositoryMock.execute.mockResolvedValueOnce([{ id: "uuid-123", name: "Local User", secret: "OK" }]);

		const response = await server.inject({
			method: "POST",
			url: "/api/v1/sso/local",
			body: { email: "local@example.com", password: "Password123!" },
		});

		expect(response.statusCode).toBe(200);
		expect(response.json().token).toBe("mock-token-123");
	});

	it("Should fail on /local login if missing body", async () => {
		const response = await server.inject({
			method: "POST",
			url: "/api/v1/sso/local",
			body: {},
		});

		expect(response.statusCode).toBe(400);
	});

	it("Should process /callback and create new user without email if missing", async () => {
		spyOn(oidc, "exchangeToken").mockResolvedValue({ access_token: "mock", token_type: "Bearer" });
		spyOn(oidc, "getNormalizedUser").mockResolvedValue({ subject: "67890", name: "No Email User" });

		repositoryMock.execute.mockResolvedValue([]);
		repositoryMock.returning.mockResolvedValue([{ id: "uuid-no-email" }]);

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/callback",
			query: { provider: "GOOGLE", code: "mock-code" },
		});

		expect(response.statusCode).toBe(200);
		expect(response.json().session.id).toBe("uuid-no-email");
	});

	it("Should process /callback and use existing credential if found", async () => {
		spyOn(oidc, "exchangeToken").mockResolvedValue({ access_token: "mock", token_type: "Bearer" });
		spyOn(oidc, "getNormalizedUser").mockResolvedValue({
			subject: "11111",
			email: "existing@google.com",
			name: "Existing User",
		});

		repositoryMock.execute.mockResolvedValueOnce([{ identityId: "uuid-existing-cred" }]);

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/callback",
			query: { provider: "GOOGLE", code: "mock-code" },
		});

		expect(response.statusCode).toBe(200);
		expect(response.json().session.id).toBe("uuid-existing-cred");
	});
});
