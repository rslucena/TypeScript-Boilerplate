const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const IDENTITY_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

export const createCredentialsBuilder = (overrides = {}) => ({
	id: VALID_UUID,
	identityId: IDENTITY_UUID,
	password: "hashed_password_123",
	activated: true,
	deletedAt: null as Date | null,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});
