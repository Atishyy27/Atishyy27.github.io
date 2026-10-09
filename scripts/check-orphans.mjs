// scripts/check-orphans.mjs
// Components that are defined and rendered nowhere.
//
// This is not tidiness. Four components had drifted into being orphans, and one
// of them (a live GitHub activity panel) still counted two repositories that
// are permanently excluded from the open-source record. Dead code that nothing
// renders is also code that nothing re-checks, so remounting it later would
// have quietly re-leaked them.
//
// Run:  node scripts/check-orphans.mjs

import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

// Anything under src/app/ that is a DEFAULT export is mounted by the framework
// (a page, layout, route handler, sitemap, robots, manifest), so the absence of
// a <Tag> for it is normal. Deciding this structurally beats keeping a list of
// names: the first version was a hand-maintained allowlist and it flagged the
// next two routes that were added.
const FRAMEWORK_NAMED = new Set(["generateMetadata", "generateStaticParams"]);

function isFrameworkEntrypoint(file, name, isDefault) {
  const inApp = path.relative(process.cwd(), file).startsWith(path.join("src", "app"));
  return (inApp && isDefault) || FRAMEWORK_NAMED.has(name);
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})(SRC);

const text = new Map(files.map((p) => [p, fs.readFileSync(p, "utf8")]));
const all = [...text.values()].join("\n");

// Exported components: capitalised, so a plain helper function is not counted.
const defined = [];
for (const [p, body] of text) {
  for (const m of body.matchAll(/export\s+(default\s+)?function\s+(\w+)/g)) {
    const isDefault = Boolean(m[1]);
    const name = m[2];
    // Only capitalised names are components; a lowercase export is a helper.
    if (!/^[A-Z]/.test(name) && !isDefault) continue;
    if (isFrameworkEntrypoint(p, name, isDefault)) continue;
    defined.push({ name, file: path.relative(process.cwd(), p), isDefault });
  }
}

const orphans = defined.filter(({ name }) => {
  // Rendered as JSX anywhere, or lazily imported by name.
  const rendered = new RegExp(`<${name}[\\s/>]`).test(all);
  const lazy = new RegExp(`import\\([^)]*/${name}["']`).test(all);
  return !rendered && !lazy;
});

if (orphans.length === 0) {
  console.log(`PASS: no orphaned components (${defined.length} exported components checked)`);
  console.log("ALL PASS");
  process.exit(0);
}

console.log("FAIL: components defined but rendered nowhere:");
for (const o of orphans) console.log(`  ${o.name}  (${o.file})`);
console.log(`\n${orphans.length} ORPHAN(S)`);
process.exit(1);
