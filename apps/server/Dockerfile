ARG BUN_VERSION=1.2.23
FROM oven/bun:${BUN_VERSION} AS base

FROM base AS build-deps
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    pkg-config \
    libpixman-1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    && rm -rf /var/lib/apt/lists/*

FROM base AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune server --docker

FROM build-deps AS installer
WORKDIR /app
COPY --from=pruner /app/out/json ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/out/full ./out/full
COPY packages /app/packages
COPY apps/server/src ./apps/server/src
COPY turbo.json ./turbo.json
RUN bun install
RUN bun install --os=linux --cpu=x64 sharp || bun install --build-from-source sharp

FROM base AS build-packages
WORKDIR /app
COPY --from=installer /app ./
RUN bun run --filter="@lunarweb/*" build

FROM base AS builder
WORKDIR /app
COPY --from=build-packages /app ./
RUN bun run --filter=server compile

FROM base
WORKDIR /app
COPY --from=builder /app/apps/server/server /app/server
COPY --from=installer /app/node_modules /app/node_modules
EXPOSE 3000
CMD ["/app/server"]
