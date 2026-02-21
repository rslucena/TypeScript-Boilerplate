import { providers } from "@domain/credentials/constants";
import { headers } from "@infrastructure/server/interface";
import { z } from "zod";

const actions = {
	headers,
	authorize: z.object({
		provider: z.enum([providers.GOOGLE, providers.GITHUB]),
	}),
	callback: z.object({
		provider: z.enum([providers.GOOGLE, providers.GITHUB]),
		code: z.string(),
		state: z.string().optional(),
	}),
};

const responses = {
	profile: z.object({
		subject: z.string(),
		email: z.string().optional(),
		name: z.string().optional(),
	}),
};

export default { actions, responses };
