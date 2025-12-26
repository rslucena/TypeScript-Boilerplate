import { mock } from "bun:test";

export const createReferencesMock = () => ({
	tag: mock((...args: unknown[]) => args.join(":")),
	hash: mock((val) => `hashed-${val}`),
	withPagination: mock(),
});

export const referencesMock = createReferencesMock();
