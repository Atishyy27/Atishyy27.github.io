"use client";

import { useMemo, useState } from "react";
import { cpProfiles, person, type Work } from "@/content/site";
import { Reveal, Tilt } from "./Chrome";
import { Logo } from "./Logo";
import UnifiedHeatmap from "./UnifiedHeatmap";

export function CpSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cpProfiles.map((p, i) => (
          <Reveal key={p.site} delay={i * 0.06}>
            <Tilt className="glass h-full rounded-2xl p-6">
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="block">
                <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">
                  {p.site.toUpperCase()}
                </div>
                <div className="display mt-3 text-3xl text-[var(--accent)]">{p.rank}</div>
                <div className="mt-2 text-sm text-[var(--fg-muted)]">{p.detail}</div>
                <div className="mt-3 font-mono text-[10px] text-[var(--fg-muted)]">@{p.handle}</div>
              </a>
            </Tilt>
          </Reveal>
        ))}
      </div>

      <UnifiedHeatmap />
    </div>
  );
}

/* ---------------- filterable work explorer ---------------- */

const DOMAIN: Record<string, string[]> = {
  Backend: ["Node", "Express", "Spring Boot", "Django", "FastAPI", "Laravel", "MongoDB", "PostgreSQL", "MySQL", "Supabase", "MERN"],
  Frontend: ["React", "Next.js", "Vite", "three.js", "WordPress", "Wix", "React Native"],
  Mobile: ["Flutter", "React Native"],
  "ML / AI": ["PyTorch", "PyTorch Geometric", "Neo4j", "Agentic AI", "Federated ML", "Python", "SHAP", "Geospatial"],
  Systems: ["Rust", "Docker", "AWS", "C#", "Linux"],
  Blockchain: ["Blockchain", "Hyperledger", "Solidity"],
};

function tagsFor(w: Work): string[] {
  const t = new Set<string>();
  for (const [domain, keys] of Object.entries(DOMAIN)) {
    if (w.stack.some((s) => keys.some((k) => s.toLowerCase().includes(k.toLowerCase())))) t.add(domain);
  }
  return [...t];
}

export function WorkExplorer({ groups }: { groups: { kind: string; items: Work[] }[] }) {
  const all = useMemo(
    () => groups.flatMap((g) => g.items.map((w) => ({ ...w, kind: g.kind, tags: tagsFor(w) }))),
    [groups]
  );
  const domains = useMemo(() => Object.keys(DOMAIN).filter((d) => all.some((w) => w.tags.includes(d))), [all]);
  const kinds = useMemo(() => groups.map((g) => g.kind), [groups]);
  const [domain, setDomain] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);

  const shown = all.filter((w) => (!domain || w.tags.includes(domain)) && (!kind || w.kind === kind));

  const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      data-cursor
      className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
        on
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--line)] text-[var(--fg-muted)] hover:border-[var(--accent)]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <Reveal>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">DOMAIN</span>
          <Chip on={!domain} onClick={() => setDomain(null)}>All</Chip>
          {domains.map((d) => (
            <Chip key={d} on={domain === d} onClick={() => setDomain(domain === d ? null : d)}>{d}</Chip>
          ))}
        </div>
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">TYPE</span>
          <Chip on={!kind} onClick={() => setKind(null)}>All</Chip>
          {kinds.map((k) => (
            <Chip key={k} on={kind === k} onClick={() => setKind(kind === k ? null : k)}>{k}</Chip>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((w) => (
          <Reveal key={w.name}>
            <Tilt className="glass flex h-full flex-col rounded-2xl p-6">
              <div className="mb-3 flex items-center gap-3">
                <Logo name={w.name} domain={w.domain} size={34} />
                <div>
                  <span className="font-mono text-[9px] tracking-[0.15em] text-[var(--accent)]">{w.kind.toUpperCase()}</span>
                  {w.org && <span className="block font-mono text-[9px] text-[var(--fg-muted)]">{w.org}</span>}
                </div>
              </div>
              <h3 className="text-lg font-medium tracking-tight">{w.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--fg-muted)]">{w.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {w.stack.slice(0, 4).map((s) => (
                  <span key={s} className="rounded-full border border-[var(--line)] px-2.5 py-0.5 font-mono text-[9px] text-[var(--fg-muted)]">{s}</span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                {w.links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="link text-[var(--accent)]">{l.label} →</a>
                ))}
                {w.privateNote && <span className="text-[11px] italic text-[var(--fg-muted)]">{w.privateNote}</span>}
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
      {shown.length === 0 && (
        <p className="py-10 text-center text-sm text-[var(--fg-muted)]">Nothing in that combination.</p>
      )}
    </div>
  );
}

/* ---------------- reusable work grid ---------------- */

export function WorkGrid({ items, cols = 2 }: { items: Work[]; cols?: number }) {
  return (
    <div className={`grid gap-6 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {items.map((w, i) => (
        <Reveal key={w.name} delay={(i % cols) * 0.07}>
          <Tilt
            className={`glass h-full rounded-2xl p-7 ${
              w.featured && cols === 2 ? "md:col-span-2" : ""
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="text-xl font-medium tracking-tight">{w.name}</h3>
              {w.org && (
                <span className="font-mono text-[10px] tracking-wide text-[var(--accent)]">
                  {w.org}
                </span>
              )}
            </div>
            <p className="mt-3 leading-relaxed text-[var(--fg-muted)]">{w.blurb}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {w.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[10px] text-[var(--fg-muted)]"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {w.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link text-[var(--accent)]"
                >
                  {l.label} →
                </a>
              ))}
              {w.privateNote && (
                <span className="text-xs italic text-[var(--fg-muted)]">{w.privateNote}</span>
              )}
            </div>
          </Tilt>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------------- résumé, embedded ---------------- */

export function ResumeEmbed() {
  const [open, setOpen] = useState(false);
  return (
    <Reveal>
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h3 className="text-lg font-medium">Résumé</h3>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Read it here, or take the PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {open ? "Hide" : "Read here"}
            </button>
            <a
              href={person.resumeHref}
              download
              className="rounded-full border border-[var(--accent)] px-5 py-2.5 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              Download PDF ↓
            </a>
          </div>
        </div>
        {open && (
          // Loaded only on click — a 175 KB PDF should never be in the
          // initial page weight.
          <object
            data={`${person.resumeHref}#view=FitH`}
            type="application/pdf"
            className="h-[80vh] w-full border-t border-[var(--line)]"
          >
            <div className="p-6 text-sm text-[var(--fg-muted)]">
              Your browser can&apos;t display PDFs inline.{" "}
              <a href={person.resumeHref} className="link text-[var(--accent)]">
                Download it instead ↓
              </a>
            </div>
          </object>
        )}
      </div>
    </Reveal>
  );
}
