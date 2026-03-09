---
title: Database Repository Layer
description: Guide to the optimized Drizzle ORM Repository Pattern used in the Boilerplate.
---
<script setup>
import { MarkerType } from '@vue-flow/core'
const nodes = [
  { id: "act", type: "multi-handle", label: "Generate Tag", position: { x: 296.6615722992293, y: -77.46830718947243 }},
  { id: "cache", type: "multi-handle", label: "Redis Cache", position: { x: 300, y: 50 }},
  { id: "driz", type: "multi-handle", label: "manager.select", position: { x: 289.3007955784649, y: 190.61977235532368 }},
  { id: "ret", type: "multi-handle", label: "Return Fast", position: { x: 540.6307912277367, y: 48.85130164500296 }},
  { id: "pg", type: "multi-handle", label: "PostgreSQL", position: { x: 423.1004533304567, y: 375.20812069467684 }},
  { id: "set", type: "multi-handle", label: "cache.json.set", position: { x: 528.7855555169805, y: 192.74112565773294 }},
];
const edges = [
  { id: "c3", source: "cache", target: "ret", sourceHandle: "right-source", targetHandle: "left", label: "Hit", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#10B981" } },
  { id: "c4", source: "driz", target: "pg", sourceHandle: "right-source", targetHandle: "left", label: "SQL", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#3B82F6" } },
  { id: "c5", source: "pg", target: "set", sourceHandle: "right-source", targetHandle: "left", label: "Result", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#F59E0B" } },
  { id: "c6", source: "act", target: "cache", sourceHandle: "bottom-source", targetHandle: "top", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#b1b1b7" } },
  { id: "c7", source: "cache", target: "driz", sourceHandle: "bottom-source", targetHandle: "top", label: "Miss / Down", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#b30000" } },
  { id: "c8", source: "set", target: "ret", sourceHandle: "top-source", targetHandle: "bottom", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#ff0000" } },
];
</script>

# Database Repository Layer

This Boilerplate relies on **Drizzle ORM** coupled with `postgres.js` to handle database interactions. However, instead of importing Drizzle directly inside your Domain Actions, the infra layer abstracts the connection and provides powerful out-of-the-box optimizations via `src/infrastructure/repositories/repository.ts`.

---

## 1. The Connection Manager (`repository.ts`)

This file is responsible for creating a high-performance Singleton connection to your PostgreSQL database. 

It implements several enterprise-level configurations automatically:
- **`prepare: true`**: Instructs `postgres.js` to use Prepared Statements globally. This ensures the database query engine compiles the SQL just once, drastically reducing CPU overhead for repeated queries.
- **Connection Pooling**: Uses the `.env` variable `POSTGRES_POOL` to dictate the max number of connections.
- **`idle_timeout` and `max_lifetime`**: Automatically closes idle connections after 5 seconds to prevent memory leaks in the PgBouncer/Serverless environments.
- **Integrated Logging**: Pipes all generated Drizzle SQL queries directly into the central Fastify/Pino Logger handler via `DefaultLogger`.

### How to use it in Actions

Instead of creating new clients, simply import the `manager`.

```typescript
import manager from "@infrastructure/repositories/repository";
import { usersTable } from "../entity";

export default async function getUsers() {
    // Uses the optimized singleton connection
    return await manager.select().from(usersTable);
}
```

---

## 2. Pagination Helper

The repository layer exports a strongly-typed `withPagination` helper. In traditional SQL, implementing pagination (Limit and Offset) safely without polluting the code is tricky. 

`withPagination` automatically translates a `page` number into the mathematical offset.

```typescript
import manager, { withPagination } from "@infrastructure/repositories/repository";
import { post } from "../entity";

// Gets Page 2 (with 10 items per page limit by default)
const page = 2;

const query = manager
    .select()
    .from(post)
    .$dynamic(); // Required by Drizzle for dynamic query building

const results = await withPagination(query, page, 10);
```

---

## 3. Cache Tagging (Repository References)

To support the Redis "Graceful Degradation" strategy detailed in the [Cache Actions Reference](/reference/cache-actions-reference), the repository layer also includes a specific pattern for hashing DB Queries.

In `src/infrastructure/repositories/references.ts`, you use the `tag()` function. This creates a deterministic, non-colliding String key that you can use to save your Repositories Queries inside Redis.

### Cache Degradation Flow

<InteractiveFlow :nodes="nodes" :edges="edges" />

```typescript
import { tag } from "@infrastructure/repositories/references";
import cache from "@infrastructure/cache/actions";

// Request params
const userId = "123";

// Generate a strict, safe Redis Key: "domain:method:conditionHash"
const cacheKey = tag("user", "getById", { id: userId });

// Try Cache first
let user = await cache.json.get(cacheKey);

if (!user) {
    // Query DB with Drizzle
    user = await manager.select().from(usersTable).where(eq(usersTable.id, userId));
    // Save to Cache
    await cache.json.set(cacheKey, user, 60); 
}
```
