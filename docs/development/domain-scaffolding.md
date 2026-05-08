---
title: Domain Scaffolding
description: CLI generator tool for creating complete CRUD domains
---

# Domain Scaffolding

To accelerate development and maintain consistency across domain modules, the project includes a CLI generator tool that creates complete CRUD domains in seconds. It also automatically registers the new routes and formats the code.

> **Want to understand how the generator works internally?**
> See [Template System Architecture](/development/template-system-architecture) for a deep dive into the zero-dependency template engine.

## How to use

<div align="center" style="margin: 2rem 0;">
  <img src="/praxis-content-create-demo.gif" alt="Praxis CLI Generation Demo" width="100%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);" />
</div>

Run the following command in your terminal:

::: code-group

```bash [bun]
bun gen:domain <name>
```

```bash [npm]
npm run gen:domain <name>
```

```bash [yarn]
yarn gen:domain <name>
```

```bash [pnpm]
pnpm gen:domain <name>
```

:::

Replace `<name>` with the singular name of your domain (e.g., `product`, `category`, `order`). The name will be used to:
- Create the domain folder structure
- Name the database table (e.g., `product` → table `product`)
- Generate proper imports and references
- Create Swagger tags with capitalized names (e.g., `Product`)

<script setup>
import { MarkerType } from '@vue-flow/core'

const style = { type: 'smoothstep', style: {stroke: 'var(--vp-code-line-diff-add-symbol-color)', strokeWidth: 1}, animated: true, markerEnd: MarkerType.ArrowClosed }

const style2 = { type: 'smoothstep', style: {stroke: 'var(--vp-code-color)', strokeWidth: 1}, animated: true, markerEnd: MarkerType.ArrowClosed }

/* --- Structure Diagram --- */
const structNodes = [
  { id: 'cmd', type: 'multi-handle', label: 'bun gen:domain product', position: { x: 235, y: 0 } },
  { id: 'dir', type: 'multi-handle', label: 'src/domain/product/', position: { x: 250, y: 100 } },
  { id: 'test', type: 'multi-handle', label: 'tests/.../product/', position: { x: 50, y: 100 } },
  { id: 'ent', type: 'multi-handle', label: 'entity.ts', position: { x: 660, y: 200 } },
  { id: 'sch', type: 'multi-handle', label: 'schema.ts', position: { x: 250, y: 200 } },
  { id: 'rou', type: 'multi-handle', label: 'routes.ts', position: { x: 400, y: 200 } },
  { id: 'act', type: 'multi-handle', label: 'actions/', position: { x: 540, y: 200 } },
  { id: 'list', type: 'multi-handle', label: 'actions files...', position: { x: 518, y: 300 } },
  { id: 'spec', type: 'multi-handle', label: 'crud.spec.ts', position: { x: 66, y: 200 } }
]

const structEdges = [
  { id: 's1', source: 'cmd', target: 'dir', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 's2', source: 'cmd', target: 'test', sourceHandle: 'left-source', targetHandle: 'top', ...style2 },
  { id: 's3', source: 'dir', target: 'ent', sourceHandle: 'right-source', targetHandle: 'top', ...style },
  { id: 's4', source: 'dir', target: 'sch', sourceHandle: 'right-source', targetHandle: 'top', ...style },
  { id: 's5', source: 'dir', target: 'rou', sourceHandle: 'right-source', targetHandle: 'top', ...style },
  { id: 's6', source: 'dir', target: 'act', sourceHandle: 'right-source', targetHandle: 'top', ...style },
  { id: 's7', source: 'act', target: 'list', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 's8', source: 'test', target: 'spec', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 }
]

/* --- Action Flows --- */
const createFlow = (idPrefix, steps) => ({
  nodes: steps.map((label, i) => ({
    id: `${idPrefix}-${i}`,
    label,
    position: { x: i * 100, y: i * 100 },
    type: 'multi-handle'

  })),
  edges: steps.slice(0, -1).map((_, i) => ({
    id: `${idPrefix}-e${i}`,
    source: `${idPrefix}-${i}`,
    target: `${idPrefix}-${i+1}`,
    sourceHandle: 'bottom-source', targetHandle: 'left',
    ...style2
  }))
})

const getById = createFlow('get', ['Request', 'Validate', 'Check Cache', 'Query DB', 'Cache Result', 'Return'])
const list = createFlow('list', ['Request', 'Validate', 'Check Cache', 'Apply Filters', 'Paginate', 'Cache & Return'])
const create = createFlow('create', ['Request', 'Validate', 'Insert to DB', 'Invalidate Cache', 'Return New'])
const update = createFlow('update', ['Request', 'Validate', 'Update DB', 'Invalidate Cache', 'Return Updated'])
const delFlow = createFlow('del', ['Request', 'Validate', 'Delete from DB', 'Invalidate Cache', 'Confirm'])

