import crypto from "node:crypto";

const base64url = (input: Buffer | string) =>
	Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

const sha256 = (data: Buffer | string) => crypto.createHash("sha256").update(data).digest();

const uuid = () => crypto.randomUUID();

const generateRSAKeyPair = () => {
	const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: "spki",
			format: "pem",
		},
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
		},
	});

	return { publicKey, privateKey };
};

const pemToJWK = (publicKeyPem: string) => {
	const key = crypto.createPublicKey(publicKeyPem);
	const jwkRaw = key.export({ format: "jwk" });
	const kid = base64url(sha256(publicKeyPem));
	return {
		kty: "RSA",
		use: "sig",
		kid,
		alg: "RS256",
		n: jwkRaw.n as string,
		e: jwkRaw.e as string,
	} as const;
};

const createJWKS = (
	keys: {
		kty: "RSA";
		use: "sig";
		kid: string;
		alg: "RS256";
		n: string;
		e: string;
	}[],
) => ({
	keys,
});

const rsa = (data: string, privateKey: string) => crypto.createSign("RSA-SHA256").update(data).sign(privateKey);

const rsaVerify = (data: string, signature: Buffer, publicKey: string) => {
	const verifier = crypto.createVerify("RSA-SHA256");
	verifier.update(data);
	return verifier.verify(publicKey, signature);
};

export { uuid, base64url, sha256, generateRSAKeyPair, createJWKS, pemToJWK, rsa, rsaVerify };
