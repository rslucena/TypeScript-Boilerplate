import type { container } from "@infrastructure/server/interface";

export default async function getLiveness(request: container) {
	request.status(200);
	return {
		status: "active",
		version: "1.0.0", // Mocked version
		date: new Date().toISOString(),
	};
}
