FROM oven/bun:latest AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune server --docker

# Installer stage
FROM oven/bun:latest AS installer
WORKDIR /app
COPY --from=pruner /app/out/json ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/out/full ./out/full
COPY packages ./packages
COPY apps/server/src ./apps/server/src
RUN bun install

# Builder stage
FROM oven/bun:latest AS builder
WORKDIR /app
COPY --from=installer /app ./
RUN bun run --filter=server compile

# Final stage
FROM ubuntu:24.04
WORKDIR /app
COPY --from=builder /app/apps/server/server /app/server
EXPOSE 3000


CMD ["/app/server"]
