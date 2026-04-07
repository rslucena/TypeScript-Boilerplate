import { describe, expect, it } from "bun:test";
import { createJWKS, generateRSAKeyPair, pemToJWK } from "@infrastructure/pipes/crypto";

describe("Infrastructure Pipes -> Crypto", () => {
	const { publicKey } = generateRSAKeyPair();

	describe("pemToJWK", () => {
		it("should convert PEM to JWK", () => {
			const jwk = pemToJWK(publicKey);
			expect(jwk).toHaveProperty("kty", "RSA");
			expect(jwk).toHaveProperty("use", "sig");
			expect(jwk).toHaveProperty("alg", "RS256");
			expect(jwk).toHaveProperty("kid");
			expect(jwk).toHaveProperty("n");
			expect(jwk).toHaveProperty("e");
		});
	});

	describe("createJWKS", () => {
		it("should create JWKS from array of keys", () => {
			const jwk = pemToJWK(publicKey);
			const jwks = createJWKS([jwk]);
			expect(jwks).toHaveProperty("keys");
			expect(jwks.keys).toBeArray();
			expect(jwks.keys[0]).toEqual(jwk);
		});
	});
});
