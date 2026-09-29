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

export default function Log() {
  const ov = useOverrides();
  const blurb = ov.blurb ?? person.blurb;
  const about = ov.about ?? aboutDefault;
  void blurb; void about;

  return (
    <main className="relative pt-24">
        {/* BUILD LOG */}
        <Wrap id="log">
          <Head n="08" title="Build log" kicker="Notes from building things, with the thing itself embedded rather than described." />
          <BuildLog />
        </Wrap>

        {/* ASK / TERMINAL */}
        <Wrap id="terminal">
          <Head n="09" title="Or just ask" kicker="A small language model runs in your browser and answers from my work. Or drop into the shell." />
          <Terminal />
        </Wrap>

    </main>
  );
}
