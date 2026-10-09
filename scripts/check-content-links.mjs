// scripts/check-content-links.mjs
// Cross-references between content files, checked against the source.
//
// The failure this exists for: a journal entry's `project:` front matter is a
// foreign key into the project list, and nothing validated it. I set one to
// "pf-management-system" on an entry about a policy engine, which would have
// put an unrelated story on that project's page. A typo would have been worse:
// it fails silently, the entry simply never appears anywhere.
//
// Run:  node --experimental-strip-types --import ./scripts/alias-hook-register.mjs scripts/check-content-links.mjs

import { allProjects, pagedProjects } from "../src/content/projects.ts";
import { buildableEntries } from "../src/lib/journal.ts";

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log("PASS: " + name);
  else { failures++; console.log("FAIL: " + name + (detail ? "  -> " + detail : "")); }
}

const projectSlugs = new Set(allProjects.map((p) => p.slug));
const pagedSlugs = new Set(pagedProjects.map((p) => p.slug));
const entries = buildableEntries();

// 1. Every `project:` must name a real project.
const unknown = entries
  .filter((e) => e.project && !projectSlugs.has(e.project))
  .map((e) => `${e.slug} -> "${e.project}"`);
check("every journal entry's project: names a real project", unknown.length === 0, unknown.join("; "));

// 2. And that project must have a page, or the link has nowhere to show.
const unpaged = entries
  .filter((e) => e.project && projectSlugs.has(e.project) && !pagedSlugs.has(e.project))
  .map((e) => `${e.slug} -> ${e.project} (no page)`);
check("every linked project has a page to show the entry on", unpaged.length === 0, unpaged.join("; "));

// 3. Dates must not be in the future. A future-dated entry sorts to the top
//    and stays there, which silently buries whatever is actually newest.
const today = new Date().toISOString().slice(0, 10);
const future = entries.filter((e) => e.date > today).map((e) => `${e.slug} (${e.date})`);
check("no entry is dated in the future", future.length === 0, future.join("; "));

// 4. Slugs must be unique. Two files producing the same slug means one page
//    silently wins and the other is unreachable.
const seen = new Map();
for (const e of entries) seen.set(e.slug, (seen.get(e.slug) ?? 0) + 1);
const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([s]) => s);
check("no duplicate journal slugs", dupes.length === 0, dupes.join(", "));

const linked = entries.filter((e) => e.project);
console.log(`\n${entries.length} entries, ${linked.length} linked to a project, ${projectSlugs.size} projects`);
console.log(failures === 0 ? "ALL PASS" : failures + " FAILURE(S)");
process.exit(failures === 0 ? 0 : 1);
