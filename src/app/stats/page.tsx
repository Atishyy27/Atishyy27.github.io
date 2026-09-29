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

export default function Stats() {
  const ov = useOverrides();
  const blurb = ov.blurb ?? person.blurb;
  const about = ov.about ?? aboutDefault;
  void blurb; void about;

  return (
    <main className="relative pt-24">
        {/* STATS — up top, as asked */}
        <Wrap id="cp">
          <Head n="01" title="The numbers" kicker="ICPC 2025, Rank 12 at the Mysuru on-site regionals. Live cards, straight from each platform." />
          <CpSection />
        </Wrap>

    </main>
  );
}
