/**
 * Pinned repositories, the way a GitHub profile pins them.
 *
 * /oss opened with counts and then a table of 58 rows. A table is the right
 * shape for the record and the wrong shape for an answer: someone landing here
 * wants to know, in about four seconds, which real projects took his code. Six
 * cards answer that; the table underneath still holds everything.
 *
 * Which six is a RULE, not a hand-pick: the six repositories with the most
 * merged pull requests, ties broken by the most recent merge. So it re-sorts
 * itself when fetch-oss.mjs refreshes the snapshot, and it can never drift
 * into being a list of the ones that sounded most impressive.
 */

import Link from "next/link";
import RepoLogo from "@/components/RepoLogo";
import { mergedRepos, type OssRepo } from "@/content/oss";

function lastMerge(r: OssRepo): string {
  const dates = r.prs.filter((p) => p.state === "merged" && p.closedAt).map((p) => p.closedAt!);
  return dates.sort().at(-1) ?? "";
}

export default function PinnedRepos() {
  const pinned = [...mergedRepos]
    .sort((a, b) => b.merged - a.merged || (lastMerge(a) < lastMerge(b) ? 1 : -1))
    .slice(0, 6);

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-[length:var(--step-h2)] font-medium">Pinned</h2>
        <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">
          The six repositories that merged the most of my work. Not chosen by hand.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pinned.map((r) => {
          const latest = [...r.prs]
            .filter((p) => p.state === "merged")
            .sort((a, b) => ((a.closedAt ?? "") < (b.closedAt ?? "") ? 1 : -1))[0];
          return (
            <Link
              key={r.slug}
              href={`/oss/${r.slug}/`}
              className="tilt flex flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] p-4"
            >
              <div className="flex items-center gap-2.5">
                <RepoLogo owner={r.owner} size={22} />
                <span className="min-w-0 flex-1 truncate text-[length:var(--step-small)] font-medium">
                  {r.name}
                </span>
                <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[10px] text-[var(--accent)]">
                  {r.merged} merged
                </span>
              </div>
              <p className="mt-1 truncate font-mono text-[10px] tracking-[0.1em] text-[var(--fg-muted)] uppercase">
                {r.owner}
              </p>
              {/* The latest merged title, because "6 merged" is a number and
                  the title is the only thing on this card that says what the
                  work actually was. */}
              {latest ? (
                <p className="mt-3 line-clamp-2 text-[length:var(--step-small)] leading-snug text-[var(--fg-muted)]">
                  {latest.title}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
