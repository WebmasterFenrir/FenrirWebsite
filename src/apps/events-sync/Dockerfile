# Stage 1: install workspace dependencies (same pattern as the site Dockerfile)
FROM oven/bun:1.3.7 AS deps
WORKDIR /app
COPY ./src ./src
WORKDIR /app/src
RUN bun install --frozen-lockfile

# Stage 2: runtime — bun + real Chrome for scraping
FROM oven/bun:1.3.7

# Google Chrome stable (the apt `chromium` package on Debian is a snap stub and
# does not work in containers — this is the battle-tested alternative).
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg ca-certificates fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libglib2.0-0 libgtk-3-0 \
    libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libx11-xcb1 \
    libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
    libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils \
    && rm -rf /var/lib/apt/lists/* \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=deps /app/src/apps/events-sync ./apps/events-sync
COPY --from=deps /app/src/node_modules ./node_modules

ENV CHROME_PATH=/usr/bin/google-chrome-stable
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "--cwd", "apps/events-sync", "start"]
