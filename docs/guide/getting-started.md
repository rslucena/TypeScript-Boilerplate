---
title: Getting Started
description: Complete guide to setting up and creating your first feature with TypeScript Boilerplate
---

# Getting Started

Welcome to the TypeScript Boilerplate! This guide will walk you through creating your first feature from scratch.

## Prerequisites

Before starting, ensure you have:
- ✅ Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- ✅ Docker and Docker Compose
- ✅ PostgreSQL and Redis running (via `docker-compose up -d`)
- ✅ Database migrations applied (`bun db:migrate:push`)

## Tutorial: Building a Blog Post API (5 minutes)

### Step 1: Generate the Domain

::: code-group

```bash [bun]
bun gen:domain post

# Output:
# 🚀 Generating domain: post...
# ✅ Domain post generated successfully!
# 📍 Location: src/domain/post
# 🧪 Test: tests/unit/domain/post/crud.spec.ts
```

```bash [npm]
npm run gen:domain post

# Output:
# 🚀 Generating domain: post...
# ✅ Domain post generated successfully!
# 📍 Location: src/domain/post
# 🧪 Test: tests/unit/domain/post/crud.spec.ts
```

```bash [yarn]
yarn gen:domain post

# Output:
# 🚀 Generating domain: post...
# ✅ Domain post generated successfully!
# 📍 Location: src/domain/post
# 🧪 Test: tests/unit/domain/post/crud.spec.ts
```

```bash [pnpm]
pnpm gen:domain post

# Output:
# 🚀 Generating domain: post...
# ✅ Domain post generated successfully!
# 📍 Location: src/domain/post
# 🧪 Test: tests/unit/domain/post/crud.spec.ts
```

:::

### Step 2: Customize the Entity

Edit `src/domain/post/entity.ts`:

```typescript
import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { pgTable, varchar, text } from "drizzle-orm/pg-core";

const columns = {
	title: varchar("title", { length: 255 }).notNull(),
	content: text("content").notNull(),
	authorId: varchar("author_id", { length: 36 }).notNull(),
	slug: varchar("slug", { length: 255 }).unique().notNull(),
};

const post = pgTable("post", { ...columns, ...identifier }, (table) =>
	pgIndex("post", table, ["title", "slug"])
);

type post = typeof post.$inferSelect;

export default post;
```

### Step 3: Update the Schema Validation

Edit `src/domain/post/schema.ts`:

```typescript
import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array, object } from "zod/v4";
import { default as entity } from "./entity";

const create = createInsertSchema(entity, {
	title: (schema) => schema.min(5).max(255),
	content: (schema) => schema.min(10),
	slug: (schema) => schema.min(3).max(255).regex(/^[a-z0-9-]+$/),
});

const select = createSelectSchema(entity, {
	...zodIdentifier,
}).partial();

const actions = {
	headers,
	id: select.pick({ id: true }),
	read: object({
		...select.omit({ id: true }).shape,
		...withPagination.shape,
	}),
	create: create.omit({ id: true }),
	update: create.omit({ id: true }).partial(),
	delete: create.pick({ id: true }),
};

const response = array(select);

export default { actions, entity: response };
```

#### Migration Flow

<script setup>
import { MarkerType } from '@vue-flow/core'

const migrationNodes = [
  { id: '1', type: 'multi-handle', label: 'Developer', position: { x: 0, y: 0 } },
  { id: '2', type: 'multi-handle', label: 'Source Code', position: { x: 250, y: 0 } },
  { id: '3', type: 'multi-handle', label: 'Postgres', position: { x: 500, y: 0 } }
]

