"use client";

import Link from "next/link";
import { person, proof } from "@/content/site";
import { featuredProjects, allProjects } from "@/content/projects";
import UnifiedHeatmap from "@/components/UnifiedHeatmap";
import LiveCounts from "@/components/LiveCounts";
import { ProjectGraphMount } from "@/components/SceneMount";
import { nodes, edges, sharedTech } from "@/content/graph";

// The home page is an index, not the whole site. Everything used to live on one
// scroll, which is why changes elsewhere were invisible from here.
//
// It carries two live elements on purpose. Every counted claim on this page is
// fetched from the platform that owns it at page load, so there is no number
// here that can quietly go stale, and nothing to keep in sync by hand.
const INDEX: [string, string, string][] = [
  ["Projects", "/projects/", "Everything built, with a link to the artifact on every row"],
  ["Work", "/work/", "Shipped platforms, products and hackathon systems"],
  ["Open source", "/oss/", "Live pull request activity, pulled from GitHub"],
  ["Stats", "/stats/", "Competitive programming and a year of contributions"],
  ["Build log", "/log/", "Notes on what was built, and a question box over the site"],
  ["Journal", "/journal/", "Dated, first person, nothing invented"],
  ["About", "/about/", "Experience, research, education, résumé"],
];

export default function Home() {
  return (
    <main className="w-full pt-32">
      {/* Reading column: name, blurb, the fixed facts. */}
      <div className="mx-auto w-full max-w-[var(--measure)] px-6 sm:px-8">
        <h1 className="display text-[length:var(--step-display)]">{person.name}</h1>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-[var(--fg-muted)]">
          {person.blurb}
        </p>

        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[length:var(--step-small)]">
          {person.socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="link">
                {s.label}
              </a>
            </li>
          ))}
        </ul>

      </div>

      {/* The core element. Wider than the reading measure: it needs the room.
          The sentence under it is static on purpose. The canvas is client-only,
          so anything rendered inside it is absent from the HTML, and these are
          the facts the element exists to show. */}
      <div className="mx-auto mt-16 w-full max-w-5xl px-6 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-[length:var(--step-h2)] font-medium">How the work connects</h2>
          <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">
            <Link href="/projects/" className="link">
              {nodes.length} projects, {edges.length} shared-technology links,{" "}
              {sharedTech.length} technologies used more than once
            </Link>
          </p>
        </div>
        <ProjectGraphMount />
      </div>

      <div className="mx-auto w-full max-w-[var(--measure)] px-6 sm:px-8">
        {/* Counted facts, under the core element. */}
        <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-px sm:grid-cols-4">
          {proof.map((p) => (
            <Link
              key={p.stat}
              href={p.href}
              className="group border-t border-[var(--line)] pt-4 transition-colors hover:border-[var(--accent)]"
            >
              <dt className="text-2xl font-medium tracking-tight">{p.stat}</dt>
              <dd className="mt-1 text-[length:var(--step-small)] text-[var(--fg-muted)] group-hover:text-[var(--fg)]">
                {p.label}
              </dd>
            </Link>
          ))}
        </dl>
      </div>

      {/* Wider band: the two live elements need more than the reading measure.
          53 week-columns do not fit in 46rem, and squeezing them into a scroller
          on a 1440px screen wastes the page. */}
      <div className="mx-auto mt-20 w-full max-w-5xl px-6 sm:px-8">
        <LiveCounts />
        <div className="mt-6">
          <UnifiedHeatmap />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[var(--measure)] px-6 sm:px-8">
        <section className="mt-24">
          <h2 className="text-[length:var(--step-h2)] font-medium">Selected</h2>
          <div className="mt-6">
            {featuredProjects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}/`} className="row group">
                <span className="row-kind">{p.org ?? "Project"}</span>
                <span>
                  <span className="row-name">{p.name}</span>
                  <span className="row-line block">{p.story || p.blurb}</span>
                </span>
                <span className="row-kind whitespace-nowrap">
                  {p.links[0]?.label ?? (p.privateNote ? "Private" : "")}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-[length:var(--step-small)]">
            <Link href="/projects/" className="link">
              See all {allProjects.length} projects
            </Link>
          </p>
        </section>

        <section className="mt-20">
          <h2 className="text-[length:var(--step-h2)] font-medium">Everything else</h2>
          <div className="mt-6">
            {INDEX.map(([label, href, desc]) => (
              <Link key={href} href={href} className="row group">
                <span className="row-kind" />
                <span>
                  <span className="row-name">{label}</span>
                  <span className="row-line block">{desc}</span>
                </span>
                <span className="row-kind">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
