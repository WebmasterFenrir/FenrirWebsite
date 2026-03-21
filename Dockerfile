# Stage 1: Build
FROM oven/bun:latest AS builder
WORKDIR /app

COPY ./src .
RUN bun install
RUN bun run build --filter=website

# Stage 2: Serve
FROM node:lts-alpine
WORKDIR /app

COPY --from=builder /app/apps/website/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
