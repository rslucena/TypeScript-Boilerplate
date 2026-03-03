import { headers, livenessHealth, readinessHealth } from "@infrastructure/server/interface";

const schema = {
	actions: {
		headers,
		livenessHealth,
		readinessHealth,
	},
};

export default schema;
