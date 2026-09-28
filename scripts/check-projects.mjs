// scripts/check-projects.mjs
// Link integrity for the projects section, checked against the BUILT output.
// The failure this prevents: a gallery card that links to a page which was never
// generated. That is a 404 a visitor finds before you do.
//
// Run after a build:  node scripts/check-projects.mjs

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
let failures = 0;

function check(name, cond, detail) {
  if (cond) console.log("PASS: " + name);
  else { failures++; console.log("FAIL: " + name + (detail ? "  -> " + detail : "")); }
}

const galleryPath = path.join(OUT, "projects", "index.html");
if (!fs.existsSync(galleryPath)) {
  console.log("FAIL: out/projects/index.html missing. Did the build run?");
  process.exit(1);
}

const gallery = fs.readFileSync(galleryPath, "utf8");

// Every /projects/<slug>/ the gallery links to must have a built page.
const linked = [...gallery.matchAll(/href="\/projects\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);
const uniqueLinked = [...new Set(linked)];
check("gallery links at least one project page", uniqueLinked.length > 0, "found 0 links");

const missing = uniqueLinked.filter(
  (slug) => !fs.existsSync(path.join(OUT, "projects", slug, "index.html"))
);
check("every linked project page was generated", missing.length === 0, "missing: " + missing.join(", "));

// And the reverse: every built page should be reachable from the gallery, or it is
// an orphan nobody can find.
const builtDirs = fs
  .readdirSync(path.join(OUT, "projects"), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

const orphans = builtDirs.filter((slug) => !uniqueLinked.includes(slug));
check("no orphan project pages", orphans.length === 0, "unreachable: " + orphans.join(", "));

// Every project page must carry at least one outbound proof link or an explicit
// note saying why there is none. A page with neither is an unbacked claim.
let unbacked = [];
for (const slug of builtDirs) {
  const html = fs.readFileSync(path.join(OUT, "projects", slug, "index.html"), "utf8");
  const hasProof = html.includes(">Proof<");
  if (!hasProof) unbacked.push(slug);
}
check(
  "every project page shows proof links or says why there are none",
  unbacked.length === 0,
  "no proof section: " + unbacked.join(", ")
);

console.log("\nlinked " + uniqueLinked.length + " project pages, " + builtDirs.length + " built");
console.log(failures === 0 ? "ALL PASS" : failures + " FAILURE(S)");
process.exit(failures === 0 ? 0 : 1);
