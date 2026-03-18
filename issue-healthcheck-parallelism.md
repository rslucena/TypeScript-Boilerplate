---
name: Feature request
description: Suggest an idea for this project
labels: ["feat", "performance"]
---

### Is your feature request related to a problem?

Yes. In `src/domain/health/actions/get-readiness.ts`, the `/readiness` health check performs its checks (Postgres liveness, Redis liveness, and disk space evaluation) sequentially, using sequential `await` statements.

This inflates the total latency of the health check endpoint, as each subsequent check waits for the previous one to complete, resulting in poor response times for automated monitoring systems.

### Describe the solution you'd like

Refactor `getReadiness` to run the independent checks (Postgres connection, Redis connection, and disk `statfs`) in parallel using `Promise.all` or `Promise.allSettled`. This way, the total time for the health check will be bound by the slowest individual check rather than the sum of all checks.

### Describe alternatives you've considered

Keeping the sequential `await` calls, which negatively impacts the responsiveness of the endpoint and might cause false-positive degraded health statuses under high load due to accumulated timeouts.

### Additional context

- **Current Metrics**: The response time of `/readiness` is `latency(Postgres) + latency(Redis) + latency(disk)`.
- **Expected Impact**: Reduces the overall latency to `max(latency(Postgres), latency(Redis), latency(disk))`, ensuring quicker readiness responses.
- **Implementation Hints**: Use `Promise.allSettled` or `Promise.all` in `src/domain/health/actions/get-readiness.ts`. Note that the latency measurements (`performance.now()`) for individual services can still be calculated correctly by starting the timers right before adding the respective promise to the parallel execution array or by measuring them inside wrapper functions.
