import { describe, expect, it } from "bun:test";
import { providers, types } from "@domain/credentials/constants";
import schema from "@domain/credentials/schema";

describe("Credentials Domain Schema Validation", () => {
	const { actions } = schema;

	describe("actions.create", () => {
		it("should fail if type is PASSWORD but secret is missing", () => {
			const data = {
				identityId: "00000000-0000-0000-0000-000000000000",
				type: types.PASSWORD,
				provider: providers.LOCAL,
				login: "user@example.com",
			};

			const result = actions.create.safeParse(data);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issues = result.error.issues;
				expect(issues.some((i) => i.path.includes("secret") && i.message.includes("Secret is required"))).toBe(true);
			}
		});

		it("should fail if type is OIDC but subject is missing", () => {
			const data = {
				identityId: "00000000-0000-0000-0000-000000000000",
				type: types.OIDC,
				provider: providers.GOOGLE,
			};

			const result = actions.create.safeParse(data);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issues = result.error.issues;
				expect(issues.some((i) => i.path.includes("subject") && i.message.includes("Subject is required"))).toBe(true);
			}
		});

		it("should succeed for valid PASSWORD credential", () => {
			const data = {
				identityId: "00000000-0000-0000-0000-000000000000",
				type: types.PASSWORD,
				provider: providers.LOCAL,
				login: "user@example.com",
				secret: "securepassword",
			};

			const result = actions.create.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("should succeed for valid OIDC credential", () => {
			const data = {
				identityId: "00000000-0000-0000-0000-000000000000",
				type: types.OIDC,
				provider: providers.GOOGLE,
				subject: "google-sub-123",
			};

			const result = actions.create.safeParse(data);
			expect(result.success).toBe(true);
		});
	});
});
