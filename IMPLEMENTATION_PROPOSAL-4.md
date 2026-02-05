# IMPLEMENTATION_PROPOSAL-4

This proposal addresses the remaining test failures, implements the `credentials` domain unit tests, and standardizes internal naming/logic across the `Identity` and `Credentials` domains.

## Changes Made

### [Infrastructure]
- **Standardize JWT Imports**: Fixed remaining default imports of JWT module in `authentication.spec.ts`.

### [Credentials Domain]
- **Entity Initialization**: Fixed `pgTable` initialization by using manual index definitions to prevent `TypeError`.
- **Cache Standardization**: Flattened cache access structure in `get-by-id.ts` and `get-find-by-params.ts`.

### [Testing]
- **Circular Dependency Fix**: Successfully bypassed the Bun test runner's initialization lock by mocking `@domain/credentials/schema` in unit tests, allowing us to keep clean static imports in production.
- **New Unit Tests**: Full coverage for `Credentials` entity and primary actions.

## Commit Plan

1. `fix: update jwt imports in authentication tests`
2. `refactor(credentials): standardize cache access patterns`
3. `refactor(credentials): fix entity initialization`
4. `test(credentials): add builder and unit tests for entity and actions`
