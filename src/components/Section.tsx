"use client";

import { Reveal } from "@/components/Chrome";

export function Head({ n, title, kicker }: { n: string; title: string; kicker?: string }) {
  return (
    <Reveal className="mb-10">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-[var(--accent)]">{n}</span>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>
      <h2 className="display mt-4 text-4xl sm:text-5xl">{title}</h2>
      {kicker && <p className="mt-3 max-w-2xl text-[var(--fg-muted)]">{kicker}</p>}
    </Reveal>
  );
}

export const Wrap = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-20 px-6 py-14 sm:px-10 lg:px-16">
    <div className="mx-auto w-full max-w-6xl">{children}</div>
  </section>
);
