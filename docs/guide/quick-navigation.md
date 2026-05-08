---
title: Quick Navigation
description: Quick navigation to the most important files and folders
---

<script setup>
import { MarkerType } from '@vue-flow/core'

const style = { type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed, style: { strokeWidth: 1.5 } }

const repoNodes = [
  { id: 'src', type: 'multi-handle', label: 'src/', position: { x: 300, y: -50 } },
  { id: 'cmd', type: 'multi-handle', label: 'commands/', position: { x: 50, y: 100 } },
  { id: 'dom', type: 'multi-handle', label: 'domain/', position: { x: 170, y: 160 } },
  { id: 'fn', type: 'multi-handle', label: 'functions/', position: { x: 290, y: 100 } },
  { id: 'infra', type: 'multi-handle', label: 'infrastructure/', position: { x: 510, y: 100 } },

  { id: 'cache', type: 'multi-handle', label: 'cache/', position: { x: 400, y: 200 } },
  { id: 'db', type: 'multi-handle', label: 'repositories/', position: { x: 517, y: 200 } },
  { id: 'srv', type: 'multi-handle', label: 'server/', position: { x: 660, y: 200 } }
]

const repoEdges = [
  { id: 'e-src-cmd', sourceHandle: 'left-source', targetHandle: 'top', source: 'src', target: 'cmd', ...style },
  { id: 'e-src-dom', sourceHandle: 'left-source', targetHandle: 'top', source: 'src', target: 'dom', ...style },
  { id: 'e-src-fn', sourceHandle: 'bottom-source', targetHandle: 'top',source: 'src', target: 'fn', ...style },
  { id: 'e-src-infra', sourceHandle: 'right-source', targetHandle: 'top', source: 'src', target: 'infra', ...style },
  { id: 'e-infra-cache', sourceHandle: 'left-source', targetHandle: 'top', source: 'infra', target: 'cache', ...style, type: 'smoothstep' },
  { id: 'e-infra-db', sourceHandle: 'bottom-source', targetHandle: 'top', source: 'infra', target: 'db', ...style, type: 'smoothstep' },
  { id: 'e-infra-srv', sourceHandle: 'right-source', targetHandle: 'top', source: 'infra', target: 'srv', ...style, type: 'smoothstep' }
]
</script>

# Quick Navigation

### The Praxis Identity
Understand the philosophy and core values behind our enterprise architecture.
**[Read the Branding Manifesto](/architecture/branding)**

---

### Documentation Map

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin: 2rem 0;">

  <div>
    <h4 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">🚀 Foundations</h4>
    <ul style="list-style: none; padding-left: 0; font-size: 0.95rem; line-height: 1.8;">
      <li><a href="/TypeScript-Boilerplate/guide/getting-started">Getting Started</a></li>
      <li><a href="/TypeScript-Boilerplate/guide/complete-example">Complete Example</a></li>
      <li><a href="/TypeScript-Boilerplate/architecture/">Architecture Overview</a></li>
      <li><a href="/TypeScript-Boilerplate/development/best-practices">Best Practices</a></li>
      <li><a href="/TypeScript-Boilerplate/development/base-repository-pattern">Repository Pattern</a></li>
    </ul>
  </div>

  <div>
    <h4 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">🛠️ Development</h4>
    <ul style="list-style: none; padding-left: 0; font-size: 0.95rem; line-height: 1.8;">
      <li><a href="/TypeScript-Boilerplate/development/domain-scaffolding">Domain Generator</a></li>
      <li><a href="/TypeScript-Boilerplate/development/template-system-architecture">Template System</a></li>
      <li><a href="/TypeScript-Boilerplate/api/introduction">API Reference</a></li>
      <li><a href="/TypeScript-Boilerplate/development/testing-guide">Testing Guide</a></li>
      <li><a href="/TypeScript-Boilerplate/api/health-check">Health Check</a></li>
    </ul>
  </div>

  <div>
    <h4 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">⚙️ Infrastructure</h4>
    <ul style="list-style: none; padding-left: 0; font-size: 0.95rem; line-height: 1.8;">
      <li><a href="/TypeScript-Boilerplate/development/environment-configuration">Environment Config</a></li>
      <li><a href="/TypeScript-Boilerplate/development/security-and-keys">Security & Keys</a></li>
      <li><a href="/TypeScript-Boilerplate/development/database-migrations">DB Migrations</a></li>
      <li><a href="/TypeScript-Boilerplate/devops/ci-cd-pipeline">CI/CD Pipeline</a></li>
      <li><a href="/TypeScript-Boilerplate/devops/deployment">Deployment Guide</a></li>
    </ul>
  </div>

  <div>
    <h4 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">🆘 Support</h4>
    <ul style="list-style: none; padding-left: 0; font-size: 0.95rem; line-height: 1.8;">
      <li><a href="/TypeScript-Boilerplate/reference/troubleshooting">Troubleshooting</a></li>
      <li><a href="/TypeScript-Boilerplate/devops/process-manager-reference">Process Manager</a></li>
      <li><a href="/TypeScript-Boilerplate/reference/logs-actions-reference">Logs Reference</a></li>
      <li><a href="/TypeScript-Boilerplate/reference/cache-actions-reference">Cache Reference</a></li>
    </ul>
  </div>

