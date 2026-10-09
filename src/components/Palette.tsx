"use client";

/**
 * ⌘K / Ctrl+K command palette.
 *
 * Everything on this site reachable from one keystroke. Subsequence matching
 * rather than substring, so "gsc" finds "Government Skyline Chart" the way an
 * editor would.
 *
 * It used to navigate by calling scrollIntoView on element ids, which was
 * correct when the whole site was one scrolling page. After the split into
 * routes those ids are not on the current page, so every "Go to" entry
 * silently did nothing. It routes now, and indexes the pages that did not
 * exist before: every journal entry, every repository, every tag, the archive.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  person, govtWork, clientWork, orgWork, extensions, hackathons,
} from "@/content/site";
import { allProjects, pagedProjects } from "@/content/projects";
import { oss } from "@/content/oss";

type Item = {
  id: string;
  label: string;
  hint: string;
  group: string;
  run: () => void;
};

/** Fuzzy subsequence score. Returns -1 for no match; higher is better. */
function score(needle: string, hay: string) {
  if (!needle) return 0;
  const n = needle.toLowerCase();
  const h = hay.toLowerCase();
  let i = 0;
  let s = 0;
  let streak = 0;
  for (let j = 0; j < h.length && i < n.length; j++) {
    if (h[j] === n[i]) {
      streak++;
      // reward consecutive hits and hits at word starts
      s += streak + (j === 0 || h[j - 1] === " " || h[j - 1] === "-" ? 4 : 0);
      i++;
    } else {
      streak = 0;
    }
  }
  if (i < n.length) return -1;
  return s - h.length * 0.03;
}

const open = (href: string) => () => window.open(href, href.startsWith("http") ? "_blank" : "_self", "noopener");

/** Top-level routes, in the order the home page lists them. */
const ROUTES: [string, string, string][] = [
  ["Home", "/", "the index"],
  ["Projects", "/projects/", "everything built"],
  ["Open source", "/oss/", "every upstream pull request"],
  ["Work", "/work/", "shipped platforms and products"],
  ["Stats", "/stats/", "competitive programming, a year of days"],
  ["Build log", "/log/", "notes, and the ask box"],
  ["Journal", "/journal/", "dated, first person"],
  ["Archive", "/archive/", "everything dated, by month"],
  ["About", "/about/", "experience, research, resume, contact"],
];

/**
 * Journal and tag data arrive as props rather than being imported.
 * lib/journal.ts reads the filesystem at module scope, so importing it here
 * would pull node:fs into the browser bundle. The layout is a Server
 * Component and already has the data, so it hands over just the fields the
 * palette needs.
 */
export type PaletteEntry = { slug: string; title: string; date: string };
export type PaletteTag = { tag: string; slug: string; count: number };

