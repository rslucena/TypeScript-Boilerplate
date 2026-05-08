<div align="center">
  <img src="https://i.ibb.co/Ytg53xH/Screenshot-from-2024-03-01-23-25-11.png" alt="TypeScript Boilerplate" width="100%" />
  
  <p><b>A modern, modular, and scalable TypeScript foundation for versatile Server-Side Applications.</b></p>

  <p>
    <a href="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/check.codeql.yml"><img src="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/check.codeql.yml/badge.svg" alt="CodeQL" /></a>
    <a href="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/ci.yml"><img src="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/ci.yml/badge.svg" alt="Quality Gate" /></a>
    <a href="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/deploy-docker.yml"><img src="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/deploy-docker.yml/badge.svg" alt="Docker Deployment" /></a>
    <a href="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/deploy-docs.yml"><img src="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/deploy-docs.yml/badge.svg" alt="Deploy Docs" /></a>
    <a href="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/release.yml"><img src="https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/release.yml/badge.svg" alt="Automated Release" /></a>
  </p>
  <p>
    <a href="https://github.com/rslucena/TypeScript-Boilerplate/graphs/code-frequency"><img src="https://img.shields.io/github/last-commit/rslucena/TypeScript-Boilerplate" alt="GitHub last commit" /></a>
    <a href="https://github.com/rslucena/TypeScript-Boilerplate/graphs/contributors"><img src="https://img.shields.io/github/contributors/rslucena/TypeScript-Boilerplate" alt="GitHub contributors" /></a>
    <a href="https://github.com/rslucena/TypeScript-Boilerplate/tree/main?tab=MIT-1-ov-file"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License" /></a>
  </p>

  <p>
    <i>Optimized for production • 100% Type-Safe • Auto-CRUD CLI • Built on Bun</i>
  </p>
</div>

---

## 🎯 The "Sweet Spot" of Web Development

We analyzed the current ecosystem and built this boilerplate to sit exactly in the sweet spot between **Developer Experience** and **Raw Performance**:

- **VS NestJS / Adonis**: Get the same "batteries-included" feel but with **3x the performance** and a much lower cognitive load (no complex Dependency Injection or decorator hell).
- **VS Go (Fiber/Gin)**: Achieve **near-native performance** without leaving the TypeScript ecosystem. Keep your rich npm libraries and the fastest developer feedback loop.
- **VS Elysia / Bare Fastify**: Instead of a "blank slate", start with a **production-ready architecture** featuring i18n, caching, automated testing, and database migrations already wired up.

| Feature | This Boilerplate | NestJS / Adonis | Go (Fiber/Gin) | Elysia / Bare Fastify |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime** | **Bun (Ultra Fast)** ⚡ | Node.js | Native Binary | Bun |
| **Dev Velocity** | **Extreme (CLI Gen)** 🚀 | High | Low | Medium |
| **Type Safety** | **Total (Zod + Drizzle)** 🔒 | Good | Strong | Total |
| **Smart Caching** | **Redis + Auto-Inv** 💾 | Manual setup | Manual | Manual |

---

## ✨ Core Features

- ⚡ **Blazing Fast**: Powered by **Bun** for 3x faster execution than standard Node.js.
- 🛠️ **CLI Generator**: Scaffold complete CRUD domains in seconds with `bun gen:domain`.
- 🔒 **End-to-End Type Safety**: Driven by **Drizzle ORM** and **Zod** validation.
- 💾 **Smart Caching**: Built-in Redis integration with *Graceful Degradation* for high availability.
- 📚 **Auto API Docs**: Instant, interactive Swagger UI documentation from your Zod schemas.
- 🌍 **i18n Ready**: Multi-language error messages and responses out of the box.
- 🛡️ **Secure Error Handling**: Internal details are masked and safely logged.
- 🔐 **SSO Ready**: Built-in OAuth2/OIDC structure for centralized identity management.

---

## 🚀 Quick Start (3 Minutes to Running API)

### 1️⃣ Scaffold Your Project

```bash
bun create rslucena/TypeScript-Boilerplate my-api
cd my-api
cp .env.exemple .env
```

> [!CAUTION]
> **Strict Environment Validation**: All variables in `.env` are **mandatory**. Configure your `DATABASE_URL`, `REDIS_URL`, and `AUTH_SALT` before running.

### 2️⃣ Start Infrastructure

Start PostgreSQL and Redis via Docker, then apply the database schema:

```bash
podman compose up -d --build
bun db:migrate:push
```
*(Note: Use `docker-compose` if you are not using Podman)*

### 3️⃣ Generate Keys & Start Server

Generate RSA+SSL keys for secure sessions and start the development server:

```bash
bun gen:keys
bun dev --workers=primary-webserver
```

**Boom! 💥 Your API is live.**
- 🟢 API Endpoint: `http://localhost:3000`
- 📖 Swagger Docs: `http://localhost:3000/docs`

---

## 🎨 The CLI Magic (`bun gen:domain`)

Why write boilerplate code when you can generate it? Create complete CRUD modules instantly:

```bash
bun gen:domain product
```

**What happens?**
You instantly get a Database table (Drizzle), Validation schemas (Zod), 5 REST endpoints, Business logic, Auto-registered routes, and a Test skeleton. **Zero `.hbs` or `.ejs` templates**—we use native TypeScript files for template generation!

---

## 🏗️ Architecture & Structure

<details open>
<summary><b>Click to view folder structure breakdown</b></summary>

```text
src/
├── commands/         # Commands or CLI entry points (System Core)
├── domain/           # Core Business Logic (The "What")
├── functions/        # Application entry points (APIs, Functions, CLI)
├── infrastructure/   # External Dependencies (The "How")
tests/                # Automated tests (Unit, Integration, Builders)
```

| Folder | Responsibility |
| :--- | :--- |
| **`domain`** | **Core Business Logic:** Entities, Schemas, and Actions. Independent of frameworks. |
| **`infrastructure`** | **External Dependencies:** DB Connections (Drizzle), Redis, Plugins, Logging. |
| **`functions`** | **Entry Points:** API Routes, WebSockets. Connects Domain to Infrastructure. |
| **`commands`** | **Process Management:** Bun runtime config, PM2, hooks, and build scripts. |

</details>

---

## 🧪 Testing & CI/CD

We take quality seriously. The project comes with a comprehensive testing suite and a robust GitHub Actions pipeline.

<details>
<summary><b>Testing Commands</b></summary>

Powered by Bun's blazing-fast test runner, aiming for >90% coverage:
```bash
bun test              # Run all unit and integration tests
bun test --watch      # Run in watch mode
bun test --coverage   # Generate coverage report
bun tests:ci          # Simulate GitHub Actions locally (requires act)
```
</details>

<details>
<summary><b>CI/CD Flow</b></summary>

- **Quality Gates:** Linting (Biome), Type Checking (TSC), and Tests run on every push.
- **Docker Ready:** Automated image publishing to GHCR.
- **Semantic Releases:** Automated versioning based on conventional commits.
</details>

---

## 📚 Documentation & Assistant

Our documentation is powered by **VitePress** (Vite + Vue), providing a blazing-fast, static site generation experience. This creates a clear separation of concerns: the core API uses native backend build tools (`tsup`/Bun), while the documentation utilizes Vite.

🌐 **[Read the Official Documentation](https://rslucena.github.io/TypeScript-Boilerplate/)**

> **Have questions? Ask our AI assistant:**
> 🤖 **[Access DeepWiki Assistant](https://deepwiki.com/rslucena/TypeScript-Boilerplate)**

---

## 🤝 Contributing & License

We welcome all contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
