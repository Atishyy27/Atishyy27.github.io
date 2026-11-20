// scripts/check-oss-numbers.mjs
// Fails the build when the site's open-source numbers disagree with each other.
//
// WHY. On 21 Nov 2026 the same site said 51 merged on the home page, 53 in the
// scorecard, 56 in the stats file and 79 in a live widget, and none of it updated
// when a PR merged. The cause was four hand-typed copies. This check makes a fifth
// copy impossible to ship.
//
// Three layers, all cheap and dependency free:
//   1. The generated files agree with each other (counts add up, one source).
//   2. No source file types an OSS number; they must import OSS_STATS.
//   3. If out/ exists (after a build): the home page and /oss show exactly the
//      generated headline numbers, and say nothing about closed or merge rate.
//
// A line can opt out of layer 2 with the comment  oss-number-ok  when the number is
// a different thing that happens to sit beside one of the words.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fails = [];
const fail = (m) => { fails.push(m); console.log(`FAIL  ${m}`); };
const pass = (m) => console.log(`PASS  ${m}`);

const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const data = JSON.parse(read("src/content/oss-data.json"));
const card = JSON.parse(read("src/content/oss-scorecard.json"));
const prsFile = JSON.parse(read("src/content/oss-prs.json"));
const stats = Object.fromEntries([...read("src/content/oss-stats.ts").matchAll(/^\s*(\w+):\s*(\d+),/gm)].map((m) => [m[1], Number(m[2])]));
const T = data.totals;

// ---- 1. the generated files agree
const eq = (label, a, b) => (a === b ? pass(`${label}: ${a}`) : fail(`${label}: ${a} vs ${b}`));
eq("contributions = merged + carried + reports fixed", T.contributions, T.merged + T.carried + T.reportsFixed);
eq("OSS_STATS.contributions matches oss-data.json", stats.contributions, T.contributions);
eq("OSS_STATS.merged matches oss-data.json", stats.merged, T.merged);
eq("OSS_STATS.open matches oss-data.json", stats.open, T.open);
eq("OSS_STATS.orgsLanded matches oss-data.json", stats.orgsLanded, T.orgsLanded);
eq("repos add up to merged", data.repos.reduce((t, r) => t + r.merged, 0), T.merged);
eq("repos add up to open", data.repos.reduce((t, r) => t + r.open, 0), T.open);
eq("orgs add up to contributions", data.orgs.reduce((t, o) => t + o.contributions, 0), T.contributions);
eq("oss-prs.json holds every merged PR", prsFile.prs.length, T.merged);
eq("scorecard merged matches", card.merged, T.merged);
eq("scorecard contributions matches", card.contributions, T.contributions);
eq("merged PRs listed under repos", data.repos.flatMap((r) => r.prs).filter((p) => p.state === "merged").length, T.merged);
eq("closed PRs carry a reason", data.repos.flatMap((r) => r.prs).filter((p) => p.state === "closed" && !p.closeReason).length, 0);
eq("closed reasons add up to closed", data.closedReasons.reduce((t, c) => t + c.count, 0), T.closed);

// The hourly refresh job passes --data-only: a slip in someone's code must never stop
// fresh numbers from publishing. CI and deploy run all three layers.
if (process.argv.includes("--data-only")) {
  console.log(`\n${fails.length ? fails.length + " FAIL" : "ALL PASS (data only)"}`);
  process.exit(fails.length ? 1 : 0);
}

// ---- 2. no source file types an OSS number
const SKIP = [/src[\\/]content[\\/]oss-/, /src[\\/]content[\\/]citations\.ts$/];
const WORDS = "merged|accepted|upstream PRs?|pull requests?|PRs|repositories|repos|organi[sz]ations|orgs|contributions";
const typed = new RegExp(`(^|[^\\w.])\\d{1,3}(?:,\\d{3})*\\+?\\s+(?:${WORDS})\\b`, "i");
const closedStat = /(OSS_STATS|totals)\.closed\b/;
const CLOSED_OK = /oss[\\/](org[\\/]|\[slug\])|Closed|closed-reasons|ClosedReasons/;
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}
let scanned = 0;
for (const f of walk(path.join(root, "src"))) {
  const rel = path.relative(root, f);
  if (SKIP.some((re) => re.test(rel))) continue;
  scanned++;
  fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    // Comment-only lines are history, not rendered text.
    if (line.includes("oss-number-ok") || /^\s*(\/\/|\*|\/\*|\{\/\*)/.test(line)) return;
    if (typed.test(line)) fail(`${rel}:${i + 1} types an OSS number: ${line.trim().slice(0, 110)}`);
    if (closedStat.test(line) && !CLOSED_OK.test(rel)) fail(`${rel}:${i + 1} shows a closed count outside the detail pages`);
  });
}
if (!fails.some((m) => m.includes("types an OSS number") || m.includes("closed count"))) pass(`no typed OSS numbers and no closed counts in ${scanned} source files`);

// ---- 3. the built pages
const out = path.join(root, "out");
if (fs.existsSync(out)) {
  const textOf = (p) => fs.readFileSync(p, "utf8")
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  const num = (s) => Number(s.replace(/,/g, ""));
  const pages = [["index.html", true], ["oss/index.html", false]];
  for (const [rel, strictAll] of pages) {
    const file = path.join(out, rel);
    if (!fs.existsSync(file)) { fail(`built page missing: ${rel}`); continue; }
    const text = textOf(file);
    const all = (word) => [...text.matchAll(new RegExp(`(\\d[\\d,]*)\\s+${word}\\b`, "gi"))].map((m) => num(m[1]));
    const contrib = all("contributions?");
    if (!contrib.length) fail(`${rel} states no contribution count`);
    else if (contrib.some((n) => n !== stats.contributions)) fail(`${rel} says ${[...new Set(contrib)].join("/")} contributions, data says ${stats.contributions}`);
    else pass(`${rel} says ${stats.contributions} contributions everywhere (${contrib.length} mention(s))`);
    const merged = all("merged");
    const open = all("open");
    if (strictAll) {
      if (merged.some((n) => n !== stats.merged)) fail(`${rel} says ${[...new Set(merged)].join("/")} merged, data says ${stats.merged}`);
      else if (merged.length) pass(`${rel} says ${stats.merged} merged everywhere (${merged.length})`);
    } else if (merged.length && merged[0] !== stats.merged) fail(`${rel} first says ${merged[0]} merged, data says ${stats.merged}`);
    else if (merged.length) pass(`${rel} headline merged = ${stats.merged}`);
    if (open.length && open[0] !== stats.open && strictAll) fail(`${rel} first says ${open[0]} open, data says ${stats.open}`);
    for (const banned of ["Closed unmerged", "Merge rate", "closed unmerged"]) {
      if (text.includes(banned)) fail(`${rel} contains "${banned}", closed work is detail-page only`);
    }
  }
}

console.log(`\n${fails.length ? fails.length + " FAIL" : "ALL PASS"}`);
if (fails.length) process.exit(1);
