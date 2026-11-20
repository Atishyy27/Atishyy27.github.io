"use client";

import Link from "next/link";
import { person } from "@/content/site";
import { allProjects } from "@/content/projects";
import ProofMarquee from "@/components/ProofMarquee";
import SelectedImpact from "@/components/SelectedImpact";
import FeaturedCaseStudies from "@/components/FeaturedCaseStudies";
import CitationsSection from "@/components/CitationsSection";
import HomeResearchCards from "@/components/HomeResearchCards";
import ExperienceHighlights from "@/components/ExperienceHighlights";
import EngineeringPhilosophy from "@/components/EngineeringPhilosophy";
import StoreShelf from "@/components/StoreShelf";
import LiveCounts from "@/components/LiveCounts";
import UnifiedHeatmap from "@/components/UnifiedHeatmap";
import { ProjectGraphMount } from "@/components/SceneMount";
import { nodes, edges, sharedTech } from "@/content/graph";
import OssHeadline from "@/components/OssHeadline";
import { ACTIVITY } from "@/content/activity";
import { capture } from "@/lib/posthog";
import { Reveal, Tilt } from "@/components/Chrome";

const INDEX: [string, string, string][] = [
  ["Projects", "/projects/", "Every build, filterable, with a link to the artifact where one is public"],
  ["Open source", "/oss/", "Live pull request activity, pulled from GitHub"],
  ["Stats", "/stats/", "Competitive programming and a year of contributions"],
  ["Writing", "/writing/", "Essays and build-log notes on what broke and what it cost"],
  ["About", "/about/", "Experience, research, education, résumé"],
];

const PRIMARY_SOCIALS = new Set(["GitHub", "LinkedIn", "X"]);

