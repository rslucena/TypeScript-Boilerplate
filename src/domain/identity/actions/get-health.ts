import type { container } from "@infrastructure/server/interface";

export default async function getHealth(request: container) {
	request.status(200);
	return {
		status: "active",
		version: "1.0.0",
		date: new Date().toISOString(),
	};
}
