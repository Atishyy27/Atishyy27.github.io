"use client";

/**
 * App screenshots, in a phone frame, scrollable sideways.
 *
 * The two government apps are the only projects on this site that a visitor
 * cannot be shown directly: the Play Store refuses to be framed, so there is no
 * embed to fall back on and no URL that renders the app. Until now that meant
 * the two largest pieces of work here were described and never seen.
 *
 * Click one and it opens full size. No lightbox library: a <dialog> does this
 * natively, closes on Escape for free, and costs nothing to ship.
 */

import { useRef, useState } from "react";
import type { Shot } from "@/content/shots";

export default function Shots({ shots, name }: { shots: Shot[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);

  if (!shots.length) return null;

  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
          {shots.length} screens
        </h3>
        <p className="font-mono text-[10px] tracking-[0.1em] text-[var(--fg-muted)]">
          from the Play Store listing
        </p>
      </div>

      {/* Negative margin so the strip bleeds to the edge on a phone and it is
          obvious there is more to the right, instead of ending in a neat column
          that looks like the whole set. */}
      <div
        ref={strip}
        className="-mx-6 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 sm:-mx-8 sm:px-8"
      >
        {shots.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setOpen(i)}
            className="group relative shrink-0 snap-start overflow-hidden rounded-xl border border-[var(--line)] bg-black transition-colors hover:border-[var(--accent)]"
            style={{ width: 150, height: Math.round((150 * s.h) / s.w) }}
            aria-label={`${name}, screen ${i + 1} of ${shots.length}`}
          >
            <img
              src={s.src}
              width={s.w}
              height={s.h}
              alt={`${name}, screen ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${name}, screen ${open + 1}`}
        >
          <img
            src={shots[open].src}
            width={shots[open].w}
            height={shots[open].h}
            alt={`${name}, screen ${open + 1}`}
            className="max-h-[85vh] w-auto rounded-2xl border border-[var(--line)]"
          />
          <button
            onClick={() => setOpen(null)}
            className="absolute right-6 top-6 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            close
          </button>
        </div>
      )}
    </div>
  );
}
