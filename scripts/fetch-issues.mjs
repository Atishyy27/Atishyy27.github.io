// scripts/fetch-issues.mjs
// Every issue Atishyy27 has filed in a public repository he does not own, written
// to src/content/oss-issues.json. Same exclusion list as the PR fetch.
//
// Before 21 Nov 2026 this read one page of 100, matched the exclusion list by exact
// case, and on an HTTP error printed a message and exited 0, so the workflow stayed
// green while the data went stale. Now it pages, shares scripts/oss-exclusions.mjs,
// and a failure is a non-zero exit.

import fs from "node:fs";
import { token } from "./lib/gh.mjs";
import { isExcluded, exclusionTerms } from "./oss-exclusions.mjs";

const USER = "Atishyy27";
const OUT = "src/content/oss-issues.json";
const q = `is:issue author:${USER} -user:${USER} is:public ${exclusionTerms}`;

const items = [];
for (let page = 1; page <= 10; page++) {
  const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${page}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "portfolio-updater", Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status} ${res.statusText} on page ${page}`);
  const j = await res.json();
  items.push(...(j.items ?? []));
  if ((j.items ?? []).length < 100) break;
  if (page === 10) throw new Error("issue search hit the 1000-result cap");
  await new Promise((r) => setTimeout(r, 2500));
}

const issues = items
  .map((it) => ({
    title: it.title,
    number: it.number,
    repo: it.repository_url.replace("https://api.github.com/repos/", ""),
    url: it.html_url,
    state: it.state,
    state_reason: it.state_reason,
    created_at: it.created_at,
    closed_at: it.closed_at,
    comments: it.comments,
  }))
  .filter((i) => !isExcluded(i.repo))
  .sort((a, b) => (a.created_at < b.created_at ? 1 : -1) || a.number - b.number);

const next = JSON.stringify(issues, null, 2) + "\n";
let prev = "";
try { prev = fs.readFileSync(OUT, "utf8"); } catch { /* first run */ }
if (prev === next) console.log(`${issues.length} upstream issues, no change`);
else {
  fs.writeFileSync(OUT, next);
  console.log(`${issues.length} upstream issues written to ${OUT}`);
}
