import plugins from "@infrastructure/settings/plugins";
import type { container } from "./interface";

export default class authentication {
	async session(receiver: container) {
		const active = Object.entries(plugins.authentication)
			.map(([name, plugin]) => ({ name, ...plugin }))
			.filter((item) => item.active);

		const sorted = active.sort((a, b) => a.priority - b.priority);
		const session = new Map();

		for (const item of sorted) {
			const auth = await item.strategy(receiver).catch(() => undefined);
			if (auth) session.set(item.name, auth);
		}

		if (session.size > 0) {
			receiver.session(Object.fromEntries(session));
			return true;
		}

		return false;
	}
}
