"use client";

import { useState, useMemo } from "react";
import rawIssues from "@/content/oss-issues.json";
import RepoLogo from "@/components/RepoLogo";

interface Issue {
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

const PAGE_SIZE = 10;

export default function OssIssuesSection() {
  const issues = rawIssues as Issue[];
  const [filter, setFilter] = useState<"all" | "closed" | "open">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return issues.filter((it) => {
      if (filter === "closed" && it.state !== "closed") return false;
      if (filter === "open" && it.state !== "open") return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          it.title.toLowerCase().includes(query) ||
          it.repo.toLowerCase().includes(query) ||
          String(it.number).includes(query)
        );
      }
      return true;
    });
  }, [issues, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const closedCount = useMemo(() => issues.filter((i) => i.state === "closed").length, [issues]);
  const openCount = useMemo(() => issues.filter((i) => i.state === "open").length, [issues]);

  return (
    <section className="mt-20 border-t border-[var(--line)] pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[length:var(--step-h2)] font-medium">Upstream Issues & Diagnosis</h2>
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--accent)] font-medium">
              {issues.length} self-sourced issues
            </span>
          </div>
          <p className="mt-2 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
            Bug discovery, security diagnosis, and architectural root causes identified across upstream codebases
            prior to submitting pull requests. Includes panic triggers, race conditions, file descriptor leaks,
            and protocol preallocation bounds.
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
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              filter === "all"
                ? "bg-[var(--accent)] text-[#06181a] font-medium"
                : "border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            All ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("closed");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              filter === "closed"
                ? "bg-[#3fb950] text-[#06181a] font-medium"
                : "border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Resolved ({closedCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("open");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              filter === "open"
                ? "bg-[var(--accent)] text-[#06181a] font-medium"
                : "border border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Open / Discussion ({openCount})
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
          placeholder="Filter issues (e.g. panic, leak, injection, podman, fedimint, kmesh, meshery)..."
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] px-4 py-2.5 text-sm placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {/* Issues List */}
      <div className="mt-6 divide-y divide-[var(--line)]/50 rounded-xl border border-[var(--line)] bg-[var(--bg-raised)]">
        {paginated.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--fg-muted)]">
            No issues matching &quot;{search}&quot;.
          </div>
        ) : (
          paginated.map((issue) => {
            const [owner] = issue.repo.split("/");
            const isClosed = issue.state === "closed";

            return (
              <div key={`${issue.repo}-${issue.number}`} className="p-4 sm:p-5 transition-colors hover:bg-[var(--bg)]/40">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <RepoLogo owner={owner} size={20} />
                    <span className="font-mono text-xs text-[var(--fg-muted)] uppercase tracking-wider truncate">
                      {issue.repo}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[10px] uppercase font-semibold ${
                        isClosed ? "bg-[#3fb950]/15 text-[#3fb950]" : "bg-[var(--accent)]/15 text-[var(--accent)]"
                      }`}
                    >
                      {issue.state}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--fg-muted)] shrink-0">
                    {issue.created_at.slice(0, 10)}
                  </span>
                </div>

                <div className="mt-2">
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm sm:text-base font-medium hover:text-[var(--accent)] transition-colors"
                  >
                    <span className="font-mono text-xs text-[var(--accent)]">#{issue.number}</span>
                    <span className="group-hover:underline">{issue.title}</span>
                    <span className="font-mono text-xs opacity-50 shrink-0" aria-hidden>
                      ↗
                    </span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4 text-xs font-mono">
          <span className="text-[var(--fg-muted)]">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} issues
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
