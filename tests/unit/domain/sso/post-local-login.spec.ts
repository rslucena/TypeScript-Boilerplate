import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";

const repositoryMock = createRepositoryMock();
const referencesMock = createReferencesMock();

import { afterEach, beforeEach, describe, expect, it, type Mock, mock, spyOn } from "bun:test";

let mockHashValue = "OK";

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
}));

mock.module("@infrastructure/repositories/references", () => ({
	__esModule: true,
	tag: referencesMock.tag,
	hash: mock((..._args) => mockHashValue),
	identifier: referencesMock.identifier,
	pgIndex: () => [],
	zodIdentifier: referencesMock.zodIdentifier,
	withPagination: referencesMock.withPagination,
}));

import { providers } from "@domain/credentials/constants";
import postLocalLogin from "@domain/sso/actions/post-local-login";
import * as jwt from "@infrastructure/authentication/jwt";
import cache from "@infrastructure/cache/actions";
import { container } from "@infrastructure/server/interface";

describe("SSO Domain Actions : postLocalLogin", () => {
	let jwtSpy: Mock<typeof jwt.create>;

	const validPayload = {
		email: "test@example.com",
		password: "StrongPassword123!",
	};

	beforeEach(async () => {
		mockHashValue = "OK";

		repositoryMock.select.mockReturnThis();
		repositoryMock.from.mockReturnThis();
		repositoryMock.where.mockReturnThis();
		repositoryMock.prepare.mockReturnThis();
		repositoryMock.execute.mockResolvedValue([]);

		repositoryMock.execute.mockClear();

		spyOn(cache.json, "get").mockResolvedValue(null);
		spyOn(cache.json, "set").mockResolvedValue("");

		jwtSpy = spyOn(jwt, "create").mockReturnValue("header.payload.signature");
	});

	afterEach(() => {
		jwtSpy.mockRestore();
		mock.restore();
	});

	it("should return 400 when body does not follow the schema", async () => {
		const request = new container({
			method: "POST",
			body: { email: "invalid-email" },
		});

		try {
			await postLocalLogin(request);
		} catch (error: unknown) {
			expect((error as { code: string }).code).toBe("ERR_REQUEST");
		}
	});

	it("should return 401 when the email does not exist", async () => {
		repositoryMock.execute.mockResolvedValueOnce([]);

		const request = new container({
			method: "POST",
			body: validPayload,
		});

		try {
			await postLocalLogin(request);
		} catch (error: unknown) {
			expect((error as { code: string }).code).toBe("ERR_UNAUTHORIZED");
		}
	});

	it("should return 401 when the local credential does not exist", async () => {
		repositoryMock.execute.mockResolvedValueOnce([{ id: "uuid-123", name: "Test User", email: validPayload.email }]);
		repositoryMock.execute.mockResolvedValueOnce([]);

		const request = new container({
			method: "POST",
			body: validPayload,
		});

		try {
			await postLocalLogin(request);
		} catch (error: unknown) {
			expect((error as { code: string }).code).toBe("ERR_UNAUTHORIZED");
		}
	});

	it("should return 401 when the password does not match", async () => {
		repositoryMock.execute.mockResolvedValueOnce([{ id: "uuid-123", name: "Test User", email: validPayload.email }]);
		repositoryMock.execute.mockResolvedValueOnce([{ provider: providers.LOCAL, secret: "hashed_secret" }]);
		mockHashValue = "INVALID";

		const request = new container({
			method: "POST",
			body: validPayload,
		});

		try {
			await postLocalLogin(request);
		} catch (error: unknown) {
			expect((error as { code: string }).code).toBe("ERR_UNAUTHORIZED");
		}
	});

	it("should return 200 and tokens when credentials are correct", async () => {
		const request = new container({
			method: "POST",
			body: validPayload,
		});

		repositoryMock.execute.mockResolvedValueOnce([{ id: "uuid-123", name: "Test User", email: validPayload.email }]);
		repositoryMock.execute.mockResolvedValueOnce([{ provider: providers.LOCAL, secret: "hashed_secret" }]);

		const result = await postLocalLogin(request);

		expect(request.status()).toBe(200);
		expect(result.token).toBe("header.payload.signature");
		expect(result.session.id).toBe("uuid-123");
		expect(result.session.name).toBe("Test User");
	});
});
