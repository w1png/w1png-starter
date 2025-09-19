# Pruner stage
FROM oven/bun:latest AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune web --docker

# Installer stage
FROM oven/bun:latest AS installer
WORKDIR /app
COPY --from=pruner /app/out/json ./
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY packages ./packages
COPY apps/server ./apps/server
RUN bun install

# Builder stage
FROM oven/bun:latest AS builder
WORKDIR /app
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ARG VITE_SERVER_URL_INTERNAL
ENV VITE_SERVER_URL_INTERNAL=$VITE_SERVER_URL_INTERNAL
COPY --from=installer /app ./
COPY --from=pruner /app/out/full ./
RUN bunx turbo run build --filter=web

# Final stage
FROM oven/bun:latest
WORKDIR /app
COPY --from=builder /app/apps/web/.output ./.output
COPY --from=builder /app/apps/web/package.json ./
EXPOSE 3000
CMD ["bun", "run", ".output/server/index.mjs"]
# CMD ["bun", "run", "vite", "preview", "--port", "3001", "--host"]
