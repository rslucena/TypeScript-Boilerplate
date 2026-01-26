---
title: Troubleshooting
description: Common issues and solutions
---

# Troubleshooting

Common issues and solutions when working with the TypeScript Boilerplate.

## Installation Issues

### Problem: `bun: command not found`

**Solution:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Restart terminal or reload shell configuration
source ~/.bashrc  # or ~/.zshrc
```

### Problem: `docker-compose: command not found`

**Solution:**
```bash
# Install Docker Compose
sudo apt-get install docker-compose  # Ubuntu/Debian
brew install docker-compose           # macOS
```

## Database Issues

### Problem: Migration fails with "relation already exists"

**Cause:** Table was created manually or migration ran partially

**Solution:**
```bash
# Option 1: Drop and recreate (development only!)
docker-compose down -v
docker-compose up -d
bun db:migrate:push

# Option 2: Create new migration
bun db:migrate
# Edit the generated file to handle existing tables
bun db:migrate:push
```

### Problem: Can't connect to PostgreSQL

**Symptoms:**
```
Error: Connection refused at localhost:5432
```

**Solution:**
```bash
# 1. Check if container is running
docker ps | grep postgres

# 2. Check logs
docker-compose logs database

# 3. Restart containers
docker-compose restart

# 4. Verify environment variables in .env
# DATABASE_URL should match docker-compose.yml
```

### Problem: Database changes not reflecting

**Cause:** Forgot to run migrations

**Solution:**
```bash
# Always run this after modifying entity files
bun db:migrate        # Generate migration
bun db:migrate:push   # Apply to database
```

## Cache Issues

### Problem: Stale data after updates

**Symptoms:** Old data still appearing after POST/PUT/DELETE

**Cause:** Cache not invalidated properly

**Solution:**
```typescript
// Ensure cache invalidation in your action
await cache.json.del(tag("domain", "find*"));

// For specific keys
await cache.json.del(tag("domain", "find{id}", { id }));
```

### Problem: Redis connection errors

**Symptoms:**
```
Error: Redis connection to localhost:6379 failed
```

**Solution:**
```bash
# 1. Ensure Redis container is running
docker ps | grep redis

# 2. Check .env configuration
# REDIS_URL=redis://localhost:6379

# 3. Restart Redis
docker-compose restart redis
```

## Domain Generator Issues

### Problem: `bun gen:domain` command not found

**Solution:**
```bash
# Run directly
bun run src/commands/generate-domain.ts product

# Or check package.json has the script
"scripts": {
  "gen:domain": "bun run src/commands/generate-domain.ts"
}
```

### Problem: Generated files have syntax errors

**Cause:** Domain name contains invalid characters

**Solution:**
```bash
# ✅ Good: Use singular, lowercase, alphanumeric
bun gen:domain product
bun gen:domain blogpost

# ❌ Bad: Spaces, special chars, capitals
bun gen:domain "Blog Post"
bun gen:domain blog-post-123!
```

## Test Issues

### Problem: Tests failing with "module not found"

**Cause:** Missing path alias configuration

**Solution:**
```bash
# 1. Check tsconfig.json has paths configured
{
  "compilerOptions": {
    "paths": {
      "@domain/*": ["./src/domain/*"],
      "@infrastructure/*": ["./src/infrastructure/*"]
    }
  }
}

# 2. Restart your editor/IDE
```

### Problem: Mock not working

**Symptoms:** Mock functions not being called

**Solution:**
```typescript
// ✅ Correct: Mock before importing the module that uses it
import { mock } from "bun:test";
mock.module("@infrastructure/cache/actions", () => ({
	default: { json: { get: mock(() => null), set: mock(() => {}) } }
}));
import myAction from "@domain/user/actions/my-action";

// ❌ Wrong: Import before mock
import myAction from "@domain/user/actions/my-action";
mock.module("@infrastructure/cache/actions", ...);
```

## API Issues

### Problem: 404 on all routes

**Cause:** Routes not registered

**Solution:**
```typescript
// In src/functions/http-primary-webserver.ts
import userRoutes from "@domain/user/routes";

(async () => {
  const server = await webserver.create();
  // ...
  server.register(userRoutes, { prefix: "/api/v1/users" });   // Add this line
  // ...
  await webserver.start(server, Number(process.env.PROCESS_PORT));
})();

```

### Problem: Swagger not showing routes

**Cause:** Schema missing from route definition

**Solution:**
```typescript
// ✅ Good: Schema properly defined
api.post("/", {
	schema: {
		tags: ["User"],
		summary: "Create user",
		body: schema.actions.create,
		response: { 201: schema.entity }
	}
}, handler);

// ❌ Bad: No schema
api.post("/", handler);
```

### Problem: CORS errors in browser

**Solution:**
```typescript
// In .env, configure CORS origins
PROCESS_CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

## Performance Issues

### Problem: Slow query performance

**Diagnostic:**
```typescript
// Add query timing
const start = Date.now();
const result = await repository.select().from(entity);
console.log(`Query took ${Date.now() - start}ms`);
```

**Solutions:**
```typescript
// 1. Add indexes
pgIndex("entity", table, ["frequently_queried_column"])

// 2. Use prepared statements
const prepared = query.prepare("/unique-name");

// 3. Limit selected columns
const { heavy_column, ...rest } = getTableColumns(entity);
repository.select(rest).from(entity);

// 4. Add pagination
withPagination(query, page, limit);
```

