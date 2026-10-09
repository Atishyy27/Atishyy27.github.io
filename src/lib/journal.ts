// src/lib/journal.ts
// Journal content layer. Entries are markdown files in content/journal/.
//
// Why filtering happens HERE and not in CSS: next.config.ts sets output "export",
// so every page is rendered to static HTML at build time and shipped. Anything a
// component renders is in the file, readable by anyone who views source, whether or
// not CSS hides it. A draft is only actually private if it never reaches the output.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type EntryStatus = "draft" | "published";
export type EntryVisibility = "public" | "unlisted";

export type JournalEntry = {
  slug: string;
  title: string;
  date: string;          // YYYY-MM-DD, absolute, never relative
  place?: string;
  tags: string[];
  cover?: string;
  status: EntryStatus;
  visibility: EntryVisibility;
  project?: string;      // slug of a project this entry tells the story of
  fixture: boolean;      // test-only entry, never shipped unless JOURNAL_FIXTURES=1
  body: string;          // raw markdown
};

const DIR = path.join(process.cwd(), "content", "journal");
const IS_PROD = process.env.NODE_ENV === "production";
// Test fixtures exist to prove draft and unlisted filtering. They must never reach a
// real build, so they are opt-in and the deploy never sets this.
const WITH_FIXTURES = process.env.JOURNAL_FIXTURES === "1";

function parseEntry(file: string): JournalEntry | null {
  const full = path.join(DIR, file);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);

  const slug = file.replace(/\.mdx?$/, "");

  if (!data.title || !data.date) {
    throw new Error(`journal/${file}: front matter needs both title and date`);
  }

  // YAML parses an unquoted 2026-10-09 into a Date, so String() on it gives
  // "Thu Oct 09 2026 05:30:00 GMT+0530" and the format check below rejects it.
  // That is a trap rather than an error: the date is correct and the author did
  // nothing wrong, and a CMS writing this file will not quote it either. So a
  // real Date is normalised here, in UTC, because toISOString on a local
  // midnight east of Greenwich would otherwise roll back to the previous day.
  const rawDate =
    data.date instanceof Date
      ? new Date(Date.UTC(data.date.getFullYear(), data.date.getMonth(), data.date.getDate()))
          .toISOString()
          .slice(0, 10)
      : String(data.date);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    throw new Error(`journal/${file}: date must be YYYY-MM-DD, got "${data.date}"`);
  }

  const status: EntryStatus = data.status === "published" ? "published" : "draft";
  const visibility: EntryVisibility = data.visibility === "unlisted" ? "unlisted" : "public";

  return {
    slug,
    title: String(data.title),
    date: rawDate,
    place: data.place ? String(data.place) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: data.cover ? String(data.cover) : undefined,
    status,
    visibility,
    project: data.project ? String(data.project) : undefined,
    fixture: data.fixture === true,
    body: content,
  };
}

function readAll(): JournalEntry[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(parseEntry)
    .filter((e): e is JournalEntry => e !== null)
    .filter((e) => (WITH_FIXTURES ? true : !e.fixture))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Everything that may be built into the output. Drafts are dropped in production. */
export function buildableEntries(): JournalEntry[] {
  return readAll().filter((e) => (IS_PROD ? e.status === "published" : true));
}

/** What the /journal index shows: buildable, minus unlisted. */
export function listedEntries(): JournalEntry[] {
  return buildableEntries().filter((e) => e.visibility === "public");
}

/** Slugs that get a page. Includes unlisted (reachable by link), excludes drafts in prod. */
export function entrySlugs(): string[] {
  return buildableEntries().map((e) => e.slug);
}

export function getEntry(slug: string): JournalEntry | undefined {
  return buildableEntries().find((e) => e.slug === slug);
}

/** Entries that tell the story of a given project slug. */
export function entriesForProject(projectSlug: string): JournalEntry[] {
  return buildableEntries().filter((e) => e.project === projectSlug);
}

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

// Re-exported so the pages already importing it from here keep working. The
// implementation moved to lib/date.ts, which client components can import
// without pulling node:fs into the bundle.
export { formatDate } from "./date";

/* ------------------------- derived, for the pages ------------------------- */

/**
 * Reading time at 220 words a minute, rounded up, minimum 1.
 *
 * 220 rather than the commonly cited 200: these entries are prose with no code
 * blocks, which reads faster than mixed technical text. The number is a courtesy
 * to the reader, so rounding up is the right direction to be wrong in.
 */
export function readingMinutes(entry: JournalEntry): number {
  const words = entry.body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

/** Newer and older neighbours, for prev/next links. Listed entries only, so an
 *  unlisted entry never becomes a path someone can walk to from a public one. */
export function neighbours(slug: string): { newer?: JournalEntry; older?: JournalEntry } {
  const list = listedEntries(); // already sorted newest first
  const i = list.findIndex((e) => e.slug === slug);
  if (i === -1) return {};
  return { newer: list[i - 1], older: list[i + 1] };
}

/** Every tag across listed entries, with counts, most used first. */
export function allTags(): { tag: string; count: number }[] {
  const c = new Map<string, number>();
  for (const e of listedEntries()) for (const t of e.tags) c.set(t, (c.get(t) ?? 0) + 1);
  return [...c.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));
}

export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function entriesByTag(slug: string): JournalEntry[] {
  return listedEntries().filter((e) => e.tags.some((t) => tagSlug(t) === slug));
}

/** Tag slugs that get a page. Excludes the test fixtures' own tag when absent. */
export function tagSlugs(): string[] {
  return [...new Set(allTags().map((t) => tagSlug(t.tag)))];
}
