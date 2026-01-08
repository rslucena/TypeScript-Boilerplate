import { describe, expect, it, mock } from "bun:test";
import { withPagination } from "@infrastructure/repositories/repository?v=unit";
import type { PgSelect } from "drizzle-orm/pg-core";

describe("Repository Utilities", () => {
	describe("withPagination", () => {
		it("should apply limit and offset correctly", () => {
			const limitMock = mock(() => queryMock);
			const offsetMock = mock(() => queryMock);
			const queryMock = {
				limit: limitMock,
				offset: offsetMock,
			} as unknown as PgSelect;

			withPagination(queryMock, 2, 10);

			expect(limitMock).toHaveBeenCalledWith(10);
			expect(offsetMock).toHaveBeenCalledWith(10);
		});
	});
});
