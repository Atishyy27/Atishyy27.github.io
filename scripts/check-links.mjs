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

// 4. Every built page must be in the sitemap, or search engines never see it.
//    The sitemap listed 21 urls while the site built 88, so /work, /oss,
//    /stats, /log, /about and all 58 repository pages were invisible.
//    Deliberate omissions are listed here and nowhere else.
const SITEMAP_EXCLUDE = [
  "/admin/",            // local-only editor, nothing to index
  "/journal/none/",     // placeholder page for the empty journal
  "/404.html",
  "/404/",              // Next emits this; a 404 page has no business in a sitemap
];

const sitemapPath = path.join(OUT, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  check("sitemap.xml exists", false, "not built");
} else {
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const listed = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  );

  const builtRoutes = pages
    .map((p) => "/" + path.relative(OUT, p).replace(/index\.html$/, "").replace(/\\/g, "/"))
    .filter((r) => !r.endsWith(".html"))
    .filter((r) => !SITEMAP_EXCLUDE.includes(r));

  // Unlisted journal entries are supposed to be absent, and check-journal
  // already asserts that, so they are not counted as a miss here.
  const unlisted = new Set(
    [...fs.readdirSync(path.join(OUT, "journal"), { withFileTypes: true })]
      .filter((e) => e.isDirectory() && e.name.includes("unlisted"))
      .map((e) => `/journal/${e.name}/`)
  );

  const absent = builtRoutes.filter((r) => !listed.has(r) && !unlisted.has(r));
  check(
    "every built page is in the sitemap",
    absent.length === 0,
    `${absent.length} missing: ` + absent.slice(0, 8).join(", ")
  );
  console.log(`      sitemap lists ${listed.size}, site builds ${builtRoutes.length}`);
}

console.log("\nscanned " + pages.length + " pages, " + internalCount + " internal links");
console.log(failures === 0 ? "ALL PASS" : failures + " FAILURE(S)");
process.exit(failures === 0 ? 0 : 1);
