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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
    throw new Error(`journal/${file}: date must be YYYY-MM-DD, got "${data.date}"`);
  }

  const status: EntryStatus = data.status === "published" ? "published" : "draft";
  const visibility: EntryVisibility = data.visibility === "unlisted" ? "unlisted" : "public";

  return {
    slug,
    title: String(data.title),
    date: String(data.date),
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

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}
