// scripts/gen-cp.mjs
// Writes src/content/cp.ts: the competitive-programming line on the site,
// fetched at build time instead of typed by hand.
//
// Why this exists, 18 Oct 2026. The four handles were hardcoded in site.ts and
// every one of them had drifted. Measured against the live APIs on 18 Oct:
//
//   LeetCode   said "947 solved, peak 1860", actually 1008 solved
//   Codeforces said "Specialist, max 1524", actually max 1539 (current 1314, pupil)
//   CodeChef   said "4 star, max 1805", actually highest 1838 (current 1800)
//   AtCoder    said "Kyu 7, max 546", actually max 641 over 9 rated contests
//
// Hand-typed numbers rot silently, and a portfolio that understates a rating is
// as wrong as one that overstates it. Running in prebuild means the numbers are
// as fresh as the last deploy, and the deploy date is written into the file.
//
// Peak LeetCode contest rating is NOT in this file. The GraphQL API returns the
// current rating only; the peak needs the whole contest history, which is a
// second paginated call, so "peak 1860" has been dropped rather than carried
// forward unverified.
//
// A source that fails keeps its previous values and is marked stale, same rule
// as gen-activity.mjs. Nothing here needs a token.

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "src", "content", "cp.ts");
const TIMEOUT = 25000;

const HANDLES = {
  leetcode: "atishayjain78001",
  codeforces: "sethatishayjain",
  codechef: "fever_tub_71",
  atcoder: "fever_tub_71",
};

async function get(url, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (portfolio build)", ...(init?.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

const json = async (url, init) => (await get(url, init)).json();
const text = async (url, init) => (await get(url, init)).text();

// LeetCode sends no access-control-allow-origin, so this can only run server side.
async function leetcode(user) {
  const body = {
    query: `query($u:String!){
      matchedUser(username:$u){ profile{ ranking } submitStatsGlobal{ acSubmissionNum{ difficulty count } } }
      userContestRanking(username:$u){ rating topPercentage attendedContestsCount }
    }`,
    variables: { u: user },
  };
  const d = await json("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "content-type": "application/json", referer: "https://leetcode.com" },
    body: JSON.stringify(body),
  });
  const m = d?.data?.matchedUser;
  if (!m) throw new Error("no matchedUser in response");
  const by = Object.fromEntries(m.submitStatsGlobal.acSubmissionNum.map((x) => [x.difficulty, x.count]));
  const c = d.data.userContestRanking;
  const rating = c ? Math.round(c.rating) : null;
  // LeetCode's own badge thresholds: Guardian top 5%, Knight top 25%.
  const rank = !c ? "unrated" : c.topPercentage <= 5 ? "Guardian" : c.topPercentage <= 25 ? "Knight" : "rated";
  return {
    site: "LeetCode",
    handle: user,
    rank,
    detail: `${by.All} solved, contest rating ${rating}`,
    href: `https://leetcode.com/u/${user}/`,
    raw: { solved: by.All, easy: by.Easy, medium: by.Medium, hard: by.Hard, rating, topPercentage: c?.topPercentage ?? null, contests: c?.attendedContestsCount ?? null, globalRanking: m.profile?.ranking ?? null },
  };
}

async function codeforces(user) {
  const d = await json(`https://codeforces.com/api/user.info?handles=${user}`);
  if (d.status !== "OK" || !d.result?.[0]) throw new Error(d.comment || "bad response");
  const u = d.result[0];
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "unrated");
  return {
    site: "Codeforces",
    handle: user,
    // The honest line is the peak title with the current rating beside it, not
    // the peak title alone, which is what the hardcoded version did.
    rank: cap(u.maxRank),
    detail: `peak, max ${u.maxRating} · now ${cap(u.rank)} ${u.rating}`,
    href: `https://codeforces.com/profile/${user}`,
    raw: { rating: u.rating, maxRating: u.maxRating, rank: u.rank, maxRank: u.maxRank },
  };
}

