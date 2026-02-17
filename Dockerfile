# Stage 1: Build
FROM oven/bun:latest AS builder
WORKDIR /app

# 1. Copy the entire 'src' folder (contains package.json, turbo.json, and all apps/packages)
COPY ./src .

# 2. Install all dependencies
RUN bun install

# 3. Build the website
# This will now find all relative files (like that types folder)
RUN bun run build --filter=website

# Stage 2: Serve
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# Copy from the builder stage
# Path: /app (WORKDIR) + apps/website/dist
COPY --from=builder /app/apps/website/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
