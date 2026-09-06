# syntax=docker/dockerfile:1.7
ARG BUN_VERSION=1.4.2
FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app

FROM base AS pruner
COPY . .
RUN bunx turbo@2.8.8 prune server --docker

FROM base AS dependencies
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

FROM dependencies AS builder
COPY --from=pruner /app/out/full/ ./
RUN bun run --cwd apps/server build

FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder --chown=bun:bun /app/apps/server/dist/index.js ./index.js
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD bun -e 'fetch("http://localhost:" + (process.env.PORT || 3000) + "/health").then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))'
CMD ["bun", "index.js"]
