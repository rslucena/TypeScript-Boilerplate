---
title: Architecture Decisions
description: Architecture Decision Records (ADRs)
---

# Architecture Decisions

This document records the architectural decisions made for the project, providing context on "why" certain technologies or patterns were chosen.

## ADR-001: Runtime Environment
- **Status**: Accepted
- **Decision**: Use **Bun** instead of Node.js.
- **Context**: We needed a high-performance runtime that simplifies the toolchain and offers native TypeScript execution without complex configuration.

### Runtime Comparison

| Feature | Bun | Node.js |
|:---:|:---:|:---:|
| **Engine** | JavaScriptCore (Zig) | V8 (C++) |
| **Startup** | < 10ms | ~50-100ms |
| **Tooling** | Built-in (Test, Package, Build) | External (fragmented) |
| **TS Support** | Native | via transpilier |

- **Consequences**:
    - ✅ **Pros**: Faster startup, built-in test runner, built-in package manager (no need for npm/yarn), TypeScript support out of the box.
    - ⚠️ **Cons**: Some Node.js APIs might have partial compatibility (though improving daily).

## ADR-002: ORM (Object-Relational Mapping)
- **Status**: Accepted
- **Decision**: Use **Drizzle ORM**.
- **Context**: Validation of TypeORM (legacy/heavy) vs Prisma (slow cold start) vs Drizzle. We prioritized performance and low abstraction overhead.

### ORM Comparison

| Feature | Drizzle | Prisma | TypeORM |
|:---|:---:|:---:|:---:|
| **Runtime Overhead** | Zero | High (Rust Engine) | Medium |
| **Cold Start** | Instant | 200ms+ | 50ms+ |
| **abstraction** | Low (SQL-like) | High (DSL) | High (OOP) |
| **Type Safety** | Native TS | Codegen | Decorators |

- **Consequences**:
    - ✅ **Pros**: Lightweight, "If you know SQL, you know Drizzle", excellent type safety, no runtime overhead.
    - ⚠️ **Cons**: Manual migration management is slightly more verbose than Prisma's auto-migrate-dev.

## ADR-003: Web Framework
- **Status**: Accepted
- **Decision**: Use **Fastify**.
- **Context**: Express is unmaintained/slow. NestJS is too opinionated and heavy for the micro-service goal of this project. Fastify provides a high-performance base with a powerful plugin system that aligns with our modular architecture.

### Framework Performance

| Framework | Requests/sec | Syntax |
|:---|:---:|:---|
| **Fastify** | ~80k+ | Functional/Plugin |
| **Express** | ~15k | Middleware |
| **NestJS** | ~30k | OOP/Decorators |

- **Consequences**:
    - ✅ **Pros**: Highest performance in Node ecosystem, schema-based validation fits perfectly with Zod, great plugin ecosystem.
    - ⚠️ **Cons**: Learning curve for hooks/plugins if coming from Express.

## ADR-005: Granular Error Handling
- **Status**: Accepted
- **Decision**: Implement specific HTTP status codes (e.g., **409 Conflict**) instead of generic ones for resource state conflicts.
- **Context**: Relying on generic errors like 422 for everything makes it harder for API clients to handle specific business logic exceptions properly.
- **Consequences**:
    - ✅ **Pros**: Better client-side error handling, clearer API documentation, follows REST best practices.
    - ⚠️ **Cons**: Slightly more verbose action logic to handle specific conflict scenarios.

## ADR-006: Redis Graceful Degradation
- **Status**: Accepted
- **Decision**: Implement non-blocking error handling and status checks for Redis operations.
- **Context**: Redis is used for high-speed caching and real-time features (Pub/Sub). However, making it a mandatory dependency for every request or for basic real-time functionality creates a Single Point of Failure (SPOF). We needed a way to ensure the system remains available and functional (Availability over Consistency/Performance) during Redis outages.
- **Decision**: 
    - **Cache**: Implement non-blocking error handling and status checks.
    - **Messaging/WebSocket**: Automatically fallback to an internal `EventEmitter` if Redis is offline, maintaining real-time functionality within the same instance.
- **Consequences**:
    - ✅ **Pros**: High Availability (API and WebSockets remain functional), non-blocking app boot, automatic recovery when connection is restored.
    - ⚠️ **Cons**: Temporary increase in Database load; loss of cross-instance WebSocket communication during Redis downtime.

## ADR-007: Identity vs Credentials Separation
- **Status**: Accepted
- **Decision**: Decouple "who the user is" (Identity) from "how they authenticate" (Credentials).
- **Context**: Combining profile data and security secrets in a single table limits scalability and increases the attack surface for social/public features.
- **Consequences**:
    - ✅ **Pros**: Enhanced security (strict access to credentials), multi-method auth support (Password, OAuth, Passkeys), cleaner domain logic.
    - ⚠️ **Cons**: Requires a 1:1 join for some authentication flows.

## ADR-008: Shared Infrastructure Pipes
- **Status**: Accepted
- **Decision**: Introduce a `pipes` module in `src/infrastructure` for pure, stateless utility functions.
- **Context**: Logic like cryptographic hashing, UUID generation, and safe JSON parsing were scattered across `transforms` or duplicated in domains.
- **Consequences**:
    - ✅ **Pros**: Reusable, standalone, and strictly typed utilities; simplified testing of infrastructure logic.
    - ⚠️ **Cons**: None identified.
