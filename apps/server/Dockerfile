ARG BUN_VERSION=1.3.8
FROM oven/bun:${BUN_VERSION} AS base

FROM base AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune server --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/out/full ./out/full
COPY packages /app/packages
COPY apps/server/src ./apps/server/src
COPY turbo.json ./turbo.json
RUN bun install

FROM base AS builder
WORKDIR /app
COPY --from=installer /app ./
RUN bun run --filter="@lunarweb/*" build

FROM base
WORKDIR /app
COPY --from=builder /app/apps/server ./apps/server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 3000
CMD ["bun", "run", "--filter=server", "start"]
