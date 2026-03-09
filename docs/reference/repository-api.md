---
title: Base Repository Methods (API)
description: Internal reference for the Drizzle ORM Repository Manager and Data Helpers.
---

# Base Repository Methods (API)

The Database Layer of the Boilerplate enforces the Repository Pattern, serving as the central hub for database interactions via Drizzle ORM. 

By passing all `Actions` through this layer, we guarantee standardized connection pooling, global Query Logging, and simplified query syntaxes.

## Drizzle Manager

The heart of the module exported by `src/infrastructure/repositories/repository.ts` is the pre-configured `manager` instance. 

Instead of dealing with client connection life-cycles, you just import the `repository` and write semantic SQL immediately. It utilizes a highly concurrent `postgres-js` pool under the hood.

```typescript
import repository from "@infrastructure/repositories/repository";
import entity from "../entity";
import { eq } from "drizzle-orm";

// Finding a single record
const result = await repository
  .select()
  .from(entity)
  .where(eq(entity.id, "123"))
  .limit(1);

// Inserting data
await repository
  .insert(entity)
  .values({ email: "hello@world.com" })
  .returning();

// Transaction blocks
await repository.transaction(async (tx) => {
  await tx.insert(entity).values({/* ... */});
  await tx.update(anotherEntity).set({/* ... */});
});
```

> [!TIP]
> For a deep dive into Cache Interception techniques when querying through the Repository, refer to the [Repository Pattern Concept](/development/base-repository-pattern) documentation.

## Utilities

### withPagination

When querying large lists of resources, building `LIMIT` and `OFFSET` manually is repetitive. This built-in helper applies offset-based pagination directly to the active QueryBuilder.

**Signature:** `withPagination(qb: PgSelect, page: number, size?: number)` 

By default, the active page size (`size`) is set to `10`.

```typescript
import { withPagination } from "@infrastructure/repositories/repository";
import repository from "@infrastructure/repositories/repository";
import entity from "../entity";

const page = 3; 

const pagedQuery = withPagination(
  repository.select().from(entity),
  page,
  20 // 20 items per page
);

const results = await pagedQuery.execute();
```
