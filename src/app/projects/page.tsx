import type { Metadata } from "next";
import { allProjects, pagedProjects } from "@/content/projects";
import { otherHackathons } from "@/content/site";
import ProjectExplorer from "@/components/ProjectExplorer";

export const metadata: Metadata = {
  title: "Projects · Atishay Jain",
  description:
    "Nineteen built things: government platforms, client products, institute systems, extensions and hackathon builds. Filter by type or domain.",
};

// This was a flat table of text rows. The research that produced that shape was
// about scannability, and it was right about scannability: a row is faster to
// read than a card. It was answering the wrong question. The complaint was never
// that the list was slow to read, it was that a site whose job is to show built
// software showed no software. A row cannot carry a screenshot; a card can.
//
// It then absorbed /work on 22 Oct 2026. /work rendered the same nineteen items
// from the arrays this list is derived from, split across three sections. One
// list of nineteen with a filter beats two lists of nineteen in any order.

export default function ProjectsIndex() {
  const withProof = allProjects.filter((p) => p.links.length > 0).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8">
      <h1 className="display text-[length:var(--step-display)]">Projects</h1>
      <p className="mt-6 max-w-prose text-[var(--fg-muted)]">
        {allProjects.length} of them: government platforms, client products,
        institute systems, two extensions and the hackathon builds.{" "}
        {withProof} link to something you can open and check yourself. The rest are
        private client work and say so.
      </p>

      <ProjectExplorer
        projects={allProjects}
        paged={pagedProjects.map((p) => p.slug)}
        otherHackathons={otherHackathons}
      />

      <p className="mt-12 text-[length:var(--step-small)] text-[var(--fg-muted)]">
        Every card links to the artifact itself where one exists. Nothing here is a
        mockup. The two Play Store apps show their real screens; a project without a
        screenshot shows a generated cover, not a stand-in for one.
      </p>
    </main>
  );
}
