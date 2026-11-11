"use client";

/* One live-demo stage for the projects page: pick a project, then load it in a
   frame. Reuses LiveEmbed, so the frame stays click-to-load and sandboxed, and
   only hosts on the embeddable allowlist (checked on the server, in the page)
   ever reach this component. Keyed on the selection so switching resets it. */
import { useState } from "react";
import LiveEmbed from "@/components/LiveEmbed";

export type Demo = { slug: string; name: string; href: string };

export default function LiveDemos({ demos }: { demos: Demo[] }) {
  const [i, setI] = useState(0);
  if (demos.length === 0) return null;
  const d = demos[Math.min(i, demos.length - 1)];

  return (
    <section className="mt-12">
      <h2 className="text-[length:var(--step-h2)] font-medium">Try them live</h2>
      <p className="mt-3 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
        {demos.length} of these run in a frame right here. Pick one; nothing loads until
        you ask.
      </p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="pick a project to run">
        {demos.map((x, n) => (
          <button
            key={x.slug}
            type="button"
            onClick={() => setI(n)}
            aria-pressed={n === i}
            className={`min-h-[40px] rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition sm:min-h-0 sm:px-3 sm:py-1 ${
              n === i
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <LiveEmbed key={d.slug} href={d.href} name={d.name} />
      {/* A framed site on a phone fights the page for scrolling; the plain
          tab is always the better way to use it there. */}
      <a
        href={d.href}
        target="_blank"
        rel="noopener"
        className="mt-3 inline-flex min-h-[40px] items-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)] hover:text-[var(--fg)] sm:min-h-0"
      >
        open {d.name} in its own tab &rarr;
      </a>
    </section>
  );
}
