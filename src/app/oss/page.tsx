import Link from "next/link";
import type { Metadata } from "next";
import { oss, orgOfRepo, orgRows, ossTiers, tierSnapshot } from "@/content/oss";
import { OSS_STATS } from "@/content/oss-stats";
import { ossHeadlineText, ossHeadline } from "@/content/oss-headline";
import OssTierList from "@/components/OssTierList";
import OssTimeline from "@/components/OssTimeline";
import { currentWork, ossPrograms } from "@/content/site";
import { formatIst } from "@/lib/date";
import { OssSceneMount } from "@/components/SceneMount";
import PinnedRepos from "@/components/PinnedRepos";
import CitationsSection from "@/components/CitationsSection";
import OssScorecard from "@/components/OssScorecard";
import UnifiedOssOrgs from "@/components/UnifiedOssOrgs";

export const metadata: Metadata = {
  title: "Open source · Atishay Jain",
  description: `Open-source work in projects I do not own: ${ossHeadlineText()}. Every row links to GitHub.`,
};

export default function Oss() {
  const orgOf = Object.fromEntries(oss.repos.map((r) => [r.full.toLowerCase(), orgOfRepo(r)?.org ?? r.owner]));

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24 sm:px-8">
      <h1 className="display text-[length:var(--step-display)]">Open source</h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-[var(--fg-muted)]">
        {ossHeadline.contributions} {ossHeadline.noun} {ossHeadline.orgs}, in projects I do not own.
        Every row links to GitHub.
      </p>

      <dl className="mt-12 grid grid-cols-3 gap-x-4 sm:gap-x-6">
        {[
          ["Contributions", OSS_STATS.contributions, "var(--accent)"],
          ["Merged", OSS_STATS.merged, "#a371f7"],
          ["Open", OSS_STATS.open, "#3fb950"],
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
        A contribution is a merged pull request ({OSS_STATS.merged}), a commit of mine that a maintainer carried
        through their own pull request ({OSS_STATS.carried}), or a bug report of mine that got fixed upstream (
        {OSS_STATS.reportsFixed}). Open pull requests are shown beside it, not counted in it.
      </p>

      <p className="mt-3 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
        Updated from GitHub automatically; last refresh {formatIst(oss.fetchedAt)}. Work hosted outside GitHub is
        not in this table.
      </p>

      {/* 1. Scorecard with dynamic metrics & monthly chart */}
      <OssScorecard />

      {/* 2. Top Pinned Highlights */}
      <PinnedRepos />

      {/* 3. Citations in Production Releases */}
      <CitationsSection />

      {/* 4. Contribution Tiers (Prominent, above repo tables) */}
      <section className="mt-20 border-t border-[var(--line)] pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2 className="text-[length:var(--step-h2)] font-medium">Contribution tiers</h2>
          <Link href="/oss/tier-game/" className="text-xs font-mono text-[var(--accent)] hover:underline">
            Play it: tier my organisations yourself &rarr;
          </Link>
        </div>
        <p className="mt-3 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
          The work as a tier list, by standing in each organisation. Level comes from what landed there and
          nothing softer. Objective, not a self-rating. Data from {tierSnapshot}.
        </p>
        <div className="mt-8">
          <OssTierList tiers={ossTiers} />
        </div>
      </section>

      {/* 5. Merged Over Time Timeline */}
      <section className="mt-20 border-t border-[var(--line)] pt-12">
        <h2 className="text-[length:var(--step-h2)] font-medium">Merged over time</h2>
        <p className="mt-3 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
          Each dot is one merged pull request on the day it landed, grouped by organisation.
        </p>
        <div className="mt-8">
          <OssTimeline orgOf={orgOf} />
        </div>
      </section>

      {/* 6. Current Work / Grant */}
      <section className="mt-20 border-t border-[var(--line)] pt-12">
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

      {/* 8. Every organisation, with search, filters and pagination */}
      <UnifiedOssOrgs orgs={orgRows()} />

      {/* 9. Repository 3D Sphere */}
      <div className="mt-24 border-t border-[var(--line)] pt-12">
        <h2 className="text-[length:var(--step-h2)] font-medium">Repository Sphere</h2>
        <p className="mt-2 max-w-prose text-[length:var(--step-small)] text-[var(--fg-muted)]">
          Interactive WebGL sphere mapping every repository with a merged or open pull request.
        </p>
        <div className="mt-6">
          <OssSceneMount />
        </div>
      </div>
    </main>
  );
}
