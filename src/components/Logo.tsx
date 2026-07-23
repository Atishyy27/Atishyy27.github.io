"use client";

import { useState } from "react";

/**
 * Company mark. Real favicon where we have a domain (framed in a uniform
 * chip so mismatched logos still line up), a clean monogram otherwise.
 * The frame is the trick: a chip with consistent padding and border makes
 * a set of unrelated logos read as one system instead of a ransom note.
 */
export function Logo({ name, domain, size = 40 }: { name: string; domain?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--line)] bg-[#0e131b]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {domain && !failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt=""
          width={size * 0.6}
          height={size * 0.6}
          loading="lazy"
          onError={() => setFailed(true)}
          className="object-contain"
        />
      ) : (
        <span className="font-mono text-[11px] font-medium text-[var(--fg-muted)]">{initials}</span>
      )}
    </span>
  );
}