</div>




## The Web Development "Sweet Spot"

The Praxis framework is designed to be the perfect middle ground between high-performance low-level languages and complex enterprise frameworks:

- **Performance**: Near Go-like speeds thanks to the **Bun** runtime.
- **Productivity**: Full "batteries-included" experience with CLI scaffolding, i18n, and integrated caching.
- **Maintainability**: Clean architecture with zero-dependency TypeScript templates.

> **See the [Full Comparison](https://github.com/rslucena/TypeScript-Boilerplate#--why-choose-this-boilerplate) in the readme.**

## Continuous Integration

This project utilizes continuous integration to automate checks and builds:

- [CodeQL](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/check.codeql.yml): Analyzes code for security vulnerabilities.
- [Quality Gate](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/ci.yml): Automates build, test, and linting processes for the `main` and `staging` branches.
- [Release Train](https://github.com/rslucena/TypeScript-Boilerplate/actions/workflows/release-train.yml): Automates the stabilization process between `staging` and `main`.

## Project Statistics

- [Commit Activity](https://github.com/rslucena/TypeScript-Boilerplate/pulse): Track commit activity over time.
- [Last Commit](https://github.com/rslucena/TypeScript-Boilerplate/graphs/code-frequency): View the most recent commits.
- [Contributors](https://github.com/rslucena/TypeScript-Boilerplate/graphs/contributors): See who has contributed to this project.

## Technologies Used

| Technology  | Description                                                                                                                    |
|-------------|--------------------------------------------------------------------------------------------------------------------------------|
| Typescript  | A programming language that adds static typing to JavaScript. Facilitates the development of robust and scalable code.         |
| Drizzle-ORM | An Object-Relational Mapping (ORM) library for TypeScript. Simplifies database interactions.                                   |
| Fastify     | A fast and low overhead web framework for Node.js.                                                                             |
| Redis       | An in-memory data structure store, widely used as a cache or message broker. Enhances data storage and retrieval efficiency.   |
| TSX         | TypeScript Execute. A CLI tool to execute TypeScript files with zero configuration.                                            |
| TSUP        | A fast TypeScript bundler tool. Simplifies the build and distribution process.                                                 |
| Biome       | A fast all-in-one toolchain for web projects (formatter and linter), used to maintain code quality.                            |
| Bun Test    | A fast test runner for JavaScript and TypeScript projects, used to ensure code quality.                                        |
| PM2         | Process manager for Node.js applications that simplifies deployment, management, and monitoring of applications in production. |
| Status Page | Monitors the availability and performance of online services (Uptime Kuma).                                                    |

## Interactive Repository Map

Visualize the project structure and how the different layers interact:

<InteractiveFlow :nodes="repoNodes" :edges="repoEdges" />

### Main Folders (`src/`)

| Folder | Description |
|:---|:---|
| **`commands/`** | Application entry points, process handlers (PM2), and build scripts. |
| **`domain/`** | Business logic layer: Entities, Actions, Schemas, and Routes organized by domain. |
| **`functions/`** | Shared utilities and helper functions used across the project. |
| **`infrastructure/`** | Technical implementation: Cache, Database, Server, i18n, etc. |

### Infrastructure Details

| Folder       | Description                                                                |
|--------------|----------------------------------------------------------------------------|
| cache        | Redis implementation for fast data retrieval with TTL support.             |
| languages    | Internationalization (i18n) support for multi-language responses.          |
| logs         | Standardized logging handlers.                                             |
| messages     | Messaging system supporting both Redis (Pub/Sub) and Node.js Events.       |
| migrations   | Automated database schema versioning scripts via Drizzle Kit.              |
| repositories | Data access layer and database connection management.                      |
| server       | [Core Fastify (HTTP)](/servers/http-server) and [Scalable WebSockets](/servers/websockets). |
| settings     | Environment variables and application-wide configuration.                  |

## Internal References

- [Typescript](https://www.typescriptlang.org)
- [Drizzle ORM](https://orm.drizzle.team)
- [Fastify](https://fastify.dev)
- [Redis](https://redis.io)
- [Bun](https://bun.sh)
- [TSX](https://tsx.is)
- [Biome](https://biomejs.dev)
- [PM2](https://pm2.keymetrics.io)
- [Uptime Kuma](https://github.com/louislam/uptime-kuma)

> **Observations:**
> This list of folders is not exhaustive. The project may contain other files and directories not listed here.
> For more detailed information, refer to the specific documentation pages in the sidebar.
