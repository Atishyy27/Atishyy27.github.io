"use client";

import { useState, useMemo } from "react";
import RepoLogo from "@/components/RepoLogo";
import type { OssRepo } from "@/content/oss";
import rawIssues from "@/content/oss-issues.json";

interface UpstreamIssue {
  title: string;
  number: number;
  repo: string;
  url: string;
  state: string;
  state_reason: string | null;
  created_at: string;
  closed_at: string | null;
  comments: number;
}

const PAGE_SIZE = 12;

interface Props {
  repos: OssRepo[];
}

export default function UnifiedOssRepos({ repos }: Props) {
  const issues = rawIssues as UpstreamIssue[];

  // Index issues by lowercase repository full name
  const issuesByRepo = useMemo(() => {
    const map = new Map<string, UpstreamIssue[]>();
    for (const it of issues) {
      const key = it.repo.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return map;
  }, [issues]);

  const [filter, setFilter] = useState<"all" | "landed" | "in-flight" | "has-issues">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedRepos, setExpandedRepos] = useState<Record<string, boolean>>({});

  const toggleExpand = (slug: string) => {
    setExpandedRepos((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const filtered = useMemo(() => {
    return repos.filter((r) => {
      const repoIssues = issuesByRepo.get(r.full.toLowerCase()) || [];

      if (filter === "landed" && r.merged === 0) return false;
      if (filter === "in-flight" && r.merged > 0) return false;
      if (filter === "has-issues" && repoIssues.length === 0) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesRepo = r.full.toLowerCase().includes(query);
        const matchesPr = r.prs.some(
          (p) => p.title.toLowerCase().includes(query) || String(p.number).includes(query)
        );
        const matchesIssue = repoIssues.some(
          (i) => i.title.toLowerCase().includes(query) || String(i.number).includes(query)
        );
        return matchesRepo || matchesPr || matchesIssue;
      }
      return true;
    });
  }, [repos, filter, search, issuesByRepo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const landedCount = useMemo(() => repos.filter((r) => r.merged > 0).length, [repos]);
  const inFlightCount = useMemo(() => repos.filter((r) => r.merged === 0).length, [repos]);
  const reposWithIssuesCount = useMemo(
    () => repos.filter((r) => (issuesByRepo.get(r.full.toLowerCase()) || []).length > 0).length,
    [repos, issuesByRepo]
  );

  return (
    <section className="mt-20 border-t border-[var(--line)] pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="text-[length:var(--step-h2)] font-medium">All Contributions & Repositories</h2>
          <p className="mt-1 text-[length:var(--step-small)] text-[var(--fg-muted)]">
            Consolidated record across {repos.length} upstream codebases. Merged PRs, open PRs, closed PRs,
            and self-sourced issues grouped per repository.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              filter === "all"
                ? "bg-[var(--accent)] text-[#06181a] font-medium"
                : "border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${filter === "all" ? "bg-[#06181a]" : "bg-[var(--fg-muted)]"}`} />
            All ({repos.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("landed");
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              filter === "landed"
                ? "bg-[#a371f7] text-white font-medium"
                : "border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#a371f7]" />
            Landed ({landedCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("in-flight");
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              filter === "in-flight"
                ? "bg-[#3fb950] text-[#06181a] font-medium"
                : "border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] animate-pulse" />
            In Flight ({inFlightCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("has-issues");
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              filter === "has-issues"
                ? "bg-[var(--accent)] text-[#06181a] font-medium"
                : "border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${filter === "has-issues" ? "bg-[#06181a]" : "bg-[var(--accent)]"}`} />
            Issues Filed ({reposWithIssuesCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mt-6">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by repository, PR/issue title, or subsystem (e.g. cilium, fedimint, panic, consensus)..."
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] px-4 py-2.5 text-sm placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {/* Repo Cards */}
      <div className="mt-6 space-y-3">
        {paginated.length === 0 ? (
          <div className="rounded-xl border border-[var(--line)] p-8 text-center text-[var(--fg-muted)] text-sm">
            No repositories matching &quot;{search}&quot;.
          </div>
        ) : (
          paginated.map((r) => {
            const isExpanded = !!expandedRepos[r.slug];
            const repoIssues = issuesByRepo.get(r.full.toLowerCase()) || [];
            const totalWorkItems = r.prs.length + repoIssues.length;
            const hasMultiple = totalWorkItems > 1;

            // When collapsed, show top item (merged first, or first PR)
            const previewPrs = isExpanded
              ? r.prs
              : r.prs.filter((p) => p.state === "merged").slice(0, 1).concat(
                  r.prs.filter((p) => p.state !== "merged").slice(0, r.merged === 0 ? 1 : 0)
                );

            return (
              <div
                key={r.slug}
                className="rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] p-4 sm:p-5 transition-all hover:border-[var(--line-strong)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <RepoLogo owner={r.owner} size={24} />
                    <a
                      href={`https://github.com/${r.full}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-base hover:text-[var(--accent)] hover:underline truncate"
                    >
                      {r.full} <span className="font-mono text-xs opacity-50" aria-hidden>↗</span>
                    </a>
                  </div>

                  {/* Status Badges - Only show non-zero */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {r.merged > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#a371f7]/15 border border-[#a371f7]/30 px-2.5 py-0.5 font-mono text-xs text-[#a371f7] font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#a371f7]" />
                        {r.merged} merged
                      </span>
                    )}
                    {r.open > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3fb950]/15 border border-[#3fb950]/30 px-2.5 py-0.5 font-mono text-xs text-[#3fb950] font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] animate-pulse" />
                        {r.open} open
                      </span>
                    )}
                    {r.closed > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f85149]/10 border border-[#f85149]/25 px-2 py-0.5 font-mono text-xs text-[var(--fg-muted)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#f85149]" />
                        {r.closed} closed
                      </span>
                    )}
                    {repoIssues.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-2.5 py-0.5 font-mono text-xs text-[var(--accent)] font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                        {repoIssues.length} {repoIssues.length === 1 ? "issue" : "issues"}
                      </span>
                    )}
                  </div>
                </div>

                {/* PR Preview / Full List */}
                <div className="mt-3 space-y-1.5 border-t border-[var(--line)]/50 pt-2.5">
                  {previewPrs.map((pr) => {
                    const isMerged = pr.state === "merged";
                    const isOpen = pr.state === "open";
                    const dotColor = isMerged ? "bg-[#a371f7]" : isOpen ? "bg-[#3fb950] animate-pulse" : "bg-[#f85149]";
                    const badgeClass = isMerged
                      ? "text-[#a371f7] bg-[#a371f7]/15 border border-[#a371f7]/30"
                      : isOpen
                      ? "text-[#3fb950] bg-[#3fb950]/15 border border-[#3fb950]/30"
                      : "text-[var(--fg-muted)] bg-[var(--bg)] border border-[var(--line)]";

                    return (
                      <div key={pr.number} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 hover:text-[var(--accent)] transition-colors min-w-0"
                        >
                          <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${badgeClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                            {pr.state} #{pr.number}
                          </span>
                          <span className="truncate group-hover:underline text-[13px]">{pr.title}</span>
                          <span className="font-mono text-xs opacity-50 shrink-0" aria-hidden>
                            ↗
                          </span>
                        </a>
                        <span className="font-mono text-[10px] text-[var(--fg-muted)] shrink-0">
                          {pr.created.slice(0, 10)}
                        </span>
                      </div>
                    );
                  })}

                  {/* Expanded Upstream Issues */}
                  {isExpanded && repoIssues.length > 0 && (
                    <div className="mt-3 border-t border-[var(--line)]/40 pt-2 space-y-1.5">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                        Self-Sourced Upstream Issues ({repoIssues.length})
                      </div>
                      {repoIssues.map((issue) => (
                        <div key={issue.number} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 hover:text-[var(--accent)] transition-colors min-w-0"
                          >
                            <span className="inline-flex items-center gap-1.5 rounded bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-2 py-0.5 font-mono text-[10px] uppercase font-semibold text-[var(--accent)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                              issue #{issue.number}
                            </span>
                            <span className="truncate group-hover:underline text-[13px]">{issue.title}</span>
                            <span className="font-mono text-xs opacity-50 shrink-0" aria-hidden>
                              ↗
                            </span>
                          </a>
                          <span className="font-mono text-[10px] text-[var(--fg-muted)] shrink-0">
                            {issue.created_at.slice(0, 10)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Show more / Collapse toggle */}
                {hasMultiple && (
                  <div className="mt-2.5 flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => toggleExpand(r.slug)}
                      className="text-xs text-[var(--accent)] hover:underline font-mono"
                    >
                      {isExpanded
                        ? "Collapse items ↑"
                        : `View all ${totalWorkItems} contributions in ${r.name} (${r.prs.length} PRs${
                            repoIssues.length > 0 ? `, ${repoIssues.length} issues` : ""
                          }) ↓`}
                    </button>
                    <span className="font-mono text-[10px] text-[var(--fg-muted)]">
                      {totalWorkItems} total items
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-[var(--line)] pt-4 text-xs font-mono">
          <span className="text-[var(--fg-muted)]">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} repositories
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--accent)]"
            >
              &larr; Prev
            </button>
            <span className="px-2 text-[var(--fg)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--accent)]"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
