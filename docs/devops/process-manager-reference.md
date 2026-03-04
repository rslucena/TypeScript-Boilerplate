---
title: Process Manager & Builder
description: DevOps guide on the programmatic PM2 worker system and the custom ESBuild/TSUP bundler.
---

# Process Manager & Builder

Behind the scenes, the Boilerplate uses a highly optimized programmatic approach to build, bundle, and serve your application. Rather than relying on simple `npm scripts` hitting global CLI tools, the deployment logic is controlled via TypeScript.

All DevOps commands reside in `src/commands/`.

## Architecture Flow

<script setup>
import { MarkerType } from '@vue-flow/core'

const styleDev = { type: 'smoothstep', style: {stroke: '#8B5CF6'}, animated: true, markerEnd: MarkerType.ArrowClosed }
const styleProd = { type: 'smoothstep', style: {stroke: '#F59E0B'}, animated: true, markerEnd: MarkerType.ArrowClosed }
const styleSuccess = { type: 'smoothstep', style: {stroke: '#10B981'}, animated: true, markerEnd: MarkerType.ArrowClosed }

const pmNodes = [
  { id: 'start', type: 'multi-handle', label: 'Execute Server', position: { x: 0, y: 150 } },
  { id: 'enum', type: 'multi-handle', label: 'Environment?', position: { x: 200, y: 150 } },
  { id: 'dev', type: 'multi-handle', label: 'Native Spawn', position: { x: 400, y: 50 } },
  { id: 'bun', type: 'multi-handle', label: 'bun --watch', position: { x: 650, y: 50 } },
  { id: 'tsup', type: 'multi-handle', label: 'Builder AST', position: { x: 400, y: 250 } },
  { id: 'pm2', type: 'multi-handle', label: 'PM2 Daemon', position: { x: 650, y: 250 } },
  { id: 'w1', type: 'multi-handle', label: 'Worker 1', position: { x: 900, y: 200 } },
  { id: 'w2', type: 'multi-handle', label: 'Worker 2', position: { x: 900, y: 300 } },
  { id: 'up', type: 'multi-handle', label: 'Uptime Kuma', position: { x: 1150, y: 250 } }
]

const pmEdges = [
  { id: 'e1', source: 'start', target: 'enum', sourceHandle: 'right-source', targetHandle: 'left' },
  { id: 'e2', source: 'enum', target: 'dev', sourceHandle: 'top-source', targetHandle: 'left', label: 'NODE_ENV=development', ...styleDev },
  { id: 'e3', source: 'dev', target: 'bun', sourceHandle: 'right-source', targetHandle: 'left', ...styleDev },
  { id: 'e4', source: 'enum', target: 'tsup', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'NODE_ENV=production', ...styleProd },
  { id: 'e5', source: 'tsup', target: 'pm2', sourceHandle: 'right-source', targetHandle: 'left', ...styleProd },
  { id: 'e6', source: 'pm2', target: 'w1', sourceHandle: 'right-source', targetHandle: 'left', ...styleProd },
  { id: 'e7', source: 'pm2', target: 'w2', sourceHandle: 'right-source', targetHandle: 'left', ...styleProd },
  { id: 'e8', source: 'w1', target: 'up', sourceHandle: 'right-source', targetHandle: 'left', label: 'Heartbeat', ...styleSuccess },
  { id: 'e9', source: 'w2', target: 'up', sourceHandle: 'right-source', targetHandle: 'left', label: 'Heartbeat', ...styleSuccess }
]
</script>

<InteractiveFlow :nodes="pmNodes" :edges="pmEdges" />

---

## 1. The TSUP Dynamic Builder (`exec-builder.ts`)

Instead of compiling the entire `src/` directory verbatim, the project uses a smart compiler built on top of the TypeScript Compiler API (`ts.createProgram`) and `tsup` (esbuild).

### How it works
When you build the project for production, `exec-builder.ts`:
1. **Reads** the entry points defined in your PM2 Workspace (e.g., the HTTP server and the WebSocket server).
2. **Walks the AST (Abstract Syntax Tree)** of your code to discover exactly which files are imported.
3. **Ignores** files that are never imported (Dead Code Elimination at the project scope).
4. **Bundles and Minifies** the exact dependency tree into optimized `esm` files inside `/dist`, dropping development layers and applying `.env` specific tweaks.

---

## 2. Programmatic Process Management

The project controls PM2 via its Node.js API (`pm2-workers.ts`), rather than using the `ecosystem.config.js` file common in legacy projects. This allows dynamic adjustments based on the runtime (`Bun` vs `Node`).

### The Workspace (`pm2-workspace.ts`)

This file is the single source of truth for the services that run on your server.

```typescript
export default (<worker[]>[
	{
		activated: true,
		group: "primary",
		name: "primary-webserver",
		tsx: "./src/functions/http-primary-webserver.ts", // Dev Entry
		bun: "./dist/functions/http-primary-webserver.js", // Prod Entry
        // ... configs
		heartbeat: `${env.UPTIME_SERVER}:${env.UPTIME_PORT}/api/push/xyVlTFF...`,
	}
]);
```

Each "worker" defines an entry point. You can add more workers here, such as a dedicated RabbitMQ consumer or a background Cron job instance.

### Development vs Production Mode

The `pm2-workers.ts` script automatically detects your environment:
- **Development (`dev`)**: PM2 is bypassed. The script uses native Node `spawn()` to launch `bun --watch` or `tsx watch`, attaching directly to `stdio` for instant console feedback.
- **Production**: It connects to the local PM2 daemon, forks the processes using `bun` as the interpreter, and begins monitoring.

### Remote Control & Uptime Kuma

The programmatic PM2 integration includes two advanced features:
1. **Heartbeat/Uptime Kuma**: When a worker starts successfully on production, it can fire a `fetch()` request to an external Uptime Kuma push URL, confirming the node is completely alive.
2. **Distributed Restart**: The PM2 script subscribes to Redis pub/sub (`workers:server:restart`). This means you can trigger an internal API that publishes to Redis, and PM2 will gracefully restart specific workers across the system without touching the terminal.
