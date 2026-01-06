![https://github.com/rslucena/TypeScript-Boilerplate](https://i.ibb.co/Ytg53xH/Screenshot-from-2024-03-01-23-25-11.png)

### Modular and High-Performance Boilerplate for Server-Side Services

A modern, **modular and scalable** TypeScript Boilerplate for versatile **Server-Side Applications** (APIs, Functions, WebSockets, CLI) featuring:

* **Runtime:** **Bun** (Speed ​​and Efficiency)
* **Build Tool:** **Vite** (Quick builds and HMR)
* **Database ORM:** **Drizzle ORM** (Type-Safe data access)
* **Containerization:** **Docker** e `docker-compose` (Environmental Consistency)

### This boilerplate is optimized for production and comes with full support for testing and code quality.

[![CodeQL](https://github.com/rslucena/Template-Typescript/actions/workflows/check.codeql.yml/badge.svg)](https://github.com/rslucena/Template-Typescript/actions/workflows/check.codeql.yml) [![Build and Test CI](https://github.com/rslucena/Template-Typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/rslucena/Template-Typescript/actions/workflows/build.nodejs.yml) [![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/rslucena/Template-Typescript?link=https%3A%2F%2Fgithub.com%2Frslucena%2FTemplate-Typescript%2Fcommits%2Fmain%2F)](https://github.com/rslucena/Template-Typescript/graphs/code-frequency)

[![GitHub contributors](https://img.shields.io/github/contributors/rslucena/Template-Typescript)](https://github.com/rslucena/Template-Typescript/graphs/contributors) [![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/rslucena/TypeScript-Boilerplate/tree/main?tab=MIT-1-ov-file) [![Commit Activity](https://img.shields.io/github/commit-activity/t/rslucena/Template-Typescript)](https://github.com/rslucena/Template-Typescript/pulse)

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

📚 **Learn More:** [Template System Architecture](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Template-System-Architecture) | [Domain Generator Guide](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Domain-Scaffolding-(Generator))

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

Comprehensive test suite using Bun's blazing-fast test runner:

```bash
bun test              # Run all tests
bun test --watch      # Watch mode
bun test --coverage   # Coverage report
```

**Test Structure:**
- `tests/unit/` - Pure logic tests
- `tests/integration/` - API endpoint tests
- `tests/builders/` - Test data factories
- `tests/mocks/` - Shared mocks

📚 **Learn More:** [Testing Guide](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Testing-Guide)

---

## 🚀 CI/CD Pipeline

Automated quality gates and deployments with GitHub Actions:

- **Quality Gate**: Lint, test, and build on every push
- **Automated Releases**: Semantic versioning with conventional commits
- **Docker Deployment**: Auto-publish to GitHub Container Registry

```bash
# Run checks locally
bun run lint:check
bun run tests
bun run build
```

📚 **Learn More:** [CI/CD Pipeline](https://github.com/rslucena/TypeScript-Boilerplate/wiki/CI-CD-Pipeline)

---

## 📚 Documentation

Comprehensive guides available in the [Wiki](https://github.com/rslucena/TypeScript-Boilerplate/wiki):

| Guide | Description |
|-------|-------------|
| [Getting Started](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Getting-Started) | Detailed setup and configuration |
| [Complete Example](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Complete-Example) | Full walkthrough of creating a User domain |
| [Template System](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Template-System-Architecture) | How the code generator works |
| [Domain Generator](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Domain-Scaffolding-(Generator)) | Creating CRUD modules |
| [Architecture](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Architecture) | Project structure deep dive |
| [Best Practices](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Best-Practices) | Coding standards and patterns |
| [Testing Guide](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Testing-Guide) | Writing and running tests |
| [CI/CD Pipeline](https://github.com/rslucena/TypeScript-Boilerplate/wiki/CI-CD-Pipeline) | Automation workflows |
| [Deployment](https://github.com/rslucena/TypeScript-Boilerplate/wiki/Deployment) | Production deployment |

---

## 🔗 Main Features

- **Bun** as package manager and runtime for fast installs and execution
- **TypeScript** for type-safe development
- **Vite** for fast builds and hot-module replacement (HMR)
- **Drizzle ORM** for modern and type-safe database access
- **Docker** and `docker-compose` for containerized development and production
- **ESLint** and **Biome** for code linting and formatting
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
