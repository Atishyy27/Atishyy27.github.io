import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pagedProjects, getProject, CATEGORY_LABEL } from "@/content/projects";
import { entriesForProject, formatDate } from "@/lib/journal";

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
      <Link href="/projects/" className="link font-mono text-xs tracking-[0.2em]">
        PROJECTS
      </Link>

      <header className="mt-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--accent)]">
          {CATEGORY_LABEL[p.category].toUpperCase()}
          {p.org ? ` · ${p.org}` : ""}
        </p>
        <h1 className="display mt-3 text-3xl sm:text-4xl">{p.name}</h1>
        {p.story ? <p className="mt-5 text-lg text-[var(--fg-muted)]">{p.story}</p> : null}
      </header>

      <section className="mt-12">
        <h2 className="font-mono text-xs tracking-[0.25em] text-[var(--fg-muted)]">WHAT IT IS</h2>
        <p className="mt-4 leading-relaxed">{p.blurb}</p>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-xs tracking-[0.25em] text-[var(--fg-muted)]">BUILT WITH</h2>
        <p className="mt-4 font-mono text-sm text-[var(--fg-muted)]">{p.stack.join(" · ")}</p>
      </section>

      {p.links.length > 0 || p.privateNote ? (
        <section className="mt-12">
          <h2 className="font-mono text-xs tracking-[0.25em] text-[var(--fg-muted)]">PROOF</h2>
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
        </section>
      ) : null}

      {entries.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-mono text-xs tracking-[0.25em] text-[var(--fg-muted)]">THE LONG VERSION</h2>
          <ul className="mt-4 space-y-2">
            {entries.map((e) => (
              <li key={e.slug}>
                <Link href={`/journal/${e.slug}/`} className="link text-sm">
                  {e.title}
                </Link>
                <span className="ml-3 font-mono text-xs text-[var(--fg-muted)]">
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
