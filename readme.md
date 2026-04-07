![https://github.com/rslucena/TypeScript-Boilerplate](https://i.ibb.co/Ytg53xH/Screenshot-from-2024-03-01-23-25-11.png)

### Modular and High-Performance Boilerplate for Server-Side Services

A modern, **modular and scalable** TypeScript Boilerplate for versatile **Server-Side Applications** (APIs, Functions, WebSockets, CLI) featuring:

* **Runtime:** **Bun** (Speed ​​and Efficiency)
* **Build Tool:** **Vite** (Quick builds and HMR)
* **Database ORM:** **Drizzle ORM** (Type-Safe data access)
* **Containerization:** **Docker** e `docker-compose` (Environmental Consistency)

### This boilerplate is optimized for production and comes with full support for testing and code quality.

[![CodeQL](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/check.codeql.yml/badge.svg)](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/check.codeql.yml) 
[![Quality Gate](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/ci.yml) 
[![Docker Deployment](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/deploy-docker.yml/badge.svg)](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/deploy-docker.yml)
[![Deploy Docs](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/deploy-docs.yml)
[![Automated Release](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/release.yml/badge.svg)](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/release.yml)

[![GitHub last commit](https://img.shields.io/github/last-commit/rslucena/TypeScript-Boilerplate)](https://github.com/rslucena/TypeScript-Boilerplate/graphs/code-frequency)
[![GitHub contributors](https://img.shields.io/github/contributors/rslucena/TypeScript-Boilerplate)](https://github.com/rslucena/TypeScript-Boilerplate/graphs/contributors) 
[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/rslucena/TypeScript-Boilerplate/tree/main?tab=MIT-1-ov-file) 
[![Commit Activity](https://img.shields.io/github/commit-activity/t/rslucena/TypeScript-Boilerplate)](https://github.com/rslucena/TypeScript-Boilerplate/pulse)

> [!TIP]
> **Check out our official documentation for deep dives, architecture diagrams, and more:**  
> 🌐 **[https://rslucena.github.io/TypeScript-Boilerplate/](https://rslucena.github.io/TypeScript-Boilerplate/)**
>
> **Have questions? Ask our AI assistant about:**
> 1. How do I scaffold a new CRUD domain with `bun gen:domain`?
> 2. How does the CI/CD pipeline handle automated releases?
> 3. What are the key features of the Smart Caching system with Redis?
> 4. How do I configure and run database migrations in production?
> 5. How does this boilerplate achieve Go-like performance with Bun?
>
> 🤖 **[Access AI Assistant](https://deepwiki.com/rslucena/TypeScript-Boilerplate)**

---

## 📖 Table of Contents
- [What Makes This Special](#-what-makes-this-special)
- [Quick Start](#-quick-start)
- [CLI Code Generator](#-cli-code-generator)
- [Why Choose This?](#-why-choose-this-boilerplate)
- [Folder Structure](#-detailed-folder-structure)
- [Testing](#-testing)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Documentation](#-documentation)
- [Main Features](#-main-features)
- [Resources](#-resources)
- [Contributing](#-contributing)

---

## ✨ What Makes This Special

- 🎯 **Production-Ready**: Full CI/CD pipeline, Docker support, and PM2 process management
- ⚡ **CLI Generator**: Scaffold complete CRUD domains in seconds with `bun gen:domain`
- 🔒 **Type-Safe Everything**: End-to-end type safety with Drizzle ORM + Zod validation
- 💾 **Smart Caching**: Redis integration with automatic cache invalidation and **Graceful Degradation** for high availability
- 📚 **Auto API Docs**: Swagger UI automatically generated from Zod schemas
- 🌍 **i18n Ready**: Multi-language error messages and responses out of the box
- 🔒 **Secure Error Handling**: Internal errors are masked and logged, preventing sensitive data exposure
- 🧪 **100% Tested**: Comprehensive unit tests with Bun's blazing-fast test runner
- 🚀 **Blazing Fast**: Bun runtime delivers 3x faster performance than Node.js
- 🔐 **SSO Ready**: Built-in OAuth2/OIDC structure for streamlined Identity management

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

> [!CAUTION]
> **Strict Environment Validation**: All variables in `.env` are now **mandatory**. The application will fail to start if any variable is missing or invalid. Configure your `DATABASE_URL`, `REDIS_URL`, `AUTH_SALT`, etc., before running.
```

### Step 2️⃣ - Start Infrastructure & App

```bash
# Start PostgreSQL, Redis, and Application containers
podman compose up -d --build

# Run database migrations
# You can run migrations directly through the app container
podman exec -it app_server bun db:migrate:push
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

# 🔐 Generate security keys and self-signed certificate (RSA + SSL)
bun gen:keys

# Start development server
bun dev --workers=primary-webserver

# ✅ API running at http://localhost:3000
# 📚 Swagger docs at http://localhost:3000/docs
# 🧪 Run tests: bun test
```

### Step 5️⃣ - Production with Docker

```bash
# Build and start the full stack (App + DB + Redis)
docker-compose up -d --build

# The application will be available at http://localhost:3000
```

---

## 🎨 CLI Code Generator

Generate complete CRUD domains in seconds with a single command:

```bash
bun gen:domain product
```

**What you get:**
- ✅ Database table (Drizzle ORM)
- ✅ Validation schemas (Zod)
- ✅ 5 REST endpoints (GET, POST, PUT, DELETE)
- ✅ Business logic with caching
- ✅ Auto-registered routes
- ✅ Type-safe operations

**Unique Approach:** Uses TypeScript files as templates (not `.hbs` or `.ejs`) for native IDE support and zero dependencies.

📚 **Learn More:** [Template System Architecture](https://rslucena.github.io/TypeScript-Boilerplate/development/template-system-architecture.html) | [Domain Generator Guide](https://rslucena.github.io/TypeScript-Boilerplate/development/domain-scaffolding.html)

---

## 🤔 Why Choose This Boilerplate?

| Feature | This Boilerplate | NestJS / Adonis | Go (Fiber/Gin) | Elysia / Bare Fastify |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime** | **Bun (Ultra Fast)** ⚡ | Node.js | Native Binary | Bun |
| **Dev Velocity** | **Extreme (CLI Gen)** 🚀 | High (Opinionated) | Low (Manual) | Medium (Minimal) |
| **CRUD Scaffolding**| **Full Auto-Reg** 🛠️ | Manual / Partial | Non-existent | Minimal |
| **Type Safety** | **Total (Zod + Drizzle)** 🔒 | Good (Decorators) | Strong (Strict) | Total |
| **Integrated i18n** | **Native Built-in** 🌍 | Complex Config | Third-party | Manual |
| **Smart Caching** | **Redis + Auto-Inv** 💾 | Manual setup | Manual | Manual |
| **API Docs** | **Auto-Generated** 📚 | Decorator heavy | Manual / Swagger | Fast (Static) |
| **Bundle Size** | **Medium (Modular)** 📦 | Large / Heavy | Tiny | Tiny |

### The "Sweet Spot" of Web Development:
- **VS NestJS/Adonis**: We offer the same "batteries-included" feel but with **3x the performance** and a much lower cognitive load (no complex Dependency Injection or decorator hell).
- **VS Go (Fiber/Gin)**: You get **Go-like performance** without leaving the TypeScript ecosystem. You keep the rich npm library access and the fastest developer feedback loop.
- **VS Elysia/Fastify Bare**: Instead of a "blank slate", you get a **production-ready architecture** with i18n, caching, and database migrations already wired up and ready for scale.
- **Native CLI Magic**: `bun gen:domain` is our secret weapon. It doesn't just create files—it understands your architecture, registers routes, and ensures consistency.

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

## 🧪 Testing

Comprehensive test suite using Bun's blazing-fast test runner with **>90% code coverage** for maximum reliability:

```bash
bun test              # Run all unit and integration tests
bun test --watch      # Run tests in watch mode
bun tests:ci          # Run github actions locally via act
bun test --coverage   # Coverage report
```

**Test Structure:**
- `tests/unit/` - Pure logic tests (isolated via `?v=unit`)
- `tests/integration/` - API endpoint tests
- `tests/builders/` - Test data factories
- `tests/mocks/` - Shared mocks

📚 **Learn More:** [Testing Guide](https://rslucena.github.io/TypeScript-Boilerplate/development/testing-guide.html)

---

## 🚀 CI/CD Pipeline

Automated quality gates and deployments with GitHub Actions:

- **Quality Gate**: Lint, test, and build on every push to `main` or `staging`.
- **PR Labeler**: Automatic labeling of pull requests based on file changes.
- **Release Train**: Structured flow from `staging` to `main` with automated PRs.
- **Automated Releases**: Semantic versioning with conventional commits.
- **Docker Deployment**: Auto-publish to GitHub Container Registry.

```bash
# Run checks locally
bun run lint
bun run tests
bun run build
```

📚 **Learn More:** [CI/CD Pipeline](https://rslucena.github.io/TypeScript-Boilerplate/devops/ci-cd-pipeline.html)

---

## 📚 Documentation

Comprehensive guides available in the [Official Documentation](https://rslucena.github.io/TypeScript-Boilerplate/):

| Guide | Description |
|-------|-------------|
| [Getting Started](https://rslucena.github.io/TypeScript-Boilerplate/guide/getting-started.html) | Detailed setup and configuration |
| [Complete Example](https://rslucena.github.io/TypeScript-Boilerplate/guide/complete-example.html) | Full walkthrough of creating a product domain |
| [Template System](https://rslucena.github.io/TypeScript-Boilerplate/development/template-system-architecture.html) | How the code generator works |
| [Domain Generator](https://rslucena.github.io/TypeScript-Boilerplate/development/domain-scaffolding.html) | Creating CRUD modules |
| [Architecture](https://rslucena.github.io/TypeScript-Boilerplate/architecture/) | Project structure deep dive |
| [Best Practices](https://rslucena.github.io/TypeScript-Boilerplate/development/best-practices.html) | Coding standards and patterns |
| [Testing Guide](https://rslucena.github.io/TypeScript-Boilerplate/development/testing-guide.html) | Writing and running tests |
| [CI/CD Pipeline](https://rslucena.github.io/TypeScript-Boilerplate/devops/ci-cd-pipeline.html) | Automation workflows |
| [Deployment](https://rslucena.github.io/TypeScript-Boilerplate/devops/deployment.html) | Production deployment |
| [HTTP Server](https://rslucena.github.io/TypeScript-Boilerplate/servers/http-server.html) | Fastify setup and configuration |
| [Scalable WebSockets](https://rslucena.github.io/TypeScript-Boilerplate/servers/websockets.html) | Redis Pub/Sub powered real-time |
| [Identity vs Credentials](./docs/architecture/identity-vs-credentials.md) | Domain separation architectural pattern |

---

## 🔗 Main Features

- **Bun** as package manager and runtime for fast installs and execution
- **TypeScript** for type-safe development
- **Vite** for fast builds and hot-module replacement (HMR)
- **Drizzle ORM** for modern and type-safe database access
- **Docker** and `docker-compose` for containerized development and production
- **Biome** for code linting and formatting
- **Testing** setup (see `tests/` directory)
- **Plugin System** for modular architecture and easy extensibility
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

- [Wiki](https://rslucena.github.io/TypeScript-Boilerplate/)
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
