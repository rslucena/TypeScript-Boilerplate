---
title: Architecture Overview
description: Project architecture and design principles
---

# Architecture Overview

This project follows a clean, modular architecture inspired by Domain-Driven Design (DDD) principles, focused on performance and developer productivity using TypeScript and Bun.

<script setup>
import { MarkerType } from '@vue-flow/core'
const style = { type: 'smoothstep', style: {stroke: 'var(--vp-code-line-diff-add-symbol-color)', strokeWidth: 1}, animated: true, markerEnd: MarkerType.ArrowClosed }
const style2 = { type: 'smoothstep', style: {stroke: 'var(--vp-code-color)', strokeWidth: 1}, animated: true, markerEnd: MarkerType.ArrowClosed }

const techNodes = [
  { id: 'bun', type: 'multi-handle', label: 'Bun', position: { x: 100, y: 0 } },
  { id: 'fastify', type: 'multi-handle', label: 'Fastify', position: { x: 100, y: 100 } },
  { id: 'swag', type: 'multi-handle', label: 'Swagger', position: { x: -50, y: 200 } },
  { id: 'zod', type: 'multi-handle', label: 'Zod', position: { x: 100, y: 200 } },
  { id: 'driz', type: 'multi-handle', label: 'Drizzle', position: { x: 250, y: 200 } },
  { id: 'pg', type: 'multi-handle', label: 'Postgres', position: { x: 250, y: 300 } },
  { id: 'redis', type: 'multi-handle', label: 'Redis', position: { x: 400, y: 100 } }
]

const techEdges = [
  { id: 'e1', source: 'bun', target: 'fastify', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 'e2', source: 'fastify', target: 'swag', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 'e3', source: 'fastify', target: 'zod', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 'e4', source: 'fastify', target: 'driz', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 'e5', source: 'driz', target: 'pg', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 'e6', source: 'fastify', target: 'redis', sourceHandle: 'right-source', targetHandle: 'left', ...style2 }
]

const layerNodes = [
  { id: 'cmd', type: 'multi-handle', label: 'Commands', position: { x: 0, y: 0 } },
  { id: 'dom', type: 'multi-handle', label: 'Domain', position: { x: 200, y: 0 } },
  { id: 'infra', type: 'multi-handle', label: 'Infrastructure', position: { x: 400, y: 0 } },
  { id: 'fn', type: 'multi-handle', label: 'Functions', position: { x: 200, y: 150 } }
]

const layerEdges = [
  { id: 'l1', source: 'cmd', target: 'dom', sourceHandle: 'right-source', targetHandle: 'left', ...style2 },
  { id: 'l2', source: 'dom', target: 'infra', sourceHandle: 'right-source', targetHandle: 'left', ...style2 },
  { id: 'l3', source: 'dom', target: 'fn', sourceHandle: 'bottom-source', targetHandle: 'top', ...style2 },
  { id: 'l4', source: 'cmd', target: 'infra', sourceHandle: 'bottom-source', targetHandle: 'bottom', ...style2 }
]

const reqNodes = [
  { id: 'user', type: 'multi-handle', label: 'User', position: { x: 0, y: 0 } },
  { id: 'server', type: 'multi-handle', label: 'Server (Infra)', position: { x: 200, y: 0 } },
  { id: 'route', type: 'multi-handle', label: 'Route (Domain)', position: { x: 400, y: 0 } },
  { id: 'action', type: 'multi-handle', label: 'Action', position: { x: 430, y: 150 } },
  { id: 'db', type: 'multi-handle', label: 'Database', position: { x: 426, y: 300 } }
]

const reqEdges = [
  { id: 'r1', source: 'user', target: 'server', sourceHandle: 'right-source', targetHandle: 'left', label: 'HTTP', ...style2 },
  { id: 'r2', source: 'server', target: 'route', sourceHandle: 'right-source', targetHandle: 'left', label: 'Dispatch', ...style2 },
  { id: 'r3', source: 'route', target: 'action', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'Execute', ...style2 },
  { id: 'r4', source: 'action', target: 'db', sourceHandle: 'right-source', targetHandle: 'right', label: 'Query', ...style2 },
  { id: 'r5', source: 'db', target: 'action', sourceHandle: 'top-source', targetHandle: 'bottom', label: 'Result', ...style },
  { id: 'r6', source: 'action', target: 'user', sourceHandle: 'left-source', targetHandle: 'bottom', label: 'Response', ...style2 }
]

