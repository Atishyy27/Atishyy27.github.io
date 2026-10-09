import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pagedProjects, getProject, CATEGORY_LABEL } from "@/content/projects";
import { entriesForProject, formatDate } from "@/lib/journal";
import LiveEmbed from "@/components/LiveEmbed";
import { canEmbed } from "@/lib/embeddable";
import { Logo } from "@/components/Logo";

export const dynamicParams = false;

export function generateStaticParams() {
  return pagedProjects.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: `${p.name} · Atishay Jain`,
    description: p.story || p.blurb,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const entries = entriesForProject(p.slug);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8">
      <Link href="/projects/" className="link text-sm">Projects</Link>

      <header className="mt-10">
        <div className="flex items-center gap-3">
          <Logo name={p.name} domain={p.domain} size={40} />
          <p className="text-sm text-[var(--fg-muted)]">
            {CATEGORY_LABEL[p.category]}
            {p.org ? ` · ${p.org}` : ""}
          </p>
        </div>
        <h1 className="display mt-4 text-4xl leading-[1.05] sm:text-5xl">{p.name}</h1>
        {p.story ? <p className="mt-5 text-lg text-[var(--fg-muted)]">{p.story}</p> : null}
      </header>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-[var(--fg-muted)]">What it is</h2>
        <p className="mt-4 leading-relaxed">{p.blurb}</p>
        {/* A counted claim that cannot be fetched live carries the date it was
            last checked, so a stale number is visibly stale instead of quietly
            wrong. */}
        {p.countsAsOf ? (
          <p className="mt-3 font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
            counts checked {formatDate(p.countsAsOf)}
          </p>
        ) : null}
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-[var(--fg-muted)]">Built with</h2>
        <p className="mt-4 text-[var(--fg-muted)]">{p.stack.join(" · ")}</p>
      </section>

      {p.links.length > 0 || p.privateNote ? (
        <section className="mt-12">
          <h2 className="text-sm font-medium text-[var(--fg-muted)]">Proof</h2>
          {p.links.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {p.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link text-sm"
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {p.privateNote ? (
            <p className="mt-4 text-sm text-[var(--fg-muted)]">{p.privateNote}</p>
          ) : null}

          {/* If the thing is live and its host permits framing, run it here
              rather than only describing it. Only the first embeddable link is
              offered: two frames of the same project is noise. */}
          {(() => {
            const live = p.links.find((l) => canEmbed(l.href));
            return live ? <LiveEmbed href={live.href} name={p.name} /> : null;
          })()}
        </section>
      ) : null}

      {entries.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-sm font-medium text-[var(--fg-muted)]">The long version</h2>
          <ul className="mt-4 space-y-2">
            {entries.map((e) => (
              <li key={e.slug}>
                <Link href={`/journal/${e.slug}/`} className="link text-sm">
                  {e.title}
                </Link>
                <span className="ml-3 text-xs text-[var(--fg-muted)]">
                  {formatDate(e.date)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
