"use client";

import { useEffect, useMemo, useState } from "react";
import { person } from "@/content/site";
import { Reveal } from "./Chrome";

/* ==================================================================
   Live open-source record, straight from the GitHub search API.
   Every PR he has opened (merged / open / closed) and every issue he
   has filed, categorised, with the real link on each row. No hardcoded
   list to go stale, and no generic "search" buttons: each row points
   at the actual PR or issue.
================================================================== */

type Item = {
  title: string;
  html_url: string;
  repo: string;
  state: "open" | "closed";
  merged: boolean;
  created: string;
  isPR: boolean;
};

const USER = person.githubUser;

function repoOf(url: string) {
  // https://api.github.com/repos/<owner>/<name>/issues/123
  const m = url.match(/repos\/([^/]+\/[^/]+)\//);
  return m ? m[1] : "";
}

async function search(kind: "pr" | "issue"): Promise<Item[]> {
  const res = await fetch(
    `https://api.github.com/search/issues?q=author:${USER}+type:${kind}&per_page=100&sort=created&order=desc`,
    { headers: { Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error(String(res.status));
  const j = await res.json();
  return (j.items ?? []).map((it: Record<string, unknown>) => {
    const pr = it.pull_request as { merged_at?: string | null } | undefined;
    return {
      title: it.title as string,
      html_url: it.html_url as string,
      repo: repoOf(it.repository_url as string),
      state: it.state as "open" | "closed",
      merged: !!pr?.merged_at,
      created: (it.created_at as string).slice(0, 10),
      isPR: kind === "pr",
    };
  });
}

type Tab = "merged" | "open" | "closed" | "issues";

export default function GitHubActivity() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState<Tab>("merged");

  useEffect(() => {
    Promise.all([search("pr"), search("issue")])
      .then(([prs, issues]) => setItems([...prs, ...issues]))
      .catch(() => setErr(true));
  }, []);

  const buckets = useMemo(() => {
    const prs = (items ?? []).filter((i) => i.isPR);
    const issues = (items ?? []).filter((i) => !i.isPR);
    return {
      merged: prs.filter((i) => i.merged),
      open: prs.filter((i) => i.state === "open"),
      closed: prs.filter((i) => i.state === "closed" && !i.merged),
      issues,
    };
  }, [items]);

  // keep his own repos out of the "contributions" count, they're not upstream
  const isUpstream = (i: Item) => !i.repo.toLowerCase().startsWith(`${USER.toLowerCase()}/`);

  const TABS: { key: Tab; label: string; color: string }[] = [
    { key: "merged", label: "Merged", color: "#a371f7" },
    { key: "open", label: "Open", color: "#3fb950" },
    { key: "closed", label: "Closed", color: "#f85149" },
    { key: "issues", label: "Issues filed", color: "#3fbdbd" },
  ];

  const list = buckets[tab];

  return (
    <Reveal>
      <div className="glass rounded-2xl p-6 sm:p-8">
        {/* headline counts */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              data-cursor
              onClick={() => setTab(t.key)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                tab === t.key ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--fg-muted)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                <span className="text-2xl font-semibold tabular-nums">
                  {items ? buckets[t.key].length : err ? "!" : "…"}
                </span>
              </div>
              <div className="mt-1 text-xs text-[var(--fg-muted)]">{t.label}</div>
            </button>
          ))}
        </div>

        {/* list */}
        <div className="mt-6 max-h-[26rem] overflow-y-auto pr-1">
          {err && (
            <p className="py-8 text-center text-sm text-[var(--fg-muted)]">
              GitHub rate-limited this view.{" "}
              <a href={`https://github.com/${USER}`} target="_blank" rel="noopener noreferrer" className="link text-[var(--accent)]">
                See it on GitHub
              </a>
            </p>
          )}
          {!items && !err && <p className="py-8 text-center text-sm text-[var(--fg-muted)]">Loading from GitHub…</p>}
          {items && (
            <ol className="divide-y divide-[var(--line)]">
              {list.map((i, k) => (
                <li key={k}>
                  <a href={i.html_url} target="_blank" rel="noopener noreferrer" className="group flex items-baseline gap-4 py-3">
                    <span className={`font-mono text-xs ${isUpstream(i) ? "text-[var(--accent)]" : "text-[var(--fg-muted)]"} w-52 shrink-0 truncate`}>
                      {i.repo}
                    </span>
                    <span className="flex-1 text-sm leading-snug text-[var(--fg-muted)] transition-colors group-hover:text-[var(--fg)]">
                      {i.title}
                    </span>
                    <span className="hidden shrink-0 font-mono text-[10px] text-[var(--fg-muted)] sm:block">{i.created}</span>
                  </a>
                </li>
              ))}
              {list.length === 0 && <li className="py-8 text-center text-sm text-[var(--fg-muted)]">Nothing here yet.</li>}
            </ol>
          )}
        </div>

        <p className="mt-4 font-mono text-[10px] text-[var(--fg-muted)]">
          live from the GitHub API · teal = upstream repo, grey = my own
        </p>
      </div>
    </Reveal>
  );
}
