import { describe, expect, it } from "bun:test";
import * as jwtDefault from "@infrastructure/authentication/strategies/jwt?v=unit";
import type { guise } from "@infrastructure/server/interface";
import { container } from "@infrastructure/server/request?v=unit";

const jwt = jwtDefault.default || jwtDefault;

describe("JWT Strategy", () => {
	const mockSession: guise["session"] = { id: "123", name: "Test User" };
	const salt = "test-salt";
	process.env.AUTH_SALT = salt;

	describe("create", () => {
		it("should create a valid JWT string", () => {
			const token = jwt.create(mockSession);
			expect(token).toBeString();
			expect(token.split(".")).toHaveLength(3);
		});

		it("should create a JWT with specific expiration", () => {
			const token = jwt.create(mockSession, 3600);
			expect(token).toBeString();
			expect(token.split(".")).toHaveLength(3);
		});
	});

	describe("session", () => {
		it("should return the decoded session for a valid token", async () => {
			const token = jwt.create(mockSession);
			const mockRequest = new container({
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			const session = await jwt.session(mockRequest);
			expect(session).toEqual(expect.objectContaining(mockSession));
		});

		it("should throw 'Unauthorized' if authorization header is missing", async () => {
			const mockRequest = new container({
				headers: {},
			});

			expect(jwt.session(mockRequest)).rejects.toThrow("Unauthorized");
		});

		it("should throw 'Unauthorized' for malformed token", async () => {
			const mockRequest = new container({
				headers: {
					authorization: "Bearer invalid.token",
				},
			});

			expect(jwt.session(mockRequest)).rejects.toThrow("Unauthorized");
		});

		it("should throw 'Unauthorized' for invalid signature", async () => {
			const token = jwt.create(mockSession);
			const [header, payload, _signature] = token.split(".");
			const tamperedToken = `${header}.${payload}.invalid-signature`;

			const mockRequest = new container({
				headers: {
					authorization: `Bearer ${tamperedToken}`,
				},
			});

			expect(jwt.session(mockRequest)).rejects.toThrow("Unauthorized");
		});

		it("should throw 'Unauthorized' if token is expired", async () => {
			const token = jwt.create(mockSession, -3600);
			const mockRequest = new container({
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			expect(jwt.session(mockRequest)).rejects.toThrow("Unauthorized");
		});

		it("should throw 'Unauthorized' if header is invalid JSON", async () => {
			const payload = Buffer.from(JSON.stringify(mockSession)).toString("base64");
			const invalidHeader = Buffer.from("invalid-json").toString("base64");
			const token = `${invalidHeader}.${payload}.sig`;

			const mockRequest = new container({
				headers: {
					authorization: `Bearer ${token}`,
				},
			});

			expect(jwt.session(mockRequest)).rejects.toThrow("Unauthorized");
		});
	});
});
