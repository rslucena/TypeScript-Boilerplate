import * as jwt from "@infrastructure/authentication/jwt";
import type { container } from "@infrastructure/server/interface";

type agents = "authentication";

type definitions = {
	active: boolean;
	priority: number;
	strategy: <T>(container: container) => Promise<T | Error>;
};

export default {
	authentication: {
		JWT: {
			priority: 1,
			active: true,
			strategy: jwt.session,
		},
	},
} as const satisfies Record<agents, Record<string, definitions>>;
