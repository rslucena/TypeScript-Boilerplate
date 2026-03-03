# Health Check

In distributed architectures, load balancers (like AWS ALB or Nginx) and orchestrators (like Kubernetes or Docker Swarm) require a mechanism to determine if an application instance is healthy and capable of serving traffic. The TypeScript Boilerplate provides a standard mechanism for this.

## The `/health` Endpoint

Currently, the boilerplate includes a basic health check endpoint located within the identity domain:

**Endpoint:** `GET /api/v1/identity/health`

This endpoint returns a simple JSON object indicating the application's basic operational status, conforming to the `health` schema defined in `src/infrastructure/server/interface.ts`.

### Expected Response (200 OK)

```json
{
  "status": "up",
  "version": "1.0.0",
  "date": "2023-10-27T10:00:00.000Z"
}
```

## Current Maturity and Limitations

> [!WARNING]
> **Development / Basic Testing Only**
>
> The current implementation of the `/health` endpoint is basic and primarily intended for initial setup and superficial testing.
>
> **It currently only confirms that the Fastify web server is running and capable of responding to HTTP requests.**

A truly robust, production-ready health check should deeply probe the underlying infrastructure dependencies. In future implementations, this endpoint (or a dedicated infrastructure-level health endpoint) should be matured to actively verify:

*   **Database Connectivity:** Attempting a lightweight query (e.g., `SELECT 1`) against the PostgreSQL instance via Drizzle.
*   **Cache Status:** Pinging the Redis instance to ensure it is accepting connections.
*   **External Services:** Checking the status of any critical third-party APIs the system relies upon.

Until these deep checks are implemented, infrastructure orchestrators relying solely on the current `/health` endpoint might route traffic to an instance that has lost its database connection, resulting in 500 errors for end-users. Developers are encouraged to expand the logic in `src/domain/identity/actions/get-health.ts` (or create a dedicated infrastructure route) to include these critical dependency checks for production environments.
