"use client";

/**
 * A project card with a face.
 *
 * Three sources, in order of how much they prove.
 *
 * 1. A Play Store screenshot, for the two apps that have them.
 * 2. A real capture of the project's own live site. This was listed here as
 *    impossible until 2026-10-24: "headless Brave hangs on this machine". What
 *    hung was chrome-headless-shell, the stripped binary Puppeteer downloads,
 *    which dies on this Mac with "GPU process isn't usable". The full Brave in
 *    /Applications renders fine in --headless=new. scripts/shoot-covers.mjs
 *    now takes eleven of them. A screenshot service is still refused: it would
 *    mean sending his project URLs to a third party on every build.
 * 3. A drawn cover from what is already known: category colour, initials and
 *    the stack. Deterministic, no bytes, scales to any size, and reads as
 *    designed rather than as a missing image.
 */

import Link from "next/link";
import { CATEGORY_COLOR } from "@/content/graph";
import { CATEGORY_LABEL, type Project } from "@/content/projects";
import { SHOTS } from "@/content/shots";
import { COVERS } from "@/content/covers";

/** Stable per name, so a project's cover never changes between builds. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function initials(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function Cover({ p }: { p: Project }) {
  const shot = SHOTS[p.slug]?.[0];
  const color = CATEGORY_COLOR[p.category];
  const cover = COVERS[p.slug];

  // A real capture of the live site, where one exists. Below the Play Store
  // screenshots on purpose: a store screenshot is the developer's own chosen
  // frame, a capture is whatever the site happened to render.
  if (!shot && cover) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover.src}
          alt={`${p.name}, its live site`}
          width={cover.w}
          height={cover.h}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  if (shot) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        {/* Phone screenshots are tall. Anchored to the top so the card shows the
            top of the app screen, which is where the app says what it is. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shot.src}
          alt={`${p.name}, app screen`}
          width={shot.w}
          height={shot.h}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const h = hash(p.slug);
  const angle = h % 360;
  const dots = 7 + (h % 5);

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden"
      style={{ background: `linear-gradient(${angle}deg, ${color}1f, transparent 70%), var(--bg-raised)` }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 90" aria-hidden="true">
        {Array.from({ length: dots }).map((_, i) => {
          const n = hash(p.slug + i);
          return (
            <circle
              key={i}
              cx={(n % 120)}
              cy={((n >> 7) % 90)}
              r={1 + ((n >> 13) % 3)}
              fill={color}
              opacity={0.12 + ((n >> 17) % 10) / 60}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color }}>
          {CATEGORY_LABEL[p.category]}
        </span>
        <span
          className="display text-5xl leading-none transition-transform duration-500 group-hover:-translate-y-0.5"
          style={{ color }}
        >
          {initials(p.name)}
        </span>
      </div>
    </div>
  );
}

export default function ProjectCard({ p, hasPage }: { p: Project; hasPage: boolean }) {
  const body = (
    <>
      <Cover p={p} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-medium leading-snug">{p.name}</h2>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
            {p.links.length > 0 ? p.links.map((l) => l.label).join(", ") : p.privateNote ? "Private" : ""}
          </span>
        </div>
        {p.org ? (
          <p className="mt-1 text-[length:var(--step-small)] text-[var(--fg-muted)]">{p.org}</p>
        ) : null}
        <p className="mt-3 flex-1 text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
          {p.story || p.blurb}
        </p>
        <p className="mt-4 font-mono text-[10px] tracking-[0.1em] text-[var(--fg-muted)]">
          {p.stack.slice(0, 4).join("  ·  ")}
        </p>
      </div>
    </>
  );

  const shell =
    "group flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-raised)] transition-colors";

  return hasPage ? (
    <Link href={`/projects/${p.slug}/`} className={`${shell} hover:border-[var(--accent)]`}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}
