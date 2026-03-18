import { providers } from "@domain/credentials/constants";
import { headers } from "@infrastructure/server/interface";
import { z } from "zod";

const actions = {
	headers: headers.extend({
		cookie: z.string().optional(),
	}),
	authorize: z.object({
		provider: z.enum([providers.GOOGLE, providers.GITHUB]),
	}),
	callback: z.object({
		provider: z.enum([providers.GOOGLE, providers.GITHUB]),
		code: z.string(),
		state: z.string(),
	}),
	local: z.object({
		email: z.string().email(),
		password: z.string().min(8),
	}),
};

const responses = {
	pro