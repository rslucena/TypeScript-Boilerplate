---
title: Domain Scaffolding
description: CLI generator tool for creating complete CRUD domains
---

# Domain Scaffolding

To accelerate development and maintain consistency across domain modules, the project includes a CLI generator tool that creates complete CRUD domains in seconds. It also automatically registers the new routes and formats the code.

> **💡 Want to understand how the generator works internally?**  
> See [Template System Architecture](/development/template-system-architecture) for a deep dive into the zero-dependency template engine.

## How to use

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

## Generated Structure

The tool automatically creates a **complete CRUD structure** following the project's architectural patterns:

<script setup>
import { MarkerType } from '@vue-flow/core'

/* --- Structure Diagram --- */
const structNodes = [
  { id: 'cmd', label: 'bun gen:domain product', position: { x: 250, y: 0 } },
  { id: 'dir', label: 'src/domain/product/', position: { x: 250, y: 100 } },
  { id: 'test', label: 'tests/.../product/', position: { x: 50, y: 100 } },
  { id: 'ent', label: 'entity.ts', position: { x: 100, y: 200 } },
  { id: 'sch', label: 'schema.ts', position: { x: 250, y: 200 } },
  { id: 'rou', label: 'routes.ts', position: { x: 400, y: 200 } },
  { id: 'act', label: 'actions/', position: { x: 550, y: 200 } },
  { id: 'list', label: 'actions files...', position: { x: 550, y: 280 } },
  { id: 'spec', label: 'crud.spec.ts', position: { x: 50, y: 200 } }
]

const structEdges = [
  { id: 's1', source: 'cmd', target: 'dir', markerEnd: MarkerType.ArrowClosed },
  { id: 's2', source: 'cmd', target: 'test', markerEnd: MarkerType.ArrowClosed },
  { id: 's3', source: 'dir', target: 'ent', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 's4', source: 'dir', target: 'sch', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 's5', source: 'dir', target: 'rou', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 's6', source: 'dir', target: 'act', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 's7', source: 'act', target: 'list', type: 'step', markerEnd: MarkerType.ArrowClosed },
  { id: 's8', source: 'test', target: 'spec', markerEnd: MarkerType.ArrowClosed }
]

/* --- Action Flows --- */
/* Helper to create simple linear flows */
const createFlow = (idPrefix, steps) => ({
  nodes: steps.map((label, i) => ({ 
    id: `${idPrefix}-${i}`, 
    label, 
    position: { x: i * 200, y: 0 },
    ...(label.includes('DB') ? {} : {}),
    ...(label.includes('Cache') ? {} : {})
  })),
  edges: steps.slice(0, -1).map((_, i) => ({ 
    id: `${idPrefix}-e${i}`, 
    source: `${idPrefix}-${i}`, 
    target: `${idPrefix}-${i+1}`, 
    markerEnd: MarkerType.ArrowClosed 
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

    D --> E[Return Empty]

    style C fill:#f44336,stroke:#333,stroke-width:2px
    style D fill:#f44336,stroke:#333,stroke-width:2px
```

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
```
🚀 Generating domain: category...
🔗 Injected route into http-primary-webserver.ts

✅ Domain "category" generated successfully!

📂 Created Files:
   - src/domain/category/entity.ts
   - src/domain/category/schema.ts
   - src/domain/category/routes.ts
   - src/domain/category/actions/...
   - tests/unit/domain/category/crud.spec.ts

📍 Location: src/domain/category

👇 Next Steps:
   1. Review the generated schema in src/domain/category/schema.ts
   2. Run migration if necessary: bun run db:migrate
   3. Run tests: bun test tests/unit/domain/category/crud.spec.ts

🎨 Running formatter...
✨ Formatting complete!
```

### What's Created

- ✅ Complete REST API with 5 endpoints
- ✅ Database table with indexes
- ✅ Request/response validation
- ✅ Automatic caching layer
- ✅ Swagger documentation
- ✅ Test file skeleton
- ✅ Type-safe operations

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
