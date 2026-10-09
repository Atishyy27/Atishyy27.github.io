"use client";

import { useState } from "react";
import { canEmbed } from "@/lib/embeddable";

/**
 * The running project, in the page.
 *
 * CLICK TO LOAD, deliberately. Five iframes mounted on page load would fetch
 * five entire sites before anyone scrolled to them, cost their hosting real
 * bandwidth, and make this page slower than the projects it is showing. The
 * frame mounts when someone asks for it.
 *
 * Which hosts actually permit framing lives in lib/embeddable.ts, as a plain
 * module, because the project page decides on the server whether to render this
 * at all. A host that is not on that allowlist keeps its link and gets no
 * frame: a blocked iframe is a blank rectangle with the reason only in the
 * console, which looks exactly like a broken project.
 */

export default function LiveEmbed({ href, name }: { href: string; name: string }) {
  const [on, setOn] = useState(false);

  if (!canEmbed(href)) return null;

  return (
    <div className="mt-4">
      {on ? (
        <div className="relative overflow-hidden rounded-lg border border-[var(--line)]">
          <iframe
            src={href}
            title={`${name}, running`}
            loading="lazy"
            // The frame is a third-party site. allow-scripts plus
            // allow-same-origin would let it reach out of the sandbox, so
            // same-origin is not granted; it renders and runs, and that is all.
            sandbox="allow-scripts allow-popups allow-forms"
            referrerPolicy="no-referrer"
            className="block h-[520px] w-full bg-white"
          />
          <button
            onClick={() => setOn(false)}
            className="absolute right-3 top-3 rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            close
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOn(true)}
          className="group flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--line)] px-5 py-4 text-left transition-colors hover:border-[var(--accent)]"
        >
          <span>
            <span className="block text-[length:var(--step-small)] font-medium">
              Run {name} here
            </span>
            <span className="mt-0.5 block font-mono text-[10px] tracking-[0.1em] text-[var(--fg-muted)] uppercase">
              loads the live site in a frame
            </span>
          </span>
          <span className="shrink-0 text-[var(--accent)]">▸</span>
        </button>
      )}
    </div>
  );
}
