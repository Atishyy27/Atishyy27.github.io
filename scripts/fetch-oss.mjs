// scripts/fetch-oss.mjs
// One fetch, every open-source number on the site.
//
// Writes, from the same GitHub GraphQL responses:
//   src/content/oss-data.json      schema 2: orgs, repos, PRs, carried commits, fixed reports
//   src/content/oss-stats.ts       the headline numbers; the only place TSX may read them from
//   src/content/oss-scorecard.json how the work lands (medians, size buckets, per month)
//   src/content/oss-prs.json       every merged PR with kind, level, reach (tiers, timeline, game)
//
// DEFINITIONS (v2, 21 Nov 2026)
//   contribution = a merged PR, plus a commit of his that a maintainer carried through
//                  their own PR (verified by author LOGIN, never by name), plus a bug
//                  report of his that was fixed upstream by someone else's PR or commit.
//   open         = an open PR. Shown beside contributions, never inside them.
//   closed       = a PR closed without merging. Never summarised on the site; only listed
//                  on org and repo detail pages, with the reason GitHub's own close event gives.
//   Upstream only: public repositories he does not own, minus the list in oss-exclusions.mjs.
//
// WHY CLOSE REASONS ARE EVIDENCE, NOT OPINION. GitHub records who closed a PR and, when
// it knows, what closed it (a commit, or another PR). That is classified below; a label
// or a bot closing it is the second signal. Anything else a maintainer closed is
// "declined" with no guessed motive, and a PR with no event is "unknown".
//
// Refresh: npm run fetch:oss   (needs a token: GITHUB_TOKEN, or `gh auth login`)

import fs from "node:fs";
import { graphql, searchAll } from "./lib/gh.mjs";
import { EXCLUDED, isExcluded, exclusionTerms } from "./oss-exclusions.mjs";

const USER = "Atishyy27";
const ME = USER.toLowerCase();
const F = {
  data: "src/content/oss-data.json",
  stats: "src/content/oss-stats.ts",
  card: "src/content/oss-scorecard.json",
  prs: "src/content/oss-prs.json",
  extras: "src/content/oss-extras.json",
};
const HEARTBEAT_MS = 24 * 3600 * 1000; // rewrite the stamp at least daily so "last checked" is honest

const CLOSE_REASONS = [
  ["landed", "Landed another way"],
  ["superseded", "Replaced by another PR"],
  ["resubmitted", "Resubmitted by me"],
  ["auto", "Closed automatically"],
  ["mine", "Closed by me"],
  ["declined", "Closed by a maintainer"],
  ["unknown", "Reason not recorded"],
];

const PR_QUERY = `
fragment PR on PullRequest {
  number title url state merged createdAt closedAt mergedAt additions deletions authorAssociation
  author { login }
  mergedBy { __typename login }
  repository { nameWithOwner stargazerCount isPrivate owner { __typename login } }
  labels(first: 12) { nodes { name } }
  reviews(first: 5) { nodes { createdAt author { __typename login } } }
  comments(first: 5) { nodes { createdAt author { __typename login } } }
  lastComments: comments(last: 3) { nodes { author { __typename login } body } }
  timelineItems(last: 8, itemTypes: [CLOSED_EVENT, LABELED_EVENT]) { nodes {
    __typename
    ... on ClosedEvent { actor { __typename login } closer { __typename
      ... on Commit { oid url }
      ... on PullRequest { number url merged author { login } } } }
    ... on LabeledEvent { label { name } }
  } }
}
query($q: String!, $after: String) {
  search(query: $q, type: ISSUE, first: 40, after: $after) {
    issueCount
    pageInfo { hasNextPage endCursor }
    nodes { ...PR }
  }
}`;