const migrationEdges = [
  { id: 'e1-2', source: '1', target: '2', sourceHandle: 'right-source', targetHandle: 'left', label: 'Edit entity.ts', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e1-2b', source: '1', target: '2', sourceHandle: 'right-source', targetHandle: 'left', label: 'Run bun db:migrate', type: 'smoothstep', animated: true, style: { strokeDasharray: '5,5' }, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2-2', source: '2', target: '2', label: 'Generate SQL', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e1-2c', source: '1', target: '2', sourceHandle: 'right-source', targetHandle: 'left', label: 'Run bun db:migrate:push', type: 'smoothstep', animated: true, style: { stroke: '#4CAF50' }, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2-3', source: '2', target: '3', sourceHandle: 'right-source', targetHandle: 'left', label: 'Apply SQL Changes', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="migrationNodes" :edges="migrationEdges" />

### Step 4: Generate and Apply Migration

::: code-group

```bash [bun]
# Generate migration file
bun db:migrate

# Apply to database
bun db:migrate:push
```

```bash [npm]
# Generate migration file
npm run db:migrate

# Apply to database
npm run db:migrate:push
```

```bash [yarn]
# Generate migration file
yarn db:migrate

# Apply to database
yarn db:migrate:push
```

```bash [pnpm]
# Generate migration file
pnpm db:migrate

# Apply to database
pnpm db:migrate:push
```

:::

### Step 5: Verify Route Registration

When using `bun gen:domain`, the routes are **automatically registered** in `src/functions/http-primary-webserver.ts`. 

You just need to verify the injection or customize the prefix if necessary:

```typescript
// src/functions/http-primary-webserver.ts
import postRoutes from "@domain/post/routes"; // Auto-added

(async () => {
  const server = await webserver.create();
  // ...
  server.register(postRoutes, { prefix: "/api/v1/posts" }); // Auto-added
  // ...
})();
```

### Step 6: Test Your API

```bash
# Start the server
bun dev --workers=primary-webserver

# In another terminal, test the endpoints:

# Create a post
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post!",
    "authorId": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "my-first-post"
  }'

# Get all posts
curl http://localhost:3000/api/v1/posts

# Check Swagger docs
open http://localhost:3000/docs
```

### Step 7: Write Tests

Edit `tests/unit/domain/post/crud.spec.ts`:

```typescript
import { describe, expect, it, mock } from "bun:test";
import postNewEntity from "@domain/post/actions/post-new-entity";
import { container } from "@infrastructure/server/request";

describe("Post Domain", () => {
	it("should create a new post", async () => {
		const mockRequest = {
			body: () => ({
				title: "Test Post",
				content: "Test content",
				authorId: "123e4567-e89b-12d3-a456-426614174000",
				slug: "test-post"
			}),
			status: mock(() => {}),
			language: () => "en",
		} as unknown as container;

		// Add your test logic here
		expect(true).toBe(true);
	});
});
```

Run tests:

::: code-group

```bash [bun]
bun test tests/unit/domain/post
```

```bash [npm]
npm test tests/unit/domain/post
```

```bash [yarn]
yarn test tests/unit/domain/post
```

```bash [pnpm]
pnpm test tests/unit/domain/post
```

:::

## Next Steps

- ✅ **Add business logic**: Implement custom validation in actions
- ✅ **Add relationships**: Link posts to users via foreign keys
- ✅ **Add authentication**: Protect routes with JWT middleware
- ✅ **Add more features**: Comments, likes, tags, etc.

## Common Patterns

### Adding a Foreign Key

```typescript
// In entity.ts
import { references } from "drizzle-orm";
import user from "../user/entity";

const columns = {
	// ... other columns
	authorId: varchar("author_id", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
};
```

## Troubleshooting

**Problem**: Migration fails with "column already exists"
**Solution**: Drop the table or run `bun db:migrate` to generate a fresh migration

**Problem**: Routes not appearing in Swagger
**Solution**: Ensure `schema` is properly defined in routes with `tags`, `summary`, and `response`

**Problem**: Cache not invalidating
**Solution**: Check that `tag("domain", "find*")` matches your cache key pattern

## Resources

- [Architecture Overview](/architecture/)
- [Domain Scaffolding Reference](/development/domain-scaffolding)
- [Troubleshooting Guide](/reference/troubleshooting)
