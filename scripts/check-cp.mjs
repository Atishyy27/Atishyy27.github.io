// scripts/check-cp.mjs
// Fails the build if the competitive-programming panel would show something
// wrong: a missing source, a source that quietly fell back to last week's
// numbers, a snapshot old enough to be embarrassing, or a hand-typed rating
// sneaking back into site.ts.
//
// Same contract as check-activity.mjs: exit 0 and print PASS lines, or exit 1
// and print every FAIL.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const CP = path.join(root, "src", "content", "cp.ts");
const SITE = path.join(root, "src", "content", "site.ts");
const MAX_AGE_DAYS = 21;

let pass = 0;
const fails = [];
const ok = (label) => { pass++; console.log(`PASS  ${label}`); };
const bad = (label) => { fails.push(label); console.log(`FAIL  ${label}`); };
const check = (cond, label) => (cond ? ok(label) : bad(label));

if (!fs.existsSync(CP)) {
  console.log("FAIL  src/content/cp.ts does not exist, run npm run gen:cp");
  process.exit(1);
}

const src = fs.readFileSync(CP, "utf8");
const m = src.match(/export const CP = ([\s\S]*?) as const;/);
if (!m) {
  console.log("FAIL  cp.ts does not contain a parseable CP object");
  process.exit(1);
}

let data;
try {
  data = JSON.parse(m[1]);
} catch (err) {
  console.log(`FAIL  cp.ts CP object is not valid JSON: ${err.message}`);
  process.exit(1);
}

const EXPECTED = ["LeetCode", "Codeforces", "CodeChef", "AtCoder"];

check(Array.isArray(data.profiles), "cp.ts exposes a profiles array");
check(data.profiles.length === EXPECTED.length, `all ${EXPECTED.length} platforms present, got ${data.profiles?.length}`);

for (const site of EXPECTED) {
  const p = data.profiles.find((x) => x.site === site);
  if (!p) { bad(`${site} is missing from cp.ts`); continue; }
  check(Boolean(p.handle), `${site} has a handle`);
  check(Boolean(p.rank) && p.rank !== "unrated", `${site} has a rank, got "${p.rank}"`);
  check(/\d/.test(p.detail || ""), `${site} detail carries a number, got "${p.detail}"`);
  check(/^https:\/\//.test(p.href || ""), `${site} links over https`);
}

for (const [key, meta] of Object.entries(data.meta || {})) {
  check(meta.ok === true, `${key} fetched without error${meta.error ? ` (${meta.error})` : ""}`);
  check(meta.stale !== true, `${key} is live, not carried over from an older run`);
}

const ageDays = (Date.now() - Date.parse(data.generated)) / 86400000;
check(Number.isFinite(ageDays), "cp.ts carries a parseable generated timestamp");
check(ageDays < MAX_AGE_DAYS, `snapshot is ${ageDays.toFixed(1)} days old, limit is ${MAX_AGE_DAYS}`);

// The whole point of the generator is that nobody types a rating into site.ts
// again. Catch the obvious shapes of that regression.
const site = fs.readFileSync(SITE, "utf8");
check(site.includes("CP_PROFILES"), "site.ts takes cpProfiles from the generated file");
check(!/rank:\s*"(Knight|Guardian|Specialist|Pupil|Expert|\d\s*star|Kyu\s*\d)"/.test(site),
  "site.ts has no hand-typed competitive programming rank");
check(!/detail:\s*"[^"]*\b(max|peak|solved)\b[^"]*"/.test(site),
  "site.ts has no hand-typed rating or solve count");

console.log(`\n${pass} PASS, ${fails.length} FAIL`);
if (fails.length) {
  console.log("\nfix:\n  npm run gen:cp -- --force");
  process.exit(1);
}
console.log("ALL PASS");
