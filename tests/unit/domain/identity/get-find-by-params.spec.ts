import { mock } from "bun:test";

import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";

const _redisClientMock = createRedisClientMock();
const repositoryMock = createRepositoryMock();
const containerMock = createContainerMock();
const referencesMock = createReferencesMock();

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: {
		...repositoryMock,
		execute: repositoryMock.execute,
	},
	withPagination: mock((qb) => qb),
}));

mock.module("@infrastructure/server/request", () => ({
	container: mock(() => containerMock),
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

describe("Identity Domain Actions : getFindByParams", () => {
	let getFindByParams: CallableFunction;
	let mockJsonGet: Mock<typeof cache.json.get>;
	let mockJsonSet: Mock<typeof cache.json.set>;

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.query.mockReturnValue({});
		repositoryMock.execute.mockClear();

		mockJsonGet = spyOn(cache.json, "get").mockResolvedValue(null);
		mockJsonSet = spyOn(cache.json, "set").mockResolvedValue("");

		getFindByParams = (await import("@domain/identity/actions/get-find-by-params")).default;
	});

	afterEach(() => {
		mock.restore();
	});

	it("should return cached identities if available", async () => {
		const cachedData = [{ id: 1, name: "Test" }];
		mockJsonGet.mockResolvedValueOnce(cachedData);
		containerMock.query.mockReturnValue({ "req.page": [1, 10] });

		const result = await getFindByParams(containerMock);
		expect(result).toEqual(cachedData);
		expect(mockJsonGet).toHaveBeenCalled();
		expect(repositoryMock.execute).not.toHaveBeenCalled();
	});

	it("should return identities from repository if not cached", async () => {
		mockJsonGet.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([{ id: 1, name: "Test" }]);
		containerMock.query.mockReturnValue({ name: "John", "req.page": [1, 10] });

		const result = await getFindByParams(containerMock);
		expect(result).toEqual([{ id: 1, name: "Test" }]);
		expect(repositoryMock.execute).toHaveBeenCalled();
		expect(mockJsonSet).toHaveBeenCalled();
	});

	it("should throw error if no identities found", async () => {
		mockJsonGet.mockResolvedValueOnce(null);
		repositoryMock.execute.mockResolvedValueOnce([]);
		containerMock.query.mockReturnValue({ "req.page": [1, 10] });

		expect(getFindByParams(containerMock)).rejects.toThrow();
	});

	it("should throw error if validation fails", async () => {
		containerMock.query.mockReturnValue({ "req.page": "invalid" });

		expect(getFindByParams(containerMock)).rejects.toThrow();
	});
});
