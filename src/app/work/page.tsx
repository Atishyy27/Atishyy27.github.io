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

export default function Work() {
  const ov = useOverrides();
  const blurb = ov.blurb ?? person.blurb;
  const about = ov.about ?? aboutDefault;
  void blurb; void about;

  return (
    <main className="relative pt-24">
        {/* SHIPPED — filterable, for the interviewer who's looking for one thing */}
        <Wrap id="work">
          <Head n="03" title="Shipped" kicker="Government platforms, client products, institute systems. Filter by what you're looking for." />
          <WorkExplorer
            groups={[
              { kind: "Government", items: govtWork },
              { kind: "Client", items: clientWork },
              { kind: "Institution", items: orgWork },
            ]}
          />
        </Wrap>

        {/* PRODUCTS */}
        <Wrap id="products">
          <Head n="04" title="Products" kicker="Two Chrome extensions people installed without being asked to." />
          <WorkGrid items={extensions} />
        </Wrap>

        {/* HACKATHONS */}
        <Wrap id="hackathons">
          <Head n="05" title="Hackathons" />
          <WorkGrid items={hackathons} />
          <Reveal><p className="mt-8 font-mono text-xs leading-loose text-[var(--fg-muted)]">{otherHackathons.join("  ·  ")}</p></Reveal>
        </Wrap>

    </main>
  );
}
