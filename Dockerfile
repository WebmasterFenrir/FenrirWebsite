# Stage 1: Prune the monorepo
FROM oven/bun:latest AS pruner
WORKDIR /app

# Copy the contents of your 'src' folder into the root of /app
COPY ./src .

# Now turbo will find package.json exactly where it expects it
RUN bunx turbo prune website --docker

# Stage 2: Build the project
FROM oven/bun:latest AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN bun install

COPY --from=pruner /app/out/full/ .
# Note: In your repo, 'website' is under 'apps/website'
RUN bun run build --filter=website

# Stage 3: Serve with Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# Based on your repo structure, the build output will be here:
COPY --from=builder /app/apps/website/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