const ISSUE_QUERY = `
query($q: String!, $after: String) {
  search(query: $q, type: ISSUE, first: 40, after: $after) {
    issueCount
    pageInfo { hasNextPage endCursor }
    nodes { ... on Issue {
      number title url stateReason
      repository { nameWithOwner isPrivate owner { __typename login } }
      timelineItems(last: 4, itemTypes: [CLOSED_EVENT]) { nodes { ... on ClosedEvent {
        stateReason
        closer { __typename
          ... on Commit { oid url }
          ... on PullRequest { number url merged author { login } repository { nameWithOwner } } } } } }
    } }
  }
}`;

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// GitHub types some bot accounts as users (ldk-reviews-bot), so the login is checked too.
const isBot = (a) => !!a && (a.__typename === "Bot" || /(\[bot\]|[-_]bot)$/i.test(a.login || ""));
const lc = (s) => String(s || "").toLowerCase();
const median = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// ---------------------------------------------------------------- pull requests
const { nodes: prNodes, issueCount: prCount } = await searchAll(
  PR_QUERY,
  `author:${USER} is:pr -user:${USER} is:public ${exclusionTerms}`,
);

const prs = [];
let dropped = 0;
for (const n of prNodes) {
  const full = n.repository.nameWithOwner;
  // The query already excludes these; a qualifier that stops working is silent, so check again.
  if (isExcluded(full) || n.repository.isPrivate || lc(n.repository.owner.login) === ME || lc(n.author?.login) !== ME) {
    dropped++;
    console.warn(`WARNING: filtered after the query: ${full}#${n.number}`);
    continue;
  }
  prs.push(n);
}
if (prNodes.length !== prCount) throw new Error(`search said ${prCount} PRs but returned ${prNodes.length}`);
console.log(`fetched ${prs.length} pull requests to repositories he does not own (${dropped} filtered)`);

function classifyClosed(n) {
  const nodes = n.timelineItems?.nodes ?? [];
  const ev = [...nodes].reverse().find((x) => x.__typename === "ClosedEvent");
  const labels = new Set([
    ...(n.labels?.nodes ?? []).map((l) => lc(l.name)),
    ...nodes.filter((x) => x.__typename === "LabeledEvent").map((x) => lc(x.label?.name)),
  ]);
  const actor = ev?.actor;
  const closer = ev?.closer;
  const by = actor?.login;
  if (closer?.__typename === "Commit") {
    return { reason: "landed", evidence: `closed by commit ${closer.oid.slice(0, 7)}`, by };
  }
  if (closer?.__typename === "PullRequest" && closer.number !== n.number) {
    const mine = lc(closer.author?.login) === ME;
    return { reason: mine ? "resubmitted" : "superseded", evidence: `closed by PR #${closer.number}`, by };
  }
  const label = [...labels].find((l) => /duplicate|superseded/.test(l));
  if (label) return { reason: "superseded", evidence: `label: ${label}`, by };
  const auto = [...labels].find((l) => /^(stale|no[- ]?activity|inactive|autoclose|auto[- ]closed|cla[: -]*(not|no|missing))/.test(l));
  if (isBot(actor) || auto) {
    return { reason: "auto", evidence: isBot(actor) ? `closed by ${actor.login}` : `label: ${auto}`, by };
  }
  if (actor && lc(actor.login) === ME) return { reason: "mine", evidence: "closed by me", by };
  // A maintainer says in their last words that it landed (a hash, or "in #123"), without the close event saying so.
  const said = (n.lastComments?.nodes ?? []).some(
    (c) => lc(c.author?.login) !== ME && !isBot(c.author) &&
      /\b(merged|landed|applied|cherry[- ]?pick(ed)?|included|pushed)\b[^.\n]{0,60}\b([0-9a-f]{7,40}|in #\d+)\b/i.test(c.body || ""),
  );
  if (said) return { reason: "landed", evidence: "a maintainer comment says it landed", by };
  if (actor) return { reason: "declined", evidence: `closed by @${actor.login}`, by };
  return { reason: "unknown", evidence: "", by };
}

const kindOf = (title, labels) => {
  const t = lc(title).replace(/^\[[^\]]*\]\s*/, "");
  const l = labels.map(lc);
  if (/^(fix|bug|bugfix|hotfix)\b/.test(t) || l.includes("bug")) return "Fix";
  if (/^(feat|feature|add|adds|support|implement)\b/.test(t) || l.some((x) => /enhancement|feature/.test(x))) return "Feature";
  if (/^docs?\b/.test(t) || l.includes("documentation")) return "Docs";
  if (/^(ci|build|chore|test|tests|refactor)\b/.test(t)) return "Infra";
  return "Fix";
};

