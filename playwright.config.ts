import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
// Inherited by workers and server; never reuse the main application's database.
process.env.ASTRA_DB_NAME ||= `astra_browser_test_${Date.now()}`;
if (!/^astra_browser_test_\d+$/.test(process.env.ASTRA_DB_NAME))
  throw new Error(
    "Browser tests require an isolated astra_browser_test_<timestamp> database.",
  );
if (
  process.env.PLAYWRIGHT_BROWSERS_PATH !==
  resolve(".environment/cache/playwright")
)
  throw new Error(
    "Run through node scripts/env.mjs to keep browser storage inside AStra.",
  );
export default defineConfig({
  testDir: "./tests",
  testMatch: "browser.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 6000 },
  outputDir: ".environment/test-results/browser",
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: ".environment/test-results/browser-report",
        open: "never",
      },
    ],
  ],
  use: {
    baseURL: "http://127.0.0.1:3002",
    browserName: "chromium",
    headless: true,
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: { args: ["--disable-breakpad", "--disable-crash-reporter"] },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "node scripts/env.mjs npm run start -- --port 3002",
    url: "http://127.0.0.1:3002",
    reuseExistingServer: false,
    env: {
      ASTRA_DB_NAME: process.env.ASTRA_DB_NAME,
      SPOTIFY_CLIENT_ID: "browser-test-client",
      SPOTIFY_REDIRECT_URI:
        "http://127.0.0.1:3002/api/integrations/spotify/callback",
      GOOGLE_CLIENT_ID: "browser-test-client",
      GOOGLE_CLIENT_SECRET: "browser-test-secret",
      GOOGLE_REDIRECT_URI:
        "http://127.0.0.1:3002/api/integrations/youtube/callback",
      YOUTUBE_API_KEY: "",
      SPOTIFY_TOKEN_ENCRYPTION_KEY: "12".repeat(32),
    },
  },
});
