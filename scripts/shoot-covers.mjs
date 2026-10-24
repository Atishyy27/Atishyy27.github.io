// scripts/shoot-covers.mjs
// Real screenshots of every project that has a live site, as card covers.
//
// WHY THIS NOW WORKS. Live captures were tried on 2026-10-09 and dropped: the
// comment in ProjectCard.tsx said "headless Brave hangs on this machine". The
// thing that hung was `chrome-headless-shell`, the stripped binary Puppeteer
// downloads, which dies on this Mac with "GPU process isn't usable". The full
// Brave in /Applications is ordinary Chromium and its --headless=new mode
// renders fine here, fonts, JavaScript and all. It prints two
// CVDisplayLinkCreateWithCGDisplay errors on the way and writes the file
// anyway; those are a display-link warning, not a failure.
//
// WHY NOT A SCREENSHOT SERVICE. It would mean sending his project URLs to a
// third party on every build. Ruled out on 2026-10-09 and still ruled out.
//
// WHY THE OUTPUT IS COMMITTED. Same reason as fetch-shots.mjs: the deploy runs
// in GitHub Actions, which has no browser and no business loading twelve third
// party sites on every build.
//
// The URL list is DERIVED from the project data, never hand-kept, so a project
// that gains a live link gains a cover the next time this runs.
//
// Refresh:  node scripts/shoot-covers.mjs        (then commit public/covers)
//           node scripts/shoot-covers.mjs tripkit   to redo just one

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const run = promisify(execFile);

const BRAVE = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const OUT_DIR = path.join(process.cwd(), "public", "covers");
const OUT_TS = path.join(process.cwd(), "src", "content", "covers.ts");
const TMP = path.join(process.cwd(), ".cover-tmp");

// Shot at 2x the card's widest rendering, then downsampled, so the text in a
// cover is still legible on a retina screen.
const SHOT = { w: 1280, h: 960 };
const CARD_W = 900;

// The card is 4:3 and a page is not, so the capture is 1280x960 directly
// rather than a tall page cropped: a crop of a long landing page is mostly
// whitespace, and the top 960px is the part that says what the thing is.

async function liveLinks() {
  // Read the content files as text rather than importing TypeScript: this is a
  // plain node script and the content modules import each other.
  const site = fs.readFileSync(path.join(process.cwd(), "src/content/site.ts"), "utf8");
  const out = [];
  // Each entry is `name: "..."` somewhere before its links array.
  const re = /name:\s*"([^"]+)"[\s\S]{0,2000}?links:\s*\[([\s\S]{0,600}?)\]/g;
  for (const m of site.matchAll(re)) {
    const [, name, links] = m;
    const live = [...links.matchAll(/label:\s*"(Live|Live demo|Chrome Web Store|Play Store)"\s*,\s*href:\s*"([^"]+)"/g)]
      .filter(([, label]) => label.startsWith("Live"))
      .map(([, , href]) => href)[0];
    if (!live) continue;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    out.push({ slug, name, url: live });
  }
  return out;
}

async function shoot(url, file) {
  // --virtual-time-budget lets the page's own timers and fetches finish before
  // the frame is taken. Without it a site that renders from an API screenshots
  // as an empty shell.
  await run(BRAVE, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    `--window-size=${SHOT.w},${SHOT.h}`,
    "--virtual-time-budget=12000",
    `--screenshot=${file}`,
    url,
  ], { timeout: 90_000 }).catch((e) => {
    // Brave exits non-zero while still writing the file in some cases, so the
    // file's existence is the test, not the exit code.
    if (!fs.existsSync(file)) throw e;
  });
  if (!fs.existsSync(file)) throw new Error("no file written");
}

/** A capture that is one flat colour is a site that did not load. */
async function isBlank(buf) {
  const { dominant } = await sharp(buf).stats();
  const { channels } = await sharp(buf).stats();
  const spread = Math.max(...channels.map((c) => c.stdev));
  return spread < 6;
}

const only = process.argv[2];
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const targets = (await liveLinks()).filter((t) => !only || t.slug.includes(only));
console.log(`${targets.length} project(s) with a live site\n`);

const made = {};
let ok = 0, bad = 0;

for (const t of targets) {
  const raw = path.join(TMP, `${t.slug}.png`);
  try {
    await shoot(t.url, raw);
    const buf = fs.readFileSync(raw);
    if (await isBlank(buf)) {
      console.log(`SKIP  ${t.slug}  the capture is one flat colour, the site did not render`);
      bad++;
      continue;
    }
    const out = await sharp(buf).resize({ width: CARD_W }).webp({ quality: 78 }).toBuffer();
    const meta = await sharp(out).metadata();
    fs.writeFileSync(path.join(OUT_DIR, `${t.slug}.webp`), out);
    made[t.slug] = { src: `/covers/${t.slug}.webp`, w: meta.width, h: meta.height };
    console.log(`PASS  ${t.slug}  ${meta.width}x${meta.height}  ${(out.length / 1024).toFixed(0)} KB  ${t.url}`);
    ok++;
  } catch (e) {
    console.log(`FAIL  ${t.slug}  ${String(e.message).slice(0, 90)}`);
    bad++;
  }
}

fs.rmSync(TMP, { recursive: true, force: true });

// Merge rather than overwrite, so shooting one project does not delete the
// other eleven.
let existing = {};
if (fs.existsSync(OUT_TS)) {
  for (const m of fs.readFileSync(OUT_TS, "utf8").matchAll(/"([^"]+)":\s*\{ src: "([^"]+)", w: (\d+), h: (\d+) \}/g)) {
    existing[m[1]] = { src: m[2], w: Number(m[3]), h: Number(m[4]) };
  }
}
const all = { ...existing, ...made };

const rows = Object.entries(all).sort().map(([k, v]) =>
  `  "${k}": { src: "${v.src}", w: ${v.w}, h: ${v.h} },`).join("\n");

fs.writeFileSync(OUT_TS, `// GENERATED by scripts/shoot-covers.mjs. Do not edit.
// Real screenshots of each project's own live site, taken with headless Brave
// on ${new Date().toISOString().slice(0, 10)} at ${SHOT.w}x${SHOT.h} and downsampled to ${CARD_W}px wide.
// Nothing here is a mockup and nothing was fetched from a third-party service.
export type Cover = { src: string; w: number; h: number };

export const COVERS: Record<string, Cover> = {
${rows}
};
`);

console.log(`\n${ok} captured, ${bad} skipped or failed, ${Object.keys(all).length} covers in total`);
