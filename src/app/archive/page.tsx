import Link from "next/link";
import type { Metadata } from "next";
import { listedEntries, formatDate, readingMinutes } from "@/lib/journal";
import { log } from "@/content/log";
import { oss } from "@/content/oss";

export const metadata: Metadata = {
  title: "Archive · Atishay Jain",
  description: "Everything dated on this site, by year and month.",
};

/* ==================================================================
   The archive, the way an archive actually works: everything that has
   a date, on one page, oldest era at the bottom.

   Three sources, merged: journal entries, build-log entries, and every
   upstream pull request from the committed OSS snapshot. The point of
   putting pull requests in here is that they are the densest dated
   record by far, and a calendar of only the writing would show a dozen
   dots in a year where several hundred things happened.

   No month is invented. A month with nothing in it is absent rather
   than rendered empty, because a grid of empty cells implies the
   record is complete and it is not: anything before this site existed
   is simply not here.
================================================================== */

type Item = {
  date: string;
  kind: "journal" | "log" | "pr";
  title: string;
  href: string;
  external?: boolean;
  note?: string;
};

const KIND_LABEL: Record<Item["kind"], string> = {
  journal: "Journal",
  log: "Build log",
  pr: "Pull request",
};

function collect(): Item[] {
  const items: Item[] = [];

  for (const e of listedEntries()) {
    items.push({
      date: e.date,
      kind: "journal",
      title: e.title,
      href: `/journal/${e.slug}/`,
      note: `${readingMinutes(e)} min`,
    });
  }

  for (const e of log) {
    items.push({ date: e.date, kind: "log", title: e.title, href: "/log/" });
  }

  for (const r of oss.repos) {
    for (const pr of r.prs) {
      items.push({
        date: pr.created,
        kind: "pr",
        title: pr.title,
        href: pr.url,
        external: true,
        note: `${r.full} · ${pr.state}`,
      });
    }
  }

  return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Archive() {
  const items = collect();

  // Group by year, then by month. A Map preserves insertion order, and the
  // items are already sorted, so the groups come out newest first for free.
  const byYear = new Map<string, Map<number, Item[]>>();
  for (const it of items) {
    const [y, m] = it.date.split("-");
    const year = byYear.get(y) ?? new Map<number, Item[]>();
    const month = Number(m) - 1;
    year.set(month, [...(year.get(month) ?? []), it]);
    byYear.set(y, year);
  }

  const counts = {
    journal: items.filter((i) => i.kind === "journal").length,
    log: items.filter((i) => i.kind === "log").length,
    pr: items.filter((i) => i.kind === "pr").length,
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24 sm:px-8">
      <h1 className="display text-[length:var(--step-display)]">Archive</h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-[var(--fg-muted)]">
        {items.length} dated things, newest first. {counts.pr} pull requests,{" "}
        {counts.log} build-log entries, {counts.journal} journal entries.
      </p>
      <p className="mt-4 max-w-prose text-[length:var(--step-small)] text-[var(--fg-muted)]">
        A month with nothing in it is left out rather than shown empty. This is not a
        complete record of what I have done, only a complete record of what is dated
        and on this site.
      </p>

      {[...byYear.entries()].map(([year, months]) => {
        const yearTotal = [...months.values()].reduce((n, l) => n + l.length, 0);
        return (
          <section key={year} className="mt-20">
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-3">
              <h2 className="display text-3xl">{year}</h2>
              <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
                {yearTotal} {yearTotal === 1 ? "entry" : "entries"} · {months.size}{" "}
                {months.size === 1 ? "month" : "months"}
              </span>
            </div>

            {[...months.entries()]
              .sort((a, b) => b[0] - a[0])
              .map(([month, list]) => (
                <div key={month} className="mt-10">
                  <h3 className="font-mono text-[10px] tracking-[0.18em] text-[var(--accent)] uppercase">
                    {MONTHS[month]} · {list.length}
                  </h3>
                  <div className="mt-3">
                    {list.map((it, i) =>
                      it.external ? (
                        <a
                          key={`${it.href}-${i}`}
                          href={it.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="row group"
                        >
                          <span className="row-kind whitespace-nowrap">{formatDate(it.date)}</span>
                          <span>
                            <span className="row-name">{it.title}</span>
                            <span className="row-line block">
                              {KIND_LABEL[it.kind]}
                              {it.note ? ` · ${it.note}` : ""}
                            </span>
                          </span>
                          <span className="row-kind">↗</span>
                        </a>
                      ) : (
                        <Link key={`${it.href}-${i}`} href={it.href} className="row group">
                          <span className="row-kind whitespace-nowrap">{formatDate(it.date)}</span>
                          <span>
                            <span className="row-name">{it.title}</span>
                            <span className="row-line block">
                              {KIND_LABEL[it.kind]}
                              {it.note ? ` · ${it.note}` : ""}
                            </span>
                          </span>
                          <span className="row-kind">→</span>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}
          </section>
        );
      })}
    </main>
  );
}
