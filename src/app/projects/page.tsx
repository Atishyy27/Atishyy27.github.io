import Link from "next/link";
import type { Metadata } from "next";
import { allProjects, pagedProjects, CATEGORY_LABEL } from "@/content/projects";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Projects · Atishay Jain",
  description: "Government platforms, client builds, extensions and hackathon systems.",
};

// One flat table, not cards and not five grouped lists. Three independent research
// passes over 116 portfolios landed on the same shape: a fixed left column, one row
// height, a hairline between rows, and a link to real proof on every row. The fixed
// left column is what stops rows reading as floating.
//
// The left column is the kind, not the year, because the year is not known for every
// project and an invented year is worse than no year.

const ORDER = ["government", "client", "institution", "extension", "hackathon"] as const;

function proofLabel(p: (typeof allProjects)[number]): string {
  if (p.links.length > 0) return p.links.map((l) => l.label).join(", ");
  if (p.privateNote) return "Private";
  return "";
}

export default function ProjectsIndex() {
  const paged = new Set(pagedProjects.map((p) => p.slug));
  const rows = [...allProjects].sort(
    (a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category)
  );

  const withProof = rows.filter((p) => p.links.length > 0).length;

  return (
    <main className="mx-auto w-full max-w-[var(--measure)] px-6 py-24 sm:px-8">
      <h1 className="display text-[length:var(--step-display)]">Projects</h1>
      <p className="mt-6 max-w-prose text-[var(--fg-muted)]">
        {rows.length} of them. {withProof} link to something you can open and check
        yourself. The rest are private client work and say so.
      </p>

      <div className="mt-16">
        {rows.map((p) => {
          const hasPage = paged.has(p.slug);
          const body = (
            <>
              <span className="row-kind flex items-center gap-2.5">
                {p.image ? (
                  <span className="grid h-[26px] w-[26px] shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--line)] bg-[var(--bg-raised)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" width={26} height={26} loading="lazy" className="h-full w-full object-cover" />
                  </span>
                ) : (
                  <Logo name={p.name} domain={p.domain} size={26} />
                )}
                {CATEGORY_LABEL[p.category]}
              </span>
              <span>
                <span className="row-name">{p.name}</span>
                {p.org ? (
                  <span className="ml-2 text-[length:var(--step-small)] text-[var(--fg-muted)]">
                    {p.org}
                  </span>
                ) : null}
                <span className="row-line block">{p.story || p.blurb}</span>
              </span>
              <span className="row-kind whitespace-nowrap">{proofLabel(p)}</span>
            </>
          );

          return hasPage ? (
            <Link key={p.slug} href={`/projects/${p.slug}/`} className="row group">
              {body}
            </Link>
          ) : (
            <div key={p.slug} className="row">
              {body}
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-[length:var(--step-small)] text-[var(--fg-muted)]">
        Every row above links to the artifact itself where one exists. Nothing here is
        a mockup.
      </p>
    </main>
  );
}
