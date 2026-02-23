import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";

const repositoryMock = createRepositoryMock();
const containerMock = createContainerMock();
const referencesMock = createReferencesMock();

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
}));

mock.module("@infrastructure/cache/actions", () => ({
	__esModule: true,
	default: {
		json: {
			get: mock(() => Promise.resolve(null)),
			set: mock(() => Promise.resolve()),
		},
	},
}));

mock.module("@infrastructure/repositories/references", () => ({
	__esModule: true,
	tag: referencesMock.tag,
	hash: referencesMock.hash,
	identifier: referencesMock.identifier,
	pgIndex: referencesMock.pgIndex,
	zodIdentifier: referencesMock.zodIdentifier,
	withPagination: referencesMock.withPagination,
}));

import { afterEach, beforeEach, describe, expect, it, type Mock, mock, spyOn } from "bun:test";
import { providers } from "@domain/credentials/constants";
import * as jwt from "@infrastructure/authentication/jwt";
import * as oidc from "@infrastructure/sso/oidc";

const mockNormalizedUser = {
	subject: "12345",
	email: "user@example.com",
	name: "OAuth User",
};

describe("SSO Domain Actions : getCallback", () => {
	let getCallback: CallableFunction;
	let jwtSpy: Mock<any>;
	let oidcExchangeSpy: Mock<any>;
	let oidcUserSpy: Mock<any>;

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.query.mockReturnValue({ provider: providers.GOOGLE, code: "code123" });
		repositoryMock.insert.mockReturnThis();
		repositoryMock.values.mockReturnThis();
		repositoryMock.returning.mockResolvedValue([{ id: "uuid-123", name: "OAuth User" }]);
		repositoryMock.execute.mockResolvedValue([]);

		repositoryMock.insert.mockClear();
		repositoryMock.values.mockClear();
		repositoryMock.returning.mockClear();
		repositoryMock.execute.mockClear();

		jwtSpy = spyOn(jwt, "create").mockReturnValue("header.payload.signature");
		oidcExchangeSpy = spyOn(oidc, "exchangeToken").mockResolvedValue({ access_token: "abc", token_type: "Bearer" });
		oidcUserSpy = spyOn(oidc, "getNormalizedUser").mockResolvedValue(mockNormalizedUser);

		getCallback = (await import("@domain/sso/actions/get-callback")).default;
	});

	afterEach(() => {
		jwtSpy.mockRestore();
		oidcExchangeSpy.mockRestore();
		oidcUserSpy.mockRestore();
	});

	it("should create new identity and credential for new user", async () => {
		// Mock findByProviderSubject returning empty
		repositoryMock.execute.mockResolvedValueOnce([]);
		// Mock getByIdentityEmail returning empty
		repositoryMock.execute.mockResolvedValueOnce([]);

		const result = await getCallback(containerMock);

		expect(result.token).toBe("header.payload.signature");
		expect(result.session.name).toBe("OAuth User");
		expect(repositoryMock.insert).toHaveBeenCalledTimes(2); // Identity then Credential
	});

	it("should link to existing identity if email matches", async () => {
		// Mock findByProviderSubject returning empty
		repositoryMock.execute.mockResolvedValueOnce([]);
		// Mock getByIdentityEmail returning match
		repositoryMock.execute.mockResolvedValueOnce([{ id: "existing-id", name: "Existing User" }]);

		const result = await getCallback(containerMock);

		expect(result.session.id).toBe("existing-id");
		expect(repositoryMock.insert).toHaveBeenCalledTimes(1); // Only Credential
	});

	it("should return existing identity if credential exists", async () => {
		// Mock findByProviderSubject returning match
		repositoryMock.execute.mockResolvedValueOnce([{ identityId: "very-old-id" }]);

		const result = await getCallback(containerMock);

		expect(result.session.id).toBe("very-old-id");
		expect(repositoryMock.insert).not.toHaveBeenCalled();
	});
});
