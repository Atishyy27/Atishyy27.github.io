"use client";

import { useState } from "react";
import { cpProfiles, person } from "@/content/site";
import { Reveal, Tilt } from "./Chrome";
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

/* The filterable work explorer and the work grid lived here. Both rendered the
   same nineteen projects that /projects renders, for a second route that showed
   the same list again. The route is gone (22 Oct 2026) and the filter now lives
   in components/ProjectExplorer.tsx, over the one derived list. */

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
