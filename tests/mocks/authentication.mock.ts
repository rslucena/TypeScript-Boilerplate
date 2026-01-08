import { mock } from "bun:test";

export const authenticationMock = {
	create: mock().mockReturnValue("test-token"),
	session: mock().mockResolvedValue({ id: "test-id", name: "Test User" }),
};
