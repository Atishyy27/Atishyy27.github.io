// scripts/fetch-oss.mjs
// Snapshots every pull request Atishyy27 has opened against a repository he
// does not own, and writes it to src/content/oss-data.json.
//
// WHY A SNAPSHOT AND NOT A BUILD-TIME FETCH: the deploy runs in GitHub Actions
// against the unauthenticated search API, which is 10 requests a minute and
// answers 403 when it feels like it. A build that fails because a rate limit
// moved is a bad trade for data that changes a few times a week. The live
// numbers already come from the browser on /oss; this is the dense, static
// part that must render even when the API is down.
//
// Refresh:  npm run fetch:oss    (then commit the json)

import fs from "node:fs";

const USER = "Atishyy27";
const OUT = "src/content/oss-data.json";

/**
 * Permanently excluded from the open-source record. These are not open-source
 * contributions and must never be counted, cited or shown.
 *
 * Excluded BOTH in the search query and again as a filter on the results. The
 * query alone is not enough: a typo in the query string fails silently and
 * quietly re-adds them, which is exactly how 19 of a stated 55 "merged"
 * pull requests came from these two repos and reached the live site.
 */
const EXCLUDED = new Set([
  "saloni0903/yoga-app",
  "iamrahulmahato/master-web-development",
]);

// GitHub's search API caps at 1000 results and 100 per page.
async function searchAll(q) {
  const items = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} on page ${page}`);
    const j = await res.json();
    items.push(...(j.items ?? []));
    if ((j.items ?? []).length < 100) break;
    // Unauthenticated search is 10/min. Stay under it.
    await new Promise((r) => setTimeout(r, 7000));
  }
  return items;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const exclusionTerms = [...EXCLUDED].map((r) => `-repo:${r}`).join(" ");
const fetched = await searchAll(`author:${USER} type:pr -user:${USER} ${exclusionTerms}`);

// Belt and braces: the query should already have removed these, so anything
// caught here means the query silently stopped working.
const all = fetched.filter((it) => {
  const full = it.repository_url.split("/repos/")[1];
  if (EXCLUDED.has(full)) {
    console.warn(`WARNING: query did not exclude ${full}; filtered in post`);
    return false;
  }
  return true;
});
console.log(`fetched ${all.length} pull requests to repositories he does not own`);
console.log(`excluded: ${[...EXCLUDED].join(", ")}`);

const byRepo = new Map();
for (const it of all) {
  const full = it.repository_url.split("/repos/")[1];
  const [owner, name] = full.split("/");
  const merged = !!it.pull_request?.merged_at;
  const state = merged ? "merged" : it.state === "open" ? "open" : "closed";

  const r = byRepo.get(full) ?? {
    full, owner, name, slug: slugify(full),
    merged: 0, open: 0, closed: 0, prs: [],
  };
  r[state] += 1;
  r.prs.push({
    number: it.number,
    title: it.title,
    url: it.html_url,
    state,
    created: it.created_at.slice(0, 10),
    closedAt: it.closed_at ? it.closed_at.slice(0, 10) : null,
  });
  byRepo.set(full, r);
}

const repos = [...byRepo.values()]
  .map((r) => ({ ...r, prs: r.prs.sort((a, b) => (a.created < b.created ? 1 : -1)) }))
  .sort((a, b) => b.merged - a.merged || b.prs.length - a.prs.length);

const totals = repos.reduce(
  (t, r) => ({
    merged: t.merged + r.merged,
    open: t.open + r.open,
    closed: t.closed + r.closed,
    prs: t.prs + r.prs.length,
  }),
  { merged: 0, open: 0, closed: 0, prs: 0 }
);

const payload = {
  user: USER,
  fetchedAt: new Date().toISOString().slice(0, 10),
  excludedCount: EXCLUDED.size,
  note: "Upstream only: repositories Atishyy27 does not own. Two repositories that are not open-source contributions are permanently excluded; they are named in this script, not in this file, because this file ships to the browser. GitHub search indexes public repositories, and counts a PR as merged only when it was closed with the merge button. Work landed by a maintainer rebasing and closing shows as closed.",
  totals,
  repoCount: repos.length,
  repos,
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log(`${OUT}: ${repos.length} repos, ${totals.merged} merged, ${totals.open} open, ${totals.closed} closed`);
