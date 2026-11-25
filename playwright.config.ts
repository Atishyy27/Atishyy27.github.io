import { defineConfig } from "@playwright/test";

// Runs against the built site in out/, served by scripts/serve-out.mjs. CI only:
// no browser is installed or run on the laptop.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173", reducedMotion: "reduce" },
  webServer: {
    command: "node scripts/serve-out.mjs out 4173",
    url: "http://localhost:4173/",
    reuseExistingServer: false,
  },
});
