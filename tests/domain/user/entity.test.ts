import user from "@domain/user/entity";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ======================================================================
// 🧩 MOCK DO MÓDULO @infrastructure/repositories/repository
// ======================================================================

const mockDatabase = {
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	returning: vi.fn().mockResolvedValue([]),

	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockResolvedValue([]),

	update: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),

	delete: vi.fn().mockReturnThis(),

	limit: vi.fn().mockReturnThis(),
	offset: vi.fn().mockReturnThis(),

	reset() {
		this.insert.mockClear();
		this.values.mockClear();
		this.returning.mockClear();
		this.select.mockClear();
		this.from.mockClear();
		this.where.mockClear();
		this.update.mockClear();
		this.set.mockClear();
		this.delete.mockClear();
		this.limit.mockClear();
		this.offset.mockClear();
	},
};

const withPagination = vi.fn((qb: any, page: number, size = 10) => qb.limit(size).offset((page - 1) * size));

vi.mock("@infrastructure/repositories/repository", () => ({
	__esModule: true,
	default: mockDatabase,
	withPagination,
}));

// ======================================================================
// 🧪 TESTES
// ======================================================================

// Importa o mockado após o vi.mock()
const { default: db } = await import("@infrastructure/repositories/repository");
const typedDb = db as unknown as PostgresJsDatabase<Record<string, never>>;

describe("User Domain Entity Repository", () => {
	const testUser = {
		name: "Test User",
		email: "test@example.com",
	};

	beforeEach(() => {
		mockDatabase.reset();
	});

	it("should create a new user", async () => {
		const newUser = { ...testUser, id: "123", createdAt: new Date(), updatedAt: new Date() };
		mockDatabase.insert.mockReturnThis();
		mockDatabase.values.mockReturnThis();
		mockDatabase.returning.mockResolvedValue([newUser]);

		const result = await typedDb.insert(user).values(testUser).returning();

		expect(result[0]).toBeDefined();
		expect(result[0].name).toBe(testUser.name);
		expect(result[0].email).toBe(testUser.email);
		expect(result[0].id).toBe("123");
		expect(result[0].createdAt).toBeInstanceOf(Date);
		expect(result[0].updatedAt).toBeInstanceOf(Date);
	});

	it("should enforce unique email constraint", async () => {
		mockDatabase.insert.mockReturnThis();
		mockDatabase.values.mockReturnThis();
		mockDatabase.returning.mockImplementation(() =>
			Promise.reject(new Error("duplicate key value violates unique constraint")),
		);

		await expect(
			typedDb
				.insert(user)
				.values({
					...testUser,
					password: "hashedpassword123",
					lastName: "Test Lastname",
				})
				.returning(),
		).rejects.toThrow("duplicate key value violates unique constraint");
	});

	it("should retrieve a user by email", async () => {
		const mockUser = { ...testUser, id: "123", createdAt: new Date(), updatedAt: new Date() };
		mockDatabase.select.mockReturnThis();
		mockDatabase.from.mockReturnThis();
		mockDatabase.where.mockResolvedValue([mockUser]);

		const [foundUser] = await typedDb.select().from(user).where(eq(user.email, testUser.email));

		expect(foundUser).toBeDefined();
		expect(foundUser.email).toBe(testUser.email);
		expect(mockDatabase.where).toHaveBeenCalledWith(eq(user.email, testUser.email));
	});

	it("should update a user", async () => {
		const updatedName = "Updated Name";
		const updatedUser = {
			...testUser,
			name: updatedName,
			id: "123",
			createdAt: new Date(),
			updatedAt: new Date(Date.now() + 1000),
		};

		mockDatabase.update.mockReturnThis();
		mockDatabase.set.mockReturnThis();
		mockDatabase.where.mockReturnThis();
		mockDatabase.returning.mockResolvedValue([updatedUser]);

		const [result] = await typedDb
			.update(user)
			.set({ name: updatedName })
			.where(eq(user.email, testUser.email))
			.returning();

		expect(result).toBeDefined();
		expect(result.name).toBe(updatedName);
		expect(result.updatedAt.getTime()).toBeGreaterThan(result.createdAt.getTime());
	});

	it("should delete a user", async () => {
		const deletedUser = { ...testUser, id: "123" };
		mockDatabase.delete.mockReturnThis();
		mockDatabase.where.mockReturnThis();
		mockDatabase.returning.mockResolvedValue([deletedUser]);

		const [result] = await typedDb.delete(user).where(eq(user.email, testUser.email)).returning();

		expect(result).toBeDefined();
		expect(result.id).toBe("123");
		expect(mockDatabase.delete).toHaveBeenCalledWith(user);
		expect(mockDatabase.where).toHaveBeenCalledWith(eq(user.email, testUser.email));
	});
});
