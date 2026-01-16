---
title: Scripts & Development
---

# Scripts & Development

Once the setup is complete, the following scripts will be available in your `package.json`. These commands handle everything from the local development server to database migrations and testing.

## Configuration

These are the primary scripts registered in your project:

``` json [package.json]
{
  "scripts": {
    "dev": "bun --watch src/commands/exec-process.ts",
    "build": "bun src/commands/exec-builder.ts",
    "start": "bun dist/commands/exec-process.js",
    "db:migrate:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio --host localhost",
    "tests": "bun test --coverage",
    "lint:check": "bunx biome ci .",
    "gen:domain": "bun src/commands/generate-domain.ts"
  }
}
```

## Local Development

### Start Development Server

The dev script starts your main process with instant hot updates using Bun's native watch mode.

::: code-group
``` Bash [npm]
npm run dev
```
``` Bash [pnpm]
pnpm dev
```
``` Bash [yarn]
yarn dev
```
``` Bash [bun]
bun dev
```
:::

## Database Management (Drizzle)

Use these commands to sync your schema or manage your data via the Drizzle Studio.

### Push Schema Changes:
::: code-group
``` Bash [npm]
npm run db:migrate:push
```
```Bash [pnpm]
pnpm db:migrate:push
```
```Bash [yarn]
yarn db:migrate:push
```
```Bash [bun]
bun db:migrate:push
```
:::

### Open Drizzle Studio:
::: code-group
``` Bash [npm]
npm run db:studio
```
``` Bash [pnpm]
pnpm db:studio
```
``` Bash [yarn]
yarn db:studio
```
``` Bash [bun]
bun db:studio
```
:::

### Quality & Tooling

Keep your code base clean, tested, and up to date with these utility scripts:

::: code-group
``` Bash [Tests]
bun tests
```
``` Bash [Lint Check]
bun lint:check
```
``` Bash [Outdated Deps]
bun pb:health
```
``` Bash [Gen Domain]
bun gen:domain
```
:::

[!TIP]
The development server uses Bun's --watch flag, meaning it will automatically restart whenever you save changes in the src directory.

## CLI Reference

Instead of npm scripts, you can also invoke commands directly using your preferred runner:

::: code-group
``` Bash [npm]
npx drizzle-kit push
```
``` Bash [pnpm]
pnpm dlx drizzle-kit push
```
``` Bash [yarn]
yarn dlx drizzle-kit push
``` 
``` Bash [bun]
bunx drizzle-kit push
```
:::

### Key Improvements:
1.  **Professional Terminology:** Used terms like `Hot Updates`, `Schema Changes` and `Utility Scripts`.
2.  **Logical Grouping:** Separated `Local Development` from `Database Management` and `Quality` (Lint/Tests).
3.  **Cross-Platform Tabs:** Included code for all package managers, ensuring your users can choose their preferred tool.
4.  **Action-Oriented Headings:** Instead of just listing the command, I used descriptions like `Start Development Server` or `Push Schema Changes`.
5.  **Drizzle Focus:** Since you are using `drizzle-kit`, I highlighted those specific workflows.