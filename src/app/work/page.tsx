"use client";

import { govtWork, clientWork, orgWork, extensions, hackathons, otherHackathons } from "@/content/site";
import { Reveal } from "@/components/Chrome";
import { WorkGrid, WorkExplorer } from "@/components/Panels";
import { Head, Wrap } from "@/components/Section";

export default function Work() {
  return (
    <main className="relative pt-24">
      {/* SHIPPED — filterable, for the interviewer who's looking for one thing */}
      <Wrap id="work">
        <Head n="01" title="Shipped" kicker="Government platforms, client products, institute systems. Filter by what you're looking for." />
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
        <Head n="02" title="Products" kicker="Two Chrome extensions people installed without being asked to." />
        <WorkGrid items={extensions} />
      </Wrap>

      {/* HACKATHONS */}
      <Wrap id="hackathons">
        <Head n="03" title="Hackathons" />
        <WorkGrid items={hackathons} />
        <Reveal>
          <p className="mt-8 font-mono text-xs leading-loose text-[var(--fg-muted)]">
            {otherHackathons.join("  ·  ")}
          </p>
        </Reveal>
      </Wrap>
    </main>
  );
}
