# Pagination, Filtering & Sorting

When building APIs that return lists of resources, it's essential to paginate results to ensure performance and reduce payload sizes. The TypeScript Boilerplate provides standardized utilities to handle pagination and filtering seamlessly using Zod and Drizzle ORM.

## Pagination Implementation

The boilerplate implements offset-based pagination. This is handled by a combination of a standard Zod schema for input validation and a Drizzle ORM query modifier.

### 1. The Request Schema (`req.page`)

In `src/infrastructure/repositories/references.ts`, the boilerplate defines a reusable Zod schema for pagination parameters:

```typescript
const withPagination = z.object({
	"req.page": array(number().min(1)).length(2).default([1, 10]),
});
```

This expects an array of two numbers in the query string representing `[page, limit]`. Because URLs don't natively pass arrays easily, Fastify's query parser or a custom hook handles the conversion, allowing a client to pass `?req.page=1&req.page=10`. It defaults to page 1, limit 10.

When generating a domain using `bun gen:domain`, this is automatically merged into the `read` action schema:

```typescript
// src/domain/<domain>/schema.ts
const actions = {
	// ...
	read: select.omit({ id: true }).extend(withPagination.shape),
};
```

### 2. The Database Query Modifier (`withPagination`)

To apply these parameters to your Drizzle SQL queries, use the `withPagination` helper provided by `src/infrastructure/repositories/repository.ts`.

```typescript
import { withPagination } from "@infrastructure/repositories/repository";

export function withPagination<T extends PgSelect>(qb: T, page: number, size = 10) {
	return qb.limit(size).offset((page - 1) * size);
}
```

<script setup>
import { MarkerType } from '@vue-flow/core'

const pagNodes = [
  { id: 'client', type: 'multi-handle', label: 'Client', position: { x: 0, y: 100 } },
  { id: 'fastify', type: 'multi-handle', label: 'Fastify Route', position: { x: 250, y: 100 } },
  { id: 'zod', type: 'multi-handle', label: 'Zod Validator', position: { x: 500, y: 0 }, class: 'bg-indigo-50 border-indigo-200' },
  { id: 'action', type: 'multi-handle', label: 'Domain Action', position: { x: 500, y: 200 } },
  { id: 'drizzle', type: 'multi-handle', label: 'Drizzle ORM', position: { x: 750, y: 200 }, class: 'bg-orange-50 border-orange-200' },
  { id: 'db', type: 'multi-handle', label: 'Database', position: { x: 1000, y: 200 }, class: 'bg-blue-50 border-blue-200' }
]

const pagEdges = [
  { id: 'e1', source: 'client', target: 'fastify', sourceHandle: 'right-source', targetHandle: 'left', label: 'GET /items?name=foo', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2', source: 'fastify', target: 'zod', sourceHandle: 'top-source', targetHandle: 'left', label: 'Validate', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e3', source: 'zod', target: 'fastify', sourceHandle: 'left-source', targetHandle: 'top', label: 'Valid Data', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e4', source: 'fastify', target: 'action', sourceHandle: 'right-source', targetHandle: 'left', label: 'Call Action', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e5', source: 'action', target: 'drizzle', sourceHandle: 'right-source', targetHandle: 'left', label: 'Build Query', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e6', source: 'drizzle', target: 'db', sourceHandle: 'right-source', targetHandle: 'left', label: 'Execute SQL', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e7', source: 'db', target: 'drizzle', sourceHandle: 'left-source', targetHandle: 'right', label: 'Results', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e8', source: 'drizzle', target: 'action', sourceHandle: 'left-source', targetHandle: 'right', label: 'Entities', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e9', source: 'action', target: 'fastify', sourceHandle: 'left-source', targetHandle: 'right', label: 'Return', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e10', source: 'fastify', target: 'client', sourceHandle: 'left-source', targetHandle: 'right', label: '200 OK', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="pagNodes" :edges="pagEdges" :height="400" />

## Example: Building a Paginated Endpoint

Here is how you combine the schema validation and the database modifier in an action (`get-find-by-params.ts`):

```typescript
import repository, { withPagination } from "@infrastructure/repositories/repository";
import { default as schema } from "../schema";
import entity from "../entity";
import { and, desc, eq, ilike, sql } from "drizzle-orm";

export default async function getFindByParams(request: container) {
	// 1. Validate the query parameters, including pagination and filters
	const validRequest = await schema.actions.read.safeParseAsync(request.query());
	if (!validRequest.success) throw request.badRequest();

	const { data } = validRequest;

	// 2. Prepare the Drizzle query with filters
	const prepare = repository
		.select()
		.from(entity)
		.where(
			and(
				data.name ? ilike(entity.name, `%${data.name}%`) : undefined,
				data.activated !== undefined ? eq(entity.activated, data.activated) : undefined,
			),
		)
		.orderBy(desc(entity.id))
		.$dynamic();

	// 3. Apply Pagination using the validated req.page array [page, limit]
	withPagination(prepare, data["req.page"][0], data["req.page"][1]);

	// 4. Execute the query
	const content = await prepare.execute();

	if (!content.length) throw request.notFound();

	return content;
}
```

## Filtering Data

As seen in the example above, filtering is achieved by making your query parameters optional in your Zod schema (`.partial()`), and then dynamically constructing the `where` clause in Drizzle ORM using the `and()` and `undefined` pattern.

If a property in `data` is `undefined`, Drizzle ignores that condition. This allows the same endpoint to handle `/users?name=john` and `/users?activated=true`.

*   **Exact Matches**: Use Drizzle's `eq()` function.
*   **Partial Matches**: Use Drizzle's `ilike()` function combined with SQL wildcard strings (e.g., `%${data.name}%`).
*   **Prepared Statements**: For better performance, notice the use of `sql.placeholder("name")` in the boilerplate's generated code, which allows PostgreSQL to cache the query execution plan.

## Sorting Data

Sorting is currently applied directly within the action logic using Drizzle's `orderBy` clause (e.g., `orderBy(desc(entity.id))`). If dynamic sorting by the client is required, you can add a `sort` field to your Zod schema and dynamically map it to Drizzle columns in your action.
