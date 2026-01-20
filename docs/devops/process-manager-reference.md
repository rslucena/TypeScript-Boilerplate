---
title: Process Manager Reference
description: PM2 process management reference
---

# Process Manager Reference

This document describes the functions available for executing and managing processes.

## Types
- **Workspace** _Settings for all workers_
- **Worker** _Process settings_

## Process Flow

<script setup>
import { MarkerType } from '@vue-flow/core'

const processNodes = [
  { id: 'user', type: 'multi-handle', label: 'User Terminal', position: { x: 0, y: 75 } },
  { id: 'watch', type: 'multi-handle', label: 'bun watch', position: { x: 200, y: 25 } },
  { id: 'run', type: 'multi-handle', label: 'bun dist/...', position: { x: 200, y: 125 } },
  { id: 'exec', type: 'multi-handle', label: 'exec-process.ts', position: { x: 400, y: 75 } },
  { id: 'env', type: 'multi-handle', label: '.env', position: { x: 550, y: 0 } },
  { id: 'pm2', type: 'multi-handle', label: 'PM2 Manager', position: { x: 550, y: 150 } },
  { id: 'api', type: 'multi-handle', label: 'API Worker', position: { x: 750, y: 100 } },
  { id: 'bg', type: 'multi-handle', label: 'Bg Worker', position: { x: 750, y: 200 } }
]

const processEdges = [
  { id: 'e1', source: 'user', target: 'watch', sourceHandle: 'right-source', targetHandle: 'left', label: 'bun dev', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2', source: 'user', target: 'run', sourceHandle: 'right-source', targetHandle: 'left', label: 'bun start', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e3', source: 'watch', target: 'exec', sourceHandle: 'right-source', targetHandle: 'left', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e4', source: 'run', target: 'exec', sourceHandle: 'right-source', targetHandle: 'left', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e5', source: 'exec', target: 'env', sourceHandle: 'top-source', targetHandle: 'left', label: 'Load Config', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e6', source: 'exec', target: 'pm2', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Init', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e7', source: 'pm2', target: 'api', sourceHandle: 'right-source', targetHandle: 'left', label: 'Spawn', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e8', source: 'pm2', target: 'bg', sourceHandle: 'right-source', targetHandle: 'left', label: 'Spawn', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="processNodes" :edges="processEdges" />

## Worker configs: 
```typescript
export interface worker {
  tsx: string
  node: string
  bun: string
  name: string
  group: string
  activated: boolean
  heartbeat: string
  options: Omit<pm2.StartOptions, 'name' | 'script'>
}

const defaultConfigs: pm2.StartOptions = {
  force: true,
  max_restarts: 5,
  exec_mode: 'fork',
  autorestart: true,
  interpreter: 'bun',
  max_memory_restart: '100M',
  ignore_watch: ['node_modules'],
}
```

## Methods: 
```typescript
  dev: Promise<void>
  start: Promise<void>
```

### dev 
_bun --watch src/commands/exec-process.ts_ 
`Returns: Promise void.`

The `bun` runner will watch the project files for any changes and automatically restart the process using the entry point `exec-process.ts`. In development mode, the system efficiently manages worker processes, ensuring that file changes trigger immediate reloads and that all child processes are properly cleaned up on exit (SIGINT/SIGTERM support).

**Parameters**
```command
--workers={nameworker}
--group={namegroup}
```

**Detail**

- **bun**: The high-performance runtime and package manager used.

- **watch**: Instructs the runner to observe the project files and automatically restart.

- **workers**: Starts a specific worker by name (e.g., `primary-webserver`).

- **group**: Starts all workers belonging to a group (e.g., `primary`).

Example:
```command
 bun dev --workers=primary-webserver
 bun dev --group=primary
```

### start
_bun dist/commands/exec-process.js_ 
`Returns: Promise void.`

Runs the process in production mode using the Bun runtime and the pre-built files.

**Parameters**
```command
--workers={nameworker}
--group={namegroup}
```

Example:
```command
 bun start --group=primary
 bun start # Falls back to --group=primary automatically if no group/worker specified
```

> For the 'start' command to work, you must first carry out the 'build' process:
> ```command
>  bun build
> ```

If neither the 'workers' nor the 'group' parameter is defined in production, it will automatically fallback to `--group=primary`.
