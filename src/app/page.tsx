"use client";

import Link from "next/link";
import { person, proof } from "@/content/site";
import { allProjects } from "@/content/projects";
import UnifiedHeatmap from "@/components/UnifiedHeatmap";
import LiveCounts from "@/components/LiveCounts";
import StoreShelf from "@/components/StoreShelf";
import { ProjectGraphMount } from "@/components/SceneMount";
import { nodes, edges, sharedTech } from "@/content/graph";
import { capture } from "@/lib/posthog";

/**
 * Rebuilt 27 Oct 2026. What changed and why, because the old order was the
 * problem rather than the pieces.
 *
 * It used to open with a WebGL graph of how the projects connect. That is the
 * most technically interesting thing on the page and the least useful one: it
 * is unreadable on a phone, it says nothing until you have already decided to
 * care, and it was standing between a visitor and every clickable artifact he
 * owns. The graph is not deleted, because the plan says it stays 3D or moves.
 * It moved. It is now near the bottom, where someone who is already interested
 * can play with it.
 *
 * In its place: the five things a stranger can install in one click. Two Play
 * Store apps, three Chrome extensions. That is his own stated order and it is
 * also the honest argument. "Scalable systems from scratch" is a sentence
 * anyone can write; "here is the install button, 394 people pressed it" is not.
 *
 * The "Selected" block is gone. It listed three projects by a `featured` flag
 * and duplicated what the shelf and /projects already say better.
 *
 * The email address is now on the page as text. It was reachable only by
 * walking to /about and opening a form, which is a strange thing to do to the
 * one action the whole site exists to produce.
 */

const INDEX: [string, string, string][] = [
  ["Projects", "/projects/", "Every build, filterable, with a link to the artifact where one is public"],
  ["Open source", "/oss/", "Live pull request activity, pulled from GitHub"],
  ["Stats", "/stats/", "Competitive programming and a year of contributions"],
  ["Writing", "/writing/", "Essays and build-log notes on what broke and what it cost"],
  ["About", "/about/", "Experience, research, education, résumé"],
];

/** The handles worth a stranger's click. The rest live on /stats. */
const PRIMARY_SOCIALS = new Set(["GitHub", "LinkedIn", "X"]);

export default function Home() {
  return (
    <main className="w-full pt-32">
      {/* ---------------- hero ---------------- */}
      <div className="mx-auto w-full max-w-[var(--measure)] px-6 sm:px-8">
        <h1 className="display text-[length:var(--step-display)]">{person.name}</h1>

        {/* One sentence, and every noun in it is checkable further down the
            page. No adjectives: "product sense" and "scalable" are claims a
            reader has to take on trust, and a count with a link is not. */}
        <p className="mt-6 text-xl leading-relaxed">
          I build things people can use without signing up for anything.
        </p>
        <p className="mt-4 max-w-prose leading-relaxed text-[var(--fg-muted)]">
          {person.blurb}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[length:var(--step-small)]">
          {/* Shown as text, not hidden behind the word "Contact". Someone who
              wants to write to him should not have to find a form first. */}
          <a
            href={`mailto:${person.email}`}
            data-track="home:email"
            onClick={() => capture("email_click", { from: "home" })}
            className="rounded-full bg-[var(--accent)] px-4 py-2 font-medium text-[#06181a] transition-opacity hover:opacity-90"
          >
            {person.email}
          </a>
          <a
            href={person.resumeHref}
            data-track="home:resume"
            onClick={() => capture("resume_click", { from: "home" })}
            className="link"
          >
            Résumé, PDF
          </a>
          {person.socials
            .filter((s) => PRIMARY_SOCIALS.has(s.label))
            .map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="link">
                {s.label}
              </a>
            ))}
          <span className="text-[var(--fg-muted)]">{person.location}</span>
        </div>
      </div>

      {/* ---------------- the argument ---------------- */}
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-8">
        <StoreShelf />
      </div>

      {/* ---------------- counted facts ---------------- */}
      <div className="mx-auto w-full max-w-[var(--measure)] px-6 sm:px-8">
        <dl className="mt-20 grid grid-cols-2 gap-x-6 gap-y-px sm:grid-cols-4">
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

      {/* ---------------- the live record ---------------- */}
      <div className="mx-auto mt-20 w-full max-w-5xl px-6 sm:px-8">
        <LiveCounts />
        <div className="mt-6">
          <UnifiedHeatmap />
        </div>
      </div>

      {/* ---------------- the graph, moved ---------------- */}
      <div className="mx-auto mt-24 w-full max-w-5xl px-6 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-[length:var(--step-h2)] font-medium">How the work connects</h2>
          <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">
            <Link href="/projects/" className="link">
              {nodes.length} projects, {edges.length} shared-technology links,{" "}
              {sharedTech.length} technologies used more than once
            </Link>
          </p>
        </div>
        {/* The sentence above is static on purpose: the canvas is client-only,
            so nothing rendered inside it exists in the HTML, and these are the
            facts the element is here to show. */}
        <ProjectGraphMount />
      </div>

      {/* ---------------- index ---------------- */}
      <div className="mx-auto w-full max-w-[var(--measure)] px-6 sm:px-8">
        <section className="mt-24">
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
          <p className="mt-6 text-[length:var(--step-small)]">
            <Link href="/projects/" className="link">
              See all {allProjects.length} projects
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
