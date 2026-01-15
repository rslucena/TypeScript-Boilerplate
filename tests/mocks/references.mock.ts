import { mock } from "bun:test";

export const createReferencesMock = () => ({
	tag: mock((domain, method, conditions) => {
		let collection = `${domain}/${method}`;
		if (!conditions) {
			return {
				hash: collection.toLowerCase().trim(),
				tags: [domain.toLowerCase()],
			};
		}
		collection += "/";
		for (const [key, value] of Object.entries(conditions)) collection += `{${key.replace("_", "")}:${value}}`;
		return {
			hash: collection.toLowerCase().trim(),
			tags: [domain.toLowerCase(), `${domain.toLowerCase()}:${conditions.id ?? "wildcard"}`],
		};
	}),
	hash: mock((val) => `hashed-${val}`),
	pgIndex: mock(() => []),
	identifier: { id: mock().mockReturnValue("some-id") },
	zodIdentifier: { id: { _type: "string" } },
	withPagination: mock(),
});

export const referencesMock = createReferencesMock();
