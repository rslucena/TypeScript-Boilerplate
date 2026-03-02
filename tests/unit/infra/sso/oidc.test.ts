import { afterEach, beforeAll, describe, expect, it, type Mock, mock, spyOn } from "bun:test";
import { providers } from "@domain/credentials/constants";
import { exchangeToken, getAuthorizationUrl, getNormalizedUser, verifyIdToken } from "@infrastructure/sso/oidc";
import { oidcProviders } from "@infrastructure/sso/providers";

let fetchSpy: Mock<typeof fetch>;

beforeAll(() => {
	const google = oidcProviders[providers.GOOGLE];
	if (google) {
		google.clientId = "mock-client-id";
		google.clientSecret = "mock-client-secret";
		google.redirectUri = "http://localhost/callback";
	}

	const github = oidcProviders[providers.GITHUB];
	if (github) {
		github.clientId = "mock-client-id";
		github.clientSecret = "mock-client-secret";
		github.redirectUri = "http://localhost/callback";
	}
});

afterEach(() => {
	if (fetchSpy) fetchSpy.mockRestore();
});

describe("Infrastructure - SSO Connect", () => {
	it("Should generate authorization URL correctly for Google", () => {
		const state = "random-xyz";
		const url = getAuthorizationUrl(providers.GOOGLE, state);

		expect(url).toInclude("https://accounts.google.com/o/oauth2/v2/auth");
		expect(url).toInclude("client_id=");
		expect(url).toInclude("redirect_uri=");
		expect(url).toInclude("response_type=code");
		expect(url).toInclude("scope=openid+profile+email");
		expect(url).toInclude(`state=${state}`);
		expect(url).toInclude("nonce=");
	});

	it("Should generate authorization URL correctly for GitHub without nonce", () => {
		const state = "random-xyz";
		const url = getAuthorizationUrl(providers.GITHUB, state);

		expect(url).toInclude("https://github.com/login/oauth/authorize");
		expect(url).toInclude("client_id=");
		expect(url).toInclude("redirect_uri=");
		expect(url).toInclude("response_type=code");
		expect(url).toInclude("scope=read%3Auser+user%3Aemail");
		expect(url).toInclude(`state=${state}`);
		expect(url).not.toInclude("nonce=");
	});

	it("Should exchange token successfully using mock fetch", async () => {
		const mockFetch = mock().mockResolvedValue(
			new Response(
				JSON.stringify({
					access_token: "mock_access_token",
					id_token: "mock_id_token",
					token_type: "Bearer",
					expires_in: 3600,
				}),
				{ status: 200 },
			),
		);
		fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as unknown as typeof fetch);

		const result = await exchangeToken(providers.GOOGLE, "mock_auth_code");

		expect(result.access_token).toBe("mock_access_token");
		expect(result.id_token).toBe("mock_id_token");
	});

	it("Should normalize GitHub user correctly", async () => {
		const mockFetch = mock()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						id: 12345,
						login: "mockuser",
						name: "Mock User",
						email: null,
					}),
					{ status: 200 },
				),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify([{ email: "mockuser@example.com", primary: true, verified: true }]), {
					status: 200,
				}),
			);
		fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as unknown as typeof fetch);

		const result = await getNormalizedUser(providers.GITHUB, { access_token: "mock_git_token" });

		expect(result.subject).toBe("12345");
		expect(result.name).toBe("Mock User");
		expect(result.email).toBe("mockuser@example.com");
	});

	it("Should throw when getting authorization URL with missing config", () => {
		expect(() => getAuthorizationUrl("INVALID_PROVIDER" as providers, "state")).toThrowError(/not configured/);
	});

	it("Should throw when exchanging token with missing config", async () => {
		await expect(exchangeToken("INVALID_PROVIDER" as providers, "code")).rejects.toThrowError(/not configured/);
	});

	it("Should throw when exchange token fetch fails", async () => {
		const mockFetch = mock().mockResolvedValue(new Response("Error", { status: 400 }));
		fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as unknown as typeof fetch);

		await expect(exchangeToken(providers.GOOGLE, "mock_code")).rejects.toThrowError(/Failed to exchange/);
	});

	it("Should throw when getting GitHub user fails", async () => {
		const mockFetch = mock().mockResolvedValue(new Response("Error", { status: 401 }));
		fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as unknown as typeof fetch);

		await expect(getNormalizedUser(providers.GITHUB, { access_token: "invalid" })).rejects.toThrowError(
			/Failed to fetch GitHub/,
		);
	});

	it("Should throw when normalize user is called with unsupported provider", async () => {
		await expect(getNormalizedUser(providers.LOCAL, { access_token: "token" })).rejects.toThrowError(/not implemented/);
	});

	it("Should throw when parsing verifyIdToken with missing JWKS uri", async () => {
		await expect(verifyIdToken("INVALID_PROVIDER" as providers, "invalid.token.format")).rejects.toThrowError(
			/JWKS not supported/,
		);
	});

	it("Should throw when verifyIdToken receives invalid token format", async () => {
		await expect(verifyIdToken(providers.GOOGLE, "invalidtokenformat")).rejects.toThrowError(/Invalid token format/);
	});

	it("Should throw when verifyIdToken receives invalid token content", async () => {
		// Three parts but not base64 valid json
		await expect(verifyIdToken(providers.GOOGLE, "aaa.bbb.ccc")).rejects.toThrowError(/Invalid token content/);
	});

	it("Should fetch provider JWKS successfully", async () => {
		const mockFetch = mock().mockResolvedValue(
			new Response(JSON.stringify({ keys: [{ kid: "test-kid" }] }), { status: 200 }),
		);
		fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as unknown as typeof fetch);

		const { getProviderJwks } = await import("@infrastructure/sso/oidc");
		const result = await getProviderJwks("https://example.com/jwks");
		expect(result.keys[0].kid).toBe("test-kid");
	});

	it("Should throw when getProviderJwks fails", async () => {
		const mockFetch = mock().mockResolvedValue(new Response("Error", { status: 500 }));
		fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch as unknown as typeof fetch);

		const { getProviderJwks } = await import("@infrastructure/sso/oidc");
		await expect(getProviderJwks("https://example.com/jwks-fail")).rejects.toThrowError(/Failed to fetch JWKS/);
	});

	it("Should throw when verifyIdToken receives expired token", async () => {
		// Mock a token where the payload indicates expiration
		const header = Buffer.from(JSON.stringify({ kid: "test-kid" })).toString("base64url");
		const payload = Buffer.from(JSON.stringify({ sub: "sub123", exp: Math.floor(Date.now() / 1000) - 1000 })).toString(
			"base64url",
		);
		const signature = Buffer.from("fakesignature").toString("base64url");
		const token = `${header}.${payload}.${signature}`;

		// Provide a valid JWKS
		const mockFetchJwks = mock().mockResolvedValue(
			new Response(JSON.stringify({ keys: [{ kid: "test-kid", kty: "RSA", n: "anbc", e: "AQAB" }] }), { status: 200 }),
		);
		fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetchJwks as unknown as typeof fetch);

		// We mock crypto createVerify inside this to make it pass verify()
		// but fail at exp
		const crypto = await import("node:crypto");
		spyOn(crypto, "createVerify").mockReturnValue({
			update: mock(),
			verify: mock().mockReturnValue(true),
		} as unknown as ReturnType<typeof crypto.createVerify>);

		spyOn(crypto, "createPublicKey").mockReturnValue("mockkey" as unknown as ReturnType<typeof crypto.createPublicKey>);

		await expect(verifyIdToken(providers.GOOGLE, token)).rejects.toThrowError(/Token expired/);
	});

	it("Should verify Google user correctly on normalized user using ID Token", async () => {
		const header = Buffer.from(JSON.stringify({ kid: "test-kid" })).toString("base64url");
		const payloadObj = {
			sub: "sub123",
			email: "google@google.com",
			name: "Google Name",
			exp: Math.floor(Date.now() / 1000) + 1000,
		};
		const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
		const signature = Buffer.from("fakesignature").toString("base64url");
		const token = `${header}.${payload}.${signature}`;

		const mockFetchJwks = mock().mockResolvedValue(
			new Response(JSON.stringify({ keys: [{ kid: "test-kid", kty: "RSA", n: "anbc", e: "AQAB" }] }), { status: 200 }),
		);
		fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetchJwks as unknown as typeof fetch);

		const crypto = await import("node:crypto");
		spyOn(crypto, "createVerify").mockReturnValue({
			update: mock(),
			verify: mock().mockReturnValue(true),
		} as unknown as ReturnType<typeof crypto.createVerify>);
		spyOn(crypto, "createPublicKey").mockReturnValue("mockkey" as unknown as ReturnType<typeof crypto.createPublicKey>);

		const res = await getNormalizedUser(providers.GOOGLE, { access_token: "ignored", id_token: token });

		expect(res.subject).toBe("sub123");
		expect(res.email).toBe("google@google.com");
		expect(res.name).toBe("Google Name");
	});
});
