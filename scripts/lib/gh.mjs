// scripts/lib/gh.mjs
// A token and a GraphQL call, shared by the OSS scripts.
//
// The token comes from GITHUB_TOKEN or GH_TOKEN (the workflow sets one) and falls
// back to `gh auth token`, so a local run needs no setup. GraphQL needs a token
// even for public data, which is why the old unauthenticated REST search is gone.

import { execFileSync } from "node:child_process";

let cached;
export function token() {
  if (cached) return cached;
  const t = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (t) return (cached = t);
  try {
    return (cached = execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim());
  } catch {
    throw new Error("No GitHub token: set GITHUB_TOKEN, or run `gh auth login`");
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A failed refresh must be loud. The site went stale before because a bad
// response was swallowed and the script exited 0, so this throws and the
// workflow goes red instead.
export async function graphql(query, variables = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
          "User-Agent": "portfolio-oss-fetch",
        },
        body: JSON.stringify({ query, variables }),
      });
      if (res.status >= 500 || res.status === 429 || res.status === 403) {
        lastErr = new Error(`GitHub answered ${res.status}`);
        await sleep(2000 * attempt);
        continue;
      }
      const j = await res.json();
      if (!res.ok) throw new Error(`GitHub answered ${res.status}: ${JSON.stringify(j).slice(0, 300)}`);
      if (j.errors && !j.data) throw new Error(`GraphQL errors: ${JSON.stringify(j.errors).slice(0, 400)}`);
      if (j.errors) console.warn(`WARNING: partial GraphQL errors: ${JSON.stringify(j.errors).slice(0, 300)}`);
      return j.data;
    } catch (e) {
      lastErr = e;
      if (attempt === 4) break;
      await sleep(2000 * attempt);
    }
  }
  throw lastErr ?? new Error("GraphQL failed");
}

// Runs a search query page by page. GitHub caps search at 1000 results, and a
// silent cap is how a count goes quietly wrong, so reaching it throws.
export async function searchAll(query, q) {
  const nodes = [];
  let after = null;
  let issueCount = 0;
  for (;;) {
    const d = await graphql(query, { q, after });
    issueCount = d.search.issueCount;
    nodes.push(...d.search.nodes.filter(Boolean));
    if (!d.search.pageInfo.hasNextPage) break;
    after = d.search.pageInfo.endCursor;
    if (nodes.length >= 1000) throw new Error(`search hit the 1000-result cap for: ${q}`);
  }
  return { nodes, issueCount };
}
