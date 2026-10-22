"use client";

/**
 * The one index of built things.
 *
 * Until 22 Oct 2026 there were two: /projects rendered `allProjects`, and /work
 * rendered the five arrays `allProjects` is derived from. Same nineteen items,
 * two routes, two layouts. Anyone who clicked both read the list twice and
 * concluded the site was padded. /work is gone; its only content this page did
 * not already have was the filter and the short list of other hackathons, and
 * both are here now.
 *
 * Filtering is client state and nothing else: no URL params, no router pushes.
 * The whole dataset is nineteen rows that ship in the page, so a filter is a
 * array operation, not a navigation.
 */

import { useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { CATEGORY_LABEL, DOMAIN_ORDER, type Project, type ProjectCategory } from "@/content/projects";

const CATEGORY_ORDER: ProjectCategory[] = [
  "government",
  "client",
  "institution",
  "extension",
  "hackathon",
];

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      data-cursor
      className={`rounded-full border px-3.5 py-1 font-mono text-[11px] transition-colors ${
        on
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--line)] text-[var(--fg-muted)] hover:border-[var(--accent)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProjectExplorer({
  projects,
  paged,
  otherHackathons,
}: {
  projects: Project[];
  paged: string[];
  otherHackathons: string[];
}) {
  const hasPage = useMemo(() => new Set(paged), [paged]);
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [domain, setDomain] = useState<string | null>(null);

  const ordered = useMemo(
    () =>
      [...projects].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
      ),
    [projects]
  );

  // Only offer a filter that some project actually matches. A chip that always
  // returns nothing is worse than no chip.
  const categories = CATEGORY_ORDER.filter((c) => ordered.some((p) => p.category === c));
  const domains = DOMAIN_ORDER.filter((d) => ordered.some((p) => p.domains.includes(d)));

  const shown = ordered.filter(
    (p) => (!category || p.category === category) && (!domain || p.domains.includes(domain))
  );

  const filtered = category !== null || domain !== null;

  return (
    <div>
      <div className="mt-10 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-14 font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">
            TYPE
          </span>
          <Chip on={!category} onClick={() => setCategory(null)}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c}
              on={category === c}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-14 font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">
            DOMAIN
          </span>
          <Chip on={!domain} onClick={() => setDomain(null)}>
            All
          </Chip>
          {domains.map((d) => (
            <Chip key={d} on={domain === d} onClick={() => setDomain(domain === d ? null : d)}>
              {d}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-[11px] tracking-[0.1em] text-[var(--fg-muted)]">
        {shown.length} of {ordered.length}
        {filtered ? (
          <>
            {"  ·  "}
            <button
              type="button"
              onClick={() => {
                setCategory(null);
                setDomain(null);
              }}
              className="link"
            >
              clear
            </button>
          </>
        ) : null}
      </p>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--fg-muted)]">
          Nothing is both of those.
        </p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProjectCard key={p.slug} p={p} hasPage={hasPage.has(p.slug)} />
          ))}
        </div>
      )}

      {(!category || category === "hackathon") && otherHackathons.length > 0 ? (
        <p className="mt-10 font-mono text-[11px] leading-loose text-[var(--fg-muted)]">
          Also entered, without a build worth its own card: {otherHackathons.join("  ·  ")}
        </p>
      ) : null}
    </div>
  );
}
