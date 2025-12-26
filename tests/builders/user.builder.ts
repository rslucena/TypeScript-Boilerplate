const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
export const createUserBuilder = (overrides = {}) => ({
  id: VALID_UUID,
  name: "John",
  lastName: "Doe",
  email: `john.doe.${Math.random()}@example.com`,
  password: "password123",
  activated: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
