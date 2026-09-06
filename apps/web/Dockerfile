# syntax=docker/dockerfile:1.7
ARG BUN_VERSION=1.4.2
FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app

FROM base AS pruner
COPY . .
RUN bunx turbo@2.8.8 prune web --docker

FROM base AS dependencies
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

FROM dependencies AS builder
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ARG VITE_SERVER_URL_INTERNAL
ENV VITE_SERVER_URL_INTERNAL=$VITE_SERVER_URL_INTERNAL
COPY --from=pruner /app/out/full/ ./
RUN --mount=type=cache,target=/app/.turbo bunx turbo run build --filter=web

FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder --chown=bun:bun /app/apps/web/.output ./.output
USER bun
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
