# Stage 1: Build
FROM oven/bun:latest AS builder
WORKDIR /app

COPY ./src .
RUN bun install

# 3. Build the website
# This will now find all relative files (like that types folder)
RUN bun run build

# Stage 2: Serve
FROM node:lts-alpine
WORKDIR /app

COPY --from=builder /app/apps/website/dist ./dist
COPY --from=builder /app/apps/website/package.json ./package.json
RUN npm install --omit=dev --ignore-scripts

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
