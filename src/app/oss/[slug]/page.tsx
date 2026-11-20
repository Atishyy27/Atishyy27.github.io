import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { getRepo, repoSlugs, orgOfRepo, mergedPrs, openPrs, REPO_NOTES } from "@/content/oss";
import { formatDate } from "@/lib/date";
import RepoLogo from "@/components/RepoLogo";
import RepoCard from "@/components/RepoCard";
import ClosedReasons from "@/components/ClosedReasons";

export const dynamicParams = false;

export function generateStaticParams() {
  return repoSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = getRepo(slug);
  if (!r) return { title: "Open source" };
  return seo(
    `/oss/${slug}/`,
    `${r.full} · Open source · Atishay Jain`,
    `My pull requests to ${r.full}: ${r.merged} merged, ${r.open} open.`,
  );
}

const STATE_STYLE = {
  merged: { label: "merged", color: "#a371f7" },
  open: { label: "open", color: "#3fb950" },
} as const;

export default async function RepoPage({ params }: Props) {
  const { slug } = await params;
  const r = getRepo(slug);
  if (!r) notFound();

  const note = REPO_NOTES[r.slug];
  const live = [...mergedPrs(r.prs), ...openPrs(r.prs)];
  const byCreated = [...live].sort((a, b) => (a.created < b.created ? -1 : 1));
  const first = byCreated[0];
  const latest = byCreated[byCreated.length - 1];
  const org = orgOfRepo(r);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24 sm:px-8">
      <p className="flex flex-wrap items-center gap-x-2 text-sm">
        <Link href="/oss/" className="link inline-flex min-h-11 items-center">Open source</Link>
        {org ? (
          <>
            <span className="text-[var(--fg-muted)]" aria-hidden>/</span>
            <Link href={`/oss/org/${org.slug}/`} className="link inline-flex min-h-11 items-center">{org.org}</Link>
          </>
        ) : null}
      </p>

      <header className="mt-10">
        <div className="flex items-center gap-3">
          <RepoLogo owner={r.owner} size={40} />
          <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">{r.owner}</p>
        </div>
        <h1 className="display mt-3 text-4xl leading-[1.05] sm:text-5xl">{r.name}</h1>
        <p className="mt-5 text-lg text-[var(--fg-muted)]">
          {r.merged} merged, {r.open} open.
          {first && latest && first.created !== latest.created
            ? ` First ${formatDate(first.created)}, most recent ${formatDate(latest.created)}.`
            : first
              ? ` ${formatDate(first.created)}.`
              : ""}
        </p>
        <p className="mt-4">
          <a
            href={`https://github.com/${r.full}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link inline-flex min-h-11 items-center text-[var(--accent)] text-sm"
          >
            github.com/{r.full} ↗
          </a>
        </p>
      </header>

      {/* GitHub's own social card for the project. The only honest image
          available for a repository I do not own. */}
      <div className="mt-10">
        <RepoCard full={r.full} priority />
      </div>

      {/* Written context only where it exists. A repo with no note shows the
          verified list alone rather than a paragraph invented about it. */}
      {note ? (
        <section className="mt-12">
          <h2 className="text-sm font-medium text-[var(--fg-muted)]">Why this one</h2>
          <p className="mt-4 leading-relaxed">{note}</p>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-sm font-medium text-[var(--fg-muted)]">Merged and open pull requests</h2>
        <div className="mt-4">
          {live.map((pr) => {
            const s = STATE_STYLE[pr.state as "merged" | "open"];
            return (
              <a
                key={pr.number}
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="row group"
              >
                <span className="row-kind flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span>
                  <span className="row-name">{pr.title}</span>
                  <span className="row-line block">
                    #{pr.number} · opened {formatDate(pr.created)}
                    {pr.state === "merged" && (pr.mergedAt ?? pr.closedAt)
                      ? ` · merged ${formatDate((pr.mergedAt ?? pr.closedAt)!.slice(0, 10))}`
                      : ""}
                  </span>
                </span>
                <span className="row-kind whitespace-nowrap">↗</span>
              </a>
            );
          })}
        </div>
      </section>

      <ClosedReasons prs={r.prs} />
    </main>
  );
}
