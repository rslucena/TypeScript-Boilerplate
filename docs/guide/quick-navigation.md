---
title: Quick Navigation
description: Quick navigation to the most important files and folders
---
# 🎯 Quick Navigation

**New here?** → [Getting Started](/guide/getting-started) | [Complete Example](/guide/complete-example)\
**Building features?** → [Domain Generator](/development/domain-scaffolding) | [Template System](/development/template-system-architecture)\
**Understanding the code?** → [Architecture](/architecture/) | [Best Practices](/development/best-practices) | [Repository Pattern](/development/base-repository-pattern)**Security & Infrastructure?** → [Environment](/development/environment-configuration) | [Security & Keys](/development/security-and-keys) | [Database Migrations](/development/database-migrations)**API & Auth?** → [Identity, Credentials & SSO](/api/identity-credentials-sso) | [Health Check](/api/health-check)**Testing?** → [Testing Guide](/development/testing-guide)\
**Deploying?** → [CI/CD Pipeline](/devops/ci-cd-pipeline) | [Deployment Guide](/devops/deployment) | [Process Manager](/devops/process-manager-reference)**Need help?** → [Troubleshooting](/reference/troubleshooting)

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

TechnologyDescriptionTypescriptA programming language that adds static typing to JavaScript. Facilitates the development of robust and scalable code.Drizzle-ORMAn Object-Relational Mapping (ORM) library for TypeScript. Simplifies database interactions.FastifyA fast and low overhead web framework for Node.js.RedisAn in-memory data structure store, widely used as a cache or message broker. Enhances data storage and retrieval efficiency.TSXTypeScript Execute. A CLI tool to execute TypeScript files with zero configuration.TSUPA fast TypeScript bundler tool. Simplifies the build and distribution process.BiomeA fast all-in-one toolchain for web projects (formatter and linter), used to maintain code quality.Bun TestA fast test runner for JavaScript and TypeScript projects, used to ensure code quality.PM2Process manager for Node.js applications that simplifies deployment, management, and monitoring of applications in production.Status PageMonitors the availability and performance of online services (Uptime Kuma).

## Interactive Repository Map

Visualize the project structure and how the different layers interact:

### Main Folders (`src/`)

FolderDescription`commands/`Application entry points, process handlers (PM2), and build scripts.`domain/`Business logic layer: Entities, Actions, Schemas, and Routes organized by domain.`functions/`Shared utilities and helper functions used across the project.`infrastructure/`Technical implementation: Cache, Database, Server, i18n, etc.

### Infrastructure Details

FolderDescriptioncacheRedis implementation for fast data retrieval with TTL support.languagesInternationalization (i18n) support for multi-language responses.logsStandardized logging handlers.messagesMessaging system supporting both Redis (Pub/Sub) and Node.js Events.migrationsAutomated database schema versioning scripts via Drizzle Kit.repositoriesData access layer and database connection management.server[Core Fastify (HTTP)](/servers/http-server) and [Scalable WebSockets](/servers/websockets).settingsEnvironment variables and application-wide configuration.

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

> **Observations**:This list of folders is not exhaustive. The project may contain other files and directories not listed here. For more detailed information, refer to the specific documentation pages in the sidebar.