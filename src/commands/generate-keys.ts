import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createJWKS, generateRSAKeyPair, pemToJWK } from "@infrastructure/pipes/crypto";
import { env } from "@infrastructure/settings/environment";

mkdirSync("./keys", { recursive: true });

const { publicKey, privateKey } = generateRSAKeyPair();

writeFileSync(`${env.APP_FOLDER_KEY}/private.pem`, privateKey);
writeFileSync(`${env.APP_FOLDER_KEY}/public.pem`, publicKey);

console.log("⏳ Generating certificate...");
execSync(
	`openssl req -x509 -new -nodes -key ${env.APP_FOLDER_KEY}/private.pem -sha256 -days 365 -out ${env.APP_FOLDER_KEY}/cert.pem -subj "/C=BR/ST=SP/L=SaoPaulo/O=Development/CN=localhost"`,
	{ stdio: "inherit" },
);

const jwk = pemToJWK(publicKey);
const jwks = createJWKS([jwk]);

writeFileSync(`${env.APP_FOLDER_KEY}/jwks.json`, JSON.stringify(jwks, null, 2));

console.log("✔ Keys geradas");
console.log("✔ JWKS gerado");
console.log("✔ Kid:", jwk.kid);

writeFileSync(`${env.APP_FOLDER_KEY}/metadata.json`, JSON.stringify({ kid: jwk.kid }, null, 2));

const domain = `${env.PROCESS_DOMAIN}:${env.PROCESS_PORT}`;

const openidConfiguration = {
	issuer: domain,
	authorization_endpoint: `${domain}/api/v1/sso/authorize`,
	token_endpoint: `${domain}/api/v1/sso/token`,
	userinfo_endpoint: `${env.PROCESS_DOMAIN}:${env.PROCESS_PORT}/api/v1/sso/userinfo`,
	jwks_uri: `${env.PROCESS_DOMAIN}:${env.PROCESS_PORT}/api/v1/sso/jwks`,
	scopes_supported: ["openid", "profile", "email"],
	response_types_supported: ["code"],
	grant_types_supported: ["authorization_code", "refresh_token"],
	subject_types_supported: ["public"],
	id_token_signing_alg_values_supported: ["RS256"],
};

writeFileSync(`${env.APP_FOLDER_KEY}/openid-configuration.json`, JSON.stringify(openidConfiguration, null, 2));

console.log("✔ Metadata gerado");
