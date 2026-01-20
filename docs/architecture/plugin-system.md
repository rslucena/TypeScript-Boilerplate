---
title: Plugins & Agents System
description: Plugin/Agent System overview
---

# Plugins & Agents System

The boilerplate introduces a **Plugin/Agent System** to handle cross-cutting concerns and feature extensions in a modular way. This allows you to "plug in" functionality like authentication, logging, or other middleware-like behaviors without cluttering the core request handling logic.

## Concept

- **Agent**: A category consisting of one or more plugins (e.g., `authentication`).
- **Plugin**: A specific implementation of a strategy (e.g., `JWT`, `OAuth`).
- **Container**: The context passed to plugins, containing the request state (headers, body, etc.).

## Configuration

Plugins are configured in `src/infrastructure/settings/plugins.ts`. Each plugin can be toggled `active` and assigned a `priority`.

```typescript
// src/infrastructure/settings/plugins.ts
import jwt from "@infrastructure/authentication/strategies/jwt";

export default {
    authentication: {
        JWT: {
            priority: 1,      // Lower numbers run first
            active: true,     // Enable/Disable
            strategy: jwt.session, // The function to execute
        },
    },
}
```

## Request Flow

When a request is marked as `restricted` (requiring authentication/plugins), the system iterates through active plugins for the `authentication` agent, sorted by priority.

<script setup>
import { MarkerType } from '@vue-flow/core'

const pluginNodes = [
  { id: 's', type: 'multi-handle', label: 'Server', position: { x: 0, y: 100 } },
  { id: 'h', type: 'multi-handle', label: 'Auth Handler', position: { x: 250, y: 100 }},
  { id: 'p', type: 'multi-handle', label: 'Plugin Mgr', position: { x: 250, y: 0 } },
  { id: 'jwt', type: 'multi-handle', label: 'JWT Strategy', position: { x: 500, y: 0 } },
  { id: 'c', type: 'multi-handle', label: 'Session', position: { x: 500, y: 200 }}
]

const pluginEdges = [
  { id: 'p1', source: 's', target: 'h', sourceHandle: 'right-source', targetHandle: 'left', label: 'Authenticate', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'p2', source: 'h', target: 'p', sourceHandle: 'top-source', targetHandle: 'bottom', label: 'Get Plugins', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'p3', source: 'p', target: 'jwt', sourceHandle: 'right-source', targetHandle: 'left', label: 'Execute', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'p4', source: 'jwt', target: 'h', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'Return Data', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'p5', source: 'h', target: 'c', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Set Session', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'p6', source: 'h', target: 's', sourceHandle: 'left-source', targetHandle: 'right', label: 'Proceed/401', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="pluginNodes" :edges="pluginEdges" />

## How to Add a New Plugin

1.  **Define the Strategy**: Create a function that accepts a `container` and returns data or throws an error.
2.  **Register**: Add it to `src/infrastructure/settings/plugins.ts`.
3.  **Use**: The data returned by the strategy is available in `request.session()`.

### Example Strategy

```typescript
async function myCustomAuth(request: container) {
    const key = request.headers()["x-api-key"];
    if (key === "secret") return { user: "admin" };
    throw new Error("Invalid Key");
}
```
