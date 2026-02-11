---
title: Testing Guide
description: Comprehensive testing guide with patterns and best practices
---

# Testing Guide

This guide covers the testing strategy, structure, and best practices for the TypeScript Boilerplate project. The project uses **Bun's built-in test runner**, which is significantly faster than Jest while maintaining a familiar API.

## Test Structure

The test directory follows a clear organizational pattern:

```
tests/
├── unit/
│   ├── domain/              # Pure logic tests
│   │   └── user/
│   │       ├── user-get-by-id.spec.ts
│   │       └── user-create.spec.ts
│   └── infra/               # Adapter/gateway testing
│       └── cache/
│           └── redis-client.spec.ts
├── integration/
│   └── api/                 # Route/Endpoint Testing
│       └── users.test.ts
├── builders/                # Test data builders
│   └── user.builder.ts
└── mocks/                   # Global and reusable mocks
    ├── redis.client.mock.ts
    └── repository.mock.ts
```

### Directory Purposes

| Directory | Purpose | Example |
|-----------|---------|---------|
| `unit/domain/` | Business logic tests (no external dependencies) | Testing user validation rules |
| `unit/infra/` | Infrastructure adapter tests | Testing Redis cache wrapper |
| `integration/api/` | End-to-end API tests | Testing full HTTP request/response |
| `builders/` | Factory functions for test data | Creating valid user objects |
| `mocks/` | Shared mock implementations | Mocked Redis client |

## Writing Tests

### Test File Naming

- Use `.test.ts` or `.spec.ts` suffix
- Match the file being tested: `user-service.ts` → `user-service.spec.ts`
- Place in corresponding directory structure
- Use path aliases (`@infrastructure`, `@domain`, `@tests`) instead of relative paths

### Test Isolation and Mocks (Bun Specific)

In Bun, `mock.module` applied in one test file can affect other test files in the same process. To ensure **unit tests** are isolated and always use the **real implementation**, we use a query parameter in the import path:

```typescript
// tests/unit/infra/authentication/jwt.spec.ts
import * as jwt from "@infrastructure/authentication/jwt?v=unit";
```

The suffix `?v=unit` (or any query) creates a separate module cache entry, bypassing any global mocks applied to the base path.

---

### Test Structure: Arrange-Act-Assert

Follow the AAA pattern for clarity:

```typescript
import { describe, it, expect, mock } from "bun:test";

describe("getUserById", () => {
  it("should return user when valid ID is provided", async () => {
    // Arrange
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const expectedUser = createUserBuilder({ id: userId });
    mockRepository.getById.mockResolvedValue(expectedUser);

    // Act
    const result = await userService.getUserById(userId);

    // Assert
    expect(result).toEqual(expectedUser);
  });

  it("should throw error when user not found", async () => {
    // Arrange
    const userId = "non-existent-id";
    mockRepository.getById.mockResolvedValue(null);

    // Act & Assert
    await expect(userService.getUserById(userId)).rejects.toThrow();
  });
});
```

### Test Descriptions

Use descriptive test names that explain the scenario:

```typescript
// ✅ Good
it("should return 404 when user does not exist", async () => {});
it("should hash password before saving to database", async () => {});
it("should invalidate cache after user update", async () => {});

// ❌ Bad
it("works", async () => {});
it("test user", async () => {});
it("should return user", async () => {});  // Too vague
```

## Test Builders

Builders create valid test data with sensible defaults:

```typescript
// tests/builders/user.builder.ts
import { randomUUID } from "node:crypto";

export function createUserBuilder(overrides = {}) {
  return {
    id: randomUUID(),
    name: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "hashed_password_123",
    activated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,  // Allow customization
  };
}
```

**Usage:**
```typescript
// Default user
const user = createUserBuilder();

// Custom user
const inactiveUser = createUserBuilder({ activated: false });
const adminUser = createUserBuilder({ email: "admin@example.com" });
```

## Mocking

### Mocking External Dependencies

```typescript
import { mock } from "bun:test";

// Mock Redis client
export const createRedisClientMock = () => ({
  get: mock((..._args: unknown[]) => Promise.resolve(null)),
  set: mock((..._args: unknown[]) => Promise.resolve("OK")),
  del: mock((..._args: unknown[]) => Promise.resolve(1)),
  json: {
    get: mock((..._args: unknown[]) => Promise.resolve(null)),
    set: mock((..._args: unknown[]) => Promise.resolve("OK")),
  },
  ping: mock(() => Promise.resolve("PONG")),
});
```

### Using Mocks in Tests

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
import { createRedisClientMock } from "@tests/mocks/redis.client.mock";

describe("Cache Service", () => {
  let redisMock: ReturnType<typeof createRedisClientMock>;

  beforeEach(() => {
    redisMock = createRedisClientMock();
  });

  it("should retrieve cached value", async () => {
    // Arrange
    const key = "user:123";
    const cachedData = { name: "John" };
    redisMock.json.get.mockResolvedValue(cachedData);

    // Act
    const result = await cacheService.get(key);

    // Assert
    expect(result).toEqual(cachedData);
    expect(redisMock.json.get).toHaveBeenCalledWith(key);
  });
});
```

## Running Tests

### Basic Commands

::: code-group

```bash [bun]
# Run all tests
bun test

# Run specific file
bun test tests/unit/domain/user/user-get-by-id.spec.ts

# Run tests matching pattern
bun test user

# Watch mode (re-run on file changes)
bun test --watch

# Coverage report
bun test --coverage
```

```bash [npm]
# Run all tests
npm test