const roadmapNodes = [
  { id: 'rd1', type: 'multi-handle', label: 'Core Architecture', position: { x: 0, y: 0 } },
  { id: 'rd2', type: 'multi-handle', label: 'Enhanced Plugins', position: { x: 0, y: 150 } },
  { id: 'rd3', type: 'multi-handle', label: 'Advanced Observability', position: { x: 0, y: 300 } },
  { id: 'rd4', type: 'multi-handle', label: 'Cloud Native', position: { x: 0, y: 450 } }
]

const roadmapEdges = [
  { id: 're1', source: 'rd1', target: 'rd2', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Implemented', ...style },
  { id: 're2', source: 'rd2', target: 'rd3', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Implemented/WIP', ...style2, animated: true },
  { id: 're3', source: 'rd3', target: 'rd4', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Planned', ...style2 }
]
</script>

## Technology Stack

<InteractiveFlow :nodes="techNodes" :edges="techEdges" />

## Layer Overview

<InteractiveFlow :nodes="layerNodes" :edges="layerEdges" />

### 1. Commands (`src/commands/`)
The entry point of the application. It handles process management (via PM2), building, and bootstrapping. It also hosts the **Zero-Dep Template Engine** for domain scaffolding.

### 2. Domain (`src/domain/`)
The heart of the application. Each subfolder (e.g., `user`) represents a bounded context and contains:
- **actions**: The actually business logic handlers.
- **entity**: Data models and database table definitions.
- **schema**: Input validation and output serialization using Zod.
- **routes**: Fastify route definitions.

### 3. Infrastructure (`src/infrastructure/`)
Contains implementation details of technical services:
- **Server**: [Fastify (HTTP)](/servers/http-server) and [WebSockets (Scalable)](/servers/websockets) configurations.
- **Cache**: Redis integration for high-performance data storage with **Graceful Degradation** for high availability.
- **Repository**: Database connection and base repository patterns.
- **Messages**: Communication layer (distributed via Redis or internal via Node events).
- **Plugins**: Agent system for modular extensions (e.g., Authentication).

## Request Flow

When an HTTP request arrives, it follows this path:

1. **Fastify Server** (Infrastructure) receives the request.
2. **Request Transform** converts raw data and identifies the language/token.
3. **Route** (Domain) matches the path and calls the appropriate **Action**.
4. **Action** (Domain) validates input using **Schema** (Domain/Zod).
5. **Action** interacts with **Repository** or **Cache** (Infrastructure) to fetch/persist data.
6. **Action** returns the response, which is then serialized by the **Route**.

<InteractiveFlow :nodes="reqNodes" :edges="reqEdges" />

## Future Roadmap

We are constantly evolving the boilerplate to provide the best developer experience. Here is our current roadmap:

<InteractiveFlow :nodes="roadmapNodes" :edges="roadmapEdges" />

### Phase 1: Core Architecture (Completed)
- [x] Zero-Dep Template Engine
- [x] Auto-CRUD Scaffolding
- [x] Redis-powered Smart Caching
- [x] i18n support

### Phase 2: Enhanced Plugins ( In Progress)
- [x] Redis Graceful Degradation
- [x] Real-time WebSocket plugin (Scalable via Redis)
- [ ] Advanced Authentication (OAuth2, OIDC)
- [ ] Distributed Locking system

### Phase 3: Advanced Observability (Planned)
- [ ] OpenTelemetry integration
- [ ] Structured logging with automatic trace correlation
- [ ] Performance monitoring dashboard

### Phase 4: Cloud Native (Planned)
- [ ] Kubernetes operators for domain scaling
- [ ] Serverless deployment adapters
- [ ] Edge runtime optimization
