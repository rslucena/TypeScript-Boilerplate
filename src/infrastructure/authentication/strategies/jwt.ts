import crypto from "node:crypto";
import type { container, guise, JWT } from "@infrastructure/server/interface";
import { safeParse } from "@infrastructure/server/transforms";

function create(content: guise["session"], exp?: number) {
	const header = {
		alg: "HS256",
		typ: "JWT",
		exp: Math.floor(Date.now() / 1000) + (exp ?? 60 * 60),
	};
	const encodedHeader = Buffer.from(JSON.stringify(header))
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
	const encodedPayload = Buffer.from(JSON.stringify(content))
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
	const signature = crypto
		.createHmac("sha256", String(process.env.AUTH_SALT))
		.update(`${encodedHeader}.${encodedPayload}`)
		.digest("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function session<T = guise["session"]>(request: container): Promise<T> {
	const { authorization } = request.headers();

	if (!authorization) throw new Error("Unauthorized");

	const jwt = authorization.replace("Bearer", "").replace(" ", "");

	const parts = jwt.split(".");
	if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) throw new Error("Unauthorized");

	const encodedHeader = parts[0];
	const encodedPayload = parts[1];
	const signature = parts[2];

	const header = safeParse<JWT>(Buffer.from(encodedHeader, "base64").toString());
	if (!header) throw new Error("Unauthorized");
	if (header.typ !== "JWT" || header.alg !== "HS256") throw new Error("Unauthorized");

	const body = safeParse<{ [key: string]: unknown }>(Buffer.from(encodedPayload, "base64").toString());
	if (!body) throw new Error("Unauthorized");

	const expectedSignature = crypto
		.createHmac("sha256", String(process.env.AUTH_SALT))
		.update(`${encodedHeader}.${encodedPayload}`)
		.digest("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");

	if (signature !== expectedSignature) throw new Error("Unauthorized");

	const Now = Math.floor(Date.now() / 1000);

	if (Now > header.exp) throw new Error("Unauthorized");

	return body as T;
}

export default {
	create,
	session,
};
