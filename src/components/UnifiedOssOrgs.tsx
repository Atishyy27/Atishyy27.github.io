"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import RepoLogo from "@/components/RepoLogo";
import type { OrgRow } from "@/content/oss";
import { levelColor } from "@/content/oss-levels";
import rawIssues from "@/content/oss-issues.json";

interface UpstreamIssue {
  title: string;
  number: number;
  repo: string;
  url: string;
  created_at: string;
}

const PAGE_SIZE = 12;

type Filter = "all" | "landed" | "in-flight" | "has-issues";

const pill = (active: boolean, on: string) =>
  `inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 font-mono text-xs transition-colors ${
    active ? on : "border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
  }`;

export default function UnifiedOssOrgs({ orgs }: { orgs: OrgRow[] }) {
  const issuesByOrg = useMemo(() => {
    const map = new Map<string, UpstreamIssue[]>();
    for (const it of rawIssues as UpstreamIssue[]) {
      const key = it.repo.split("/")[0].toLowerCase();
      map.set(key, [...(map.get(key) ?? []), it]);
    }
    return map;
  }, []);
  const issuesOf = (o: OrgRow) => issuesByOrg.get(o.org.toLowerCase()) ?? [];

  // An organisation where nothing landed and nothing is open has nothing to list here.
  const rows = useMemo(() => orgs.filter((o) => o.contributions + o.open > 0), [orgs]);

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((o) => {
      const issues = issuesByOrg.get(o.org.toLowerCase()) ?? [];
      if (filter === "landed" && o.contributions === 0) return false;
      if (filter === "in-flight" && o.contributions > 0) return false;
      if (filter === "has-issues" && issues.length === 0) return false;
      if (!q) return true;
      return (
        o.org.toLowerCase().includes(q) ||
        o.repos.some(
          (r) =>
            r.full.toLowerCase().includes(q) ||
            r.prs.some((p) => p.title.toLowerCase().includes(q) || String(p.number).includes(q))
        ) ||
        issues.some((i) => i.title.toLowerCase().includes(q) || String(i.number).includes(q))
      );
    });
  }, [rows, filter, search, issuesByOrg]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const landedCount = rows.filter((o) => o.contributions > 0).length;
  const inFlightCount = rows.filter((o) => o.contributions === 0).length;
  const withIssuesCount = rows.filter((o) => issuesOf(o).length > 0).length;

  const pick = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <section className="mt-20 border-t border-[var(--line)] pt-12">
      <div>
        <h2 className="text-[length:var(--step-h2)] font-medium">Every organisation</h2>
        <p className="mt-1 max-w-prose text-[length:var(--step-small)] text-[var(--fg-muted)]">
          One row per organisation, most contributions first. Open a row for its repositories and their merged and
          open pull requests.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => pick("all")} className={pill(filter === "all", "bg-[var(--accent)] text-[#06181a] font-medium")}>
          All ({rows.length})
        </button>
        <button type="button" onClick={() => pick("landed")} className={pill(filter === "landed", "bg-[#a371f7] text-white font-medium")}>
          Landed ({landedCount})
        </button>
        <button type="button" onClick={() => pick("in-flight")} className={pill(filter === "in-flight", "bg-[#3fb950] text-[#06181a] font-medium")}>
          In flight ({inFlightCount})
        </button>
        <button type="button" onClick={() => pick("has-issues")} className={pill(filter === "has-issues", "bg-[var(--accent)] text-[#06181a] font-medium")}>
          Issues filed ({withIssuesCount})
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          aria-label="Filter organisations"
          placeholder="Filter by organisation, repository or pull request title"
          className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] px-4 text-base placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      <div className="mt-6 space-y-3">
        {paginated.length === 0 ? (
          <div className="rounded-xl border border-[var(--line)] p-8 text-center text-sm text-[var(--fg-muted)]">
            Nothing matches &quot;{search}&quot;.
          </div>
        ) : (
          paginated.map((o) => {
            const isOpen = !!expanded[o.slug];
            const issues = issuesOf(o);
            const color = levelColor(o.level);
            return (
              <div key={o.slug} className="rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] p-4 transition-colors hover:border-[var(--accent)]/40 sm:p-5">
                <div className="flex items-start gap-3">
                  <RepoLogo owner={o.org} size={32} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/oss/org/${o.slug}/`}
                      className="inline-flex min-h-11 max-w-full items-center truncate text-base font-medium hover:text-[var(--accent)] hover:underline"
                    >
                      {o.org}
                    </Link>
                    <p className="-mt-1 font-mono text-xs text-[var(--fg-muted)]">
                      {o.merged} merged · {o.open} open
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-2xl font-medium leading-tight tabular-nums">{o.contributions}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">
                      contributions
                    </span>
                    {color ? (
                      <span
                        className="mt-1 inline-block rounded border px-1.5 font-mono text-[10px] leading-4"
                        style={{ color, borderColor: color }}
                      >
                        {o.level}
                      </span>
                    ) : null}
                  </div>
                </div>

                {o.repos.length > 0 || issues.length > 0 ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded((p) => ({ ...p, [o.slug]: !p[o.slug] }))}
                    className="mt-2 inline-flex min-h-11 items-center font-mono text-xs text-[var(--accent)] hover:underline"
                  >
                    {isOpen
                      ? "Hide repositories ↑"
                      : `Show ${o.repos.length} ${o.repos.length === 1 ? "repository" : "repositories"}${
                          issues.length > 0 ? ` and ${issues.length} ${issues.length === 1 ? "issue" : "issues"}` : ""
                        } ↓`}
                  </button>
                ) : null}

                {isOpen ? (
                  <div className="mt-2 space-y-4 border-t border-[var(--line)] pt-3">
                    {o.repos.map((r) => (
                      <div key={r.slug}>
                        <div className="flex flex-wrap items-center justify-between gap-x-3">
                          <Link
                            href={`/oss/${r.slug}/`}
                            className="inline-flex min-h-11 items-center font-mono text-sm hover:text-[var(--accent)] hover:underline"
                          >
                            {r.name}
                          </Link>
                          <span className="font-mono text-xs text-[var(--fg-muted)]">
                            {r.merged} merged · {r.open} open
                          </span>
                        </div>
                        <ul>
                          {r.prs.map((pr) => (
                            <li key={pr.number}>
                              <a
                                href={pr.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-11 items-center gap-2 text-sm hover:text-[var(--accent)]"
                              >
                                <span
                                  className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                                    pr.state === "merged"
                                      ? "border border-[#a371f7]/30 bg-[#a371f7]/15 text-[#a371f7]"
                                      : "border border-[#3fb950]/30 bg-[#3fb950]/15 text-[#3fb950]"
                                  }`}
                                >
                                  {pr.state}
                                </span>
                                <span className="min-w-0 flex-1 truncate">
                                  #{pr.number} {pr.title}
                                </span>
                                <span className="shrink-0 font-mono text-[10px] text-[var(--fg-muted)]">
                                  {pr.created.slice(0, 10)}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {issues.length > 0 ? (
                      <div>
                        <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[var(--accent)]">
                          Self-sourced upstream issues
                        </p>
                        <ul>
                          {issues.map((issue) => (
                            <li key={`${issue.repo}${issue.number}`}>
                              <a
                                href={issue.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-11 items-center gap-2 text-sm hover:text-[var(--accent)]"
                              >
                                <span className="shrink-0 rounded border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-[var(--accent)]">
                                  issue
                                </span>
                                <span className="min-w-0 flex-1 truncate">
                                  #{issue.number} {issue.title}
                                </span>
                                <span className="shrink-0 font-mono text-[10px] text-[var(--fg-muted)]">
                                  {issue.created_at.slice(0, 10)}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4 font-mono text-xs">
          <span className="text-[var(--fg-muted)]">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} organisations
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="min-h-11 rounded border border-[var(--line)] bg-[var(--bg-raised)] px-4 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              &larr; Prev
            </button>
            <span className="px-1 text-[var(--fg)]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="min-h-11 rounded border border-[var(--line)] bg-[var(--bg-raised)] px-4 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
