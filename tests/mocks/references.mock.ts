import type { Mock } from "bun:test";
import { mock } from "bun:test";
import { identifier, pgIndex, withPagination, zodIdentifier } from "@infrastructure/repositories/references";

export interface ReferencesMockType {
	tag: Mock<(domain: string, method: string, conditions?: Record<string, string>) => string>;
	hash: Mock<(val: string) => string>;
	pgIndex: Mock<typeof pgIndex>;
	identifier: typeof identifier;
	zodIdentifier: typeof zodIdentifier;
	withPagination: typeof withPagination;
}

export const createReferencesMock = (): ReferencesMockType => ({
	tag: mock((domain: string, method: string, conditions?: Record<string, string>) => {
		let collection = `${domain}/${method}`;
		if (!conditions) return collection.toLowerCase().trim();
		collection += "/";
		for (const [key, value] of Object.entries(conditions)) collection += `{${key.replace("_", "")}:${value}}`;
		return collection.toLowerCase().trim();
	}),
	hash: mock((val) => `hashed-${val}`),
	pgIndex: mock(pgIndex),
	identifier,
	zodIdentifier,
	withPagination,
});

/**
 * Returns the module shape expected by mock.module("@infrastructure/repositories/references").
 * Accepts an optional overrides to allow per-test customization (e.g. custom identifier).
 */
export const createReferencesModuleMock = (overrides: Partial<ReferencesMockType> = {}) => {
	const refs = createReferencesMock();
	return {
		__esModule: true,
		tag: refs.tag,
		hash: refs.hash,
		identifier: refs.identifier,
		pgIndex: refs.pgIndex,
		zodIdentifier: refs.zodIdentifier,
		withPagination: refs.withPagination,
		...overrides,
	};
};
