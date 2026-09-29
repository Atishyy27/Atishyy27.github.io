"use client";

import Link from "next/link";
import {
  person, proof, experience, govtWork, clientWork, orgWork, extensions,
  hackathons, otherHackathons, currentWork, ossPrograms,
  publications, education, skills, about as aboutDefault,
} from "@/content/site";
import { Marquee, Reveal, SplitHeading, Tilt } from "@/components/Chrome";
import { CpSection, WorkGrid, WorkExplorer, ResumeEmbed } from "@/components/Panels";
import GitHubActivity from "@/components/GitHubActivity";
import { Logo } from "@/components/Logo";
import Contact from "@/components/Contact";
import Terminal from "@/components/Terminal";
import BuildLog from "@/components/BuildLog";
import { useOverrides } from "@/lib/overrides";
import { Head, Wrap } from "@/components/Section";

export default function Oss() {
  const ov = useOverrides();
  const blurb = ov.blurb ?? person.blurb;
  const about = ov.about ?? aboutDefault;
  void blurb; void about;

  return (
    <main className="relative pt-24">
        {/* OPEN SOURCE — live from GitHub */}
        <Wrap id="opensource">
          <Head n="02" title="Open source" kicker="Every PR and issue, pulled live from GitHub. Nothing hand-picked." />
          <Reveal>
            <Tilt className="glass mb-8 rounded-2xl p-8">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h3 className="text-xl font-medium">{currentWork.title}</h3>
                <span className="font-mono text-xs text-[var(--fg-muted)]">since {currentWork.since}</span>
                <span className="rounded-full border border-[var(--accent)] px-3 py-1 font-mono text-[10px] text-[var(--accent)]">{currentWork.badge}</span>
              </div>
              <p className="mt-4 max-w-3xl leading-relaxed text-[var(--fg-muted)]">{currentWork.detail}</p>
            </Tilt>
          </Reveal>
          <GitHubActivity />
          <Reveal><p className="mt-4 font-mono text-xs text-[var(--fg-muted)]">Programs: {ossPrograms.join(" · ")}</p></Reveal>
        </Wrap>

    </main>
  );
}
