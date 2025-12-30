![https://github.com/rslucena/TypeScript-Boilerplate](https://i.ibb.co/Ytg53xH/Screenshot-from-2024-03-01-23-25-11.png)

### Modular and High-Performance Boilerplate for Server-Side Services

A modern, **modular and scalable** TypeScript Boilerplate for versatile **Server-Side Applications** (APIs, Functions, WebSockets, CLI) featuring:

* **Runtime:** **Bun** (Speed ​​and Efficiency)
* **Build Tool:** **Vite** (Quick builds and HMR)
* **Database ORM:** **Drizzle ORM** (Type-Safe data access)
* **Containerization:** **Docker** e `docker-compose` (Environmental Consistency)

### This boilerplate is optimized for production and comes with full support for testing and code quality.

[![CodeQL](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/check.codeql.yml/badge.svg)](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/check.codeql.yml) [![Build and Test CI](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/build.nodejs.yml/badge.svg)](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/build.nodejs.yml) [![GitHub last commit](https://img.shields.io/github/last-commit/rslucena/TypeScript-Boilerplate)](https://github.com/rslucena/TypeScript-Boilerplate/graphs/code-frequency) [![GitHub contributors](https://img.shields.io/github/contributors/rslucena/TypeScript-Boilerplate)](https://github.com/rslucena/TypeScript-Boilerplate/graphs/contributors)

[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/rslucena/TypeScript-Boilerplate/tree/main?tab=MIT-1-ov-file) [![Commit Activity](https://img.shields.io/github/commit-activity/t/rslucena/TypeScript-Boilerplate)](https://github.com/rslucena/TypeScript-Boilerplate/pulse) [![GitHub Stars](https://img.shields.io/github/stars/rslucena/TypeScript-Boilerplate)](https://github.com/rslucena/TypeScript-Boilerplate/stargazers)

---

## 📖 Table of Contents
- [What Makes This Special](#-what-makes-this-special)
- [Quick Start](#-quick-start)
- [Why Choose This?](#-why-choose-this-boilerplate)
- [Folder Structure](#-detailed-folder-structure)
- [Testing Guide](#-testing-guide)
- [Complete Example](#-complete-use-case-example-creating-a-user)
- [Main Features](#-main-features)
- [Resources](#-resources)
- [Contributing](#-contributing)

---

## ✨ What Makes This Special

- 🎯 **Production-Ready**: Full CI/CD pipeline, Docker support, and PM2 process management
- ⚡ **CLI Generator**: Scaffold complete CRUD domains in seconds with `bun gen:domain`
- 🔒 **Type-Safe Everything**: End-to-end type safety with Drizzle ORM + Zod validation
- 💾 **Smart Caching**: Redis integration with automatic cache invalidation
- 📚 **Auto API Docs**: Swagger UI automatically generated from Zod schemas
- 🌍 **i18n Ready**: Multi-language error messages and responses out of the box
- 🧪 **100% Tested**: Comprehensive unit tests with Bun's blazing-fast test runner
- 🚀 **Blazing Fast**: Bun runtime delivers 3x faster performance than Node.js

---

## 🚀 Quick Start (3 Minutes to Running API)

### Step 1️⃣ - Clone & Install

```bash
# Clone the repository
git clone https://github.com/rslucena/TypeScript-Boilerplate.git my-api

# Navigate to directory
cd my-api

# Install dependencies with Bun
bun install

# Create environment file
cp .env.exemple .env
# Configure your environment variables (DATABASE_URL, REDIS_URL, etc.)
```

### Step 2️⃣ - Start Infrastructure

```bash
# Start PostgreSQL + Redis containers
docker-compose up -d --build

# Run database migrations
bun db:migrate        # Generate migration files
bun db:migrate:push   # Apply to database
```

### Step 3️⃣ - Generate Your First Domain (Optional)

```bash
# Scaffold a complete CRUD domain in seconds
bun gen:domain product

# This creates:
# ✓ Entity (Drizzle table)
# ✓ Schema (Zod validation)
# ✓ Routes (5 REST endpoints)
# ✓ Actions (Full CRUD logic)
# ✓ Tests (Unit test skeleton)
# ✓ Automatic Route Registration
# ✓ Auto-formatting (Biome)
```

### Step 4️⃣ - Run & Test

```bash
# Start development server
bun dev --workers=primary-webserver

# ✅ API running at http://localhost:3000
# 📚 Swagger docs at http://localhost:3000/docs
# 🧪 Run tests: bun test
```


---

## 🤔 Why Choose This Boilerplate?

| Feature | This Boilerplate | NestJS | Express Boilerplates |
|---------|------------------|--------|----------------------|
| **Runtime Speed** | Bun (3x faster) ⚡ | Node.js | Node.js |
| **Code Generation** | ✅ Full CRUD CLI | ❌ Manual scaffolding | ❌ Manual |
| **Type Safety** | Drizzle + Zod (100%) | TypeORM | Varies |
| **Built-in Caching** | ✅ Redis integrated | ❌ Manual setup | ❌ Manual |
| **API Documentation** | ✅ Auto Swagger | ❌ Manual decorators | ❌ Manual |
| **Learning Curve** | Low (familiar patterns) | High (complex) | Medium |
| **Production Ready** | ✅ Docker + PM2 | ⚠️ Requires setup | ⚠️ Varies |

---

## 📦 Detailed Folder Structure
The project uses a structured, modular approach inspired by clean architecture principles. This separation of concerns is what allows the boilerplate to be easily adapted for APIs, WebSockets, or standalone functions.

```
src/
├── commands/         # Commands or CLI entry points (System Core)
├── domain/           # Core Business Logic (The "What")
├── functions/        # Application entry points (APIs, Functions, CLI)
├── infrastructure/   # External Dependencies (The "How")
tests/              # Automated tests
```

### Breakdown by Responsibility

| Folder | Responsibility | Key Content & Role                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :--- | :--- |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`src/domain`** | **Core Business Logic (The WHAT)** | Contains the essential logic, independent of any framework or database. Includes Entities, Value Objects, and Use Cases that define system behavior. **This is reusable across API, WebSocket, and Function entry points.**                                                                                                                                                                                                                                                                                                              |
| **`src/infrastructure`** | **External Dependencies (The HOW)** | Handles all external services. This includes database connections (Drizzle ORM setup), logging, and external service clients. Contains Repositories (implementations of Domain interfaces).                                                                                                                                                                                                                                                                                                                                              |
| **`src/commands`** | **Acts as the **interface and control layer** | Where the application is configured. This directory hosts all the actual executables: <ul><li>**Runtime and Process Management:** Contains the crucial configuration logic related to the **Bun runtime**, **PM2 configuration** (if programmatic), and hooks for optimized build/initialization scripts.</li></ul>                                                                                                                                                                                                                      |
| **`src/functions`** | **Execution Entry Points & Application Wiring** | Acts as the **initialization and bootstrapping layer** where the application is wired up. This directory hosts the actual executable entry points: <ul><li>**Entry Points:** API Routes, WebSocket Handlers, or CLI Commands.</li><li>**Wiring:** Connects the Use Cases (`domain`) with the Infrastructure (`infrastructure`).</li><li>**Runtime & Process Management:** Contains crucial setup logic related to the **Bun runtime**, **PM2 configuration** (if programmatic), and hooks for optimized build/startup scripts.</li></ul> |
| **`tests`** | **Automated Tests** | Houses unit, integration, and end-to-end tests for the entire application.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

---

## ⚓ Testing Guide

This directory contains the automated tests for the application. The structure follows best practices for test organization to facilitate maintenance and scalability.

```
tests/
├── unit/
│   ├── domain/              # Pure logic tests (user/user-get-by-id.spec.ts)
│   └── infra/               # Adapter/gateway testing
├── integration/
│   └── api/                 # Route/Endpoint Testing (users.test.ts)
├── builders/                # Real objects or DTOs with valid data (users.builder.ts)
└── mocks/                   # Global and reusable mockups
```

- Test file names: `[name].test.ts` or `[name].spec.ts`
- Test descriptions: should be descriptive and use `should... when...`

**Arrange-Act-Assert**:
 ```typescript
 it('should return user when valid ID is provided', async () => {
  const userId = '1';
  const expectedUser = createUserBuilder({ id: userId });
  mockRepository.getById.mockResolvedValue(expectedUser);
  const result = await userService.getUserById(userId);
  expect(result).toEqual(expectedUser);
});
 ```
```typescript
it('should throw error when user not found', async () => {
  // Arrange
  const userId = 'non-existent';
  mockRepository.getById.mockResolvedValue(null);
  await expect(userService.getUserById(userId)).rejects.toThrow()
});
```

### Executando Testes

```bash
bun test  # Run all tests
bun test --watch # Run tests in watch mode
bun test --coverage # Run tests with coverage
```
---
## 🚀 CI/CD & DevOps

This boilerplate comes with a fully configured **GitHub Actions** pipeline to ensure code quality and automate deployments.

### Workflows Included

1.  **Quality Gate (`ci.yml`)**:
    *   Runs on every Push and Pull Request to `main`.
    *   **Lint**: Checks code style using Biome (`bun run lint:check`).
    *   **Test**: Runs unit tests (`bun run tests`).
    *   **Build**: Verifies the project builds successfully.

2.  **Automated Release (`release.yml`)**:
    *   Runs only after the Quality Gate passes on `main`.
    *   Uses **Semantic Release** to analyze commits, generate a Changelog, and publish a GitHub Release (and optionally npm).
    *   *Requirement*: Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: new user route`, `fix: validation bug`).

3.  **Docker Deployment (`deploy-docker.yml`)**:
    *   Triggered when a new Release is published.
    *   Builds the Docker image and pushes it to **GitHub Container Registry (GHCR)**.

### Local Quality Check
Before pushing, you can run the same checks locally:
```bash
# Check code style
bun run lint:check

# Run tests
bun run tests
```
---

## 💡 Complete Use Case Example: Creating a User

This example demonstrates the visual data flow when a request is made, showing how the architectural layers work together in this modular setup.

### 1. Domain Definition: Entity and Validation Schemas

In this structure, the Drizzle table definition (`entity.ts`) and the Zod validation schemas (`schema.ts`) are kept together in the domain layer, making them readily available for the business logic.

#### A. Entity Definition (`src/domain/user/entity.ts`)
Defines the database table structure using Drizzle ORM.

```typescript
import { identifier, pgIndex } from "@infrastructure/repositories/references";
import { pgTable, varchar } from "drizzle-orm/pg-core";

const columns = {
  name: varchar("name", { length: 50 }).notNull(),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 400 }).unique().notNull(),
  password: varchar("password", { length: 100 }).notNull(),
};

const user = pgTable("user", { ...columns, ...identifier }, (table) => pgIndex("user", table, ["name", "email"]));
type user = typeof user.$inferSelect;

export default user;
```

#### B. Schema Generation (src/domain/user/schema.ts)
Generates Zod schemas from the Drizzle entity for runtime validation and defines complex actions/response schemas
```typescript
import { withPagination, zodIdentifier } from "@infrastructure/repositories/references";
import { headers } from "@infrastructure/server/interface";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { array, object, string } from "zod/v4";
import { default as users } from "./entity";


// ... (create and select schemas remain the same)

const actions = {
  // ...
  create: {
    entity: create.omit({ id: true }),
    auth: create.pick({ email: true, password: true }),
  },
  // ...
};

// ... (export defaults)
export default { actions, entity, auth };
```


### 2. Domain Action (Business Logic) (src/domain/user/actions/post-new-entity.ts)
This is the core business logic. It handles validation, applies business rules (e.g., password hashing), and directly interacts with the persistence layer via the shared repository module.
```typescript
import cache from '@infrastructure/cache/actions'
import { hash, tag } from '@infrastructure/repositories/references'
import repository from '@infrastructure/repositories/repository' // Global repository module
import { container } from '@infrastructure/server/request'
import user from '../entity' // Uses the Drizzle entity definition
import { default as schema } from '../schema'
import getById from './get-by-id'

export default async function postNewEntity(request: container) {
  request.status(201);
  const validRequest = await schema.actions.create.entity.safeParseAsync(request.body());
  if (!validRequest.success) throw request.badRequest(request.language(), "post/user/{params}");
  const content = await repository
    .insert(user)
    .values({
      ...validRequest.data,
      password: hash(validRequest.data.password),
    })
    .onConflictDoNothing()
    .returning();
  if (!content.length) throw request.unprocessableEntity(request.language(), `post/user/${validRequest.data.email}`);
  await cache.json.del(tag("user", "find*"));
  return getById(new container({ params: { id: content[0].id } }));
}
```
### 3. Application Entry Point (src/commands/api/routes/user.ts)
This is the command layer for the API. It defines the Fastify route structure, hooks up the validation schemas for documentation/enforcement, and delegates the execution to the domain action.
```typescript
import request from "@infrastructure/server/request";
import type { FastifyInstance } from "fastify";
import postNewEntity from "../actions/post-new-entity"; // Imports the Domain Action
import schema from "../schema";

export default async function userRoutes(api: FastifyInstance) {
  api.get("/ping", { schema: { tags: ["User"] } }, (_, reply) => reply.code(200).send());

  api.post(
    "/",
    {
      schema: {
        tags: ["User"],
        summary: "Create new user",
        body: schema.actions.create.entity, // Hooks up Zod schema for validation/docs
        response: { 201: schema.entity, ...request.reply.schemas },
      },
    },
    // Delegates execution to the Domain Action
    request.noRestricted(postNewEntity),
  );
}
```

---

## 🔗 Main Features

- **Bun** as package manager and runtime for fast installs and execution
- **TypeScript** for type-safe development
- **Vite** for fast builds and hot-module replacement (HMR)
- **Drizzle ORM** for modern and type-safe database access
- **Docker** and `docker-compose` for containerized development and production
- **ESLint** and **Biome** for code linting and formatting
- **Testing** setup (see `tests/` directory)
- **Ready-to-use project structure** separating domain, infrastructure, commands, and utilities

---

## 💡 Tips & FAQ

- **How to create a new migration (Drizzle)?**
  ```bash
  bun run drizzle-kit generate
  ```
- **How to add a new dependency?**
  ```bash
  bun add <package>
  ```
- **How to update dependencies?**
  ```bash
  bun upgrade
  ```

---

## 📚 Resources

- [Wiki](https://github.com/rslucena/TypeScript-Boilerplate/wiki)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/guide/)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Docker Docs](https://docs.docker.com/)

---

## 🤝 Contributing

Pull requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

## 📜 License

This project is under the MIT license. See [LICENSE](LICENSE) for details.