### Problem: Memory leaks

**Symptoms:** Memory usage grows over time

**Diagnostic:**
```bash
# Monitor memory usage
docker stats

# Check for leaks in Node
NODE_OPTIONS="--max-old-space-size=4096" bun dev
```

**Common Causes:**
- Not closing database connections
- Cache growing indefinitely
- Event listeners not removed

## Build Issues

### Problem: Build fails with TypeScript errors

**Solution:**
```bash
# 1. Clear cache
rm -rf node_modules/.cache
rm -rf dist/

# 2. Reinstall dependencies
rm -rf node_modules
bun install

# 3. Check tsconfig.json is valid
```

### Problem: Docker build fails

**Solution:**
```bash
# 1. Clear Docker cache
docker system prune -a

# 2. Build with no cache
docker-compose build --no-cache

# 3. Check Dockerfile paths are correct
```

## Environment Issues

### Problem: `❌ Invalid environment variables`

**Symptoms:**
When starting the app via `bun dev` or `bun run dev`, it crashes immediately with a list like:
```
❌ Invalid environment variables:
  - PROCESS_PORT: Invalid input: expected number, received NaN
  - AUTH_SALT: Invalid input: expected string, received undefined
...
```

**Cause:**
The boilerplate implements **Strict Environment Validation** via Zod. Most environment variables (Postgres, Redis, JWT Salt, etc.) are mandatory and do not have fallbacks to ensure production safety and "fail-fast" behavior.

**Solution:**
1.  **Check your `.env` file**: Ensure every variable listed in the error message is defined in your `.env` file.
2.  **Verify Variable Names**: Names must match exactly (e.g., `POSTGRES_USER` not `DB_USER`).
3.  **Check Data Types**: Ports must be numbers, booleans must be `"true"` or `"false"`.
4.  **Sync with Exemple**: Run `cp .env.exemple .env` if you are starting from scratch and fill in all values.

### Problem: Environment variables not loading

**Solution:**
```bash
# 1. Ensure .env file exists
cp .env.exemple .env

# 2. Check .env file format (no quotes needed)
POSTGRES_PORT=5432
POSTGRES_POOL=10
POSTGRES_SERVER=localhost
POSTGRES_USER=user
POSTGRES_DATABASE=dbname
POSTGRES_PASSWORD=password

# 3. Restart the application after .env changes
```

### Problem: Different behavior in development vs production

**Diagnostic:**
```typescript
console.log(process.env.NODE_ENV);
// Should be 'development' locally, 'production' in prod
```

**Solution:**
```bash
# Explicitly set NODE_ENV
NODE_ENV=production bun start
```

## Getting Help

If your issue isn't listed here:

1. **Check the logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Enable debug mode:**
   ```bash
   DEBUG=* bun dev
   ```

3. **Search existing issues:**
   - [GitHub Issues](https://github.com/rslucena/TypeScript-Boilerplate/issues)

4. **Ask for help:**
   - Open a new [GitHub Issue](https://github.com/rslucena/TypeScript-Boilerplate/issues/new)
   - Include:
     - Error message (full stack trace)
     - Your environment (OS, Bun version, Docker version)
     - Steps to reproduce

## Quick Reference

### Essential Commands

```bash
# Development
bun dev --workers=primary-webserver

# Testing
bun test
bun test --coverage

# Database
bun db:migrate
bun db:migrate:push
bun db:studio

# Docker
docker-compose up -d
docker-compose down
docker-compose logs -f

# Code quality
bun run prebuild  # Format with Biome
```

### Useful Debugging Snippets

```typescript
// Log SQL queries
repository.select().from(entity).toSQL();

// Inspect cache keys
const keys = await cache.keys("*");
console.log(keys);

// Check Zod validation details
const result = schema.safeParseAsync(data);
if (!result.success) console.log(result.error.format());
```

## Frequently Asked Questions (FAQ)

### 1. Can I use Node.js instead of Bun?
The boilerplate is heavily optimized for **Bun**. While it's possible to run it with Node.js, you would lose the integrated test runner, the ultra-fast package manager, and some native optimizations. We highly recommend sticking with Bun for the intended performance gains.

### 2. How do I change from PostgreSQL to another database?
The project uses **Drizzle ORM**, which supports various dialects (PostgreSQL, MySQL, SQLite). To switch:
1. Update `docker-compose.yml` with the new database image.
2. Change the DB driver in `infrastructure/repositories/repository.ts`.
3. Update `drizzle.config.ts` to reflect the new dialect.
4. Regenerate migrations.

### 3. How to add a new plugin/middleware?
We follow Fastify's plugin architecture. You can:
- Add a new file in `src/infrastructure/plugins/`.
- Register it in `src/infrastructure/server/server.ts` or directly in your domain routes.

### 4. Is the Domain Generator customizable?
Yes! The generator uses templates located in `src/commands/templates/` (if implemented as a separate directory) or directly within the `generate-domain.ts` script. You can modify these templates to include extra fields or different logic by default.

### 5. How to handle multiple environments (test, staging)?
Use different `.env` files (e.g., `.env.test`, `.env.staging`) and load them by setting the `NODE_ENV` variable. The CI/CD pipeline already handles this for you using GitHub Secrets.