const firstResponseHours = (n) => {
  const t = [...(n.reviews?.nodes ?? []), ...(n.comments?.nodes ?? [])]
    .filter((e) => e.author && lc(e.author.login) !== ME && !isBot(e.author))
    .map((e) => Date.parse(e.createdAt));
  return t.length ? (Math.min(...t) - Date.parse(n.createdAt)) / 36e5 : null;
};

const repoMap = new Map();
const orgKind = new Map();
const flat = [];
for (const n of prs) {
  const full = n.repository.nameWithOwner;
  const [owner, name] = full.split("/");
  orgKind.set(owner, n.repository.owner.__typename);
  const state = n.merged ? "merged" : n.state === "OPEN" ? "open" : "closed";
  const labels = (n.labels?.nodes ?? []).map((l) => l.name);
  const rec = {
    number: n.number, title: n.title, url: n.url, state,
    created: n.createdAt.slice(0, 10),
    closedAt: n.closedAt ? n.closedAt.slice(0, 10) : null,
    mergedAt: n.mergedAt || null,
    additions: n.additions, deletions: n.deletions,
  };
  if (state === "merged" && n.mergedBy && !isBot(n.mergedBy)) rec.mergedBy = n.mergedBy.login;
  if (state === "closed") {
    const c = classifyClosed(n);
    rec.closeReason = c.reason; rec.closeEvidence = c.evidence;
    if (c.by) rec.closedBy = c.by;
  }
  const r = repoMap.get(full) ?? {
    full, owner, name, slug: slugify(full), org: owner,
    stars: n.repository.stargazerCount, reach: "C", level: "",
    merged: 0, open: 0, closed: 0, member: false, features: 0, prs: [],
  };
  r[state] += 1;
  r.prs.push(rec);
  if (state === "merged") {
    if (["MEMBER", "COLLABORATOR", "OWNER"].includes(n.authorAssociation)) r.member = true;
    if (kindOf(n.title, labels) === "Feature") r.features += 1;
  }
  repoMap.set(full, r);
  flat.push({ n, rec, full, labels, state });
}

const reachOf = (kind, stars) => (kind !== "Organization" ? "D" : stars >= 10000 ? "A" : stars >= 1000 ? "B" : "C");
const levelOf = (merged, features, member) =>
  member ? "L4" : merged === 0 ? "" : merged >= 5 || features > 0 ? "L3" : merged >= 2 ? "L2" : "L1";

for (const r of repoMap.values()) {
  r.reach = reachOf(orgKind.get(r.owner), r.stars);
  r.level = levelOf(r.merged, r.features, r.member);
  r.prs.sort((a, b) => (a.created < b.created ? 1 : -1));
}

