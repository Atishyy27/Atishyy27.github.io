"use client";

import Link from "next/link";
import { Reveal, Tilt } from "./Chrome";
import { experience } from "@/content/site";

export default function ExperienceHighlights() {
  // Show the top 4 flagship professional roles on the homepage
  const featured = experience.slice(0, 4);

  return (
    <section className="border-t border-[var(--line)] pt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-semibold">
            04 / PROFESSIONAL EXPERIENCE
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight">Experience & engineering work</h2>
          <p className="mt-1 text-sm text-[var(--fg-muted)] max-w-xl">
            Shipped systems across consumer AI wearables, state-government mobile ecosystems, and distributed infrastructure.
          </p>
        </div>
        <Link href="/about/" className="font-mono text-xs text-[var(--accent)] hover:underline">
          View full timeline & education &rarr;
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {featured.map((exp, i) => (
          <Reveal key={exp.org} delay={i * 0.06}>
            <Tilt className="flex h-full flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 transition-all hover:border-[var(--accent)]/40">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
                  <span className="font-mono text-[11px] text-[var(--accent)] font-semibold">
                    {exp.dates}
                  </span>
                  {exp.place && (
                    <span className="font-mono text-[10px] text-[var(--fg-muted)]">
                      {exp.place}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-medium text-[var(--fg)]">
                  {exp.role}
                </h3>
                <div className="text-sm text-[var(--fg-muted)] font-medium mt-0.5">
                  {exp.org}
                </div>

                {exp.points && exp.points.length > 0 && (
                  <ul className="mt-3.5 space-y-2 text-xs text-[var(--fg-muted)]">
                    {exp.points.slice(0, 2).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-[var(--accent)] select-none shrink-0">›</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-5 border-t border-[var(--line)]/50 pt-3">
                <Link href="/about/" className="font-mono text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                  <span>Full responsibilities & credentials</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
