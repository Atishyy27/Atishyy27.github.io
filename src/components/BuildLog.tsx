"use client";

/**
 * Build log. Entries expand in place; the embed only mounts once an entry is
 * open, so a closed log costs nothing. Repo cards pull live stars and the
 * real description from the GitHub API rather than hardcoding either.
 */

import { useEffect, useState } from "react";
import { Reveal } from "./Chrome";
import { log, type Entry } from "@/content/log";

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

function Row({ e, i }: { e: Entry; i: number }) {
  const [open, setOpen] = useState(i === 0);
  const when = new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Reveal delay={Math.min(i, 4) * 0.05}>
      <li className="border-b border-[var(--line)]">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-baseline gap-5 py-6 text-left"
          data-cursor
        >
          <span className="w-24 shrink-0 font-mono text-[10px] tracking-[0.1em] text-[var(--fg-muted)]">{when}</span>
          <span className="flex-1 text-lg font-medium leading-snug">{e.title}</span>
          <span className={`shrink-0 text-[var(--accent)] transition-transform ${open ? "rotate-45" : ""}`}>+</span>
        </button>

        {open && (
          <div className="grid gap-6 pb-9 md:grid-cols-[6rem_1fr] md:gap-5">
            <div className="flex flex-wrap gap-1.5 md:flex-col md:items-start">
              {e.tags.map((t) => (
                <span key={t} className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[9px] text-[var(--fg-muted)]">
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
        )}
      </li>
    </Reveal>
  );
}

export default function BuildLog() {
  const entries = [...log].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <ol className="border-t border-[var(--line)]">
      {entries.map((e, i) => <Row key={e.date + e.title} e={e} i={i} />)}
    </ol>
  );
}
