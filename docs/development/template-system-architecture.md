---
title: Template System Architecture
description: Zero-dependency template engine architecture and implementation details
---
<script setup>
import { MarkerType } from '@vue-flow/core'

const style = { type: 'smoothstep', style: {stroke: 'var(--vp-code-line-diff-add-symbol-color)', strokeWidth: 2}, animated: true, markerEnd: MarkerType.ArrowClosed }
const style2 = { type: 'smoothstep', style: {stroke: 'var(--vp-code-color)', strokeWidth: 2}, animated: true, markerEnd: MarkerType.ArrowClosed }

/* --- Architecture Diagram --- */
const archNodes = [
  { id: 'a', type: 'multi-handle', label: 'User runs bun gen:domain', position: { x: 0, y: -20 } },
  { id: 'b', type: 'multi-handle', label: 'generate-domain.ts', position: { x: 25, y: 150 } },
  { id: 'c', type: 'multi-handle', label: 'Load Templates', position: { x: 40, y: 300 } },
  { id: 'd', type: 'multi-handle', label: 'Replace Placeholders', position: { x: 300, y: 0 } },
  { id: 'e', type: 'multi-handle', label: 'Write to src/domain/', position: { x: 304, y: 150 } },
  { id: 'f', type: 'multi-handle', label: 'Auto-inject Routes', position: { x: 311, y: 300 } },
  { id: 'g', type: 'multi-handle', label: 'Biome Format', position: { x: 329, y: 440 } }
]

const archEdges = [
  { id: 'e1', source: 'a', target: 'b', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 'e2', source: 'b', target: 'c', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 'e3', source: 'c', target: 'd', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 'e4', source: 'd', target: 'e', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 'e5', source: 'e', target: 'f', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 'e6', source: 'f', target: 'g', sourceHandle: 'bottom-source', targetHandle: 'top', ...style }
]

/* --- Generation Flow Diagram --- */
const genNodes = [
  { id: 'u', type: 'multi-handle', label: 'User', position: { x: 0, y: -100 } },
  { id: 'cli', type: 'multi-handle', label: 'CLI', position: { x: 200, y: 0 } },
  { id: 'tmp', type: 'multi-handle', label: 'Templates', position: { x: 450, y: 0 } },
  { id: 'fs', type: 'multi-handle', label: 'File System', position: { x: 450, y: 100 } },
  { id: 'srv', type: 'multi-handle', label: 'Webserver', position: { x:189, y: 150 } }
]

const genEdges = [
  { id: 'g1', source: 'u', target: 'cli', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'gen:domain', ...style },
  { id: 'g2', source: 'cli', target: 'tmp', sourceHandle: 'right-source', targetHandle: 'left', label: 'Load', ...style2 },
  { id: 'g3', source: 'tmp', target: 'cli', sourceHandle: 'left-source', targetHandle: 'right', label: 'Content', ...style2 },
  { id: 'g4', source: 'cli', target: 'fs', sourceHandle: 'right-source', targetHandle: 'left', label: 'Write Files', ...style2 },
  { id: 'g5', source: 'cli', target: 'srv', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'Inject Route', ...style2 },
  { id: 'g6', source: 'cli', target: 'u', sourceHandle: 'top-source', targetHandle: 'right', label: 'Done', ...style }
]

/* --- Structure Diagram --- */
const structNodes = [
  { id: 'cmd', type: 'multi-handle', label: 'bun gen:domain', position: { x: 350, y: 0 } },
  { id: 'dir', type: 'multi-handle', label: 'src/domain/product/', position: { x: 333, y: 100 } },
  { id: 'ent', type: 'multi-handle', label: 'entity.ts', position: { x: 100, y: 250 } },
  { id: 'sch', type: 'multi-handle', label: 'schema.ts', position: { x: 180, y: 320 } },
  { id: 'rou', type: 'multi-handle', label: 'routes.ts', position: { x: 300, y: 380 } },
  { id: 'act', type: 'multi-handle', label: 'actions/', position: { x: 500, y: 250 } },
  { id: 'a1', type: 'multi-handle', label: 'get-by-id', position: { x: 670, y: 380 } },
  { id: 'a2', type: 'multi-handle', label: 'find-by-params', position: { x: 570, y: 440 } },
  { id: 'a3', type: 'multi-handle', label: 'post-new', position: { x: 495, y: 500 } },
  { id: 'sv', type: 'multi-handle', label: 'server.register', position: { x: 279, y: 500 } }
]