// ---------------------------------------------------- carried commits (verified)
const extras = JSON.parse(fs.readFileSync(F.extras, "utf8"));
const carried = [];
for (const c of extras.carried ?? []) {
  const [o, nm] = c.repo.split("/");
  const d = await graphql(
    `query($o:String!,$n:String!,$pr:Int!,$sha:String!){ repository(owner:$o,name:$n){
       pullRequest(number:$pr){ merged title url }
       object(expression:$sha){ ... on Commit { oid url messageHeadline author { user { login } } } } } }`,
    { o, n: nm, pr: c.pr, sha: c.commit },
  );
  const pr = d.repository?.pullRequest;
  const obj = d.repository?.object;
  const authorLogin = obj?.author?.user?.login;
  if (!pr?.merged || !obj || lc(authorLogin) !== ME || isExcluded(c.repo)) {
    console.warn(`WARNING: carried commit not verified, not counted: ${c.repo}#${c.pr} ${c.commit}`);
    continue;
  }
  carried.push({ repo: c.repo, org: o, pr: c.pr, commit: obj.oid.slice(0, 8), title: obj.messageHeadline, url: pr.url });
  // His own PR that this one replaced did land, through the maintainer's PR. GitHub closes it with no closer.
  for (const num of c.replaces ?? []) {
    const hit = flat.find((f) => lc(f.full) === lc(c.repo) && f.rec.number === num && f.state === "closed");
    if (hit) { hit.rec.closeReason = "landed"; hit.rec.closeEvidence = `landed through PR #${c.pr}`; }
  }
}

// ------------------------------------------- bug reports that were fixed upstream
const { nodes: issueNodes } = await searchAll(
  ISSUE_QUERY,
  `author:${USER} is:issue is:closed -user:${USER} is:public ${exclusionTerms}`,
);
const reportsFixed = [];
// Found reports count only in a project that has also merged his work. Tiny community
// repos fix a typo report in an afternoon; that is not the record this site is for.
const engaged = new Set([...repoMap.values()].filter((r) => r.merged > 0).map((r) => lc(r.owner)));
for (const i of issueNodes) {
  const full = i.repository.nameWithOwner;
  if (isExcluded(full) || i.repository.isPrivate || lc(i.repository.owner.login) === ME) continue;
  if (!engaged.has(lc(i.repository.owner.login))) continue;
  const ev = [...(i.timelineItems?.nodes ?? [])].reverse().find((x) => x?.closer);
  if (!ev || ev.stateReason === "NOT_PLANNED" || ev.stateReason === "DUPLICATE") continue;
  const cl = ev.closer;
  let how, fixedBy, fixUrl;
  if (cl.__typename === "PullRequest" && cl.merged && lc(cl.author?.login) !== ME) {
    how = "closed-by-pr"; fixedBy = `@${cl.author?.login ?? "a maintainer"} in PR #${cl.number}`; fixUrl = cl.url;
  } else if (cl.__typename === "Commit") {
    how = "closed-by-commit"; fixedBy = `commit ${cl.oid.slice(0, 7)}`; fixUrl = cl.url;
  } else continue;
  reportsFixed.push({ repo: full, org: full.split("/")[0], number: i.number, title: i.title, url: i.url, fixedBy, fixUrl, how });
}
for (const x of extras.reportsFixed ?? []) {
  if (isExcluded(x.repo) || reportsFixed.some((r) => lc(r.repo) === lc(x.repo) && r.number === x.number)) continue;
  const [o, nm] = x.repo.split("/");
  const d = await graphql(
    `query($o:String!,$n:String!,$i:Int!){ repository(owner:$o,name:$n){ isPrivate issue(number:$i){ title url state stateReason author { login } } } }`,
    { o, n: nm, i: x.number },
  );
  const is = d.repository?.issue;
  if (!is || d.repository.isPrivate || is.state !== "CLOSED" || is.stateReason !== "COMPLETED" || lc(is.author?.login) !== ME) {
    console.warn(`WARNING: curated report not verified, not counted: ${x.repo}#${x.number}`);
    continue;
  }
  reportsFixed.push({ repo: x.repo, org: o, number: x.number, title: is.title, url: is.url, fixedBy: x.fixedBy ?? "the maintainers", fixUrl: x.fixUrl ?? is.url, how: "curated" });
}
reportsFixed.sort((a, b) => a.repo.localeCompare(b.repo) || a.number - b.number);

