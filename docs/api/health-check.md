---
title: Health Check API Reference
description: API reference for liveness and readiness probes used in Docker and Kubernetes orchestrations.
---

# Health Check API Reference

The Boilerplate includes a robust Native Health domain (`src/domain/health/`) designed to provide deep observability into the application's runtime state.

These endpoints are crucial when deploying the application to container orchestrators like **Kubernetes** or **Docker Swarm**, as they dictate whether traffic should be routed to a specific instance or if the container needs to be restarted.

---

## Readiness Probe Diagram

<script setup>
import { MarkerType } from '@vue-flow/core'
const nodes = [
  { id: "lb", type: "multi-handle", label: "Kubernetes / LB", position: { x: 241.95911151502077, y: -31.420236516784172 } },
  { id: "api", type: "multi-handle", label: "Fastify Action", position: { x: 250, y: 100 } },
  { id: "db", type: "multi-handle", label: "PostgreSQL", position: { x: -175.89443560892104, y: 163.2416526400949 } },
  { id: "redis", type: "multi-handle", label: "Redis", position: { x: 272.97396709994064, y: 248.24533090987546 } },
  { id: "mem", type: "multi-handle", label: "Mem Statistics", position: { x: 462.09295428509785, y: 229.86615722992292 } },
  { id: "agg", type: "multi-handle", label: "Aggregator", position: { x: 260.6903720101429, y: 387.017996265586 } },
  { id: "succ", type: "multi-handle", label: "200 Active", position: { x: 263.7843802599644, y: 512.3922439669917 } },
  { id: "fail", type: "multi-handle", label: "503 Degraded", position: { x: -3.4460950649911126, y: 252.360639825252 } },
];

const edges = [
  { id: "h1", source: "lb", target: "api", sourceHandle: "bottom", targetHandle: "top", label: "GET /readiness", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep" },
  { id: "h3", source: "api", target: "redis", sourceHandle: "bottom-source", targetHandle: "top", label: "2. PING", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep" },
  { id: "h5", source: "db", target: "agg", sourceHandle: "bottom-source", targetHandle: "left", label: "Latency", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#10B981"} },
  { id: "h6", source: "redis", target: "agg", sourceHandle: "bottom-source", targetHandle: "top", label: "Latency", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#10B981"} },
  { id: "h7", source: "mem", target: "agg", sourceHandle: "bottom-source", targetHandle: "right", label: "Stats", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#10B981"} },
  { id: "h9", source: "redis", target: "fail", sourceHandle: "left-source", targetHandle: "right", label: "Refused", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#EF4444"} },
  { id: "h10", source: "agg", target: "succ", sourceHandle: "bottom-source", targetHandle: "top", label: "All Connected", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#10B981"} },
  { id: "h11", source: "db", target: "fail", sourceHandle: "right-source", targetHandle: "top-source", label: "Timeout", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#ff0000" } },
  { id: "h12", source: "api", target: "db", sourceHandle: "left-source", targetHandle: "top-source", label: "1. SELECT", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#169258" } },
  { id: "h13", source: "api", target: "mem", sourceHandle: "right-source", targetHandle: "top", label: "3. Mem Usage", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#279629" } },
];

</script>

<InteractiveFlow :nodes="nodes" :edges="edges" />

---

## 1. Liveness Probe

The Liveness Probe is a lightweight endpoint that simply confirms the Fastify web server's Event Loop is not blocked and that it can respond to HTTP requests.

### Endpoint
`GET /api/v1/health/liveness`

### When to use
Configure orchestrators to hit this endpoint to detect deadlocks. If this endpoint times out or returns an error, the orchestrator should kill and restart the container.

### Expected Response (`200 OK`)
```json
{
  "status": "active",
  "version": "1.0.0",
  "date": "2024-03-01T12:00:00.000Z"
}
```

---

## 2. Readiness Probe (Deep Check)

The Readiness Probe performs a deep system check. It actively pings external dependencies (like PostgreSQL and Redis) and measures hardware resources (Memory, Disk).

### Endpoint
`GET /api/v1/health/readiness`

### When to use
Configure orchestrators/load balancers to hit this endpoint to check if the instance is fully booted and connected to databases. If this returns `503`, the orchestrator will temporarily **stop routing traffic** to this instance, but it will **not** kill it.

### Checks Performed
- **Database**: Executes a quick `SELECT version()` using Drizzle ORM to verify Postgres connectivity and measure latency.
- **Cache**: Sends a `PING` command to the Redis server to measure latency.
- **Hardware**: Reads the `process.memoryUsage()` and free disk space.

### Expected Response (`200 OK`)
When all dependencies are connected:

```json
{
  "status": "active",
  "version": "1.0.0",
  "date": "2024-03-01T12:00:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "rss": 45000000,
    "heapTotal": 25000000,
    "heapUsed": 15000000,
    "external": 2000000
  },
  "disk": {
    "free": 10240000000,
    "total": 50000000000
  },
  "dependencies": {
    "database": {
      "status": "connected",
      "latency": 5.2,
      "version": "PostgreSQL 15.3..."
    },
    "cache": {
      "status": "connected",
      "latency": 2.1,
      "version": "7.0.12"
    }
  }
}
```

### Degraded Response (`503 Service Unavailable`)
If either the Database or Redis connection fails, the `status` string changes to `"degraded"` and the HTTP code becomes `503`.

```json
{
  "status": "degraded",
  // ...
  "dependencies": {
    "database": {
       "status": "disconnected",
       "latency": -1
    }
  }
}
```