const structEdges = [
  { id: 's1', source: 'cmd', target: 'dir', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 's2', source: 'dir', target: 'ent', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 's3', source: 'dir', target: 'sch', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 's4', source: 'dir', target: 'rou', sourceHandle: 'bottom-source', targetHandle: 'top', ...style },
  { id: 's5', source: 'dir', target: 'act', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 's6', source: 'act', target: 'a1', sourceHandle: 'right-source', targetHandle: 'top', ...style2 },
  { id: 's7', source: 'act', target: 'a2', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 's8', source: 'act', target: 'a3', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 's9', source: 'rou', target: 'sv', sourceHandle: 'bottom-source', targetHandle: 'top', ...style }
]
</script>

# Template System Architecture

The boilerplate includes a **powerful, zero-dependency template engine** that generates complete CRUD domains in seconds. Unlike traditional code generators that use string concatenation or external libraries, this system uses **native TypeScript files as templates** with intelligent placeholder replacement.

## Overview

The template system is designed with three core principles:
1. **Zero Dependencies**: No external template libraries (Handlebars, EJS, etc.)
2. **Developer Experience**: Templates are valid TypeScript files with full IDE support
3. **Extensibility**: Easy to add new generators (Auth, WebSockets, etc.)

## Architecture

<InteractiveFlow :nodes="archNodes" :edges="archEdges" />

## Template Directory Structure

Templates are organized in `src/templates/domain/` and mirror the output structure:

```
src/templates/domain/
├── entity.ts              # Database table definition
├── schema.ts              # Zod validation schemas
├── routes.ts              # Fastify route handlers
└── actions/
    ├── get-by-id.ts       # Find by ID action
    ├── get-find-by-params.ts  # Search with filters
    ├── post-new-entity.ts     # Create new record
    ├── put-update-entity.ts   # Update existing
    └── delete-entity.ts       # Delete record
```

## Why TypeScript Templates?

Instead of using `.hbs` or `.ejs` files (which require extensions for syntax highlighting), we use **valid TypeScript files** with special placeholders.

### Before (Template)
```typescript
// src/templates/domain/entity.ts
const __name__ = pgTable("__name__", { ...columns, ...identifier });
export default __name__;
```

### After Generation
```typescript
// src/domain/pokemon/entity.ts (after bun gen:domain pokemon)
const pokemon = pgTable("pokemon", { ...columns, ...identifier });
export default pokemon;
```

### Benefits

| Feature | TypeScript Templates | Traditional (.hbs/.ejs) |
|---------|---------------------|------------------------|
| **Syntax Highlighting** | ✅ Native in IDE | ❌ Requires extension |
| **Auto-formatting** | ✅ Biome/Prettier works | ❌ Manual formatting |
| **Type Checking** | ✅ Catch errors early | ❌ Runtime errors only |
| **Dependencies** | ✅ Zero | ❌ Requires library |
| **Learning Curve** | ✅ Just TypeScript | ⚠️ New syntax to learn |

## Generation Flow

<InteractiveFlow :nodes="genNodes" :edges="genEdges" />

## Placeholder System

The template engine uses a simple regex-based replacement:

| Placeholder | Example Input | Output | Usage |
|-------------|---------------|--------|-------|
| `__name__` | `pokemon` | `pokemon` | Variable names, table names, lowercase references |
| `__Capitalized__` | `pokemon` | `Pokemon` | Class names, display labels, OpenAPI tags |

### Implementation

The entire rendering engine is just 3 lines of code:

```typescript
const render = (content: string, vars: Record<string, string>) =>
  content
    .replace(/__name__/g, vars.name)
    .replace(/__Capitalized__/g, vars.capitalized);
```

**Why this works:**
- `__name__` is a valid JavaScript identifier (no syntax errors)
- Global regex replacement (`/g` flag) handles all occurrences
- No parsing or AST manipulation needed

## What Gets Generated

Running `bun gen:domain product` creates a complete, production-ready CRUD module:

<InteractiveFlow :nodes="structNodes" :edges="structEdges" />


### Generated Files

- **`entity.ts`**: Drizzle ORM table definition with columns, indexes, and types
- **`schema.ts`**: Zod schemas for validation (create, update, read, delete)
- **`routes.ts`**: 5 Fastify routes (GET, POST, PUT, DELETE) with OpenAPI docs
- **`actions/`**: Business logic for each operation with caching and error handling

