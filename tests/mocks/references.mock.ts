import { mock } from "bun:test";

export const referencesMock = {
	tag: mock((...args: unknown[]) => args.join(":")),
	hash: mock((val) => `hashed-${val}`),
	withPagination: mock(),
};
