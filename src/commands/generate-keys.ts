import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createJWKS, generateRSAKeyPair, pemToJWK } from "@infrastructure/pipes/crypto";
import { env } from "@infrastructure/settings/environment";

const C = {
	reset: "\x1b[0m",
	green: "\x1b[32m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	dim: "\x1b[2m",
	bold: "\x1b[1m",
};

console.log(`\n${C.cyan}${C.bold}Praxis Security${C.reset} ${C.dim}v1.0.0${C.reset}`);
console.log(`${C.dim}────────────────────────────────────────${C.reset}\n`);

mkdirSync("./keys", { recursive: true });

console.log(`  ${C.blue}⏳${C.reset}  Generating RSA Key Pair...`);
const { publicKey, privateKey } = generateRSAKeyPair();

const folderKey = env.APP_FOLDER_KEY || "./keys";
writeFileSync(`${folderKey}/private.pem`, privateKey);
writeFileSync(`${folderKey}/public.pem`, publicKey);

console.log(`  ${C.blue}⏳${C.reset}  Generating X.509 Certificate (OpenSSL)...`);
execSync(
	`openssl req -x509 -new -nodes -key ${folderKey}/private.pem -sha256 -days 365 -out ${folderKey}/cert.pem -subj "/C=BR/ST=SP/L=SaoPaulo/O=Development/CN=localhost"`,
	{ stdio: "ignore" },
);

const jwk = pemToJWK(publicKey);
const jwks = createJWKS([jwk]);

writeFileSync(`${folderKey}/jwks.json`, JSON.stringify(jwks, null, 2));

console.log(`  ${C.green}✔${C.reset}  Asymmetric Keys generated`);
console.log(`  ${C.green}✔${C.reset}  JWKS (JSON Web Key Set) created`);
console.log(`  ${C.blue}ℹ${C.reset}  Key ID (kid): ${C.dim}${jwk.kid}${C.reset}`);

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

console.log(`  ${C.green}✔${C.reset}  OpenID Discovery metadata generated`);
console.log(`\n  ${C.green}✔${C.reset}  ${C.bold}Security setup complete.${C.reset}\n`);
