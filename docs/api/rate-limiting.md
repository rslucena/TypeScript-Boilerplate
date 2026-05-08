---
title: Rate Limiting
description: API logic reference for rate limiting.
---
<script setup>
import { MarkerType } from "@vue-flow/core";

const nodes = [
  { id: "req", type: "multi-handle", label: "Incoming Request", position: { x: 217, y: -39.750000000000036 } },
  { id: "ip", type: "multi-handle", label: "Extract IP", position: { x: 249, y: 81.99999999999997 } },
  { id: "incr", type: "multi-handle", label: "Redis INCR IP", position: { x: 235, y: 215.00000000000003 } },
  { id: "first", type: "multi-handle", label: "Is counter == 1?", position: { x: 227.99999999999994, y: 359.0000000000001 } },
  { id: "expire", type: "multi-handle", label: "Set EXPIRE window", position: { x: -9.000000000000014, y: 448.00000000000006 } },
  { id: "checkLimit", type: "multi-handle", label: "Is counter > Limit?", position: { x: 218.99999999999994, y: 535 } },
  { id: "tooMany", type: "multi-handle", label: "Return 429 Too Many Requests", position: { x: 169.50000000000028, y: 688.3906249999999 } },
  { id: "proceed", type: "multi-handle", label: "Proceed to Handler", position: { x: 476.9999999999999, y: 683.0000000000001 } },
];

const edges = [
  { id: "e1", source: "req", target: "ip", sourceHandle: "bottom-source", targetHandle: "top", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#218728" } },
  { id: "e2", source: "ip", target: "incr", sourceHandle: "bottom-source", targetHandle: "top", label: "Validate", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#19714f" } },
  { id: "e3", source: "incr", target: "first", sourceHandle: "bottom-source", targetHandle: "top", label: "Valid Data", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#1b7937" } },
  { id: "e4", source: "first", target: "expire", sourceHandle: "left-source", targetHandle: "top", label: "Yes", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#1f984a" } },
  { id: "e5", source: "first", target: "checkLimit", sourceHandle: "bottom-source", targetHandle: "top", label: "No", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#ff0000" } },
  { id: "e6", source: "expire", target: "checkLimit", sourceHandle: "bottom-source", targetHandle: "left", label: "Execute SQL", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#207932" } },
  { id: "e8", source: "checkLimit", target: "proceed", sourceHandle: "right-source", targetHandle: "top", label: "No", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#1b9339" } },
  { id: "vueflow__edge-checkLimitbottom-source-tooManytop", source: "checkLimit", target: "tooMany", sourceHandle: "bottom-source", targetHandle: "top", label: "Yes", animated: true, markerEnd: MarkerType.ArrowClosed, type: "smoothstep", style: { stroke: "#ff0000" } },
];

</script>

# Rate Limiting

Rate limiting is an essential defense mechanism for high-performance APIs, preventing abuse, mitigating DDoS attacks, and ensuring fair resource usage among clients. The TypeScript Boilerplate implements a robust, distributed rate-limiting strategy using Redis.

## The Rate Limiting Architecture

Unlike in-memory rate limiters (which fail when scaling horizontally across multiple Node.js/Bun processes), the boilerplate uses a centralized Redis cache. The logic resides in `src/infrastructure/server/rate-limit.ts`.

It utilizes a global `onRequest` hook registered in the Fastify webserver (`src/infrastructure/server/webserver.ts`). This means *every* incoming request is subject to rate limiting before any business logic or routing occurs.

### How It Works

1.  **Identification:** The middleware identifies the client by their IP address (`request.ip`).
    *   *Note: If your application is behind a load balancer or proxy (like Nginx or AWS ALB), Fastify is configured with `trustProxy: true` to correctly parse the `X-Forwarded-For` header for the real IP.*
2.  **Redis Tracking:** It uses the Redis `INCR` command to atomically increment a counter for that specific IP address (`tag("rate-limit", "check", { ip })`).
3.  **Expiration Window:** If the counter is 1 (meaning it's the first request in the window), it sets a TTL (Time-To-Live) on the Redis key using the `EXPIRE` command.
4.  **Evaluation:** If the counter exceeds the maximum allowed limit, the request is immediately rejected.

<InteractiveFlow :nodes="nodes" :edges="edges" :height="750" />

## Configuration

The rate limiter is configured entirely via environment variables in your `.env` file. There are no hardcoded limits in the code.

```dotenv
# .env
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60
```

*   **`RATE_LIMIT_MAX`**: The maximum number of requests allowed within the window. (e.g., `100` requests).
*   **`RATE_LIMIT_WINDOW`**: The duration of the window in seconds. (e.g., `60` seconds = 1 minute).

*In this example, a single IP address can make up to 100 requests every minute.*

## Client Monitoring (HTTP Headers)

The rate limiter automatically injects standard HTTP headers into every response. Clients can monitor these headers to understand their current quota and gracefully back off before they are blocked.

| Header | Description | Example |
| :--- | :--- | :--- |
| `X-RateLimit-Limit` | The maximum number of requests permitted in the current window. | `100` |
| `X-RateLimit-Remaining` | The number of requests remaining in the current window. | `98` |
| `X-RateLimit-Reset` | The length of the window in seconds (Note: this is a static value of the window duration in this implementation, not a Unix timestamp). | `60` |

## Handling Rate Limit Exceeded (429)

When a client exceeds the `RATE_LIMIT_MAX`, the middleware intercepts the request and prevents further execution. It returns an HTTP `429 Too Many Requests` status code with a JSON payload:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded"
}
```

### Best Practices for Clients

If you are writing a client application consuming this API:
*   Always inspect the `X-RateLimit-Remaining` header.
## Real-world Resilience

Proof that our rate-limiting and performance optimization work in tandem. Watch as we handle a brute-force load test with 100 concurrent connections. The system maintains stability and low latency even under intense pressure:

<div align="center" style="margin: 2rem 0;">
  <img src="/praxis-load-test.gif" alt="Praxis Load Test & Resilience" width="100%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);" />
</div>

