import Link from "next/link";
import type { Metadata } from "next";
import { oss, mergedRepos, pendingRepos } from "@/content/oss";
import { currentWork, ossPrograms } from "@/content/site";
import { formatDate } from "@/lib/date";
import LiveOssCounts from "@/components/LiveOssCounts";
import { OssSceneMount } from "@/components/SceneMount";

export const metadata: Metadata = {
  title: "Open source · Atishay Jain",
  description:
    "Every pull request opened against a repository I do not own, with the real link on each row.",
};

// One row per repository, sorted by what actually landed. The page used to be a
// single live widget over an empty card, which is why it read as hollow: the
// record is 172 pull requests across 58 projects and none of it was on screen.
export default function Oss() {
  const { totals, repoCount, fetchedAt } = oss;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24 sm:px-8">
      <h1 className="display text-[length:var(--step-display)]">Open source</h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-[var(--fg-muted)]">
        {totals.prs} pull requests opened against {repoCount} repositories I do not own.
        Every row links to the pull request itself.
      </p>

      {/* The three states, as counts. Merged is the one that matters, but hiding
          the other two would make the number look better than it is. */}
      <dl className="mt-12 grid grid-cols-3 gap-x-6">
        {[
          ["Merged", totals.merged, "#a371f7"],
          ["Still open", totals.open, "#3fb950"],
          ["Closed unmerged", totals.closed, "#f85149"],
        ].map(([label, n, color]) => (
          <div key={label as string} className="border-t border-[var(--line)] pt-4">
            <dt className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: color as string }} />
              <span className="text-2xl font-medium tabular-nums">{n as number}</span>
            </dt>
            <dd className="mt-1 text-[length:var(--step-small)] text-[var(--fg-muted)]">{label as string}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
        Snapshot taken {formatDate(fetchedAt)}. GitHub counts a pull request as merged
        only when it was closed with the merge button, so work a maintainer landed by
        rebasing and closing appears here as closed. Contributions hosted outside
        GitHub are not in this table at all.
      </p>

      <LiveOssCounts snapshotMerged={totals.merged} snapshotAt={fetchedAt} />

      {/* The repository sphere. It lived on the home page, which is the wrong
          place for it: the home page's subject is the projects, and this is
          every repo I have pushed at. It belongs next to the table it plots. */}
      <OssSceneMount />

      {/* The one that is current work rather than record. Kept above the table
          because it is the answer to "what are you doing now", which the table
          cannot give. */}
      <section className="mt-16 border-t border-[var(--line)] pt-8">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h2 className="text-[length:var(--step-h2)] font-medium">{currentWork.title}</h2>
          <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
            since {currentWork.since}
          </span>
          <span className="rounded-full border border-[var(--accent)] px-3 py-1 font-mono text-[10px] text-[var(--accent)]">
            {currentWork.badge}
          </span>
        </div>
        <p className="mt-4 max-w-prose leading-relaxed text-[var(--fg-muted)]">{currentWork.detail}</p>
        <p className="mt-4 font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
          programs: {ossPrograms.join(" · ")}
        </p>
      </section>

      <section className="mt-20">
        <h2 className="text-[length:var(--step-h2)] font-medium">
          Landed ({mergedRepos.length} projects)
        </h2>
        <div className="mt-6">
          {mergedRepos.map((r) => (
            <Link key={r.slug} href={`/oss/${r.slug}/`} className="row group">
              <span className="row-kind tabular-nums">
                {r.merged} merged
              </span>
              <span>
                <span className="row-name">{r.full}</span>
                <span className="row-line block">
                  {r.prs[0]?.title}
                </span>
              </span>
              <span className="row-kind whitespace-nowrap tabular-nums">
                {r.prs.length} total
              </span>
            </Link>
          ))}
        </div>
      </section>

      {pendingRepos.length > 0 && (
        <section className="mt-20">
          <h2 className="text-[length:var(--step-h2)] font-medium">
            In flight ({pendingRepos.length} projects)
          </h2>
          <p className="mt-3 max-w-prose text-[length:var(--step-small)] text-[var(--fg-muted)]">
            Open or closed without merging. Listed because a contribution record that
            only shows the wins is not a record.
          </p>
          <div className="mt-6">
            {pendingRepos.map((r) => (
              <Link key={r.slug} href={`/oss/${r.slug}/`} className="row group">
                <span className="row-kind tabular-nums">
                  {r.open > 0 ? `${r.open} open` : `${r.closed} closed`}
                </span>
                <span>
                  <span className="row-name">{r.full}</span>
                  <span className="row-line block">{r.prs[0]?.title}</span>
                </span>
                <span className="row-kind whitespace-nowrap tabular-nums">
                  {r.prs.length} total
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
