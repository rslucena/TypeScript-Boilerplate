---
title: Getting Started
---

# Getting Started

This guide walks you through setting up your development environment and getting your first feature up and running quickly.

## Installation

Before you begin, ensure your system meets the following requirements.

### Prerequisites

- A terminal or command-line interface to run VitePress commands
- [Bun](https://bun.sh) The JavaScript/TypeScript runtime
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) — For containerized services
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) — For version control

::: details Installation steps (Ubuntu / Debian)
```bash
# Update system and install base dependencies
sudo apt-get update
sudo apt-get install -y curl ca-certificates gnupg lsb-release software-properties-common

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Docker Engine and Docker Compose (official script)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Allow current user to run Docker without sudo
sudo usermod -aG docker $USER

# Install Git (latest stable via official PPA)
sudo add-apt-repository -y ppa:git-core/ppa
sudo apt-get update
sudo apt-get install -y git
```
:::

## Initial Setup

Follow the steps below to get the project up and running locally.

### 1. Clone the repository
::: code-group [bash]
```bash
git clone https://github.com/your-username/TypeScript-Boilerplate.git
cd TypeScript-Boilerplate
```
:::

### 2. Install dependencies
::: code-group [bash]
```bash
bun install
```
:::

### 3. Start development services
::: code-group
```bash [bash]
docker compose up -d
```
:::

### 4. Apply database migrations
::: code-group [bash]
```bash
bun db:migrate:push
```
:::

## File Structure

The project is organized to enforce clear separation of concerns, improve maintainability, and support scalability. Each top-level directory has a well-defined responsibility within the application architecture.

```text
.
├─ commands
├─ domain
├─ functions
└─ infrastructure
```

## Directory Overview

| Folder           | Description |
|------------------|-------------|
| `commands`       | Application entry points and process handlers responsible for bootstrapping and orchestrating workflows. |
| `domain`         | Core business logic, including entities, use cases, schemas, and route definitions. |
| `functions`      | Reusable utility functions and shared helpers used across the application. |
| `infrastructure` | Technical and external concerns such as database access, caching, server setup, logging, messaging, and internationalization (i18n). |

## Design Notes

- The `domain` layer is framework-agnostic and contains no infrastructure-specific code.
- The `infrastructure` layer encapsulates all external integrations and technical implementations.
- This structure promotes:
    - Clear boundaries between business logic and technical concerns
    - Easier testing and refactoring
    - Long-term scalability


## What's Next?

- [Scripts & Development](./scripts-&-development.md) — Overview of all available `package.json` scripts for development, database management, testing, and build processes.


