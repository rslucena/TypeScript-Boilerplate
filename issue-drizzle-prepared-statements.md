---
name: Feature request
description: Suggest an idea for this project
labels: ["feat", "performance"]
---

### Is your feature request related to a problem?

Yes. I observed that Drizzle ORM Prepared Statements (`.prepare()`) are being initialized inside the execution scope of several route actions (e.g., `src/domain/sso/actions/post-local-login.ts`, `src/domain/identity/actions/get-by-email.ts`, `src/domain/identity/actions/get-by-id.ts`, `src/domain/credentials/actions/get-by-id.ts`).

By defining the prepared statement inside the request handler function, the query is rebuilt on every request, which completely negates the caching performance benefits of using prepared statements.

### Describe the solution you'd like

Refactor the aforementioned files (and any others following the same pattern) to define the Drizzle prepared statements outside the request handler/execution scope. The `.prepare()` call should be executed once during module initialization, and the resulting prepared statement object should be reused inside the handler by calling `.execute()` with the request parameters.

### Describe alternatives you've considered

The alternative is leaving the implementation as-is, which results in unnecessary CPU cycles and database query compilation overhead for repetitive queries, especially under high load.

### Additional context

- **Current Metrics**: Query preparation happens per-request instead of once per application lifecycle for these specific actions.
- **Expected Impact**: Reduces database query latency and application CPU overhead by reusing pre-compiled queries.
- **Implementation Hints**: Move the `.prepare()` logic out of the exported default functions in the respective `src/domain/*/actions/*.ts` files into the module scope, making sure to use `sql.placeholder()` correctly. Note that due to circular dependencies during early schema resolution in `bun:test` on the main branch, care might be needed to ensure this doesn't break unit tests involving Drizzle ORM entities and schemas (e.g., `Cannot access 'schema' before initialization`).
