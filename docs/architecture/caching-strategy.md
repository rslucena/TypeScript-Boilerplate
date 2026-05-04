---
title: Caching Strategy
description: Deep dive into the Smart Caching implementation and Namespace Invalidation
---

# Caching Strategy

The TypeScript Boilerplate features a sophisticated **Smart Caching** system built on top of Redis. It prioritizes performance, high availability, and data consistency through advanced invalidation patterns.

## Architectural Overview

The system uses a **Cache-aside (Lazy Loading)** pattern combined with a custom **Namespace Management** layer using Redis Sets.

<script setup>
import { MarkerType } from '@vue-flow/core'

const cacheNodes = [
  { id: 'app', label: 'Application Logic', position: { x: 50, y: 150 }, style: { background: '#3b82f6', color: '#fff' } },
  { id: 'cache-layer', label: 'Cache Action Layer', position: { x: 350, y: 150 }, style: { border: '2px solid #3b82f6' } },
  { id: 'redis-sets', label: 'Redis (Namespace Sets)', position: { x: 650, y: 50 }, style: { background: '#ef4444', color: '#fff' } },
  { id: 'redis-keys', label: 'Redis (Data Keys)', position: { x: 650, y: 250 }, style: { background: '#ef4444', color: '#fff' } }
]

const cacheEdges = [
  { id: 'e1', source: 'app', target: 'cache-layer', label: '1. cache.set(key, val)', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2', source: 'cache-layer', target: 'redis-sets', label: '2. SADD namespace:keys key', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e3', source: 'cache-layer', target: 'redis-keys', label: '3. SET key val', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e4', source: 'app', target: 'cache-layer', label: '4. cache.del(namespace/*)', position: { x: 200, y: 300 }, style: { stroke: '#ef4444' }, markerEnd: MarkerType.ArrowClosed },
  { id: 'e5', source: 'cache-layer', target: 'redis-sets', label: '5. SMEMBERS -> DEL keys', sourceHandle: 'right', targetHandle: 'left', style: { stroke: '#ef4444' }, markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="cacheNodes" :edges="cacheEdges" />

## Key Features

### Hierarchical Invalidation
The system now supports **Hierarchical Invalidation**. When a key is stored, it is automatically indexed in all its parent namespaces.
- Key: `api/v1/users/profile/{id:123}`
- Parent Namespaces: `api`, `api/v1`, `api/v1/users`, `api/v1/users/profile`.

This allows for broad invalidations like `del('api/v1/*')` to correctly purge all nested keys across different sub-paths.

### 2. Graceful Degradation
The system is built to be resilient. If the Redis server goes down:
- The API will **not** throw errors.
- `cache.get()` will return `null`, falling back to the database.
- `cache.set()` and `cache.del()` calls will resolve silently.
- Performance will decrease (higher DB load), but **availability is preserved**.

### 3. Redis Stack Support
The boilerplate automatically detects if **Redis Stack** is available (via `REDIS_STACK=true`).
- If enabled, it uses `JSON.SET` and `JSON.GET` for native JSON support.
- If disabled, it transparently falls back to `SET` with stringification.

## Implementation Details

### Namespace Auto-Detection
The namespace is automatically extracted from the key. If the key contains curly braces (e.g., `user{123}`), the part before `{` is used as the namespace. Otherwise, the key itself acts as the primary namespace reference.

### Stale Key Management
When a key expires via **TTL**, it remains in the Redis Set until the next pattern-based deletion. This is a deliberate design choice to minimize write-heavy set cleanups. The `get` implementation manually verifies key existence to ensure no stale data is returned.

---

**See Also:**
- [Cache Actions Reference](/reference/cache-actions-reference) - API documentation
- [Getting Started](/guide/getting-started) - How to configure Redis
