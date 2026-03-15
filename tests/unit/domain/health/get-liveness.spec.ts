import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { container } from "@infrastructure/server/interface";
import { createContainerMock } from "@tests/mocks/server.mock";
import getLiveness from "../../../../src/domain/health/actions/get-liveness";

describe("Health Domain Actions : getLiveness", () => {
	let req: ReturnType<typeof createContainerMock>;

	beforeEach(() => {
		req = createContainerMock();
	});

	afterEach(() => {
		mock.restore();
	});

	it("should set status 200 and return liveness object", async () => {
		const result = await getLiveness(req as unknown as container);
		expect(req.status).toHaveBeenCalledWith(200);
		expect(result.status).toBe("active");
		expect(result.version).toBe("1.0.0");
		expect(result.date).toBeDefined();
	});
});
