import { createPublicKey, createVerify } from "node:crypto";
import { providers } from "@domain/credentials/constants";
import { base64url, sha256 } from "@infrastructure/pipes/crypto";
import { safeParse } from "@infrastructure/pipes/safe-parse";
import { oidcProviders } from "./providers";

export function getAuthorizationUrl(provider: providers, state: string): string {
	const config = oidcProviders[provider];
	if (!config || !config.clientId || !config.redirectUri) {
		throw new Error(`Provider ${provider} is not configured or missing environment variables`);
	}

	const url = new URL(config.authorizationEndpoint);
	url.searchParams.append("client_id", config.clientId);
	url.searchParams.append("redirect_uri", config.redirectUri);
	url.searchParams.append("response_type", "code");
	url.searchParams.append("scope", config.scopes.join(" "));
	url.searchParams.append("state", state);

	if (config.jwksUri) {
		url.searchParams.append("nonce", base64url(sha256(state)));
	}

	return url.toString();
}

export async function exchangeToken(provider: providers, code: string) {
	const config = oidcProviders[provider];
	if (!config || !config.clientId || !config.clientSecret || !config.redirectUri) {
		throw new Error(`Provider ${provider} is not configured`);
	}

	const payload = new URLSearchParams();
	payload.append("client_id", config.clientId);
	payload.append("client_secret", config.clientSecret);
	payload.append("code", code);
	payload.append("redirect_uri", config.redirectUri);
	payload.append("grant_type", "authorization_code");

	const response = await fetch(config.tokenEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json",
		},
		body: payload.toString(),
	});

	if (!response.ok) {
		throw new Error(`Failed to exchange token for ${provider}`);
	}

	return response.json() as Promise<{
		access_token: string;
		id_token?: string;
		token_type: string;
		expires_in?: number;
	}>;
}

const jwksCache: Record<string, { keys: any[] }> = {};

export async function getProviderJwks(jwksUri: string) {
	if (jwksCache[jwksUri]) return jwksCache[jwksUri];

	const response = await fetch(jwksUri);
	if (!response.ok) throw new Error("Failed to fetch JWKS");

	const data = (await response.json()) as { keys: any[] };
	jwksCache[jwksUri] = data;
	return data;
}

export interface NormalizedUser {
	subject: string;
	email?: string;
	name?: string;
}

export async function verifyIdToken(provider: providers, token: string) {
	const config = oidcProviders[provider];
	if (!config || !config.jwksUri) throw new Error("OIDC JWKS not supported for this provider");

	const parts = token.split(".");
	if (parts.length !== 3) throw new Error("Invalid token format");

	const header = safeParse<{ kid: string }>(Buffer.from(parts[0], "base64url").toString());
	const payload = safeParse<{ iss: string; aud: string; exp: number; sub: string; email?: string; name?: string }>(
		Buffer.from(parts[1], "base64url").toString(),
	);

	if (!header?.kid || !payload) throw new Error("Invalid token content");

	const jwks = await getProviderJwks(config.jwksUri);
	const jwk = jwks.keys.find((k: any) => k.kid === header.kid);
	if (!jwk) throw new Error("Matching JWK not found");

	const publicKey = createPublicKey({ key: jwk, format: "jwk" });
	const signature = Buffer.from(parts[2], "base64url");
	const data = `${parts[0]}.${parts[1]}`;

	const verifier = createVerify("RSA-SHA256");
	verifier.update(data);
	const isValid = verifier.verify(publicKey, signature);

	if (!isValid) throw new Error("Invalid signature");

	const now = Math.floor(Date.now() / 1000);
	if (payload.exp && payload.exp < now) throw new Error("Token expired");

	return payload;
}

export async function getGitHubUser(accessToken: string): Promise<NormalizedUser> {
	const response = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/json",
			"User-Agent": "TypeScript-Boilerplate",
		},
	});

	if (!response.ok) throw new Error("Failed to fetch GitHub user");
	const profile = await response.json();

	// Fetch primary email if not public
	let email = profile.email;
	if (!email) {
		const emailsResponse = await fetch("https://api.github.com/user/emails", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/json",
				"User-Agent": "TypeScript-Boilerplate",
			},
		});
		if (emailsResponse.ok) {
			const emails = await emailsResponse.json();
			const primary = emails.find((e: any) => e.primary);
			if (primary) email = primary.email;
		}
	}

	return {
		subject: profile.id.toString(),
		email,
		name: profile.name || profile.login,
	};
}

export async function getNormalizedUser(
	provider: providers,
	tokenResponse: { access_token: string; id_token?: string },
): Promise<NormalizedUser> {
	if (provider === providers.GITHUB) {
		return getGitHubUser(tokenResponse.access_token);
	}

	if (provider === providers.GOOGLE && tokenResponse.id_token) {
		const payload = await verifyIdToken(provider, tokenResponse.id_token);
		return {
			subject: payload.sub,
			email: payload.email,
			name: payload.name,
		};
	}

	throw new Error(`Provider ${provider} resolution not implemented`);
}
