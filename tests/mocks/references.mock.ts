import { mock } from "bun:test";

export const createReferencesMock = () => ({
	tag: mock((...args: unknown[]) => args.join(":")),
	hash: mock((val) => `hashed-${val}`),
	pgIndex: mock(() => []),
	identifier: { id: mock().mockReturnValue("some-id") },
	zodIdentifier: { id: { _type: "string" } },
	withPagination: mock(),
});

export const referencesMock = createReferencesMock();