# Run specific file
npm test tests/unit/domain/user/user-get-by-id.spec.ts

# Run tests matching pattern
npm test user

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

```bash [yarn]
# Run all tests
yarn test

# Run specific file
yarn test tests/unit/domain/user/user-get-by-id.spec.ts

# Run tests matching pattern
yarn test user

# Watch mode (re-run on file changes)
yarn test --watch

# Coverage report
yarn test --coverage
```

```bash [pnpm]
# Run all tests
pnpm test

# Run specific file
pnpm test tests/unit/domain/user/user-get-by-id.spec.ts

# Run tests matching pattern
pnpm test user

# Watch mode (re-run on file changes)
pnpm test --watch

# Coverage report
pnpm test --coverage
```

:::

### Coverage Requirements

The project aims for:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

**View coverage:**

::: code-group

```bash [bun]
bun test --coverage
# Opens coverage/index.html in browser
```

```bash [npm]
npm test -- --coverage
# Opens coverage/index.html in browser
```

```bash [yarn]
yarn test --coverage
# Opens coverage/index.html in browser
```

```bash [pnpm]
pnpm test --coverage
# Opens coverage/index.html in browser
```

:::

## Integration Tests

Integration tests verify the full request/response cycle:

```typescript
// tests/integration/api/users.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import webserver from "@infrastructure/server/webserver";

describe("User API", () => {
  let server: Awaited<ReturnType<typeof webserver.create>>;

  beforeAll(async () => {
    server = await webserver.create();
  });

  afterAll(async () => {
    await server.close();
  });

  it("GET /api/v1/users/:id should return user", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      headers: {
        authorization: "Bearer test-token",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
    });
  });

  it("POST /api/v1/users should create user", async () => {
    const newUser = {
      name: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "SecurePass123!",
    };

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/users",
      payload: newUser,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      name: newUser.name,
      email: newUser.email,
    });
  });
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
it("should call repository.findById", async () => {
  await userService.getUser("123");
  expect(mockRepository.findById).toHaveBeenCalled();
});

// ✅ Good: Testing behavior
it("should return user data when user exists", async () => {
  const user = await userService.getUser("123");
  expect(user).toHaveProperty("email");
});
```

### 2. One Assertion Per Test (When Possible)

```typescript
// ✅ Good: Focused tests
it("should return 201 status code", async () => {
  expect(response.statusCode).toBe(201);
});

it("should return created user data", async () => {
  expect(response.json()).toMatchObject({ name: "John" });
});

// ⚠️ Acceptable: Related assertions
it("should create user with hashed password", async () => {
  const user = await createUser({ password: "plain" });
  expect(user.password).not.toBe("plain");
  expect(user.password).toMatch(/^\$2[aby]\$/);  // bcrypt format
});
```

### 3. Isolate Tests

Each test should be independent:

```typescript
// ✅ Good: Each test has its own data
beforeEach(() => {
  mockData = createUserBuilder();
});

// ❌ Bad: Tests share mutable state
const sharedUser = createUserBuilder();
it("test 1", () => { sharedUser.name = "Changed"; });
it("test 2", () => { expect(sharedUser.name).toBe("John"); });  // Fails!
```

### 4. Use Descriptive Variable Names

```typescript
// ❌ Bad
const u = createUserBuilder();
const r = await service.get(u.id);

// ✅ Good
const existingUser = createUserBuilder();
const retrievedUser = await service.get(existingUser.id);
```

### 5. Test Edge Cases

```typescript
describe("calculateDiscount", () => {
  it("should return 0 for negative prices", () => {
    expect(calculateDiscount(-100)).toBe(0);
  });

  it("should return 0 for zero price", () => {
    expect(calculateDiscount(0)).toBe(0);
  });

  it("should handle very large numbers", () => {
    expect(calculateDiscount(Number.MAX_SAFE_INTEGER)).toBeGreaterThan(0);
  });
});
```

## Debugging Tests

### Using `console.log`

```typescript
it("should process data", () => {
  const data = processData(input);
  console.log("Processed data:", data);  // Visible in test output
  expect(data).toBeDefined();
});
```

### Using `test.only` and `test.skip`

```typescript
// Run only this test
it.only("should focus on this test", () => {
  // ...
});

// Skip this test
it.skip("should skip this test", () => {
  // ...
});
```

### Bun Debugger

```bash
# Run tests with debugger
bun --inspect test

# Then attach your IDE debugger to port 6499
```

## Common Patterns

### Testing Async Functions

```typescript
it("should handle async operations", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Errors

```typescript
it("should throw on invalid input", () => {
  expect(() => validateEmail("invalid")).toThrow();
});

it("should throw specific error", async () => {
  await expect(fetchUser("bad-id")).rejects.toThrow("User not found");
});
```

### Testing Dates

```typescript
it("should set createdAt to current time", () => {
  const user = createUser();
  const now = new Date();
  const diff = Math.abs(user.createdAt.getTime() - now.getTime());
  expect(diff).toBeLessThan(1000);  // Within 1 second
});
```

## Continuous Integration

Tests run automatically on every push via GitHub Actions:

```yaml
# .github/workflows/ci.yml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: oven-sh/setup-bun@v1
    - run: bun install
    - run: bun test --coverage
```

---

**See Also:**
- [CI/CD Pipeline](/devops/ci-cd-pipeline) - Automated testing in CI
- [Best Practices](/development/best-practices) - General coding standards
- [Architecture](/architecture/) - Understanding the codebase structure
