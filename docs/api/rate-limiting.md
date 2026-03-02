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
