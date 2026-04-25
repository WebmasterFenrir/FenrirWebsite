/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node ./apps/e2e/mock-pocketbase.mjs",
      url: "http://localhost:8090/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 10_000,
    },
    {
      command: process.env.CI
        ? "node ./apps/website/dist/server/entry.mjs"
        : "bun --cwd ./apps/website run dev",
      url: "http://localhost:4321",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        PORT: "4321",
        HOST: "localhost",
        PB_URL: "http://localhost:8090",
        PB_EMAIL: "ci@test.com",
        PB_PASSWORD: "mock-password",
      },
    },
  ],
});
