import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createJWKS, generateRSAKeyPair, pemToJWK } from "@infrastructure/pipes/crypto";
import { env } from "@infrastructure/settings/environment";

mkdirSync("./keys", { recursive: true });

const { publicKey, privateKey } = generateRSAKeyPair();

const folderKey = env.APP_FOLDER_KEY || "./keys";
writeFileSync(`${folderKey}/private.pem`, privateKey);
writeFileSync(`${folderKey}/public.pem`, publicKey);

console.log("⏳ Generating certificate...");
execSync(
	`openssl req -x509 -new -nodes -key ${folderKey}/private.pem -sha256 -days 365 -out ${folderKey}/cert.pem -subj "/C=BR/ST=SP/L=SaoPaulo/O=Development/CN=localhost"`,
	{ stdio: "inherit" },
);

const jwk = pemToJWK(publicKey);
const jwks = createJWKS([jwk]);

writeFileSync(`${folderKey}/jwks.json`, JSON.stringify(jwks, null, 2));

console.log("✔ Keys geradas");
console.log("✔ JWKS gerado");
console.log("✔ Kid:", jwk.kid);

writeFileSync(`${folderKey}/metadata.json`, JSON.stringify({ kid: jwk.kid }, null, 2));

const processDomain = env.PROCESS_DOMAIN || "http://localhost";
const processPort = env.PROCESS_PORT || 3000;
const domain = `${processDomain}:${processPort}`;

const openidConfiguration = {
	issuer: domain,
	authorization_endpoint: `${domain}/api/v1/sso/authorize`,
	token_endpoint: `${domain}/api/v1/sso/token`,
	userinfo_endpoint: `${domain}/api/v1/sso/userinfo`,
	jwks_uri: `${domain}/api/v1/sso/jwks`,
	scopes_supported: ["openid", "profile", "email"],
	response_types_supported: ["code"],
	grant_types_supported: ["authorization_code", "refresh_token"],
	subject_types_supported: ["public"],
	id_token_signing_alg_values_supported: ["RS256"],
};

writeFileSync(`${folderKey}/openid-configuration.json`, JSON.stringify(openidConfiguration, null, 2));

console.log("✔ Metadata gerado");
