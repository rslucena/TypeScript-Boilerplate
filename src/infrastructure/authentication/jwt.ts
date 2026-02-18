import { readFileSync } from "node:fs";
import { base64url, rsa, rsaVerify } from "@infrastructure/pipes/crypto";
import { safeParse } from "@infrastructure/pipes/safe-parse";
import type { container, guise } from "@infrastructure/server/interface";
import { env } from "@infrastructure/settings/environment";

export interface TokenPayload {
	exp?: number;
	iat?: number;
	nbf?: number;
	sub?: string;
	aud?: string;
	iss?: string;
	jti?: string;
	scope?: string;
	client_id?: string;
	email?: string;
	id?: string;
	[key: string]: unknown;
}

let keys: { privateKey: string; publicKey: string; kid: string } | null = null;

function getKeys() {
	if (keys) return keys;
	const privateKey = readFileSync(`${env.APP_FOLDER_KEY}/private.pem`, "utf8");
	const publicKey = readFileSync(`${env.APP_FOLDER_KEY}/public.pem`, "utf8");
	const metadata = JSON.parse(readFileSync(`${env.APP_FOLDER_KEY}/metadata.json`, "utf8"));
	const kid = metadata.kid as string;
	keys = { privateKey, publicKey, kid };
	return keys;
}

function create(content: guise["session"], exp?: number) {
	const { kid, privateKey } = getKeys();
	const header = { alg: "RS256", typ: "JWT", kid };

	const payload = {
		...content,
		exp: Math.floor(Date.now() / 1000) + (exp ?? 60 * 60),
	};

	const encodedHeader = base64url(JSON.stringify(header));
	const encodedPayload = base64url(JSON.stringify(payload));
	const data = `${encodedHeader}.${encodedPayload}`;

	const signature = rsa(data, privateKey);
	return `${data}.${base64url(signature)}`;
}

function parse(token: string) {
	const parts = token.split(".");
	if (parts.length !== 3) throw new Error("Invalid token format");

	const [header, payload, signature] = parts;
	const data = `${header}.${payload}`;

	const buffer = Buffer.from(signature, "base64url");

	const { publicKey } = getKeys();
	const isValid = rsaVerify(data, buffer, publicKey);
	if (!isValid) throw new Error("Invalid signature");

	const body = safeParse<{ [key: string]: unknown }>(Buffer.from(payload, "base64url").toString());
	if (!body) throw new Error("Invalid payload");

	return body;
}

async function session<T = guise["session"]>(request: container): Promise<T> {
	const { authorization } = request.headers();
	if (!authorization) throw new Error("Unauthorized");

	const jwt = authorization.replace("Bearer", "").replace(" ", "");
	try {
		const body = parse(jwt);
		const Now = Math.floor(Date.now() / 1000);
		if (typeof body.exp === "number" && Now > body.exp) throw new Error("Unauthorized");
		return body as T;
	} catch {
		throw new Error("Unauthorized");
	}
}

function decode<T>(token: string): T {
	const body = parse(token);
	return body as T;
}

export { create, decode, session };
