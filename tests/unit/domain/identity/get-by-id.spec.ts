import { mock } from "bun:test";
import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";

const repositoryMock = createRepositoryMock();
const containerMock = createContainerMock();
const referencesMock = createReferencesMock();

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
	withPagination: mock((qb) => qb),
}));

import * as requestModule from "@infrastructure/server/request";

mock.module("@infrastructure/server/request", () => ({
	...requestModule,
	container: mock(() => containerMock),
	authentication: mock(() => ({ create: mock().mockReturnValue("token") })),
}));

mock.module("@infrastructure/repositories/references", () => ({
	__esModule: true,
	tag: referencesMock.tag,
	hash: referencesMock.hash,
	withPagination: referencesMock.withPagination,
	identifier: referencesMock.identifier,
	pgIndex: referencesMock.pgIndex,
	zodIdentifier: referencesMock.zodIdentifier,
}));

import cache from "@infrastructure/cache/actions";
import "@domain/identity/schema";
import { afterEach, beforeEach, describe, expect, it, type Mock, spyOn } from "bun:test";

describe("Identity Domain Actions : getById", () => {
	let getById: CallableFunction;
	let mockJsonGet: Mock<typeof cache.json.get>;
	let mockJsonSet: Mock<typeof cache.json.set>;

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.headers.mockClear();
		containerMock.params.mockReturnValue({});
		containerMock.query.mockReturnValue({});
		containerMock.body.mockReturnValue({});
		repositoryMock.returning.mockClear();

		mockJsonGet = spyOn(cache.json, "get").mockResolvedValue(null);
		mockJsonSet = spyOn(cache.json, "set").mockResolvedValue("");

		getById = (await import("@domain/identity/actions/get-by-id")).default;
	});

	afterEach(() => {
		mock.restore();
	});

	const validId = "123e4567-e89b-12d3-a456-426614174000";

	it("should return cached identity if available", async () => {
		const cachedData = [{ id: 1, name: "Test" }];
		const _reference = referencesMock.tag("identity", "find{id}", { id: validId });
		mockJsonGet.mockResolvedValueOnce(cachedData);
		containerMock.params.mockReturnValue({ id: validId });

		const result = await getById(containerMock);
		expect(result).toEqual([{ id: 1, name: "Test" }]);
		expect(mockJsonGet).toHaveBeenCalled();
		expect(repositoryMock.execute).not.toHaveBeenCalled();
	});

	it("should return identity from repository if not cached", async () => {
		mockJsonGet.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([{ id: 1, name: "Test" }]);
		containerMock.params.mockReturnValue({ id: validId });

		const result = await getById(containerMock);
		expect(result).toEqual([{ id: 1, name: "Test" }]);
		expect(repositoryMock.execute).toHaveBeenCalled();
		expect(mockJsonSet).toHaveBeenCalled();
	});

	it("should throw error if identity not found", async () => {
		mockJsonGet.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([]);
		containerMock.params.mockReturnValue({ id: validId });

		expect(getById(containerMock)).rejects.toThrow();
	});
});
