import { mock, describe, it, expect, beforeEach } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";
import { createReferencesMock } from "@tests/mocks/references.mock";
import { createRepositoryMock } from "@tests/mocks/repository.mock";
import { createContainerMock } from "@tests/mocks/server.mock";
import "@domain/identity/schema";

const redisClientMock = createRedisClientMock();
const repositoryMock = createRepositoryMock();
const containerMock = createContainerMock();
const referencesMock = createReferencesMock();

mock.module("@infrastructure/cache/actions", () => ({
	__esModule: true,
	default: redisClientMock,
}));

mock.module("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: repositoryMock,
	withPagination: mock((qb) => qb),
}));

mock.module("@infrastructure/server/request", () => ({
	__esModule: true,
	container: mock((...args) => {
		const instance = Object.create(containerMock);
		if (args[0]?.params) instance.params = mock().mockReturnValue(args[0].params);
		if (args[0]?.body) instance.body = mock().mockReturnValue(args[0].body);
		return instance;
	}),
}));

mock.module("@infrastructure/repositories/references", () => ({
	__esModule: true,
	tag: referencesMock.tag,
	hash: referencesMock.hash,
	identifier: referencesMock.identifier,
	pgIndex: referencesMock.pgIndex,
	zodIdentifier: referencesMock.zodIdentifier,
}));

describe("Identity Domain Actions : putUpdateEntity", () => {
	let putUpdateEntity: CallableFunction;
	const validId = "123e4567-e89b-12d3-a456-426614174000";

	beforeEach(async () => {
		containerMock.status.mockClear();
		containerMock.params.mockReturnValue({});
		containerMock.body.mockReturnValue({});
		containerMock.language.mockReturnValue("en");

		// Reset repository mocks
		repositoryMock.update.mockClear();
		repositoryMock.update.mockReturnThis();

		repositoryMock.set.mockClear();
		repositoryMock.set.mockReturnThis();

		repositoryMock.where.mockClear();
		repositoryMock.where.mockReturnThis();

		repositoryMock.select.mockClear();
		repositoryMock.select.mockReturnThis();

		repositoryMock.from.mockClear();
		repositoryMock.from.mockReturnThis();

		repositoryMock.limit.mockClear();
		repositoryMock.limit.mockReturnThis();

		repositoryMock.orderBy.mockClear();
		repositoryMock.orderBy.mockReturnThis();

		repositoryMock.prepare.mockClear();
		repositoryMock.prepare.mockReturnThis();

		repositoryMock.returning.mockClear();
		repositoryMock.returning.mockResolvedValue([]);

		repositoryMock.execute.mockClear();
		repositoryMock.execute.mockResolvedValue([]);

		// Reset redis mock
		redisClientMock.json.del.mockClear();
		redisClientMock.json.get.mockResolvedValue(null);

		putUpdateEntity = (await import("@domain/identity/actions/put-update-entity")).default;
	});

	it("should update identity and return it", async () => {
		const updateData = { name: "Jane", lastName: "Doe" };
		const updatedIdentity = { id: validId, ...updateData, email: "jane@example.com", activated: true, createdAt: new Date(), updatedAt: new Date() };

		// Setup request
		const request = new (class {
			params() { return { id: validId }; }
			body() { return updateData; }
			status() { return containerMock.status(); }
			badRequest(l: string, t: string) { return containerMock.badRequest(l, t); }
			notFound(l: string, t: string) { return containerMock.notFound(l, t); }
			language() { return "en"; }
		})() as any;

		// Mock update returning success (indicates row was updated)
		repositoryMock.returning.mockResolvedValueOnce([{ id: validId }]);

		// Mock getById execution (returns the full entity)
		repositoryMock.execute.mockResolvedValueOnce([updatedIdentity]);

		const result = await putUpdateEntity(request);

		expect(result).toEqual([updatedIdentity]);
		expect(repositoryMock.update).toHaveBeenCalled();
		expect(repositoryMock.set).toHaveBeenCalled();
		expect(repositoryMock.where).toHaveBeenCalled();
		expect(redisClientMock.json.del).toHaveBeenCalled();
	});

	it("should throw 404 if identity not found", async () => {
		// Setup request
		const request = new (class {
			params() { return { id: validId }; }
			body() { return { name: "Jane" }; }
			status() { return containerMock.status(); }
			badRequest(l: string, t: string) { return containerMock.badRequest(l, t); }
			notFound(l: string, t: string) { return new Error("Not Found"); }
			language() { return "en"; }
		})() as any;

		repositoryMock.returning.mockResolvedValueOnce([]); // No rows updated

		expect(putUpdateEntity(request)).rejects.toThrow("Not Found");
		expect(redisClientMock.json.del).not.toHaveBeenCalled();
	});

	it("should throw 400 if params validation fails", async () => {
		const request = new (class {
			params() { return { id: "invalid-uuid" }; }
			body() { return { name: "Jane" }; }
			status() { return containerMock.status(); }
			badRequest(l: string, t: string) { return new Error("Bad Request"); }
			language() { return "en"; }
		})() as any;

		expect(putUpdateEntity(request)).rejects.toThrow("Bad Request");
		expect(repositoryMock.update).not.toHaveBeenCalled();
	});

	it("should throw 400 if body validation fails", async () => {
		const request = new (class {
			params() { return { id: validId }; }
			body() { return { name: "" }; } // Invalid name
			status() { return containerMock.status(); }
			badRequest(l: string, t: string) { return new Error("Bad Request"); }
			language() { return "en"; }
		})() as any;

		expect(putUpdateEntity(request)).rejects.toThrow("Bad Request");
		expect(repositoryMock.update).not.toHaveBeenCalled();
	});

	it("should propagate database errors", async () => {
		const request = new (class {
			params() { return { id: validId }; }
			body() { return { name: "Jane" }; }
			status() { return containerMock.status(); }
			badRequest(l: string, t: string) { return containerMock.badRequest(l, t); }
			language() { return "en"; }
		})() as any;

		repositoryMock.returning.mockRejectedValue(new Error("DB Error"));

		expect(putUpdateEntity(request)).rejects.toThrow("DB Error");
	});
});
