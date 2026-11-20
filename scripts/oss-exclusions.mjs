// scripts/oss-exclusions.mjs
// The one list of repositories that never count as his open source. Every OSS
// script imports this; there is no second copy to drift.
//
// Written source of truth: cnc/OSS/PORTFOLIO.md section 3, mirrored by EXCL in
// cnc/OSS/tools/pr-live.py. Before 21 Nov 2026 fetch-oss.mjs carried seven of
// these nine and fetch-issues.mjs carried seven by exact-case match, so a PR or
// issue in either missing repo would have gone public the day he opened one.
//
// Matching is case-insensitive: GitHub returns the canonical casing of a repo
// name, which is not always the casing someone typed into a list.

export const EXCLUDED = [
  // Friend and client apps. Closed team projects, not open source.
  "saloni0903/yoga-app",
  "enotebook099/WebApp",
  "j3say/4moral",
  // Event-farm repos. Their own topics are gssoc, gssoc-ext, hacktoberfest, swoc.
  "iamrahulmahato/master-web-development",
  "ayush-that/FinVeda",
  "gauravsingh1281/Rentalog.in--Frontend",
  // Awesome-list entries. tripkit listings, not code.
  "pluja/awesome-privacy",
  "osmlab/awesome-openstreetmap",
  // Public, but not open-source licensed: its LICENSE reads "All rights reserved".
  "anthropics/claude-code",
];

const LOWER = new Set(EXCLUDED.map((r) => r.toLowerCase()));

export const isExcluded = (full) => LOWER.has(String(full).toLowerCase());

// Used inside a GitHub search query. The query alone is not enough, because a
// qualifier that stops working fails silently, so callers filter the results
// again with isExcluded.
export const exclusionTerms = EXCLUDED.map((r) => `-repo:${r}`).join(" ");
