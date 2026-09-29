// scripts/check-journal.mjs
// Proves the journal's privacy guarantees against the BUILT output in out/, not
// against the source. Source-level checks are worthless here: the site is a static
// export, so whatever reached out/ is public the moment it deploys.
//
// Run after a FIXTURE build:  JOURNAL_FIXTURES=1 npm run build && node scripts/check-journal.mjs
// (or just `npm run verify`, which does both builds in the right order.)
//
// The fixtures are the only entries whose draft/unlisted/public status is known
// in advance, so they are what the privacy guarantees are proved against. A plain
// build filters them out by design, and this script then has nothing to test.

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

// Guard against the easy mistake of pointing this at a plain build. Without the
// fixtures there is nothing to prove, and half these assertions would report a
// failure that is really just a missing test input.
if (!fs.existsSync(path.join(OUT, "journal", "0002-public-fixture"))) {
  console.log("SKIP: out/ was built without fixtures, so there is nothing to check.");
  console.log("      Run:  JOURNAL_FIXTURES=1 npm run build && node scripts/check-journal.mjs");
  console.log("      Or:   npm run verify");
  process.exit(2);
}

// Collect every text file in out/ once.
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|txt|json|js|xml)$/.test(e.name)) files.push(p);
  }
})(OUT);

const haystack = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");

// 1. Drafts must not reach the output at all.
check(
  "no draft content anywhere in out/",
  !haystack.includes("DRAFT_LEAK_CANARY"),
  "the canary string from the draft fixture was found in the build"
);
check(
  "no page built for the draft slug",
  !fs.existsSync(path.join(OUT, "journal", "0000-draft-fixture")),
  "out/journal/0000-draft-fixture exists"
);

// 2. Unlisted: page exists, absent from the index, carries noindex.
const unlistedDir = path.join(OUT, "journal", "0001-unlisted-fixture");
check("unlisted entry still builds a page", fs.existsSync(unlistedDir), "missing " + unlistedDir);

const indexPath = path.join(OUT, "journal", "index.html");
const indexHtml = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
check("journal index exists", indexHtml.length > 0, "missing " + indexPath);
check(
  "unlisted entry is NOT linked from the journal index",
  !indexHtml.includes("0001-unlisted-fixture"),
  "the index links the unlisted slug"
);

const unlistedHtml = fs.existsSync(path.join(unlistedDir, "index.html"))
  ? fs.readFileSync(path.join(unlistedDir, "index.html"), "utf8")
  : "";
check(
  "unlisted entry carries a noindex robots tag",
  /name="robots"[^>]*content="[^"]*noindex/i.test(unlistedHtml),
  "no noindex meta found on the unlisted page"
);

// 3. Public: page exists and is linked from the index.
check(
  "public entry builds a page",
  fs.existsSync(path.join(OUT, "journal", "0002-public-fixture")),
  "missing the public fixture page"
);
check(
  "public entry IS linked from the journal index",
  indexHtml.includes("0002-public-fixture"),
  "the index does not link the public slug"
);

// 4. Sitemap, if one exists, must not list unlisted entries.
const sitemap = path.join(OUT, "sitemap.xml");
if (fs.existsSync(sitemap)) {
  const xml = fs.readFileSync(sitemap, "utf8");
  check("sitemap omits unlisted entries", !xml.includes("0001-unlisted-fixture"), "unlisted slug in sitemap");
} else {
  console.log("SKIP: no sitemap.xml yet, nothing to check");
}

console.log("\nscanned " + files.length + " built files");
console.log(failures === 0 ? "ALL PASS" : failures + " FAILURE(S)");
process.exit(failures === 0 ? 0 : 1);
