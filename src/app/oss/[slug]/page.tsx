import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRepo, repoSlugs, REPO_NOTES, type PrState } from "@/content/oss";
import { formatDate } from "@/lib/date";
import RepoLogo from "@/components/RepoLogo";

export const dynamicParams = false;

export function generateStaticParams() {
  return repoSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = getRepo(slug);
  if (!r) return { title: "Open source" };
  return {
    title: `${r.full} · Open source · Atishay Jain`,
    description: `${r.prs.length} pull requests to ${r.full}, ${r.merged} merged.`,
  };
}

const STATE_STYLE: Record<PrState, { label: string; color: string }> = {
  merged: { label: "merged", color: "#a371f7" },
  open: { label: "open", color: "#3fb950" },
  closed: { label: "closed", color: "#f85149" },
};

export default async function RepoPage({ params }: Props) {
  const { slug } = await params;
  const r = getRepo(slug);
  if (!r) notFound();

  const note = REPO_NOTES[r.slug];
  const first = r.prs[r.prs.length - 1];
  const latest = r.prs[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24 sm:px-8">
      <Link href="/oss/" className="link text-sm">Open source</Link>

      <header className="mt-10">
        <div className="flex items-center gap-3">
          <RepoLogo owner={r.owner} size={40} />
          <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">{r.owner}</p>
        </div>
        <h1 className="display mt-3 text-4xl leading-[1.05] sm:text-5xl">{r.name}</h1>
        <p className="mt-5 text-lg text-[var(--fg-muted)]">
          {r.prs.length} pull request{r.prs.length === 1 ? "" : "s"}, {r.merged} merged.
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
            className="link text-[var(--accent)] text-sm"
          >
            github.com/{r.full} ↗
          </a>
        </p>
      </header>

      {/* Written context only where it exists. A repo with no note shows the
          verified list alone rather than a paragraph invented about it. */}
      {note ? (
        <section className="mt-12">
          <h2 className="text-sm font-medium text-[var(--fg-muted)]">Why this one</h2>
          <p className="mt-4 leading-relaxed">{note}</p>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-sm font-medium text-[var(--fg-muted)]">Every pull request</h2>
        <div className="mt-4">
          {r.prs.map((pr) => {
            const s = STATE_STYLE[pr.state];
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
                    {pr.closedAt && pr.state !== "open" ? ` · ${s.label} ${formatDate(pr.closedAt)}` : ""}
                  </span>
                </span>
                <span className="row-kind whitespace-nowrap">↗</span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
