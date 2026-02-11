import { providers, types } from "@domain/credentials/constants";

type Rule = {
	providers: providers[];
	subjectRequired: boolean;
	secretRequired: boolean;
};

const matrix: Record<types, Rule> = {
	[types.PASSWORD]: {
		providers: [providers.LOCAL],
		subjectRequired: false,
		secretRequired: true,
	},
	[types.OIDC]: {
		providers: [providers.GOOGLE, providers.GITHUB, providers.INTERNAL_OIDC],
		subjectRequired: true,
		secretRequired: false,
	},
	[types.API_KEY]: {
		providers: [providers.LOCAL],
		subjectRequired: false,
		secretRequired: true,
	},
	[types.PASSKEY]: {
		providers: [providers.LOCAL],
		subjectRequired: true,
		secretRequired: false,
	},
	[types.SERVICE]: {
		providers: [providers.LOCAL],
		subjectRequired: false,
		secretRequired: true,
	},
};

export function credential(input: {
	type: types;
	provider: providers;
	subject?: string | null;
	secret?: string | null;
}) {
	const rule = matrix[input.type];

	if (!rule) return false;

	if (!rule.providers.includes(input.provider)) return false;

	if (rule.subjectRequired && !input.subject) return false;

	if (!rule.subjectRequired && input.subject) return false;

	if (rule.secretRequired && !input.secret) return false;

	return true;
}
