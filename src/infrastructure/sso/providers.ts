import { providers } from "@domain/credentials/constants";
import { env } from "@infrastructure/settings/environment";

export interface OIDCConfiguration {
	clientId: string | undefined;
	clientSecret: string | undefined;
	redirectUri: string | undefined;
	authorizationEndpoint: string;
	tokenEndpoint: string;
	jwksUri: string | undefined;
	userinfoEndpoint: string | undefined;
	issuer: string;
	scopes: string[];
}

export const oidcProviders: Partial<Record<providers, OIDCConfiguration>> = {
	[providers.GOOGLE]: {
		clientId: env.SSO_GOOGLE_CLIENT_ID,
		clientSecret: env.SSO_GOOGLE_CLIENT_SECRET,
		redirectUri: env.SSO_GOOGLE_REDIRECT_URI,
		authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
		tokenEndpoint: "https://oauth2.googleapis.com/token",
		jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
		userinfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
		issuer: "https://accounts.google.com",
		scopes: ["openid", "profile", "email"],
	},
	[providers.GITHUB]: {
		clientId: env.SSO_GITHUB_CLIENT_ID,
		clientSecret: env.SSO_GITHUB_CLIENT_SECRET,
		redirectUri: env.SSO_GITHUB_REDIRECT_URI,
		authorizationEndpoint: "https://github.com/login/oauth/authorize",
		tokenEndpoint: "https://github.com/login/oauth/access_token",
		jwksUri: undefined,
		userinfoEndpoint: "https://api.github.com/user",
		issuer: "https://github.com",
		scopes: ["read:user", "user:email"],
	},
};