// CodeChef publishes no API. This reads the public profile page and pulls three
// numbers out of it. If CodeChef changes its markup every regex below returns
// null, the source is marked failed, and the previous values are kept rather
// than a wrong number being printed.
async function codechef(user) {
  const html = await text(`https://www.codechef.com/users/${user}`);
  const cur = html.match(/rating-number"?>\s*([0-9]{3,4})/);
  const max = html.match(/Highest Rating[^0-9]{0,40}([0-9]{3,4})/);
  const starBlock = html.match(/<div class="rating-star[^"]*">(.*?)<\/div>/s);
  const stars = starBlock ? (starBlock[1].match(/&#9733;/g) || []).length : 0;
  if (!cur || !max) throw new Error("profile markup changed, could not read the rating");
  return {
    site: "CodeChef",
    handle: user,
    rank: stars ? `${stars} star` : "unrated",
    detail: `max ${max[1]}, now ${cur[1]}`,
    href: `https://www.codechef.com/users/${user}`,
    raw: { rating: Number(cur[1]), maxRating: Number(max[1]), stars },
  };
}

async function atcoder(user) {
  const hist = await json(`https://atcoder.jp/users/${user}/history/json`);
  const rated = hist.filter((h) => h.IsRated).map((h) => h.NewRating);
  if (!rated.length) throw new Error("no rated contests");
  const max = Math.max(...rated);
  const now = rated[rated.length - 1];
  // AtCoder kyu bands: 1-399 is 8 kyu, then every 200 points is one kyu up.
  const kyu = max < 400 ? 8 : Math.max(1, 8 - Math.floor((max - 200) / 200));
  return {
    site: "AtCoder",
    handle: user,
    rank: `Kyu ${kyu}`,
    detail: `max ${max} over ${rated.length} rated contests`,
    href: `https://atcoder.jp/users/${user}`,
    raw: { rating: now, maxRating: max, contests: rated.length },
  };
}

// Previous run, so a dead source keeps its numbers instead of blanking the panel.
let prev = null;
if (fs.existsSync(OUT)) {
  const m = fs.readFileSync(OUT, "utf8").match(/export const CP = ([\s\S]*?) as const;/);
  if (m) { try { prev = JSON.parse(m[1]); } catch { /* regenerate from scratch */ } }
}

// prebuild runs on every `next build`, and `npm run verify` builds twice, so
// without this the four APIs would be hit eight times for one verify. Skip if
// the file was written in the last six hours unless --force is passed.
const MAX_AGE_MS = 6 * 60 * 60 * 1000;
if (!process.argv.includes("--force") && prev?.generated) {
  const age = Date.now() - Date.parse(prev.generated);
  if (age >= 0 && age < MAX_AGE_MS) {
    console.log(`gen-cp: cp.ts is ${Math.round(age / 60000)} min old, skipping (pass --force to refetch)`);
    process.exit(0);
  }
}

const SOURCES = [
  { key: "leetcode", run: () => leetcode(HANDLES.leetcode) },
  { key: "codeforces", run: () => codeforces(HANDLES.codeforces) },
  { key: "codechef", run: () => codechef(HANDLES.codechef) },
  { key: "atcoder", run: () => atcoder(HANDLES.atcoder) },
];

console.log("gen-cp: fetching four competitive programming profiles");

const profiles = [];
const meta = {};

for (const s of SOURCES) {
  try {
    const p = await s.run();
    profiles.push(p);
    meta[s.key] = { ok: true, at: new Date().toISOString() };
    console.log(`  ${p.site}: ${p.rank} · ${p.detail}`);
  } catch (err) {
    const kept = prev?.profiles?.find((p) => p.site.toLowerCase() === s.key);
    if (kept) {
      profiles.push(kept);
      meta[s.key] = { ...(prev.meta?.[s.key] || {}), ok: true, stale: true, error: err.message };
      console.log(`  ${s.key}: FAILED (${err.message}), kept the previous values`);
    } else {
      meta[s.key] = { ok: false, error: err.message, at: new Date().toISOString() };
      console.log(`  ${s.key}: FAILED (${err.message}), no previous values to keep`);
    }
  }
}

// Keep the display order stable regardless of which source answered first.
const ORDER = ["LeetCode", "Codeforces", "CodeChef", "AtCoder"];
profiles.sort((a, b) => ORDER.indexOf(a.site) - ORDER.indexOf(b.site));

const payload = { generated: new Date().toISOString(), handles: HANDLES, meta, profiles };

fs.writeFileSync(
  OUT,
  `// GENERATED by scripts/gen-cp.mjs. Do not edit.
// Competitive programming ratings, fetched at build time from each platform's
// own API (CodeChef has none, so its public profile page is parsed). Hardcoded
// versions of these four lines had all drifted; see the script for the diff.
//
// Generated ${payload.generated}
export const CP = ${JSON.stringify(payload, null, 1)} as const;

export const CP_PROFILES = CP.profiles;
export const CP_GENERATED = CP.generated;
`
);

const failed = Object.entries(meta).filter(([, m]) => !m.ok).map(([k]) => k);
console.log(
  failed.length
    ? `  wrote cp.ts, ${failed.join(" and ")} unavailable`
    : `  wrote cp.ts, all ${profiles.length} sources live`
);
