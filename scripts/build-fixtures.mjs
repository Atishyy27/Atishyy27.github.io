// scripts/build-fixtures.mjs
// Runs a Next.js build with JOURNAL_FIXTURES=1 across Windows, macOS, and Linux.
import { execSync } from "node:child_process";

process.env.JOURNAL_FIXTURES = "1";
execSync("npx next build", { stdio: "inherit", env: process.env });