export default function Palette({
  journalIndex = [],
  tagIndex = [],
}: {
  journalIndex?: PaletteEntry[];
  tagIndex?: PaletteTag[];
}) {
  const [show, setShow] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  // Routing is a stable callback, so the item list can still be memoised once.
  const route = useCallback((href: string) => () => router.push(href), [router]);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = ROUTES.map(([label, href, hint]) => ({
      id: `r:${href}`, label, hint, group: "Go to", run: route(href),
    }));

    out.push({
      id: "r:tags", label: "Journal tags", hint: "browse by topic",
      group: "Go to", run: route("/journal/"),
    });

    // Projects: the page where one exists, otherwise its outbound artifact.
    const paged = new Set(pagedProjects.map((p) => p.slug));
    for (const p of allProjects) {
      const href = p.links[0]?.href;
      out.push({
        id: `w:${p.slug}`,
        label: p.name,
        hint: paged.has(p.slug) ? p.org ?? "project page" : href ? "open ↗" : p.stack.slice(0, 3).join(" · "),
        group: "Projects",
        run: paged.has(p.slug) ? route(`/projects/${p.slug}/`) : href ? open(href) : route("/projects/"),
      });
    }

    for (const e of journalIndex) {
      out.push({
        id: `j:${e.slug}`, label: e.title, hint: e.date,
        group: "Journal", run: route(`/journal/${e.slug}/`),
      });
    }

    for (const t of tagIndex) {
      out.push({
        id: `t:${t.slug}`, label: t.tag, hint: `${t.count} ${t.count === 1 ? "entry" : "entries"}`,
        group: "Tags", run: route(`/journal/tag/${t.slug}/`),
      });
    }

    for (const r of oss.repos) {
      out.push({
        id: `o:${r.slug}`,
        label: r.full,
        hint: r.merged > 0 ? `${r.merged} merged` : `${r.prs.length} open or closed`,
        group: "Open source",
        run: route(`/oss/${r.slug}/`),
      });
    }

    person.socials.forEach((s) =>
      out.push({ id: `l:${s.label}`, label: s.label, hint: "open ↗", group: "Elsewhere", run: open(s.href) })
    );

    out.push(
      { id: "a:mail", label: `Email ${person.email}`, hint: "compose", group: "Actions", run: open(`mailto:${person.email}`) },
      {
        id: "a:copy", label: "Copy email address", hint: "clipboard", group: "Actions",
        run: () => { navigator.clipboard?.writeText(person.email); setCopied(true); setTimeout(() => setCopied(false), 1600); },
      },
      { id: "a:pdf", label: "Download résumé PDF", hint: person.resumeHref, group: "Actions", run: open(person.resumeHref) },
      { id: "a:feed", label: "Subscribe to the journal (RSS)", hint: "/feed.xml", group: "Actions", run: open("/feed.xml") },
      { id: "a:ask", label: "Ask a question about my work", hint: "searches this site", group: "Actions", run: route("/log/") },
      { id: "a:src", label: "View the source of this site", hint: "github ↗", group: "Actions", run: open("https://github.com/Atishyy27/Atishyy27.github.io") },
    );

    return out;
  }, [route, journalIndex, tagIndex]);

  const results = useMemo(() => {
    if (!q.trim()) return items.slice(0, 9);
    return items
      .map((it) => ({ it, s: Math.max(score(q, it.label), score(q, `${it.group} ${it.label}`) - 2) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 9)
      .map((r) => r.it);
  }, [q, items]);

  useEffect(() => setSel(0), [q]);

  const close = useCallback(() => { setShow(false); setQ(""); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShow((v) => !v);
        return;
      }
      if (!show) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => (s + 1) % Math.max(results.length, 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => (s - 1 + results.length) % Math.max(results.length, 1)); }
      else if (e.key === "Enter") {
        e.preventDefault();
        const hit = results[sel];
        if (hit) { close(); hit.run(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, results, sel, close]);

  // keep the highlighted row in view when arrowing past the fold
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  return (
    <>
      {/* the affordance — nobody presses a shortcut they were never told about */}
      <button
        onClick={() => setShow(true)}
        aria-label="Open command palette"
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[#0b0f16cc] px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] text-[var(--fg-muted)] backdrop-blur transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] md:flex"
        data-cursor
      >
        <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5">⌘K</kbd>
        SEARCH EVERYTHING
      </button>

      {show && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh] backdrop-blur-sm"
          style={{ background: "#04060acc" }}
          onClick={close}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[#0b0f16f2] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
              <span className="text-[var(--accent)]">❯</span>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Jump to a section, open a project, copy my email…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--fg-muted)]"
                aria-label="Search"
              />
              <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--fg-muted)]">esc</kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
              {results.length === 0 && (
                <p className="px-5 py-6 text-sm text-[var(--fg-muted)]">
                  Nothing matches that. Try a project name, or a section.
                </p>
              )}
              {results.map((it, i) => (
                <button
                  key={it.id}
                  data-i={i}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => { close(); it.run(); }}
                  className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${
                    i === sel ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--fg)]"
                  }`}
                >
                  <span className="w-20 shrink-0 font-mono text-[10px] tracking-[0.15em] text-[var(--fg-muted)] uppercase">
                    {it.group}
                  </span>
                  <span className="flex-1 truncate">{it.label}</span>
                  <span className="shrink-0 truncate font-mono text-[10px] text-[var(--fg-muted)]">{it.hint}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-2.5 font-mono text-[10px] text-[var(--fg-muted)]">
              <span>↑↓ move · ⏎ open · esc close</span>
              <span className={copied ? "text-[var(--accent)]" : ""}>{copied ? "email copied" : `${items.length} things`}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
