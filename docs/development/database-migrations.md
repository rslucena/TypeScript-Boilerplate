---
title: Database & Migrations
description: How to manage your database schema, generate migrations, and interact with Drizzle ORM.
---

# Database & Migrations

This boilerplate uses **[Drizzle ORM](https://orm.drizzle.team/)** alongside **PostgreSQL**. Drizzle provides a true SQL-like experience with complete Type Safety, without the heavy overhead of traditional ORMs.

## Architecture

Our schema definition is spread across the **Domain** pattern. Instead of having a massive `schema.ts` file in the infrastructure folder, each domain has its own `entity.ts` file.

<script setup>
import { MarkerType } from '@vue-flow/core'

const styleCore = { type: 'smoothstep', style: {stroke: '#3B82F6', strokeWidth: 2}, animated: true, markerEnd: MarkerType.ArrowClosed }
const styleProd = { type: 'smoothstep', style: {stroke: '#F59E0B', strokeWidth: 2}, animated: true, markerEnd: MarkerType.ArrowClosed }

const dbNodes = [
  { id: 'u', type: 'multi-handle', label: 'user/entity.ts', position: { x: 0, y: 0 }, style: { backgroundColor: '#4B5563', color: '#fff' } },
  { id: 'p', type: 'multi-handle', label: 'product/entity.ts', position: { x: 200, y: 0 }, style: { backgroundColor: '#4B5563', color: '#fff' } },
  { id: 'a', type: 'multi-handle', label: '*/entity.ts', position: { x: 400, y: 0 }, style: { backgroundColor: '#4B5563', color: '#fff' } },
  { id: 'conf', type: 'multi-handle', label: 'drizzle.config.ts', position: { x: 200, y: 150 }, style: { borderRadius: '20px', border: '2px solid #000' } },
  { id: 'mig', type: 'multi-handle', label: 'migrations folder', position: { x: 200, y: 300 }, style: { backgroundColor: '#3B82F6', color: '#fff' } },
  { id: 'db', type: 'multi-handle', label: 'PostgreSQL DB', position: { x: 200, y: 450 }, style: { backgroundColor: '#F59E0B', color: '#fff' } }
]

const dbEdges = [
  { id: 'e1', source: 'u', target: 'conf', sourceHandle: 'bottom', targetHandle: 'top-source', label: 'User Table', ...styleCore },
  { id: 'e2', source: 'p', target: 'conf', sourceHandle: 'bottom', targetHandle: 'top', label: 'Product Table', ...styleCore },
  { id: 'e3', source: 'a', target: 'conf', sourceHandle: 'bottom', targetHandle: 'top-source', label: 'Any Table', ...styleCore },
  { id: 'e4', source: 'conf', target: 'mig', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'generate', ...styleCore },
  { id: 'e5', source: 'mig', target: 'db', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'push', ...styleProd }
]
</script>

<InteractiveFlow :nodes="dbNodes" :edges="dbEdges" />

The `drizzle.config.ts` file is configured to scan `src/domain/**/entity.ts` automatically to build the complete database schema.

---

## Migration Workflow

When you modify an `entity.ts` file (e.g., adding a new column to a table), you need to synchronize those changes with the actual database.

### 1. Generate the Migration

Generates a `.sql` file in `src/infrastructure/migrations/` containing the exact SQL commands needed to update the database.

```bash
bun db:migrate
```

*It is highly recommended to commit these generated `.sql` files to your version control.*

### 2. Apply (Push) the Migration

Executes the generated SQL files against your target PostgreSQL database.

```bash
bun db:migrate:push
```

### 3. Visualizing the Data (Drizzle Studio)

Drizzle comes with a built-in database visualizer. You can start it locally to inspect your tables and data directly from your browser.

```bash
bun db:studio
```

---

## Best Practices

### The CLI Generator
The fastest and safest way to create new tables and schemas is to use the built-in domain generator. It automatically creates the `entity.ts` ready for Drizzle.

```bash
bun gen:domain customer
```

### Prepared Statements
For maximum performance, the boilerplate rules require using [Prepared Statements](https://orm.drizzle.team/docs/perf-queries) for repetitive queries instead of raw dynamic queries. This is usually done inside your Domain Actions (`src/domain/*/actions/*.ts`).

### CI/CD Pipeline
In a production deployment (like via Docker or GitHub Actions), migrations should be automatically applied BEFORE the new application version accepts traffic.

If deploying via Docker, you can run the migrations directly inside the container before starting the main process:
```bash
docker exec -it app_server bun db:migrate:push
```
