import { mock } from "bun:test";
import type { FastifyReply, FastifyRequest } from "fastify";

export const createContainerMock = () => ({
	status: mock(),
	params: mock().mockReturnValue({}),
	query: mock().mockReturnValue({}),
	body: mock().mockReturnValue({}),
	badRequest: mock((_: string, msg: string) => new Error(msg)),
	notFound: mock((_: string, msg: string) => new Error(msg)),
	unprocessableEntity: mock((_: string, msg: string) => new Error(msg)),
	headers: mock(),
	language: mock().mockReturnValue("en"),
});

export const containerMock = createContainerMock();

export const createServerRequestMock = () => ({
	reply: {},
	restricted: (fn: CallableFunction) => async (req: FastifyRequest, reply: FastifyReply) => {
		const auth = req.headers.authorization;
		if (auth !== "Bearer valid-token") {
			return reply.code(401).send({ error: "Unauthorized" });
		}
		const result = await fn({
			params: () => req.params,
			query: () => req.query,
			body: () => req.body,
			headers: () => req.headers,
			status: (s: number) => reply.status(s),
		});
		return reply.send(result);
	},
	noRestricted: (fn: CallableFunction) => async (req: FastifyRequest, reply: FastifyReply) => {
		const result = await fn({
			params: () => req.params,
			query: () => req.query,
			body: () => req.body,
			headers: () => req.headers,
			status: (s: number) => reply.status(s),
		});
		return reply.send(result);
	},
});

export const serverRequestMock = createServerRequestMock();

export const serverActionsMock = (builder: CallableFunction) => {
	return {
		mockGetById: mock(() => Promise.resolve([builder()])),
		mockGetFindByParams: mock(() => Promise.resolve([builder()])),
		mockPostNewEntity: mock(() => Promise.resolve([builder()])),
		mockPostNewAuth: mock(() => Promise.resolve({ token: "test-token", refresh: "test-refresh" })),
	};
};
