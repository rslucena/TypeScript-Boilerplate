import { afterAll, afterEach, beforeEach, describe, expect, it, type Mock, mock, spyOn } from "bun:test";
import { createEnvMock, fsMock } from "@tests/mocks/environment.mock";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";

const redisClientMock = createRedisClientMock();
const repositoryMock = createRepositoryMock();
const localReferencesMock = createReferencesMock();

mock.module("@infrastructure/settings/environment", () => createEnvMock());
mock.module("node:fs", () => fsMock);
mock.module("@infrastructure/cache/connection", () => ({ default: redisClientMock }));
mock.module("@infrastructure/repositories/repository", () => ({
	default: repositoryMock,
	withPagination: localReferencesMock.withPagination,
}));

mock.module("@infrastructure/repositories/references", () => ({
	...localReferencesMock,
	pgIndex: mock(() => []),
}));

mock.module("@infrastructure/authentication/jwt", () => ({
	create: mock(() => "mock-jwt-token"),
	session: mock(() => Promise.resolve({ id: "123", name: "Mock" })),
}));

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

// --- 3. IMPORT APP CODE ONLY AFTER MOCKS ARE REGISTERED ---
import { providers } from "@domain/credentials/constants";
import ssoRoutes from "@domain/sso/routes";
import webserver from "@infrastructure/server/webserver";
import * as oidc from "@infrastructure/sso/oidc";

let exchangeSpy: Mock<typeof oidc.exchangeToken>;
let userSpy: Mock<typeof oidc.getNormalizedUser>;

beforeEach(() => {
	repositoryMock.execute.mockReset();
	repositoryMock.execute.mockImplementation(() => Promise.resolve([]));
	repositoryMock.insert.mockReset();
	repositoryMock.returning.mockReset();
	repositoryMock.returning.mockResolvedValue([]);
	repositoryMock.where.mockReturnValue(repositoryMock);
	repositoryMock.select.mockReturnValue(repositoryMock);
	repositoryMock.values.mockReturnValue(repositoryMock);
	repositoryMock.prepare.mockReturnValue(repositoryMock);
});

afterEach(() => {
	if (exchangeSpy) exchangeSpy.mockRestore();
	if (userSpy) userSpy.mockRestore();
	mock.restore();
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
			{
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Local User",
				secret: "OK",
			},
		]);

		localReferencesMock.hash.mockReturnValueOnce("OK");

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

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.token).toBe("mock-jwt-token");
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
