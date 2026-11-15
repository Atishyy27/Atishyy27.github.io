import Link from "next/link";
import RepoLogo from "@/components/RepoLogo";
import {
  RELEASE_CITATIONS,
  RELATED_ARCHITECTURAL_ISSUES,
} from "@/content/citations";

export default function CitationsSection() {
  const totalCitedPrs = RELEASE_CITATIONS.reduce((n, r) => n + r.prs.length, 0);
  const totalReleases = RELEASE_CITATIONS.length;

  return (
    <section className="mt-16 border-t border-[var(--line)] pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[length:var(--step-h2)] font-medium">
              Cited in production releases
            </h2>
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--accent)] font-medium">
              {totalCitedPrs} PRs across {totalReleases} releases
            </span>
          </div>
          <p className="mt-2 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
            Pull requests and fixes explicitly featured in upstream release notes and changelogs.
            Verifiable proof that code shipped into production binaries, node software, and core packages.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {RELEASE_CITATIONS.map((rel) => {
          const [owner] = rel.repo.split("/");
          return (
            <div
              key={`${rel.repo}-${rel.releaseTag}`}
              className="rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-5 sm:p-6 transition-all hover:border-[var(--line-strong)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                <div className="flex items-center gap-3">
                  <RepoLogo owner={owner} size={28} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs tracking-wider text-[var(--fg-muted)] uppercase">
                        {rel.project} · {rel.repo}
                      </span>
                      {rel.tier && (
                        <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 font-mono text-[9px] text-[var(--accent)]">
                          {rel.tier}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-medium mt-0.5">
                      Release {rel.releaseTag}{" "}
                      {rel.releaseName && (
                        <span className="text-[var(--fg-muted)] font-normal text-sm sm:text-base">
                          ({rel.releaseName})
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
                <a
                  href={rel.releaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 font-mono text-xs text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Release Notes <span aria-hidden>↗</span>
                </a>
              </div>

              <div className="mt-4 divide-y divide-[var(--line)]/50">
                {rel.prs.map((pr) => (
                  <div key={pr.number} className="py-3 first:pt-1 last:pb-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 font-medium hover:text-[var(--accent)] transition-colors text-sm"
                      >
                        <span className="font-mono text-xs text-[var(--accent)]">
                          #{pr.number}
                        </span>
                        <span className="group-hover:underline">{pr.title}</span>
                        <span className="font-mono text-xs opacity-50" aria-hidden>
                          ↗
                        </span>
                      </a>
                      {pr.quote && (
                        <span className="rounded bg-[var(--bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--accent)] border border-[var(--line)] shrink-0 max-w-full sm:max-w-md truncate">
                          &ldquo;{pr.quote}&rdquo;
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--fg-muted)] leading-relaxed">
                      {pr.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {RELATED_ARCHITECTURAL_ISSUES.length > 0 && (
        <div className="mt-6 rounded-xl border border-[var(--line)]/60 bg-[var(--bg)]/50 p-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-wider text-[var(--fg-muted)] uppercase">
              Architectural Input & RFC
            </span>
          </div>
          {RELATED_ARCHITECTURAL_ISSUES.map((issue) => (
            <div key={issue.issueNumber} className="mt-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={issue.issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[var(--accent)] hover:underline"
                >
                  Issue #{issue.issueNumber}
                </a>
                <span className="font-medium">{issue.title}</span>
                <span className="text-[var(--fg-muted)]">
                  · Resolved by {issue.authorOfFix} in{" "}
                  <a
                    href={issue.resolvedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[var(--accent)] hover:underline"
                  >
                    PR #{issue.resolvedInPr}
                  </a>
                </span>
              </div>
              <p className="mt-1 text-[var(--fg-muted)] leading-relaxed">
                {issue.note}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
