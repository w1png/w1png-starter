# Pruner stage
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
COPY packages /app/packages
COPY apps/server/src ./apps/server/src
COPY turbo.json ./turbo.json
RUN bun install

# Build packages stage
FROM oven/bun:latest AS build-packages
WORKDIR /app
COPY --from=installer /app ./
RUN bun run --filter="@lunarweb/*" build

# Builder stage
FROM oven/bun:latest AS builder
WORKDIR /app
COPY --from=build-packages /app ./
RUN bun run --filter=server compile

# Final stage
FROM oven/bun:latest
WORKDIR /app

# Copy the compiled server binary
COPY --from=builder /app/apps/server/server /app/server
COPY --from=installer /app/node_modules /app/node_modules

EXPOSE 3000
CMD ["/app/server"]
