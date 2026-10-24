"use client";

/**
 * Achievements, with the photos where there are photos.
 *
 * The list reads as a table until an entry has images, and then that entry
 * grows a strip. That is deliberate: a row of grey placeholder boxes for the
 * eight entries with no photo yet would look broken, while a plain row with a
 * number and a denominator looks finished, because it is.
 *
 * Numbers carry their denominator on purpose. "Top 0.66%" alone is a boast;
 * "550 of more than 90,000" is a fact someone can argue with.
 */

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "./Chrome";
import { achievements } from "@/content/achievements";
import { PHOTOS, type Photo } from "@/content/photos";

function Strip({ photos, title }: { photos: Photo[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {photos.map((p, i) => (
          <button
            key={p.src}
            onClick={() => setOpen(i)}
            // One height for the whole strip, width following the aspect
            // ratio. Sizing by width instead gave every photo a different
            // height, so a row of a portrait phone shot next to three
            // landscape ones came out as a ragged staircase with nothing
            // aligned. A strip reads as one object or it reads as a mess.
            className="group h-[150px] shrink-0 snap-start overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-raised)] transition-colors hover:border-[var(--accent)]"
            style={{ width: Math.round((150 * p.w) / p.h) }}
            aria-label={`${title}, photo ${i + 1} of ${photos.length}`}
          >
            <img
              src={p.src}
              width={p.w}
              height={p.h}
              alt={`${title}, photo ${i + 1}`}
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
          aria-label={`${title}, photo ${open + 1}`}
        >
          <img
            src={photos[open].src}
            width={photos[open].w}
            height={photos[open].h}
            alt={`${title}, photo ${open + 1}`}
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
    </>
  );
}

export default function Achievements() {
  const rows = [...achievements].sort((a, b) => b.year.localeCompare(a.year));

  return (
    <ul className="border-t border-[var(--line)]">
      {rows.map((a) => {
        const photos = PHOTOS[a.photos] ?? [];
        return (
          <li key={a.title + a.year} className="border-b border-[var(--line)] py-6">
            <Reveal>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="w-12 shrink-0 font-mono text-[10px] tracking-[0.12em] text-[var(--accent)]">
                  {a.year}
                </span>
                <h3 className="text-lg font-medium tracking-tight">{a.title}</h3>
                <span className="font-mono text-[11px] text-[var(--fg-muted)]">{a.result}</span>
              </div>
              {a.note ? (
                <p className="mt-2 pl-0 text-sm leading-relaxed text-[var(--fg-muted)] sm:pl-16">
                  {a.note}
                </p>
              ) : null}
              {a.links?.length ? (
                <div className="mt-2 flex flex-wrap gap-x-5 sm:pl-16">
                  {a.links.map((l) => (
                    <Link key={l.href} href={l.href} className="link text-sm">
                      {l.label}
                    </Link>
                  ))}
                </div>
              ) : null}
              {photos.length > 0 ? (
                <div className="sm:pl-16">
                  <Strip photos={photos} title={a.title} />
                </div>
              ) : null}
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
