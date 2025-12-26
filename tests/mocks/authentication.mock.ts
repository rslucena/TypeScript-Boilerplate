import { mock } from "bun:test";

export const authenticationMock = {
	create: mock().mockReturnValue("test-token"),
};
