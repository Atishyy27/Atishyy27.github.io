// scripts/check-activity.mjs
// Guards the activity snapshot, because its failure mode is silence.
//
// The whole reason this file exists: between 20 Jul and 15 Oct 2026 the
// heatmap printed "GitHub unavailable" and "LeetCode unavailable" on the live
// site and nothing anywhere said so. A dead data source has to fail the build,
// not the page.

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "src", "content", "activity.ts");
const STALE_DAYS = 21;

let fails = 0;
let checks = 0;
const say = (ok, msg) => {
  checks++;
  if (!ok) {
    fails++;
    console.log(`   -  ${msg}`);
  }
};

if (!fs.existsSync(OUT)) {
  console.log("FAIL  src/content/activity.ts is missing. Run: npm run gen:activity");
  process.exit(1);
}

const text = fs.readFileSync(OUT, "utf8");
const m = text.match(/export const ACTIVITY = (\{[\s\S]*?\}) as const;/);
say(!!m, "activity.ts does not contain a parseable ACTIVITY object");
if (!m) {
  console.log(`FAIL  ${fails} of ${checks} checks`);
  process.exit(1);
}

const snap = JSON.parse(m[1]);

for (const key of ["github", "codeforces", "leetcode"]) {
  const meta = snap.meta?.[key];
  const days = Object.keys(snap.data?.[key] ?? {}).length;
  say(!!meta, `${key} has no metadata in the snapshot`);
  say(meta?.ok === true, `${key} is marked unavailable: ${meta?.error ?? "no reason recorded"}`);
  say(days > 0, `${key} contributed zero days, so the chart would silently drop it`);
  say(!meta?.stale, `${key} is stale: the last fetch failed and old data was kept`);
}

const ageDays = (Date.now() - Date.parse(snap.generated)) / 86400000;
say(Number.isFinite(ageDays), "the snapshot has no usable generated timestamp");
say(ageDays <= STALE_DAYS, `the snapshot is ${Math.round(ageDays)} days old, over the ${STALE_DAYS} day limit. Run: npm run gen:activity`);

const total = Object.values(snap.data ?? {}).reduce(
  (sum, days) => sum + Object.values(days).reduce((a, b) => a + b, 0),
  0
);
say(total > 100, `only ${total} total events across all platforms, which looks like a broken fetch`);

if (fails === 0) {
  console.log(`PASS  ${checks}/${checks} checks, snapshot ${snap.generated.slice(0, 10)}, ${total} events`);
  process.exit(0);
}
console.log(`FAIL  ${fails} of ${checks} checks`);
process.exit(1);
