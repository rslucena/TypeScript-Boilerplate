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

<script setup>
import { MarkerType } from '@vue-flow/core'

const rateNodes = [
  { id: 'req', type: 'multi-handle', label: 'Incoming Request', position: { x: 250, y: 0 } },
  { id: 'ip', type: 'multi-handle', label: 'Extract IP', position: { x: 250, y: 100 } },
  { id: 'incr', type: 'multi-handle', label: 'Redis INCR IP', position: { x: 250, y: 200 }, class: 'bg-red-50 border-red-200' },
  { id: 'first', type: 'multi-handle', label: 'Is counter == 1?', position: { x: 250, y: 300 } },
  { id: 'expire', type: 'multi-handle', label: 'Set EXPIRE window', position: { x: 0, y: 400 }, class: 'bg-orange-50 border-orange-200' },
  { id: 'checkLimit', type: 'multi-handle', label: 'Is counter > Limit?', position: { x: 250, y: 500 } },
  { id: 'tooMany', type: 'multi-handle', label: 'Return 429 Too Many Requests', position: { x: 0, y: 650 }, class: 'bg-red-50 border-red-200' },
  { id: 'proceed', type: 'multi-handle', label: 'Proceed to Handler', position: { x: 500, y: 650 }, class: 'bg-emerald-50 border-emerald-200' }
]

const rateEdges = [
  { id: 'e1', source: 'req', target: 'ip', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2', source: 'ip', target: 'incr', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e3', source: 'incr', target: 'first', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e4', source: 'first', target: 'expire', sourceHandle: 'left-source', targetHandle: 'top', label: 'Yes', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e5', source: 'first', target: 'checkLimit', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'No', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e6', source: 'expire', target: 'checkLimit', sourceHandle: 'bottom-source', targetHandle: 'left', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e7', source: 'checkLimit', target: 'tooMany', sourceHandle: 'left-source', targetHandle: 'top', label: 'Yes', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e8', source: 'checkLimit', target: 'proceed', sourceHandle: 'right-source', targetHandle: 'top', label: 'No', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="rateNodes" :edges="rateEdges" :height="750" />

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
*   If you receive a `429` error, halt further requests. Wait for a duration (e.g., the value in `X-RateLimit-Reset` if treating it as a static delay, or implement exponential backoff) before retrying.
