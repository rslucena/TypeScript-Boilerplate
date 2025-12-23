![https://github.com/rslucena/TypeScript-Boilerplate](https://i.ibb.co/Ytg53xH/Screenshot-from-2024-03-01-23-25-11.png)

### Um Boilerplate Modular e de Alta Performance para Serviços Server-Side

A modern, **modular and scalable** TypeScript Boilerplate for versatile **Server-Side Applications** (APIs, Functions, WebSockets, CLI) featuring:

* **Runtime:** **Bun** (Speed ​​and Efficiency)
* **Build Tool:** **Vite** (Quick builds and HMR)
* **Database ORM:** **Drizzle ORM** (Type-Safe data access)
* **Containerization:** **Docker** e `docker-compose` (Environmental Consistency)

### This boilerplate is optimized for production and comes with full support for testing and code quality.

[![CodeQL](https://github.com/rslucena/Template-Typescript/actions/workflows/check.codeql.yml/badge.svg)](https://github.com/rslucena/Template-Typescript/actions/workflows/check.codeql.yml)   [![Build and Test CI](https://github.com/rslucena/Template-Typescript/actions/workflows/build.nodejs.yml/badge.svg)](https://github.com/rslucena/Template-Typescript/actions/workflows/build.nodejs.yml)   [![Commit Activity](https://img.shields.io/github/commit-activity/t/rslucena/Template-Typescript)](https://github.com/rslucena/Template-Typescript/pulse)   [![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/rslucena/Template-Typescript?link=https%3A%2F%2Fgithub.com%2Frslucena%2FTemplate-Typescript%2Fcommits%2Fmain%2F)](https://github.com/rslucena/Template-Typescript/graphs/code-frequency)   [![GitHub contributors](https://img.shields.io/github/contributors/rslucena/Template-Typescript)](https://github.com/rslucena/Template-Typescript/graphs/contributors)

## 🚀 Quick Start

Follow the steps below to clone the repository, set up the environment, and start both the application and the database.

### 1. Cloning and Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/rslucena/TypeScript-Boilerplate.git my-project

# 1.1. Move to the project directory
cd my-project

# 2. Install dependencies using Bun
bun install

# 3. Create the environment variables file
cp .env.exemple .env
    # NODE_ENV=production
    # POSTGRES_PORT=5432
    # POSTGRES_POOL=200
    # POSTGRES_SERVER=localhost
    #PROCESS_CORS_ORIGIN=https://prod.alias,https://prod.ip
    # Add other variables as needed...

```

### 2. Database Initialization (Docker)
To ensure an isolated development environment, the database is started via Docker.
```bash
# 1. Start the database container (e.g., PostgreSQL) in the background
# The --build flag ensures the service image is built the first time
docker-compose up -d --build
```

### 3. Schema Setup (Drizzle ORM)
Once the database is active, you must run the Drizzle ORM migrations to create the initial schema in the database.
```bash
# 1. Execute the command to run pending migrations
# Verify the exact script name in your package.json (e.g., 'drizzle:migrate')
bun run db:migrate
bun run db:migrate:push
```

### 4. Start the Application
With the database and schema ready, you can start the development server
```bash
# 1. Start the application in development mode
bun run dev --workers=primary-webserver
```

---

## 📦 Detailed Folder Structure
The project uses a structured, modular approach inspired by clean architecture principles. This separation of concerns is what allows the boilerplate to be easily adapted for APIs, WebSockets, or standalone functions.

```
src/
  commands/         # Commands or CLI entry points (System Core)
  domain/           # Core Business Logic (The "What")
  functions/        # Application entry points (APIs, Functions, CLI)
  infrastructure/   # External Dependencies (The "How")
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