## Automatic Route Registration

The generator intelligently injects the new routes into your webserver:

**Before:**
```typescript
// src/functions/http-primary-webserver.ts
import userRoutes from "@domain/user/routes";

const server = await webserver.create();
server.register(userRoutes, { prefix: "/api/v1/users" });
```

**After `bun gen:domain pokemon`:**
```typescript
// src/functions/http-primary-webserver.ts
import userRoutes from "@domain/user/routes";
import pokemonRoutes from "@domain/pokemon/routes";  // ← Auto-added

const server = await webserver.create();
server.register(userRoutes, { prefix: "/api/v1/users" });
server.register(pokemonRoutes, { prefix: "/api/v1/pokemons" });  // ← Auto-added
```

### Injection Algorithm

The generator uses a simple string manipulation approach:

1. **Find last import**: Search for `lastIndexOf("import ")`
2. **Insert new import**: Add after the last import line
3. **Find last register**: Search for `lastIndexOf("server.register(")`
4. **Insert new register**: Add after the last register call

This approach is:
- ✅ Simple and reliable
- ✅ Doesn't require AST parsing
- ✅ Works with any code style
- ⚠️ Assumes consistent patterns (which the boilerplate enforces)

## Extending the Template System

The architecture is designed to scale from simple CRUD to complex plugin systems.

### Adding New Generators

Want to add authentication or WebSocket support? Just create new templates:

```bash
src/templates/
├── domain/          # Existing CRUD templates
├── auth/            # New: Authentication templates
│   ├── middleware.ts
│   ├── jwt-service.ts
│   └── routes.ts
└── websocket/       # New: WebSocket templates
    ├── handler.ts
    └── events.ts
```

Then create a new generator command:

```typescript
// src/commands/generate-auth.ts
const templates = {
  middleware: await loadTemplate("auth/middleware.ts"),
  service: await loadTemplate("auth/jwt-service.ts"),
  routes: await loadTemplate("auth/routes.ts"),
};

// Render and write files...
```

### Using Anchors for Complex Injection

For more complex scenarios (like injecting middleware into existing files), use **comment anchors**:

```typescript
// src/functions/http-primary-webserver.ts
const server = await webserver.create();

// [CLI:Inject_Middleware]
// Generators can search for this comment and inject code below it

server.register(userRoutes, { prefix: "/api/v1/users" });
```

Generator code:
```typescript
const anchorIndex = content.indexOf("// [CLI:Inject_Middleware]");
const insertPoint = content.indexOf("\n", anchorIndex) + 1;
content = content.slice(0, insertPoint) + newMiddleware + content.slice(insertPoint);
```

## Best Practices

### Template Design

1. **Keep templates valid TypeScript**: Ensures IDE support and type checking
2. **Use descriptive placeholders**: `__name__` is clear, `__x__` is not
3. **Include comments**: Explain complex logic in templates
4. **Test templates**: Generate a test domain and verify output

### Generator Design

1. **Validate input**: Check domain name format before generation
2. **Handle errors gracefully**: What if file already exists?
3. **Provide feedback**: Show what was created and next steps
4. **Auto-format output**: Always run Biome after generation

### Maintenance

1. **Version templates**: Consider git-tagging template versions
2. **Document changes**: Update this Wiki when templates change
3. **Test after updates**: Regenerate a test domain after template edits

## Troubleshooting

### Templates not found

**Error:** `ENOENT: no such file or directory`

**Solution:** Ensure templates exist in `src/templates/domain/`

### Placeholder not replaced

**Error:** Generated file contains `__name__` instead of actual name

**Solution:** Check the `render()` function is being called with correct variables

### Route not auto-injected

**Error:** New domain works but route not in webserver

**Solution:** Verify `http-primary-webserver.ts` follows expected pattern (imports at top, registers after `webserver.create()`)

## Future Enhancements

Potential improvements to the template system:

1. **Interactive Mode**: Prompt for column types during generation
2. **Template Variants**: Choose between REST, GraphQL, or gRPC templates
3. **Custom Hooks**: Allow users to define pre/post generation scripts
4. **Template Marketplace**: Share community templates
5. **Migration Generator**: Auto-generate Drizzle migrations from templates

---

**See Also:**
- [Domain Scaffolding (Generator)](/development/domain-scaffolding) - How to use the generator
- [Architecture](/architecture/) - Overall project structure
- [Best Practices](/development/best-practices) - Coding standards
