# Stage 1: Prune the monorepo
FROM oven/bun:latest AS pruner
WORKDIR /app
COPY . .
# This generates a sparse /app/out directory with only what's needed for 'website'
RUN bunx turbo prune website --docker

# Stage 2: Build the project
FROM oven/bun:latest AS builder
WORKDIR /app

# Copy pruned lockfiles and package.json
COPY --from=pruner /app/out/json/ .
RUN bun install

# Copy source code and build
COPY --from=pruner /app/out/full/ .
RUN bun run build --filter=website

# Stage 3: Serve with Nginx
FROM nginx:stable-alpine
# Note: Use the actual path where Astro drops the files inside the builder
COPY --from=builder /app/apps/website/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
