import { beforeAll, describe, expect, it, mock, spyOn } from "bun:test";
import { providers } from "@domain/credentials/constants";
import { exchangeToken, getAuthorizationUrl, getNormalizedUser } from "@infrastructure/sso/oidc";
import { oidcProviders } from "@infrastructure/sso/providers";

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
		spyOn(globalThis, "fetch").mockImplementation(mockFetch as any);

		const result = await exchangeToken(providers.GOOGLE, "mock_auth_code");

		expect(result.access_token).toBe("mock_access_token");
		expect(result.id_token).toBe("mock_id_token");

		mockFetch.mockRestore();
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
		spyOn(globalThis, "fetch").mockImplementation(mockFetch as any);

		const result = await getNormalizedUser(providers.GITHUB, { access_token: "mock_git_token" });

		expect(result.subject).toBe("12345");
		expect(result.name).toBe("Mock User");
		expect(result.email).toBe("mockuser@example.com");

		mockFetch.mockRestore();
	});
});
