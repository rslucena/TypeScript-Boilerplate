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
	conflict: mock((_: string, msg: string) => new Error(msg)),
	unauthorized: mock((_: string, msg: string) => new Error(msg)),
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
		let currentStatus = 200;
		const container = {
			_status: 200,
			params: () => req.params,
			query: () => req.query,
			body: () => req.body,
			headers: () => req.headers,
			status: function (s: number) {
				if (s) {
					currentStatus = s;
					this._status = s;
					reply.status(s);
				}
				return currentStatus;
			},
		};
		try {
			const result = await fn(container);
			return reply.send(result);
		} catch (error: unknown) {
			const statusCode = (error as { statusCode?: number }).statusCode || 500;
			return reply.code(statusCode).send(error);
		}
	},
	noRestricted: (fn: CallableFunction) => async (req: FastifyRequest, reply: FastifyReply) => {
		let currentStatus = 200;
		const container = {
			_status: 200,
			params: () => req.params,
			query: () => req.query,
			body: () => req.body,
			headers: () => req.headers,
			status: function (s: number) {
				if (s) {
					currentStatus = s;
					this._status = s;
					reply.status(s);
				}
				return currentStatus;
			},
		};
		try {
			const result = await fn(container);
			return reply.send(result);
		} catch (error: unknown) {
			const statusCode = (error as { statusCode?: number }).statusCode || 500;
			return reply.code(statusCode).send(error);
		}
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
