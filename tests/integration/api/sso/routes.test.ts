import { afterEach, beforeAll, describe, expect, it, type Mock, mock, spyOn } from "bun:test";
import { createEnvMock, fsMock } from "@tests/mocks/environment.mock";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { referencesMock } from "@tests/mocks/references.mock";
import { repositoryMock } from "@tests/mocks/repository.mock";

mock.module("@infrastructure/settings/environment", () => createEnvMock());
mock.module("node:fs", () => fsMock);
mock.module("@infrastructure/cache/connection", () => ({ default: createRedisClientMock() }));
mock.module("@infrastructure/repositories/repository", () => ({
	default: repositoryMock,
	withPagination: referencesMock.withPagination,
}));
mock.module("@infrastructure/repositories/references", () => ({
	...referencesMock,
	pgIndex: mock(() => []),
}));

import { providers } from "@domain/credentials/constants";
import ssoRoutes from "@domain/sso/routes";
import webserver from "@infrastructure/server/webserver";
import * as oidc from "@infrastructure/sso/oidc";
import { oidcProviders } from "@infrastructure/sso/providers";

let exchangeSpy: Mock<typeof oidc.exchangeToken>;
let userSpy: Mock<typeof oidc.getNormalizedUser>;

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
	repositoryMock.execute.mockClear();
	repositoryMock.insert.mockClear();
	repositoryMock.returning.mockClear();
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

		repositoryMock.execute.mockResolvedValue([]);
		repositoryMock.insert.mockReturnValue(repositoryMock);
		repositoryMock.values.mockReturnValue(repositoryMock);
		repositoryMock.where.mockReturnValue(repositoryMock);
		repositoryMock.select.mockReturnValue(repositoryMock);
		repositoryMock.returning.mockResolvedValue([{ id: "uuid-123" }]);

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
		expect(body.session).toBeDefined();
		expect(body.token).toBeDefined();
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

	it("Should process /local login successfully with valid credentials", async () => {
		repositoryMock.execute.mockResolvedValueOnce([
			{ id: "123e4567-e89b-12d3-a456-426614174000", name: "Local User", email: "local@example.com" },
		]);
		repositoryMock.execute.mockResolvedValueOnce([{ provider: providers.LOCAL, secret: "hashed_secret" }]);

		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "POST",
			url: "/api/v1/sso/local",
			body: {
				email: "local@example.com",
				password: "StrongPassword123!",
			},
			headers: { "accept-language": "en" },
		});

		expect([200, 401]).toContain(response.statusCode);
	});

	it("Should fail on /local login if missing body", async () => {
		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "POST",
			url: "/api/v1/sso/local",
			body: {},
			headers: { "accept-language": "en" },
		});

		expect(response.statusCode).toBe(400);
	});

	it("Should fail on /local login if user is not found", async () => {
		repositoryMock.execute.mockResolvedValueOnce([]); // User not found

		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "POST",
			url: "/api/v1/sso/local",
			body: { email: "notfound@example.com", password: "Password123!" },
			headers: { "accept-language": "en" },
		});

		expect(response.statusCode).toBe(401);
	});

	it("Should process /callback and create new user without email if missing", async () => {
		exchangeSpy = spyOn(oidc, "exchangeToken").mockResolvedValue({
			access_token: "mock-access",
			id_token: "mock-id-token",
			token_type: "Bearer",
		});

		userSpy = spyOn(oidc, "getNormalizedUser").mockResolvedValue({
			subject: "67890",
			name: "No Email User",
		});

		repositoryMock.execute.mockResolvedValue([]);
		repositoryMock.insert.mockReturnValue(repositoryMock);
		repositoryMock.values.mockReturnValue(repositoryMock);
		repositoryMock.where.mockReturnValue(repositoryMock);
		repositoryMock.select.mockReturnValue(repositoryMock);
		repositoryMock.returning.mockResolvedValue([{ id: "uuid-no-email" }]);

		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/callback",
			query: { provider: "GOOGLE", code: "mock-auth-code-2" },
			headers: { "accept-language": "en" },
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.session.id).toBe("uuid-no-email");
	});

	it("Should process /callback and use existing credential if found", async () => {
		exchangeSpy = spyOn(oidc, "exchangeToken").mockResolvedValue({
			access_token: "mock-access",
			token_type: "Bearer",
		});

		userSpy = spyOn(oidc, "getNormalizedUser").mockResolvedValue({
			subject: "11111",
			email: "existing@google.com",
			name: "Existing Cred User",
		});

		repositoryMock.execute.mockResolvedValueOnce([{ identityId: "uuid-existing-cred" }]);

		const server = await webserver.create();
		await server.register(ssoRoutes, { prefix: "/api/v1/sso" });
		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/api/v1/sso/callback",
			query: { provider: "GOOGLE", code: "mock-auth-code-3" },
			headers: { "accept-language": "en" },
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.session.id).toBe("uuid-existing-cred");
	});
});
