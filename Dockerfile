FROM docker.io/oven/bun:latest AS base
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --ignore-scripts

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --production --ignore-scripts

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN NODE_ENV=test bun test
ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=install --chown=bun:bun /temp/prod/node_modules node_modules
COPY --from=prerelease --chown=bun:bun /usr/src/app/dist/ dist
COPY --from=prerelease --chown=bun:bun /usr/src/app/package.json .
COPY --from=prerelease --chown=bun:bun /usr/src/app/src/commands/exec-process.ts . 

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "dist/commands/exec-process.js" ]
