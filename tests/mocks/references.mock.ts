import { mock } from "bun:test";

export const createReferencesMock = () => ({
	tag: mock((domain, method, conditions) => {
		let collection = `${domain}/${method}`;
		if (!conditions) return collection.toLowerCase().trim();
		collection += "/";
		for (const [key, value] of Object.entries(conditions)) collection += `{${key.replace("_", "")}:${value}}`;
		return collection.toLowerCase().trim();
	}),
	hash: mock((val) => `hashed-${val}`),
	pgIndex: mock(() => []),
	identifier: { id: mock().mockReturnValue("some-id") },
	zodIdentifier: { id: { _type: "string" } },
	withPagination: mock(),
});

export const referencesMock = createReferencesMock();
