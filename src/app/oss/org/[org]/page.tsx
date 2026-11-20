import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getOrg,
  orgSlugs,
  reposOfOrg,
  mergedPrs,
  openPrs,
  carriedOfOrg,
  reportsFixedOfOrg,
  type OssPr,
} from "@/content/oss";
import { levelColor } from "@/content/oss-levels";
import { formatDate } from "@/lib/date";
import RepoLogo from "@/components/RepoLogo";
import ClosedReasons from "@/components/ClosedReasons";

export const dynamicParams = false;

export function generateStaticParams() {
  return orgSlugs().map((org) => ({ org }));
}

type Props = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { org } = await params;
  const o = getOrg(org);
  if (!o) return { title: "Open source" };
  return {
    title: `${o.org} · Open source · Atishay Jain`,
    description: `${o.contributions} ${o.contributions === 1 ? "contribution" : "contributions"} to ${o.org}: ${o.merged} merged, ${o.open} open.`,
  };
}

function PrRow({ pr }: { pr: OssPr }) {
  const merged = pr.state === "merged";
  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-11 items-center gap-3 border-t border-[var(--line)] py-2 hover:text-[var(--accent)]"
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: merged ? "#a371f7" : "#3fb950" }}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm">{pr.title}</span>
        <span className="block text-[length:var(--step-small)] text-[var(--fg-muted)]">
          #{pr.number} · {merged ? "merged" : "open"} {formatDate((merged ? (pr.mergedAt ?? pr.closedAt ?? pr.created) : pr.created).slice(0, 10))}
        </span>
      </span>
      <span className="shrink-0 text-[var(--fg-muted)]" aria-hidden>↗</span>
    </a>
  );
}

export default async function OrgPage({ params }: Props) {
  const { org } = await params;
  const o = getOrg(org);
  if (!o) notFound();

  const repos = reposOfOrg(o);
  const listed = repos.filter((r) => r.merged + r.open > 0);
  const carried = carriedOfOrg(o);
  const fixed = reportsFixedOfOrg(o);
  const color = levelColor(o.level ?? "");
  const allPrs = repos.flatMap((r) => r.prs.map((p) => ({ ...p, repoName: r.name })));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24 sm:px-8">
      <Link href="/oss/" className="link inline-flex min-h-11 items-center text-sm">Open source</Link>

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <RepoLogo owner={o.org} size={40} />
          <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">{o.kind === "User" ? "Individual" : "Organisation"}</p>
          {color ? (
            <span className="rounded border px-1.5 font-mono text-[10px] leading-4" style={{ color, borderColor: color }}>
              {o.level}
            </span>
          ) : null}
        </div>
        <h1 className="display mt-3 break-words text-4xl leading-[1.05] sm:text-5xl">{o.org}</h1>
        <p className="mt-5 text-4xl font-medium tabular-nums tracking-tight">
          {o.contributions}{" "}
          <span className="text-xl text-[var(--fg-muted)]">{o.contributions === 1 ? "contribution" : "contributions"}</span>
        </p>
        <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
          {o.merged} merged · {o.open} open
        </p>
        <p className="mt-4">
          <a
            href={`https://github.com/${o.org}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link inline-flex min-h-11 items-center text-sm text-[var(--accent)]"
          >
            github.com/{o.org} ↗
          </a>
        </p>
      </header>

      {listed.map((r) => (
        <section key={r.slug} className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 className="text-[length:var(--step-h2)] font-medium">
              <Link href={`/oss/${r.slug}/`} className="inline-flex min-h-11 items-center hover:text-[var(--accent)]">
                {r.name}
              </Link>
            </h2>
            <span className="font-mono text-xs text-[var(--fg-muted)]">
              {r.merged} merged · {r.open} open
            </span>
          </div>
          <div className="mt-2">
            {[...mergedPrs(r.prs), ...openPrs(r.prs)].map((pr) => (
              <PrRow key={pr.number} pr={pr} />
            ))}
          </div>
        </section>
      ))}

      {carried.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-[length:var(--step-h2)] font-medium">Commits a maintainer carried</h2>
          <p className="mt-2 max-w-prose text-[length:var(--step-small)] text-[var(--fg-muted)]">
            My commit went in through the maintainer&apos;s own pull request.
          </p>
          <div className="mt-2">
            {carried.map((c) => (
              <a
                key={c.commit}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-h-11 border-t border-[var(--line)] py-2.5 hover:text-[var(--accent)]"
              >
                <span className="block text-sm">{c.title}</span>
                <span className="block text-[length:var(--step-small)] text-[var(--fg-muted)]">
                  {c.repo} · commit {c.commit} in #{c.pr}
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {fixed.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-[length:var(--step-h2)] font-medium">Bug reports fixed upstream</h2>
          <div className="mt-2">
            {fixed.map((f) => (
              <div key={f.url} className="border-t border-[var(--line)] py-2.5">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm hover:text-[var(--accent)]"
                >
                  {f.title}
                </a>
                <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">
                  {f.repo} #{f.number} · fixed by {f.fixedBy}
                  {f.fixUrl && f.fixUrl !== f.url ? (
                    <>
                      {" · "}
                      <a href={f.fixUrl} target="_blank" rel="noopener noreferrer" className="link">
                        the fix
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <ClosedReasons prs={allPrs} />
    </main>
  );
}
