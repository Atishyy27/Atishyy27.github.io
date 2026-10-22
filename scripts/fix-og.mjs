// scripts/fix-og.mjs
// Runs after `next build`. Gives the generated Open Graph card a real file
// extension and points every page at it.
//
// Why this is needed. Next's image conventions emit the card as out/opengraph-image
// with no extension, and reference it as /opengraph-image?<hash>. GitHub Pages
// types a response from its file extension, so an extensionless file goes out as
// application/octet-stream. Some crawlers sniff the bytes and cope; LinkedIn and
// several Slack-style unfurlers do not, and drop the preview. Next has no way to
// name the route output .png, so the fix belongs here rather than in the config.
//
// What it does: copies the PNG to out/og.png and rewrites the og:image and
// twitter:image URLs in every built page. It asserts the counts rather than
// trusting the replace, and exits 1 if anything is off, so a silent regression
// fails the build instead of shipping a dead preview.

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const SRC = path.join(OUT, "opengraph-image");
const DEST_NAME = "og.png";
const DEST = path.join(OUT, DEST_NAME);

if (!fs.existsSync(OUT)) {
  console.log("FAIL  out/ does not exist, run next build first");
  process.exit(1);
}
if (!fs.existsSync(SRC)) {
  console.log("FAIL  out/opengraph-image was not generated, is src/app/opengraph-image.tsx still there");
  process.exit(1);
}

const png = fs.readFileSync(SRC);
if (png.subarray(1, 4).toString() !== "PNG") {
  console.log("FAIL  out/opengraph-image is not a PNG");
  process.exit(1);
}
fs.writeFileSync(DEST, png);
console.log(`PASS  wrote out/${DEST_NAME}, ${png.length} bytes`);

// Walk every built page and repoint the two tags.
//
// Redirect stubs are skipped. They are three lines of meta that send a browser
// somewhere else, so they carry no social card by design, and counting them as
// pages that lost their card would fail this check for the wrong reason.
const REDIRECT_STUBS = new Set(["work/index.html"]);
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html") && !REDIRECT_STUBS.has(path.relative(OUT, p).split(path.sep).join("/")))
      pages.push(p);
  }
})(OUT);

// Matches both the plain and the query-stringed form Next emits.
const RE = /(https:\/\/atishay\.tech)\/opengraph-image(\?[0-9a-f]+)?/g;

let touched = 0;
let replacements = 0;
for (const p of pages) {
  const before = fs.readFileSync(p, "utf8");
  const after = before.replace(RE, (_m, origin) => {
    replacements++;
    return `${origin}/${DEST_NAME}`;
  });
  if (after !== before) {
    fs.writeFileSync(p, after);
    touched++;
  }
}

console.log(`PASS  repointed ${replacements} tags across ${touched} of ${pages.length} pages`);

const fails = [];
if (touched === 0) fails.push("no page referenced the card, the metadata is not reaching the pages");
if (touched !== pages.length) fails.push(`${pages.length - touched} pages carry no card`);

// Nothing may still point at the extensionless route.
const leftovers = pages.filter((p) => /\/opengraph-image(\?|")/.test(fs.readFileSync(p, "utf8")));
if (leftovers.length) fails.push(`${leftovers.length} pages still reference /opengraph-image`);

if (fails.length) {
  for (const f of fails) console.log(`FAIL  ${f}`);
  process.exit(1);
}

console.log("ALL PASS");
