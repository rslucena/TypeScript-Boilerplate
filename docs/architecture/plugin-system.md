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
  { id: 's', type: 'multi-handle', label: 'Server', position: { x: 0, y: 150 } },
  { id: 'h', type: 'multi-handle', label: 'Auth Handler', position: { x: 250, y: 150 }},
  { id: 'p', type: 'multi-handle', label: 'Plugin Mgr', position: { x: 260, y: 0 } },
  { id: 'jwt', type: 'multi-handle', label: 'JWT Strategy', position: { x: 500, y: 0 } },
  { id: 'c', type: 'multi-handle', label: 'Session', position: { x: 500, y: 250 }}
]

const pluginEdges = [
  { id: 'p1', source: 's', target: 'h', sourceHandle: 'right-source', targetHandle: 'left', label: 'Authenticate', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'p2', source: 'h', target: 'p', sourceHandle: 'top-source', targetHandle: 'bottom', label: 'Get Plugins', type: 'smoothstep', animated: true,markerEnd: MarkerType.ArrowClosed },
  { id: 'p3', source: 'p', target: 'jwt', sourceHandle: 'right-source', targetHandle: 'left', label: 'Execute', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'p4', source: 'jwt', target: 'h', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'Return Data', type: 'smoothstep',animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'p5', source: 'h', target: 'c', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Set Session', type: 'smoothstep',animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'p6', source: 'h', target: 's', sourceHandle: 'left-source', targetHandle: 'right', label: 'Proceed/401', type: 'smoothstep',animated: true, markerEnd: MarkerType.ArrowClosed }
]

const styleDev = { type: 'smoothstep', style: {stroke: '#8B5CF6'}, animated: true, markerEnd: MarkerType.ArrowClosed }
const styleProd = { type: 'smoothstep', style: {stroke: '#F59E0B'}, animated: true, markerEnd: MarkerType.ArrowClosed }
const styleCore = { type: 'smoothstep', style: {stroke: '#3B82F6'}, animated: true, markerEnd: MarkerType.ArrowClosed }
const styleSuccess = { type: 'smoothstep', style: {stroke: '#10B981'}, animated: true, markerEnd: MarkerType.ArrowClosed }
const styleError = { type: 'smoothstep', style: {stroke: '#EF4444'}, animated: true, markerEnd: MarkerType.ArrowClosed }

const seqNodes = [
  { id: 'c', type: 'multi-handle', label: 'Client Request', position: { x: 0, y: 150 } },
  { id: 'f', type: 'multi-handle', label: 'Fastify Hook', position: { x: 250, y: 150 } },
  { id: 'mgr', type: 'multi-handle', label: 'plugins.ts', position: { x: 500, y: 150 } },
  { id: 'api', type: 'multi-handle', label: 'API Key Strategy', position: { x: 750, y: 50 } },
  { id: 'jwt', type: 'multi-handle', label: 'JWT Strategy', position: { x: 750, y: 250 } },
  { id: 'inj', type: 'multi-handle', label: 'Inject Session', position: { x: 1000, y: 150 } },
  { id: 'fail', type: 'multi-handle', label: '401 Unauthorized', position: { x: 750, y: 400 } },
  { id: 'proc', type: 'multi-handle', label: 'Proceed Action', position: { x: 1250, y: 150 } }
]

const seqEdges = [
  { id: 's1', source: 'c', target: 'f', sourceHandle: 'right-source', targetHandle: 'left', label: 'x-api-key', ...styleCore },
  { id: 's2', source: 'f', target: 'mgr', sourceHandle: 'right-source', targetHandle: 'left', label: 'Trigger', ...styleCore },
  { id: 's3', source: 'mgr', target: 'api', sourceHandle: 'top-source', targetHandle: 'left', label: 'Priority 1', ...styleDev },
  { id: 's4', source: 'mgr', target: 'jwt', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Priority 2', ...styleProd },
  { id: 's5', source: 'api', target: 'inj', sourceHandle: 'right-source', targetHandle: 'top', label: 'Valid Key', ...styleSuccess },
  { id: 's6', source: 'api', target: 'jwt', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'Invalid', ...styleError },
  { id: 's7', source: 'jwt', target: 'inj', sourceHandle: 'right-source', targetHandle: 'bottom', label: 'Valid Token', ...styleSuccess },
  { id: 's8', source: 'jwt', target: 'fail', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'Invalid', ...styleError },
  { id: 's9', source: 'inj', target: 'proc', sourceHandle: 'right-source', targetHandle: 'left', ...styleSuccess }
]
</script>

<InteractiveFlow :nodes="pluginNodes" :edges="pluginEdges" />

## How to Add a New Authentication Plugin

O Boilerplate foi desenhado para aceitar N métodos de autenticação simultâneos sem poluir o Core do Fastify. A classe `authentication.ts` irá lidar com todas as estratégias registradas e injetar no request a primeira que retornar sucesso.

### 1. Define the Strategy
Create a function inside `infrastructure/authentication/strategies/` that accepts the Fastify `container` and either returns the user payload or throws an error.

```typescript
// src/infrastructure/authentication/strategies/api-key.ts
import type { container } from "@infrastructure/server/interface";

export async function verifyApiKey(request: container) {
	const key = request.headers()["x-api-key"];
	if (key === process.env.SECRET_API_KEY) {
		return { role: "admin", type: "api-key" };
	}
	throw new Error("Invalid or Missing API Key");
}
```

### 2. Register the Plugin
Injete a sua nova estratégia no "Ecosystem" passivo localizado em `src/infrastructure/settings/plugins.ts`. O campo `name` no objeto determina a chave que será acessível na sessão.

```typescript
// src/infrastructure/settings/plugins.ts
import * as jwt from "@infrastructure/authentication/jwt";
import { verifyApiKey } from "@infrastructure/authentication/strategies/api-key";

export default {
	authentication: {
		// Existing JWT Strategy
		JWT: {
			priority: 2, 
			active: true,
			strategy: jwt.session,
		},
		// Your new Custom Strategy
		API_KEY: {
			priority: 1, // Will run BEFORE JWT (Lower number first)
			active: true, 
			strategy: verifyApiKey,
		}
	},
}
```

### 3. Accessing the Data
The `authentication.ts` module runs sorting by `priority`. If your `API_KEY` returns successfully, the request is instantly authenticated.

You can retrieve the result inside your Domain Actions via the `.session()` method:

```typescript
// Inside any restricted action
export default async function myAction(request: container) {
   const sessionData = request.session();
   
   if (sessionData.API_KEY) {
	   console.log("Authenticated via API Key:", sessionData.API_KEY.role);
   } else if (sessionData.JWT) {
	   console.log("Authenticated via JWT Token:", sessionData.JWT.email);
   }
}
```

### Middleware Sequence Flow

This is how the `src/infrastructure/server/authentication.ts` orchestrates the login passively:

<InteractiveFlow :nodes="seqNodes" :edges="seqEdges" />