// ---------------------------------------------------------------------- orgs
const orgMap = new Map();
const org = (login) => {
  if (!orgMap.has(login)) {
    orgMap.set(login, {
      org: login, slug: login.toLowerCase(), avatar: `https://github.com/${login}.png`,
      kind: orgKind.get(login) ?? "Organization",
      merged: 0, open: 0, closed: 0, carried: 0, reportsFixed: 0, contributions: 0, level: "", repos: [],
      _features: 0, _member: false,
    });
  }
  return orgMap.get(login);
};
for (const r of repoMap.values()) {
  const o = org(r.owner);
  o.merged += r.merged; o.open += r.open; o.closed += r.closed; o.repos.push(r.full);
  o._features += r.features; o._member ||= r.member;
}
for (const c of carried) org(c.org).carried += 1;
for (const x of reportsFixed) org(x.org).reportsFixed += 1;
const orgs = [...orgMap.values()].map((o) => {
  o.contributions = o.merged + o.carried + o.reportsFixed;
  o.level = o.merged || o.carried ? levelOf(o.merged + o.carried, o._features, o._member) : "";
  delete o._features; delete o._member;
  return o;
}).sort((a, b) => b.contributions - a.contributions || b.open - a.open || a.org.localeCompare(b.org));

const repos = [...repoMap.values()].map((r) => { delete r.member; delete r.features; return r; })
  .sort((a, b) => b.merged - a.merged || b.prs.length - a.prs.length || a.full.localeCompare(b.full));

const totals = {
  contributions: orgs.reduce((t, o) => t + o.contributions, 0),
  merged: repos.reduce((t, r) => t + r.merged, 0),
  open: repos.reduce((t, r) => t + r.open, 0),
  carried: carried.length,
  reportsFixed: reportsFixed.length,
  closed: repos.reduce((t, r) => t + r.closed, 0),
  prs: repos.reduce((t, r) => t + r.prs.length, 0),
  orgs: orgs.length,
  orgsLanded: orgs.filter((o) => o.contributions > 0).length,
  repos: repos.length,
  reposLanded: repos.filter((r) => r.merged > 0).length,
};
const closedReasons = CLOSE_REASONS.map(([key, label]) => ({
  key, label, count: flat.filter((f) => f.state === "closed" && f.rec.closeReason === key).length,
})).filter((x) => x.count > 0);

const definition =
  "A contribution is a merged pull request, a commit of mine that a maintainer carried through their own pull request, or a bug report of mine that was fixed upstream. Open pull requests are counted beside it, not inside it. Public repositories I do not own, counted from GitHub itself.";

