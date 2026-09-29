// scripts/check-links.mjs
// Internal link integrity against the BUILT output.
//
// The bug this exists for: the site was one page with #anchors, then became
// eight routes. Every "#cp", "#opensource", "#work" href silently became a
// link to nowhere, including three of the four headline stats on the home
// page. Nothing failed, nothing warned, they just stopped working.
//
// Run after a build:  node scripts/check-links.mjs

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
let failures = 0;

function check(name, cond, detail) {
  if (cond) console.log("PASS: " + name);
  else { failures++; console.log("FAIL: " + name + (detail ? "  -> " + detail : "")); }
}

if (!fs.existsSync(OUT)) {
  console.log("FAIL: out/ does not exist. Run npm run build first.");
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(OUT);

const rel = (p) => path.relative(OUT, p);

// 1. No bare "#target" hrefs. A plain "#" is a legitimate no-op in some
//    markup, so only ones that actually name a target are flagged.
const anchored = [];
for (const p of pages) {
  const html = fs.readFileSync(p, "utf8");
  for (const m of html.matchAll(/href=\\?"#([a-zA-Z][\w-]*)\\?"/g)) {
    anchored.push(rel(p) + " -> #" + m[1]);
  }
}
check(
  "no leftover #anchor links from the single-page layout",
  anchored.length === 0,
  anchored.slice(0, 6).join("; ")
);

// 2. Every internal href resolves to a page that was actually built.
const missing = new Set();
let internalCount = 0;
for (const p of pages) {
  const html = fs.readFileSync(p, "utf8");
  for (const m of html.matchAll(/href=\\?"(\/[^"\\#?]*)\\?"/g)) {
    const href = m[1];
    if (href.startsWith("/_next/")) continue;
    internalCount++;
    const asDir = path.join(OUT, href, "index.html");
    const asFile = path.join(OUT, href);
    if (!fs.existsSync(asDir) && !fs.existsSync(asFile)) {
      missing.add(href + "  (linked from " + rel(p) + ")");
    }
  }
}
check(
  "every internal link resolves to a built page",
  missing.size === 0,
  [...missing].slice(0, 8).join("; ")
);

// 3. The nav and the home index must reach every route. A break here is a
//    break on every page at once.
const home = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
for (const route of ["/projects/", "/work/", "/oss/", "/stats/", "/log/", "/journal/", "/about/"]) {
  check("home links " + route, home.includes('href="' + route + '"') || home.includes('href=\\"' + route + '\\"'));
}

console.log("\nscanned " + pages.length + " pages, " + internalCount + " internal links");
console.log(failures === 0 ? "ALL PASS" : failures + " FAILURE(S)");
process.exit(failures === 0 ? 0 : 1);
