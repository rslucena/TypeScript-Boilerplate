This project follows a clean, modular architecture inspired by Domain-Driven Design (DDD) principles, focused on performance and developer productivity using TypeScript and Bun.

## Technology Stack

```mermaid
graph TB
    subgraph "Runtime & Language"
        Bun[Bun]
        TS[TypeScript]
    end

    subgraph "Web Framework"
        Fastify[Fastify]
        Swagger[Swagger UI]
        Zod[Zod Validation]
    end

    subgraph "Data Layer"
        Drizzle[Drizzle ORM]
        Postgres[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    subgraph "DevOps"
        Docker[Docker]
        PM2[PM2]
        Biome[Biome Linter]
    end

    Bun --> Fastify
    Fastify --> Swagger
    Fastify --> Zod
    Fastify --> Drizzle
    Drizzle --> Postgres
    Fastify --> Redis

    style Bun fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    style Fastify fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    style Postgres fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style Redis fill:#DC382D,stroke:#333,stroke-width:2px,color:#fff
```

## Layer Overview

```mermaid
graph TD
    A[Commands] --> B[Infrastructure]
    A --> C[Domain]
    C --> B
    C --> D[Functions]

    subgraph Commands
        A1[exec-builder.ts]
        A2[exec-process.ts]
    end

    subgraph Domain
        C1[Entity - Drizzle]
        C2[Actions - Logic]
        C3[Schema - Zod]
        C4[Routes - Fastify]
    end

    subgraph Infrastructure
        B1[Server - Fastify]
        B2[Repository - DB]
        B3[Cache - Redis]
        B4[Messages - Pub/Sub]
    end
```

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
- **Server**: Fastify configuration and boilerplate.
- **Cache**: Redis integration for high-performance data storage.
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

```mermaid
sequenceDiagram
    participant U as User
    participant S as Server (Infra)
    participant B as Auth Handler (Infra)
    participant R as Route (Domain)
    participant A as Action (Domain)
    participant V as Schema (Zod)
    participant DB as Repository (Infra)

    U->>S: HTTP Request
    S->>B: Execute Session Check (if restricted)
    B-->>S: Session Data / Unauthorized
    S->>R: Dispatch
    R->>A: Execute Action
    A->>V: Validate Data
    V-->>A: Validated Data
    A->>DB: Query / Persistence
    DB-->>A: Result
    A-->>R: Action Response
    R-->>S: Serialize Data
    S->>U: HTTP Response
```
