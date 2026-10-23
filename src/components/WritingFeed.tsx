"use client";

/**
 * One feed for everything dated.
 *
 * Until 22 Oct 2026 the same material was split across three routes. /journal
 * listed 11 entries. /log listed 15 build-log notes. /archive listed both of
 * those plus 151 pull requests, grouped by month, which made it a superset of
 * the other two rather than a different view. The nav offered all three as
 * separate destinations, so finding "the thing he wrote about X" meant checking
 * two indexes and an archive that repeated them.
 *
 * They are one genre: dated, first person, about work that happened. The split
 * was never a reader's distinction, it was an artifact of the order the pages
 * were built. One feed, four filters, grouped by month.
 *
 * Build-log notes expand in place because that is where their embeds live and
 * they have never had their own URLs; journal entries keep theirs at
 * /journal/<slug>/, so no link dies.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Reveal } from "./Chrome";
import { log, type Entry } from "@/content/log";

export type FeedItem =
  | { kind: "journal"; date: string; title: string; href: string; note?: string }
  | { kind: "pr"; date: string; title: string; href: string; note?: string };

type Row =
  | (FeedItem & { external?: boolean })
  | { kind: "log"; date: string; title: string; entry: Entry };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ---------------- build-log embeds, moved here with the entries ---------------- */

function RepoCard({ id }: { id: string }) {
  const [d, setD] = useState<{ description: string; stargazers_count: number; language: string } | null>(null);
  const [dead, setDead] = useState(false);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setD)
      .catch(() => setDead(true));
  }, [id]);

  if (dead) return null;
  return (
    <a
      href={`https://github.com/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="tilt mt-5 block rounded-xl border border-[var(--line)] p-5"
      data-cursor
    >
      <div className="font-mono text-sm text-[var(--accent)]">{id}</div>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">{d?.description ?? "…"}</p>
      <div className="mt-3 flex gap-4 font-mono text-[10px] text-[var(--fg-muted)]">
        {d && <span>★ {d.stargazers_count}</span>}
        {d?.language && <span>{d.language}</span>}
      </div>
    </a>
  );
}

function Embed({ embed }: { embed: NonNullable<Entry["embed"]> }) {
  if (embed.kind === "repo") return <RepoCard id={embed.id} />;
  if (embed.kind === "youtube")
    return (
      <div className="mt-5 aspect-video overflow-hidden rounded-xl border border-[var(--line)]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${embed.id}`}
          title="Embedded video"
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    );
  if (embed.kind === "gist")
    return (
      <iframe
        title="Embedded gist"
        loading="lazy"
        className="mt-5 h-72 w-full rounded-xl border border-[var(--line)] bg-white"
        srcDoc={`<script src="https://gist.github.com/${embed.id}.js"></script>`}
      />
    );
  return (
    <div className="mt-5 h-96 overflow-hidden rounded-xl border border-[var(--line)]">
      <iframe src={embed.id} title="Embedded demo" loading="lazy" className="h-full w-full" />
    </div>
  );
}

/* ---------------- rows ---------------- */

function LogRow({ e }: { e: Entry }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-t border-[var(--line)]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-baseline gap-4 py-4 text-left"
        data-cursor
      >
        <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]">
          Build log
        </span>
        <span className="flex-1 leading-snug">{e.title}</span>
        <span className={`shrink-0 text-[var(--accent)] transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>

      {/* Rendered whether or not it is open, hidden with the `hidden` attribute
          rather than left out of the tree. With `open &&` only the expanded
          entry reached the HTML, so the rest were invisible to search engines
          and to anyone who did not click. The body of a build log IS the log. */}
      <div hidden={!open}>
        <div className="grid gap-5 pb-8 md:grid-cols-[6rem_1fr]">
          <div className="flex flex-wrap gap-1.5 md:flex-col md:items-start">
            {e.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--fg-muted)]"
              >
                {t}
              </span>
            ))}
          </div>
          <div>
            {e.body.map((p, k) => (
              <p key={k} className="mb-4 leading-relaxed text-[var(--fg-muted)]">{p}</p>
            ))}
            {e.embed && <Embed embed={e.embed} />}
            {e.links && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {e.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link text-sm text-[var(--accent)]">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function LinkRow({ it }: { it: FeedItem }) {
  const label = it.kind === "journal" ? "Journal" : "Pull request";
  const body = (
    <>
      <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
        {label}
      </span>
      <span className="flex-1 leading-snug group-hover:text-[var(--accent)]">{it.title}</span>
      {it.note ? (
        <span className="shrink-0 font-mono text-[10px] text-[var(--fg-muted)]">{it.note}</span>
      ) : null}
    </>
  );

  return (
    <li className="border-t border-[var(--line)]">
      {it.kind === "journal" ? (
        <Link href={it.href} className="group flex items-baseline gap-4 py-4">{body}</Link>
      ) : (
        <a
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-baseline gap-4 py-4"
        >
          {body}
        </a>
      )}
    </li>
  );
}

/* ---------------- the feed ---------------- */

// Pull requests came out on 24 Oct 2026. 151 of them against 26 pieces of
// writing was not a feed, it was a changelog with essays hidden in it, and
// nobody reads someone else's changelog. Every one of them is still on /oss,
// which is the page whose subject they actually are.
const FILTERS = [
  ["writing", "Everything"],
  ["journal", "Essays"],
  ["log", "Build log"],
] as const;

type Filter = (typeof FILTERS)[number][0];

export default function WritingFeed({ journal }: { journal: FeedItem[] }) {
  const [filter, setFilter] = useState<Filter>("writing");

  const rows: Row[] = useMemo(() => {
    const logRows: Row[] = log.map((e) => ({ kind: "log" as const, date: e.date, title: e.title, entry: e }));
    const all: Row[] = [...journal, ...logRows];
    return all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [journal]);

  const counts = {
    writing: journal.length + log.length,
    journal: journal.length,
    log: log.length,
  };

  const shown = rows.filter((r) => (filter === "writing" ? true : r.kind === filter));

  // Group by year, then month. The rows are already newest first and a Map keeps
  // insertion order, so the groups come out in the right order for free. A month
  // with nothing in it is absent rather than rendered empty: an unbroken grid of
  // months would imply the record goes back further than it does.
  const byYear = new Map<string, Map<number, Row[]>>();
  for (const r of shown) {
    const [y, m] = r.date.split("-");
    const year = byYear.get(y) ?? new Map<number, Row[]>();
    const month = Number(m) - 1;
    year.set(month, [...(year.get(month) ?? []), r]);
    byYear.set(y, year);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            data-cursor
            className={`rounded-full border px-3.5 py-1 font-mono text-[11px] transition-colors ${
              filter === id
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--line)] text-[var(--fg-muted)] hover:border-[var(--accent)]"
            }`}
          >
            {label} <span className="opacity-60">{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="mt-12 space-y-14">
        {[...byYear.entries()].map(([year, months]) => (
          <section key={year}>
            <h2 className="display text-3xl text-[var(--fg-muted)]">{year}</h2>
            <div className="mt-6 space-y-10">
              {[...months.entries()].map(([month, items]) => (
                <Reveal key={month}>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fg-muted)]">
                    {MONTHS[month]} · {items.length}
                  </h3>
                  <ul className="mt-3">
                    {items.map((r) =>
                      r.kind === "log" ? (
                        <LogRow key={`log-${r.date}-${r.title}`} e={r.entry} />
                      ) : (
                        <LinkRow key={`${r.kind}-${r.href}`} it={r} />
                      )
                    )}
                  </ul>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--fg-muted)]">Nothing under that filter.</p>
      ) : null}
    </div>
  );
}