// -------------------------------------------------------------------- scorecard
const merged = flat.filter((f) => f.state === "merged");
const decided = flat.filter((f) => f.state !== "open");
const sizeOf = (f) => (f.n.additions || 0) + (f.n.deletions || 0);
const bucketOf = (s) => (s <= 30 ? "1-30" : s <= 100 ? "31-100" : s <= 300 ? "101-300" : "300+");
const bySize = ["1-30", "31-100", "101-300", "300+"].map((b) => ({
  bucket: b,
  merged: merged.filter((f) => bucketOf(sizeOf(f)) === b).length,
  decided: decided.filter((f) => bucketOf(sizeOf(f)) === b).length,
}));
const months = [];
{
  const now = new Date();
  for (let i = 8; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
}
const byMonth = months.map((m) => ({ month: m, merged: merged.filter((f) => f.rec.mergedAt?.startsWith(m)).length }));
const mergeDays = merged.map((f) => (Date.parse(f.rec.mergedAt) - Date.parse(f.n.createdAt)) / 864e5);
const respHours = flat.map((f) => firstResponseHours(f.n)).filter((h) => h !== null);
const scorecard = (stamp) => ({
  snapshot: stamp,
  merged: totals.merged,
  contributions: totals.contributions,
  maintainersWhoMerged: new Set(merged.map((f) => lc(f.rec.mergedBy)).filter((x) => x && x !== ME)).size,
  orgsWithMerge: new Set(merged.map((f) => f.n.repository.owner.login)).size,
  medianDaysToMerge: mergeDays.length ? Math.round(median(mergeDays) * 10) / 10 : null,
  medianHoursToFirstReview: respHours.length ? Math.round(median(respHours)) : null,
  bySize,
  byMonth,
  definition: "Medians over merged PRs (days to merge) and over all PRs that got a human reply (hours to first review or comment). Sizes are lines added plus deleted.",
  detail: {
    decided: decided.length,
    mergeRate: decided.length ? Math.round((1000 * merged.length) / decided.length) / 1000 : null,
  },
});

// ------------------------------------------------------ oss-prs.json (tiers etc.)
let oldKinds = new Map();
try {
  for (const p of JSON.parse(fs.readFileSync(F.prs, "utf8")).prs) oldKinds.set(`${p.repo}#${p.number}`, p.kind);
} catch { /* first run */ }
const prList = merged
  .map((f) => ({
    repo: f.full, number: f.rec.number, title: f.rec.title, url: f.rec.url, merged_at: f.rec.mergedAt,
    size: sizeOf(f),
    kind: oldKinds.get(`${f.full}#${f.rec.number}`) ?? kindOf(f.rec.title, f.labels),
    level: repoMap.get(f.full).level,
    reach: repoMap.get(f.full).reach,
  }))
  .sort((a, b) => (a.merged_at < b.merged_at ? 1 : -1));

// ------------------------------------------------------------------------ write
const body = { schema: 2, user: USER, definition, totals, orgs, repos, carried, reportsFixed, closedReasons };
const core = JSON.stringify(body);
let prev = null;
try { prev = JSON.parse(fs.readFileSync(F.data, "utf8")); } catch { /* none */ }
const { fetchedAt: prevAt, ...prevBody } = prev ?? {};
if (prev && JSON.stringify(prevBody) === core && Date.now() - Date.parse(prevAt) < HEARTBEAT_MS) {
  console.log(`no change since ${prevAt}; nothing written`);
  process.exit(0);
}
const fetchedAt = new Date().toISOString();
fs.writeFileSync(F.data, JSON.stringify({ ...body, fetchedAt }, null, 2) + "\n");
fs.writeFileSync(F.card, JSON.stringify(scorecard(fetchedAt), null, 2) + "\n");
fs.writeFileSync(F.prs, JSON.stringify({ generated: fetchedAt, level_note: "per repo from merged counts and author association; kind from the PR title and labels unless set by hand", prs: prList }, null, 1) + "\n");
const t = totals;
fs.writeFileSync(
  F.stats,
  `// GENERATED by scripts/fetch-oss.mjs. Do not edit.
// Every number the site states about open source comes from here, counted not typed.
export const OSS_STATS = {
  contributions: ${t.contributions},
  merged: ${t.merged},
  open: ${t.open},
  carried: ${t.carried},
  reportsFixed: ${t.reportsFixed},
  orgsLanded: ${t.orgsLanded},
  reposLanded: ${t.reposLanded},
  orgs: ${t.orgs},
  repos: ${t.repos},
  mergedRepos: ${t.reposLanded},
  closed: ${t.closed},
  prs: ${t.prs},
  fetchedAt: "${fetchedAt}",
} as const;
`,
);
console.log(`excluded: ${EXCLUDED.length} repositories (see scripts/oss-exclusions.mjs)`);
console.log(`${t.contributions} contributions = ${t.merged} merged + ${t.carried} carried + ${t.reportsFixed} reports fixed; ${t.open} open; ${t.orgsLanded} organisations landed`);
console.log(`closed (detail pages only): ${t.closed} ->`, closedReasons.map((c) => `${c.key} ${c.count}`).join(", "));
