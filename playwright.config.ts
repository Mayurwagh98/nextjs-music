import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3210);

/*
 * End-to-end tests run against a production build (`next build && next start`)
 * and a separate test database, so they never touch your real data.
 * Defaults to a local MongoDB; override with E2E_MONGODB_URI.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      SESSION_SECRET: "e2e-only-secret-e2e-only-secret-e2e-only",
      MONGODB_URI: process.env.E2E_MONGODB_URI ?? "mongodb://127.0.0.1:27017/cadence_e2e",
      MONGODB_DB: "",
    },
  },
});