export default function Home() {
  return (
    <main className="w-full pt-28 sm:pt-36">
      {/* ---------------- 1. HERO — IDENTITY & POSITIONING ---------------- */}
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          {/* Left Column: Core Positioning */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 font-mono text-xs text-[var(--accent)] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Systems Engineer · Product Builder · Open Source
            </div>

            <h1 className="display mt-4 text-[length:var(--step-display)] leading-none tracking-tight">
              {person.name}
            </h1>

            <p className="mt-5 text-xl sm:text-2xl font-medium text-[var(--fg)] leading-snug">
              I build things people can use without signing up for anything.
            </p>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[var(--fg-muted)]">
              I build software that survives contact with production. From backend systems handling thousands of concurrent users to developer tools used beyond my own team, I enjoy taking difficult engineering problems from first principles to shipped products.
            </p>

            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[var(--fg-muted)]">
              Built government platforms, contributed fixes to major open-source infrastructure (Cilium, rust-lightning, SHAP, Pixi), published distributed systems research, and shipped products used by real people. Currently pursuing Mechanical Engineering at SGSITS Indore.
            </p>

            {/* Proof Metric Highlights */}
            <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--accent)]">
              <span className="rounded bg-[var(--bg-raised)] border border-[var(--line)] px-2.5 py-1">
                <OssHeadline variant="inline" />
              </span>
              <span className="rounded bg-[var(--bg-raised)] border border-[var(--line)] px-2.5 py-1">
                2 government apps shipped
              </span>
              <span className="rounded bg-[var(--bg-raised)] border border-[var(--line)] px-2.5 py-1">
                ICPC Asia Regionalist
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("case-studies")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-5 py-2 font-medium text-[#06181a] transition-all hover:opacity-90 cursor-pointer"
              >
                Explore Selected Work &darr;
              </button>
              <a
                href={person.resumeHref}
                data-track="home:resume"
                onClick={() => capture("resume_click", { from: "home" })}
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-[var(--bg-raised)] px-5 py-2 font-medium text-[var(--fg)] transition-all hover:border-[var(--accent)]"
              >
                Download Résumé, PDF ↗
              </a>
              <a
                href={`mailto:${person.email}`}
                data-track="home:email"
                onClick={() => capture("email_click", { from: "home" })}
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-transparent px-4 py-2 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
              >
                Get in touch
              </a>
            </div>

            {/* Socials & Location */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-[var(--fg-muted)]">
              <span className="text-[var(--fg)]">{person.location}</span>
              <span>·</span>
              {person.socials
                .filter((s) => PRIMARY_SOCIALS.has(s.label))
                .map((s) => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
                    {s.label} ↗
                  </a>
                ))}
            </div>
          </div>

          {/* Right Column: Restrained Engineering Telemetry Visual */}
          <Reveal delay={0.1}>
            <Tilt className="rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#3fb950] animate-pulse" />
                  SYSTEMS TELEMETRY
                </div>
                <span className="font-mono text-[10px] text-[var(--fg-muted)] uppercase">
                  ACTIVE DEPLOYMENTS
                </span>
              </div>

              <div className="mt-5 space-y-4 font-mono text-xs">
                <div className="flex items-baseline justify-between border-b border-[var(--line)]/50 pb-2.5">
                  <span className="text-[var(--fg-muted)]">OPEN SOURCE</span>
                  <OssHeadline variant="compact" className="uppercase text-[var(--fg)] font-medium" />
                </div>
                <div className="flex items-baseline justify-between border-b border-[var(--line)]/50 pb-2.5">
                  <span className="text-[var(--fg-muted)]">RELEASE CITATIONS</span>
                  <span className="text-[var(--accent)] font-medium">CILIUM · SHAP · PIXI</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-[var(--line)]/50 pb-2.5">
                  <span className="text-[var(--fg-muted)]">CONCURRENCY BENCH</span>
                  <span className="text-[var(--fg)] font-medium">5K USERS (P95 &lt; 100MS)</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-[var(--line)]/50 pb-2.5">
                  <span className="text-[var(--fg-muted)]">RESEARCH AUC-ROC</span>
                  <span className="text-[#3fb950] font-medium">94.2% (NON-IID FL)</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-[var(--line)]/50 pb-2.5">
                  <span className="text-[var(--fg-muted)]">ACM ICPC FINALS</span>
                  <span className="text-[var(--fg)] font-medium">RANK 12 (AMRITAPURI)</span>
                </div>
                <div className="flex items-baseline justify-between pb-1">
                  <span className="text-[var(--fg-muted)]">GITHUB ACTIVITY (LAST YEAR)</span>
                  <span className="text-[var(--accent)] font-medium">
                    {ACTIVITY.meta.github.total.toLocaleString("en-US")} ({ACTIVITY.meta.github.days} DAYS)
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-[11px] font-mono text-[var(--fg-muted)] flex items-center justify-between">
                <span>STATUS: READY FOR PRODUCTION</span>
                <span className="text-[#3fb950]">● LIVE</span>
              </div>
            </Tilt>
          </Reveal>
        </div>
      </div>

      {/* ---------------- 2. PROOF OF WORK TICKER ---------------- */}
      <div className="mt-16 w-full">
        <ProofMarquee />
      </div>

      {/* ---------------- MAIN CURATED BODY ---------------- */}
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 space-y-20 mt-16">
        {/* ---------------- 3. SELECTED IMPACT ---------------- */}
        <SelectedImpact />

        {/* ---------------- 4. FEATURED CASE STUDIES ---------------- */}
        <div id="case-studies">
          <FeaturedCaseStudies />
        </div>

        {/* ---------------- 5. ENGINEERING IN THE OPEN ---------------- */}
        <CitationsSection initialLimit={4} className="border-t border-[var(--line)] pt-16" />

        {/* ---------------- 6. SYSTEMS RESEARCH ---------------- */}
        <HomeResearchCards />

        {/* ---------------- 7. PROFESSIONAL EXPERIENCE ---------------- */}
        <ExperienceHighlights />

        {/* ---------------- 8. ENGINEERING PHILOSOPHY ---------------- */}
        <EngineeringPhilosophy />

        {/* ---------------- 9. THE 5 INSTALLABLES RIGHT NOW ---------------- */}
        <div className="border-t border-[var(--line)] pt-16">
          <StoreShelf />
        </div>

        {/* ---------------- 10. ENGINEERING ACTIVITY & SKYLINE ---------------- */}
        <section className="border-t border-[var(--line)] pt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <div>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-semibold">
                06 / ENGINEERING ACTIVITY
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight">One year of building</h2>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                Cross-platform verifiable record across GitHub commits, Codeforces contests, and LeetCode problem solving.
              </p>
            </div>
            <Link href="/stats/" className="font-mono text-xs text-[var(--accent)] hover:underline">
              Inspect multi-platform ratings &rarr;
            </Link>
          </div>

          <div className="mt-8">
            <LiveCounts />
          </div>
          <div className="mt-6">
            <UnifiedHeatmap />
          </div>
        </section>

        {/* ---------------- 11. HOW THE WORK CONNECTS ---------------- */}
        <div className="border-t border-[var(--line)] pt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <div>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-semibold">
                07 / SYSTEMS TOPOLOGY
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight">How the work connects</h2>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                <Link href="/projects/" className="link">
                  {nodes.length} projects, {edges.length} shared-technology links,{" "}
                  {sharedTech.length} technologies used more than once
                </Link>
              </p>
            </div>
          </div>
          <div className="mt-6">
            <ProjectGraphMount />
          </div>
        </div>

        {/* ---------------- 12. EVERYTHING ELSE & CONTACT CLOSING ---------------- */}
        <section className="border-t border-[var(--line)] pt-16">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-semibold">
            08 / DIRECTORY & ARCHIVE
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight">Explore the full archive</h2>
          
          <div className="mt-8 grid gap-2">
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

          {/* Strong Closing Contact Banner */}
          <div className="mt-16 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-soft)] p-8 sm:p-12 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
              HAVE AN INTERESTING ENGINEERING PROBLEM?
            </span>
            <h3 className="mt-3 text-2xl sm:text-4xl font-medium tracking-tight text-[var(--fg)]">
              I&apos;d love to hear about it.
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[var(--fg-muted)] max-w-lg mx-auto">
              Open to systems engineering, backend infrastructure, and open-source opportunities.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href={`mailto:${person.email}`}
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-6 py-2.5 font-medium text-[#06181a] hover:opacity-90 transition-opacity"
              >
                Get in touch &rarr;
              </a>
              <a
                href={person.resumeHref}
                className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] bg-[var(--bg)] px-6 py-2.5 font-medium text-[var(--fg)] hover:border-[var(--accent)] transition-colors"
              >
                Download Résumé, PDF ↗
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
