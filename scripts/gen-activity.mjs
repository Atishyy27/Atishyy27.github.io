// scripts/gen-activity.mjs
// Writes src/content/activity.ts: one year of daily activity, fetched at
// build time instead of from the visitor's browser.
//
// Why this moved to build time, 15 Oct 2026:
//
//   GitHub   github-contributions-api.deno.dev returns 404 for everything.
//            Deno Deploy Classic was sunset on 20 Jul 2026 and no longer
//            serves deployments, so that host has been dead for three months
//            and the site has been printing "GitHub unavailable" since.
//
//   LeetCode alfa-leetcode-api.onrender.com returns 429 "Too many request
//            from this IP, try again in 1 hour", retry-after 733. It is one
//            free Render instance with a per-IP limit shared by everyone on
//            earth who uses it, so whether his heatmap renders depends on
//            strangers. It also cold-starts.
//
// Both failures are the same mistake: a public portfolio depending on a free
// community proxy staying up. Fetching at build time removes the dependency
// from the visitor's path entirely. The page then renders instantly, with no
// CORS, no rate limit and no spinner, and the numbers are as fresh as the
// last deploy. The date of that deploy is written into the file and shown on
// the page, so a stale number is visibly stale.
//
// LeetCode has no choice about this: leetcode.com/graphql sends no
// access-control-allow-origin at all, so a browser on atishay.tech can never
// call it. Node can, and does, with no token.
//
// Runs in prebuild. A source that fails leaves its previous data in place
// rather than blanking the chart, and says so on stdout.

import fs from "node:fs";
import path from "node:path";

const HANDLES = {
  github: "Atishyy27",
  codeforces: "sethatishayjain",
  leetcode: "atishayjain78001",
};

const OUT = path.join(process.cwd(), "src", "content", "activity.ts");
const TIMEOUT = 20000;

// Every source is bucketed by UTC day. The three platforms disagree about
// this and cannot be reconciled: GitHub buckets by the timezone on his
// profile, LeetCode's calendar is UTC and not configurable, Codeforces gives
// raw epochs. Picking UTC for the two we control at least makes the rule one
// sentence long instead of three.
const isoUTC = (ms) => new Date(ms).toISOString().slice(0, 10);

async function getJSON(url, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function github() {
  // jogruber's mirror of the contribution graph. CORS-open and reachable
  // from the browser too, which is why the client keeps it as a live refresh.
  const j = await getJSON(`https://github-contributions-api.jogruber.de/v4/${HANDLES.github}?y=last`);
  const out = {};
  for (const d of j.contributions ?? []) if (d.count > 0) out[d.date] = d.count;
  if (Object.keys(out).length === 0) throw new Error("no contribution days came back");
  return out;
}

async function codeforces() {
  const j = await getJSON(`https://codeforces.com/api/user.status?handle=${HANDLES.codeforces}&from=1&count=10000`);
  if (j.status !== "OK") throw new Error(j.comment || "status not OK");
  const out = {};
  for (const s of j.result ?? []) {
    const d = isoUTC(s.creationTimeSeconds * 1000);
    out[d] = (out[d] ?? 0) + 1;
  }
  return out;
}

async function leetcode() {
  // The official endpoint, no key, no proxy. userCalendar returns one year at
  // a time, so a rolling twelve months needs this year and last.
  const query = `query userProfileCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) { userCalendar(year: $year) { submissionCalendar } }
  }`;
  const thisYear = new Date().getUTCFullYear();
  const out = {};

  for (const year of [thisYear - 1, thisYear]) {
    const j = await getJSON("https://leetcode.com/graphql/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({ query, variables: { username: HANDLES.leetcode, year } }),
    });
    const raw = j?.data?.matchedUser?.userCalendar?.submissionCalendar;
    if (!raw) continue;
    for (const [ts, n] of Object.entries(JSON.parse(raw))) {
      const d = isoUTC(Number(ts) * 1000);
      out[d] = (out[d] ?? 0) + n;
    }
  }
  if (Object.keys(out).length === 0) throw new Error("empty calendar for both years");
  return out;
}

// Keep whatever the last successful run wrote, so one flaky morning does not
// blank a year of history.
function previous() {
  try {
    const text = fs.readFileSync(OUT, "utf8");
    const m = text.match(/export const ACTIVITY = (\{[\s\S]*?\}) as const;/);
    return m ? JSON.parse(m[1]) : null;
  } catch {
    return null;
  }
}

const SOURCES = [
  { key: "github", label: "GitHub", fn: github },
  { key: "codeforces", label: "Codeforces", fn: codeforces },
  { key: "leetcode", label: "LeetCode", fn: leetcode },
];

const prev = previous();
const data = {};
const meta = {};

for (const s of SOURCES) {
  try {
    const days = await s.fn();
    const total = Object.values(days).reduce((a, b) => a + b, 0);
    data[s.key] = days;
    meta[s.key] = { ok: true, days: Object.keys(days).length, total, at: new Date().toISOString() };
    console.log(`  ${s.label}: ${total} across ${Object.keys(days).length} days`);
  } catch (err) {
    const kept = prev?.data?.[s.key];
    if (kept) {
      data[s.key] = kept;
      meta[s.key] = { ...prev.meta[s.key], ok: true, stale: true };
      console.log(`  ${s.label}: FAILED (${err.message}), kept ${Object.keys(kept).length} days from the last run`);
    } else {
      data[s.key] = {};
      meta[s.key] = { ok: false, days: 0, total: 0, error: err.message, at: new Date().toISOString() };
      console.log(`  ${s.label}: FAILED (${err.message}), no previous data to keep`);
    }
  }
}

const payload = { generated: new Date().toISOString(), handles: HANDLES, meta, data };

fs.writeFileSync(
  OUT,
  `// GENERATED by scripts/gen-activity.mjs. Do not edit.
// One year of daily activity per platform, fetched at build time because two
// of the three community proxies this used to call from the browser are dead
// or rate limited. See the script for the full reason.
//
// Generated ${payload.generated}
export const ACTIVITY = ${JSON.stringify(payload, null, 1)} as const;

export type ActivitySnapshot = typeof ACTIVITY;
`
);

const failed = Object.entries(meta).filter(([, m]) => !m.ok).map(([k]) => k);
console.log(failed.length ? `  wrote activity.ts, ${failed.join(" and ")} unavailable` : "  wrote activity.ts, all three sources live");
