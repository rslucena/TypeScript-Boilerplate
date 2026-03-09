---
title: Template Engine Variables
description: Cheat Sheet for modifying Domain Scaffolding text wildcards.
---

# Template Engine Variables

The Boilerplate comes shipped with a **Zero-Dep Template Engine** that rapidly scaffolds Domain folders, routes, CRUD actions, schemas, and test blocks whenever you run `bun gen:domain <name>`.

The source templates live in `src/templates/domain/`. 

## Built-In Wildcards

When the bundler parses a text-file template (like `get-by-id.ts` or `routes.ts`), it replaces specific hard-coded wildcards with the CLI argument you submitted string-manipulated to the specific style. 

If you extend or customize the core scaffolding templates to fit your business logic, you can safely use these wildcards:

| Wildcard String | Target Format | CLI Output Example for `bun gen:domain process` | Use Case |
| :--- | :--- | :--- | :--- |
| `__name__` | Strict Literal | `process` | For directory names, path parameters (`/process/:id`), general lowercased references, and Cache mapping tags. |
| `__Capitalized__` | Capitalized | `Process` | Essential for naming TypeScript classes, Fastify Route function definitions (e.g. `export default async function routesProcess(server)`), and schema names. |

### Example Usage inside a Template

```typescript
// src/templates/domain/actions/delete-entity.ts

// The compiler sees:
import { tag } from "@infrastructure/repositories/references";
import __name__ from "../entity";

// And outputs (if gen:domain user):
import { tag } from "@infrastructure/repositories/references";
import user from "../entity";
```
