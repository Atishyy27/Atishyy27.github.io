"use client";

import { Reveal } from "@/components/Chrome";

/** `as="h1"` for the first heading on a page: a page needs exactly one. */
export function Head({ n, title, kicker, as: Tag = "h2" }: { n: string; title: string; kicker?: string; as?: "h1" | "h2" }) {
  return (
    <Reveal className="mb-10">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-[var(--accent)]">{n}</span>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>
      <Tag className="display mt-4 text-4xl sm:text-5xl">{title}</Tag>
      {kicker && <p className="mt-3 max-w-2xl text-[var(--fg-muted)]">{kicker}</p>}
    </Reveal>
  );
}

export const Wrap = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-20 px-6 py-14 sm:px-10 lg:px-16">
    <div className="mx-auto w-full max-w-6xl">{children}</div>
  </section>
);
