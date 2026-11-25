// Before/after screenshots of the pages the review changed, taken from a built
// site in CI. No browser runs on the laptop.
//
//   node scripts/shots.mjs <built out dir> <label> <dest dir>
//
// Every request that leaves localhost is answered with an empty 204, so a shot
// never depends on a third party being up.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [outDir, label, dest] = process.argv.slice(2);
if (!outDir || !label || !dest) {
  console.error("usage: node scripts/shots.mjs <out dir> <label> <dest dir>");
  process.exit(2);
}
fs.mkdirSync(dest, { recursive: true });

const PORT = 4175;
const server = spawn(process.execPath, ["scripts/serve-out.mjs", outDir, String(PORT)], { stdio: "inherit" });
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 50; i++) {
  try {
    if ((await fetch(base + "/")).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 200));
}

const SIZES = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "360", width: 360, height: 740 },
];

const browser = await chromium.launch();
let n = 0;
try {
  for (const size of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: "reduce" });
    await ctx.route(/^https?:\/\/(?!localhost)/, (r) => r.fulfill({ status: 204, body: "" }));
    const page = await ctx.newPage();
    const shot = async (name, target) => {
      const file = path.join(dest, `${label}-${name}-${size.name}.jpg`);
      await target.screenshot({ path: file, type: "jpeg", quality: 80 });
      n++;
      console.log("wrote", file, fs.statSync(file).size, "bytes");
    };
    const settle = () => page.waitForTimeout(1200);
    const top = { x: 0, y: 0, width: size.width, height: 260 };

    await page.goto(base + "/");
    await settle();
    await page.keyboard.press("Tab");
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dest, `${label}-skip-link-first-tab-${size.name}.jpg`), type: "jpeg", quality: 80, clip: top });
    n++;

    const banner = page.getByText("HAVE AN INTERESTING ENGINEERING PROBLEM?").locator("xpath=..");
    await banner.scrollIntoViewIfNeeded();
    await settle();
    await shot("home-contact-banner", banner);

    await page.goto(base + "/about/");
    await settle();
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await settle();
    await shot("about-contact", contact);

    await page.goto(base + "/stats/");
    await settle();
    await page.screenshot({ path: path.join(dest, `${label}-stats-top-${size.name}.jpg`), type: "jpeg", quality: 80, clip: { ...top, height: 420 } });
    n++;
    if (size.name === "360") {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(dest, `${label}-stats-menu-360.jpg`), type: "jpeg", quality: 80, clip: { x: 0, y: 0, width: 360, height: 520 } });
      n++;
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(`${n} screenshots`);
