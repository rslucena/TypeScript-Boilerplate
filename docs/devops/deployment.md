---
title: Deployment Guide
description: Production deployment guide
---

# Deployment Guide

Complete guide to deploying your TypeScript Boilerplate application to production.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests passing (`bun test`)
- [ ] Environment variables documented in `.env.exemple`
- [ ] Sensitive data removed from logs
- [ ] Database migrations tested
- [ ] Docker build succeeds locally
- [ ] CORS configured for production domains
- [ ] Error messages use i18n keys (no hardcoded strings)

## Deployment Options

### Option 1: Docker Compose (VPS)

Best for: Full control, self-hosted on VPS (DigitalOcean, Linode, etc.)

#### Step 1: Prepare Server

```bash
# SSH into your server
ssh user@your-server.com

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose

# Create app directory
mkdir -p /opt/myapp
cd /opt/myapp
```

#### Step 2: Transfer Files

```bash
# On your local machine
rsync -avz --exclude 'node_modules' \
  --exclude '.git' \
  ./ user@your-server.com:/opt/myapp/
```

#### Step 3: Configure Environment

```bash
# On server
cd /opt/myapp
cp .env.exemple .env
nano .env  # Edit with production values
```

#### Step 4: Deploy

The project uses `env_file` to load your configurations automatically from `.env`, while keeping specific overrides in `docker-compose.yml` for internal Docker networking.

```bash
# Build and start all services
podman compose up -d --build

# Check logs
podman compose logs -f
```

#### Step 5: Database Migrations (Production)

```bash
# Run migrations through the app container
podman exec -it app_server bun db:migrate:push
```

#### Step 5: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt-get install nginx

# Create config
sudo nano /etc/nginx/sites-available/myapp
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option 2: Fly.io (Platform-as-a-Service)

Best for: Quick deployment without managing infrastructure

#### Step 1: Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

#### Step 2: Initialize App

```bash
fly launch

# Follow prompts:
# - App name: my-typescript-api
# - Region: Choose closest to your users
# - Setup PostgreSQL: Yes
# - Setup Redis: Yes
```

#### Step 3: Configure

Create `fly.toml`:

```toml
app = "my-typescript-api"
primary_region = "gru"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PROCESS_PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[services]]
  protocol = "tcp"
  internal_port = 8080

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

#### Step 4: Set Secrets

```bash
fly secrets set DATABASE_URL=$(fly postgres create -n my-db --region gru)
fly secrets set REDIS_URL=$(fly redis create -n my-redis --region gru)
```

#### Step 5: Deploy

```bash
fly deploy
fly logs  # Monitor deployment
```

---

### Option 3: Railway

Best for: Zero-config deployment

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Initialize

```bash
railway init

# Link to existing project or create new
railway link
```

#### Step 3: Add Services

From Railway Dashboard:
- Add PostgreSQL database
- Add Redis
- Note connection URLs

#### Step 4: Configure Variables

```bash
railway variables set NODE_ENV=production
railway variables set PROCESS_PORT=3000
# DATABASE_URL and REDIS_URL auto-configured
```

#### Step 5: Deploy

```bash
railway up
railway logs
```

---

### Option 4: Render

Best for: Free tier, automatic deployments from Git

#### Step 1: Create Render Account

Visit [render.com](https://render.com) and connect your GitHub repo

#### Step 2: Create Services

1. **Create PostgreSQL Database:**
   - New → PostgreSQL
   - Note the Internal Database URL

2. **Create Redis:**
   - New → Redis
   - Note the Internal Redis URL

3. **Create Web Service:**
   - New → Web Service
   - Connect your repo
   - Build Command: `bun install && bun db:migrate:push`
   - Start Command: `bun start`

#### Step 3: Configure Environment

In Web Service settings → Environment:
```
NODE_ENV=production
DATABASE_URL=<from PostgreSQL>
REDIS_URL=<from Redis>
PROCESS_PORT=10000
```

#### Step 4: Deploy

Render auto-deploys on git push to main

---

## Production Dockerfile

## Production Dockerfile

The project already includes a simplified multi-stage production-optimized **Dockerfile** at the root:

```dockerfile
FROM docker.io/oven/bun:latest AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --ignore-scripts

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --production --ignore-scripts

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
RUN NODE_ENV=test bun test
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install --chown=bun:bun /temp/prod/node_modules node_modules
COPY --from=prerelease --chown=bun:bun /usr/src/app/dist/ dist
COPY --from=prerelease --chown=bun:bun /usr/src/app/package.json .
COPY --from=prerelease --chown=bun:bun /usr/src/app/src/commands/exec-process.ts . 

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "dist/commands/exec-process.js" ]
```

## Health Checks

Implement health check endpoint:

```typescript
// In your routes
api.get("/health", async (request, reply) => {
	try {
		// Check database
		await repository.select().from(user).limit(1);
		
		// Check Redis
		await cache.ping();
		
		reply.code(200).send({ 
			status: "healthy",
			uptime: process.uptime(),
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		reply.code(503).send({ 
			status: "unhealthy",
			error: error.message 
		});
	}
});
```

## Monitoring

### Option 1: PM2 (Built-in)

```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

### Option 2: External Services

- **Sentry**: Error tracking
- **Datadog**: APM and logs
- **New Relic**: Performance monitoring
- **Uptime Robot**: Availability monitoring

## Scaling

### Horizontal Scaling

```bash
# Fly.io: Scale instances
fly scale count 3

# Docker Compose: Use replicas
docker-compose up -d --scale app=3
```

### Database Connection Pooling

```typescript
// Already configured in drizzle.config.ts
pool: {
	max: Number(process.env.POSTGRES_POOL) || 20,
	min: 5
}
```

## Backup Strategy

### Database Backups

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U user dbname > backup_$DATE.sql

# Upload to S3
aws s3 cp backup_$DATE.sql s3://mybucket/backups/
```

### Using Fly.io

```bash
fly postgres backup create
fly postgres backup list
fly postgres backup download <backup-id>
```

## Rollback Strategy

```bash
# Docker: Rollback to previous image
docker tag myapp:latest myapp:previous
docker tag myapp:v1.2.0 myapp:latest
docker-compose up -d

# Fly.io: Rollback deployment
fly releases
fly releases rollback <version>
```

## Security Hardening

1. **Use secrets management:**
   ```bash
   fly secrets set API_KEY=xxx
   ```

2. **Configure Rate Limiting:**
   The boilerplate uses a custom Redis-based rate limit. You must define these variables in your environment (e.g., `.env` or CI/CD secrets):
   ```bash
   RATE_LIMIT_MAX=100      # Maximum requests per window
   RATE_LIMIT_WINDOW=60    # Window size in seconds
   ```

3. **Update dependencies regularly:**
   ```bash
   bun update
   ```

4. **Scan for vulnerabilities:**
   ```bash
   bun audit
   ```

## Post-Deployment

- [ ] Test all endpoints manually
- [ ] Verify Swagger docs at `/docs`
- [ ] Monitor error rates
- [ ] Test rollback procedure
- [ ] Document any production-specific configs

## Support

For deployment issues:
- Check [Troubleshooting Guide](/reference/troubleshooting)
- Open [GitHub Issue](https://github.com/rslucena/TypeScript-Boilerplate/issues)