</script>

## Generated Structure

The tool automatically creates a **complete CRUD structure** following the project's architectural patterns:

<InteractiveFlow :nodes="structNodes" :edges="structEdges" />

### File Details

#### `entity.ts`
Drizzle ORM table definition with:
- Column definitions in a `columns` object
- Table creation with `identifier` (id, timestamps, activated)
- Index setup using `pgIndex`
- TypeScript type inference from table schema

#### `schema.ts`
Zod validation schemas for all operations:
- **headers**: Authentication headers
- **id**: UUID validation for params
- **read**: Query params with pagination support
- **create**: Body validation for POST
- **update**: Partial body validation for PUT
- **delete**: ID-only validation for DELETE

#### `routes.ts`
Fastify routes for complete REST API:
- `GET /ping` - Health check
- `GET /:id` - Retrieve single item (restricted)
- `GET /` - List with filters and pagination (restricted)
- `POST /` - Create new item (restricted)
- `PUT /:id` - Update item (restricted)
- `DELETE /:id` - Delete item (restricted)

#### Actions

### Actions Breakdown

#### 1. Retrieve Single Entity
**Endpoint:** `GET /:id`
**File:** `get-by-id.ts`
**Flow:**

<InteractiveFlow :nodes="getById.nodes" :edges="getById.edges" />

#### 2. List Entities (Paginated)
**Endpoint:** `GET /`
**File:** `get-find-by-params.ts`
**Flow:**

<InteractiveFlow :nodes="list.nodes" :edges="list.edges" />

#### 3. Create Entity
**Endpoint:** `POST /`
**File:** `post-new-entity.ts`
**Flow:**

<InteractiveFlow :nodes="create.nodes" :edges="create.edges" />

#### 4. Update Entity
**Endpoint:** `PUT /:id`
**File:** `put-update-entity.ts`
**Flow:**

<InteractiveFlow :nodes="update.nodes" :edges="update.edges" />

#### 5. Delete Entity
**Endpoint:** `DELETE /:id`
**File:** `delete-entity.ts`
**Flow:**

<InteractiveFlow :nodes="delFlow.nodes" :edges="delFlow.edges" />

**Action Features:**
- **Validation**: All inputs validated with Zod schemas
- **Caching**: Redis-based caching with TTL (10 minutes)
- **Cache Invalidation**: Automatic cache clearing on mutations
- **Prepared Statements**: Optimized DB queries
- **Error Handling**: Proper HTTP status codes and i18n messages
- **Type Safety**: Full TypeScript inference

## Example Usage

```bash
bun gen:domain category
```

**Output:**
```text
Praxis Framework v1.0.0
────────────────────────────────────────

  ℹ  Generating domain: category...
  ✔  Injected route into http-primary-webserver.ts
  ✔  Domain architecture scaffolded
  ℹ  Location: src/domain/category

  ⚙  Running code format validation...

  ✔  Generation complete.
```


### What's Created

- Complete REST API with 5 endpoints
- Database table with indexes
- Request/response validation
- Automatic caching layer
- Swagger documentation
- Test file skeleton
- Type-safe operations

### Next Steps After Generation

1. **Customize the entity**: Add more columns to `columns` object in `entity.ts`
2. **Enhance validation**: Add custom rules in `schema.ts`
3. **Write tests**: Implement actual test cases in `crud.spec.ts`
4. **Run migrations**: Generate and run Drizzle migrations

::: code-group

```bash [bun]
# Generate migration
bun db:migrate

# Apply to database
bun db:migrate:push
```

```bash [npm]
# Generate migration
npm run db:migrate

# Apply to database
npm run db:migrate:push
```

```bash [yarn]
# Generate migration
yarn db:migrate

# Apply to database
yarn db:migrate:push
```

```bash [pnpm]
# Generate migration
pnpm db:migrate

# Apply to database
pnpm db:migrate:push
```

:::

## Behavioral Notes

- **Naming Convention**: Use singular form (e.g., `product`, not `products`)
- **Table Names**: Automatically matches domain name
- **Cache Keys**: Generated using `tag()` helper with domain name
- **Idempotent**: Safe to re-run (will overwrite existing files)
- **Automatic Injection**: Routes are automatically registered in `http-primary-webserver.ts`
- **Auto-Formatting**: Runs `biome format` automatically after generation
- **No Conflicts**: Each domain is isolated in its own folder

---

## 🚀 Performance of Scaffolded Domains

Every domain generated by Praxis is production-ready and optimized for high-concurrency from day one. Here is a scaffolded domain handling a brute-force load test:

<div align="center" style="margin: 2rem 0;">
  <img src="/praxis-load-test.gif" alt="Praxis Scaffolded Domain Performance" width="100%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);" />
</div>

