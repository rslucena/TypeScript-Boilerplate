---
title: Quick Navigation
description: Quick navigation to the most important files and folders
---

<script setup>
import { MarkerType } from '@vue-flow/core'

const style = { type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed, style: { strokeWidth: 1.5 } }

const repoNodes = [
  { id: 'src', type: 'multi-handle', label: 'src/', position: { x: 250, y: 0 }, style: { backgroundColor: 'var(--vp-c-brand-soft)', fontWeight: 'bold' } },
  { id: 'cmd', type: 'multi-handle', label: 'commands/', position: { x: 50, y: 100 } },
  { id: 'dom', type: 'multi-handle', label: 'domain/', position: { x: 180, y: 100 } },
  { id: 'fn', type: 'multi-handle', label: 'functions/', position: { x: 320, y: 100 } },
  { id: 'infra', type: 'multi-handle', label: 'infrastructure/', position: { x: 450, y: 100 }, style: { backgroundColor: 'var(--vp-c-brand-soft)' } },
  
  { id: 'cache', type: 'multi-handle', label: 'cache/', position: { x: 350, y: 200 } },
  { id: 'db', type: 'multi-handle', label: 'repositories/', position: { x: 450, y: 200 } },
  { id: 'srv', type: 'multi-handle', label: 'server/', position: { x: 550, y: 200 } }
]

const repoEdges = [
  { id: 'e-src-cmd', source: 'src', target: 'cmd', ...style },
  { id: 'e-src-dom', source: 'src', target: 'dom', ...style },
  { id: 'e-src-fn', source: 'src', target: 'fn', ...style },
  { id: 'e-src-infra', source: 'src', target: 'infra', ...style },
  { id: 'e-infra-cache', source: 'infra', target: 'cache', ...style, type: 'smoothstep' },
  { id: 'e-infra-db', source: 'infra', target: 'db', ...style, type: 'smoothstep' },
  { id: 'e-infra-srv', source: 'infra', target: 'srv', ...style, type: 'smoothstep' }
]
</script>

# 🎯 Quick Navigation

**New here?** → [Getting Started](/guide/getting-started) | [Complete Example](/guide/complete-example)  
**Building features?** → [Domain Generator](/development/domain-scaffolding) | [Template System](/development/template-system-architecture)  
**Understanding the code?** → [Architecture](/architecture/) | [Best Practices](/development/best-practices)  
**Testing?** → [Testing Guide](/development/testing-guide)  
**Deploying?** → [CI/CD Pipeline](/devops/ci-cd-pipeline) | [Deployment Guide](/devops/deployment)  
**Need help?** → [Troubleshooting](/reference/troubleshooting)

## The Web Development "Sweet Spot"

This boilerplate is designed to be the perfect middle ground between high-performance low-level languages and complex enterprise frameworks:

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
| server       | Core Fastify configuration, interface definitions, and request transforms. |
| settings     | Environment variables and application-wide configuration.                  |

## References

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
