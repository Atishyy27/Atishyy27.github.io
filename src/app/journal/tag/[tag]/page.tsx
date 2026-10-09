import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tagSlugs, entriesByTag, allTags, tagSlug, formatDate, readingMinutes } from "@/lib/journal";

export const dynamicParams = false;

// A tag with no entries gets no page, so there is never an empty tag listing.
// generateStaticParams must still return something or output:"export" refuses
// the route, so an empty journal falls back to a single placeholder.
const EMPTY = "none";

export function generateStaticParams() {
  const slugs = tagSlugs();
  return slugs.length > 0 ? slugs.map((tag) => ({ tag })) : [{ tag: EMPTY }];
}

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = allTags().find((t) => tagSlug(t.tag) === tag)?.tag ?? tag;
  return {
    title: `${label} · Journal · Atishay Jain`,
    description: `Journal entries tagged ${label}.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const entries = entriesByTag(tag);
  const label = allTags().find((t) => tagSlug(t.tag) === tag)?.tag;

  if (entries.length === 0) {
    if (tag === EMPTY) {
      return (
        <main className="mx-auto w-full max-w-[var(--measure)] px-6 py-24 sm:px-8">
          <Link href="/journal/" className="link text-sm">Journal</Link>
          <h1 className="display mt-10 text-4xl">No tags yet</h1>
        </main>
      );
    }
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[var(--measure)] px-6 py-24 sm:px-8">
      <Link href="/journal/" className="link text-sm">Journal</Link>
      <h1 className="display mt-10 text-[length:var(--step-display)]">{label}</h1>
      <p className="mt-6 text-[var(--fg-muted)]">
        {entries.length} {entries.length === 1 ? "entry" : "entries"}.
      </p>

      <div className="mt-12">
        {entries.map((e) => (
          <Link key={e.slug} href={`/journal/${e.slug}/`} className="row group">
            <span className="row-kind whitespace-nowrap">{formatDate(e.date)}</span>
            <span>
              <span className="row-name">{e.title}</span>
              <span className="row-line block">{readingMinutes(e)} min read</span>
            </span>
            <span className="row-kind">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
