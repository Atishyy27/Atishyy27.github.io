import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { entrySlugs, getEntry, renderMarkdown, formatDate, readingMinutes, neighbours, tagSlug } from "@/lib/journal";

// Static export: only these slugs get a page, and nothing else is reachable.
export const dynamicParams = false;

// output: "export" refuses a dynamic route that generates nothing, and the journal
// legitimately starts empty. So when there are no entries we still emit one page,
// which renders the empty state instead of crashing the build.
const EMPTY_SLUG = "none";

export function generateStaticParams() {
  const slugs = entrySlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: EMPTY_SLUG }];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return { title: "Journal", robots: { index: false, follow: false } };

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

  if (!entry) {
    if (slug === EMPTY_SLUG) {
      return (
        <main className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8">
          <Link href="/journal/" className="link text-sm">Journal</Link>
          <h1 className="display mt-10 text-4xl leading-[1.05]">No entries yet</h1>
          <p className="mt-6 text-lg text-[var(--fg-muted)]">The first one is being written.</p>
        </main>
      );
    }
    notFound();
  }

  const html = renderMarkdown(entry.body);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8">
      <Link href="/journal/" className="link text-sm">Journal</Link>

      <header className="mt-10">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{entry.title}</h1>
        <p className="mt-4 text-sm text-[var(--fg-muted)]">
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          {` · ${readingMinutes(entry)} min read`}
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
            <li key={t}>
              <Link
                href={`/journal/tag/${tagSlug(t)}/`}
                className="block rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Prev/next across LISTED entries only, so an unlisted entry never
          becomes reachable by walking from a public one. */}
      {(() => {
        const { newer, older } = neighbours(entry.slug);
        if (!newer && !older) return null;
        return (
          <nav className="mt-16 grid gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
            {older ? (
              <Link href={`/journal/${older.slug}/`} className="group">
                <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
                  earlier
                </span>
                <span className="mt-1 block text-[length:var(--step-small)] group-hover:text-[var(--accent)]">
                  {older.title}
                </span>
              </Link>
            ) : <span />}
            {newer ? (
              <Link href={`/journal/${newer.slug}/`} className="group sm:text-right">
                <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
                  later
                </span>
                <span className="mt-1 block text-[length:var(--step-small)] group-hover:text-[var(--accent)]">
                  {newer.title}
                </span>
              </Link>
            ) : null}
          </nav>
        );
      })()}
    </main>
  );
}
