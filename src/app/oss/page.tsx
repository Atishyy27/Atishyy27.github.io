"use client";

import { currentWork, ossPrograms } from "@/content/site";
import { Reveal, Tilt } from "@/components/Chrome";
import GitHubActivity from "@/components/GitHubActivity";
import { Head, Wrap } from "@/components/Section";

export default function Oss() {
  return (
    <main className="relative pt-24">
      {/* OPEN SOURCE — live from GitHub */}
      <Wrap id="opensource">
        <Head n="01" title="Open source" kicker="Every PR and issue, pulled live from GitHub. Nothing hand-picked." />
        <Reveal>
          <Tilt className="glass mb-8 rounded-2xl p-8">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h3 className="text-xl font-medium">{currentWork.title}</h3>
              <span className="font-mono text-xs text-[var(--fg-muted)]">since {currentWork.since}</span>
              <span className="rounded-full border border-[var(--accent)] px-3 py-1 font-mono text-[10px] text-[var(--accent)]">
                {currentWork.badge}
              </span>
            </div>
            <p className="mt-4 max-w-3xl leading-relaxed text-[var(--fg-muted)]">{currentWork.detail}</p>
          </Tilt>
        </Reveal>
        <GitHubActivity />
        <Reveal>
          <p className="mt-4 font-mono text-xs text-[var(--fg-muted)]">Programs: {ossPrograms.join(" · ")}</p>
        </Reveal>
      </Wrap>
    </main>
  );
}
