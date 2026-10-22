import type { Metadata } from "next";
import { allProjects, pagedProjects } from "@/content/projects";
import ProjectCard from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "Projects · Atishay Jain",
  description: "Government platforms, client builds, extensions and hackathon systems.",
};

// This was a flat table of text rows. The research that produced that shape was
// about scannability, and it was right about scannability: a row is faster to
// read than a card. It was answering the wrong question. The complaint was never
// that the list was slow to read, it was that a site whose job is to show built
// software showed no software. A row cannot carry a screenshot; a card can.
//
// Grouping is gone with it. Category now rides on each cover, which is where it
// is useful, instead of splitting nineteen projects into five short lists.

const ORDER = ["government", "client", "institution", "extension", "hackathon"] as const;

export default function ProjectsIndex() {
  const paged = new Set(pagedProjects.map((p) => p.slug));
  const rows = [...allProjects].sort(
    (a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category)
  );
  const withProof = rows.filter((p) => p.links.length > 0).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8">
      <h1 className="display text-[length:var(--step-display)]">Projects</h1>
      <p className="mt-6 max-w-prose text-[var(--fg-muted)]">
        {rows.length} of them. {withProof} link to something you can open and check
        yourself. The rest are private client work and say so.
      </p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <ProjectCard key={p.slug} p={p} hasPage={paged.has(p.slug)} />
        ))}
      </div>

      <p className="mt-12 text-[length:var(--step-small)] text-[var(--fg-muted)]">
        Every card links to the artifact itself where one exists. Nothing here is a
        mockup. The two Play Store apps show their real screens; a project without a
        screenshot shows a generated cover, not a stand-in for one.
      </p>
    </main>
  );
}
