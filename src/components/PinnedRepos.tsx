/**
 * The organisations that took the most of my work, shown as six cards.
 *
 * A table is the right shape for the record and the wrong shape for an answer:
 * someone landing here wants to know, in about four seconds, which real projects
 * took his code. Which six is a RULE, not a hand-pick: the six organisations with
 * the most contributions, ties broken by open pull requests. So it re-sorts
 * itself on every refresh and can never drift into the ones that sounded most
 * impressive.
 */

import Link from "next/link";
import RepoLogo from "@/components/RepoLogo";
import { allOrgs, mergedPrs, reposOfOrg } from "@/content/oss";

export default function PinnedRepos() {
  const pinned = allOrgs.filter((o) => o.contributions > 0).slice(0, 6);

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-[length:var(--step-h2)] font-medium">Top organisations</h2>
        <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">
          The six organisations that took the most of my work. Not chosen by hand.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pinned.map((o) => {
          const latest = reposOfOrg(o)
            .flatMap((r) => mergedPrs(r.prs))
            .sort((a, b) => ((a.mergedAt ?? a.closedAt ?? "") < (b.mergedAt ?? b.closedAt ?? "") ? 1 : -1))[0];
          return (
            <Link
              key={o.slug}
              href={`/oss/org/${o.slug}/`}
              className="tilt flex min-h-11 flex-col rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] p-4"
            >
              <div className="flex items-center gap-2.5">
                <RepoLogo owner={o.org} size={22} />
                <span className="min-w-0 flex-1 truncate text-[length:var(--step-small)] font-medium">{o.org}</span>
                <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[10px] text-[var(--accent)]">
                  {o.contributions} {o.contributions === 1 ? "contribution" : "contributions"}
                </span>
              </div>
              <p className="mt-1 truncate font-mono text-[10px] tracking-[0.1em] text-[var(--fg-muted)] uppercase">
                {o.merged} merged · {o.open} open
              </p>
              {/* The latest merged title, because a count is a number and
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
