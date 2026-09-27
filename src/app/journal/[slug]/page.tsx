import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { entrySlugs, getEntry, renderMarkdown, formatDate } from "@/lib/journal";

// Static export: only these slugs get a page, and nothing else is reachable.
export const dynamicParams = false;

export function generateStaticParams() {
  return entrySlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};

  return {
    title: `${entry.title} · Journal`,
    description: entry.place ? `${entry.title}, ${entry.place}` : entry.title,
    // Unlisted entries stay reachable by link but must never be indexed.
    robots: entry.visibility === "unlisted" ? { index: false, follow: false } : undefined,
  };
}

export default async function JournalEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const html = renderMarkdown(entry.body);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8">
      <Link href="/journal/" className="link font-mono text-xs tracking-[0.2em]">
        JOURNAL
      </Link>

      <header className="mt-10">
        <h1 className="display text-3xl sm:text-4xl">{entry.title}</h1>
        <p className="mt-3 font-mono text-xs tracking-wide text-[var(--fg-muted)]">
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          {entry.place ? ` · ${entry.place}` : ""}
          {entry.visibility === "unlisted" ? " · unlisted" : ""}
        </p>
      </header>

      <article
        className="journal-body mt-12"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {entry.tags.length > 0 ? (
        <ul className="mt-16 flex flex-wrap gap-2 border-t border-[var(--line)] pt-6">
          {entry.tags.map((t) => (
            <li
              key={t}
              className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[10px] tracking-wider text-[var(--fg-muted)]"
            >
              {t}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
