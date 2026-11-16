"use client";

import Link from "next/link";
import { Reveal, Tilt } from "./Chrome";

interface CaseStudy {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  problem: string;
  solution: string;
  verification: string;
  badges: string[];
  href: string;
  meta: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "yes-wellness",
    tag: "01 / CONCURRENCY & BACKEND",
    title: "YES Wellness Platform",
    subtitle: "How I resolved a booking race condition in a production wellness backend",
    problem:
      "Under simultaneous peak bookings, concurrent requests evaluated slot availability before either committed, leading to duplicate reservations on identical slots.",
    solution:
      "Implemented PostgreSQL transactional row-level locking (`SELECT ... FOR UPDATE`), serializing concurrent bookings at the database tier without creating application-level bottlenecks.",
    verification:
      "Benchmarked using distributed k6 load testing under 5,000 concurrent virtual users. Zero double-booking collisions with sub-100ms P95 response latency.",
    badges: ["PostgreSQL", "Row-Level Locks", "k6 Load Testing", "Concurrency Control"],
    href: "/projects/yes-wellness-platform/",
    meta: "SCALE: 5K CONCURRENT USERS · P95 < 100MS",
  },
  {
    id: "sync-lis",
    tag: "02 / DISTRIBUTED STATE",
    title: "sync-lis & Mehfil Jukebox",
    subtitle: "Building a clock-aligned, multi-user jukebox over a local network",
    problem:
      "Traditional screen-share streaming incurred high bandwidth overhead and unacceptable audio latency across collaborative group listeners.",
    solution:
      "Engineered server-side media resolution with real-time WebSocket state broadcasts, client-side drift compensation calculating epoch offsets, and smooth late-join synchronization.",
    verification:
      "Validated against simulated packet jitter and network chaos. Shipped as a public Chrome Web Store extension used by active daily listeners.",
    badges: ["WebSockets", "Distributed Clock Sync", "Web Audio API", "Chrome Extension"],
    href: "/projects/sync-lis-and-the-mehfil-jukebox/",
    meta: "PROTOCOL: WEBSOCKETS · DRIFT COMPENSATION",
  },
  {
    id: "oss-infra",
    tag: "03 / SYSTEMS INFRASTRUCTURE",
    title: "Engineering in the Open",
    subtitle: "From first contribution to production code in major open-source infrastructure",
    problem:
      "Contributing to mature systems infrastructure (CNCF, Python ML cores, Bitcoin Lightning) requires understanding complex invariants, passing rigorous review, and preventing regressions.",
    solution:
      "Diagnosed edge-case failures through minimal reproduction scripts: Envoy XDS node IP parsing in Cilium, KernelExplainer DataFrame column mismatch in SHAP, and suggestions in Pixi.",
    verification:
      "51 accepted upstream PRs across 27 repositories, with contributions included and explicitly cited in 11 tagged production releases.",
    badges: ["Cilium (CNCF)", "rust-lightning", "SHAP", "11 Tagged Releases"],
    href: "/oss/",
    meta: "51 MERGED PRS · 27 REPOSITORIES · 11 RELEASES",
  },
];

export default function FeaturedCaseStudies() {
  return (
    <section className="border-t border-[var(--line)] pt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-semibold">
            02 / FEATURED ENGINEERING
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight">Flagship engineering case studies</h2>
          <p className="mt-1 text-sm text-[var(--fg-muted)] max-w-xl">
            In-depth breakdowns of real engineering challenges: concurrency, distributed state, and upstream systems infrastructure.
          </p>
        </div>
        <Link href="/projects/" className="font-mono text-xs text-[var(--accent)] hover:underline">
          View all 29 projects &rarr;
        </Link>
      </div>

      <div className="mt-8 space-y-6">
        {CASE_STUDIES.map((study, i) => (
          <Reveal key={study.id} delay={i * 0.08}>
            <Link href={study.href} className="group block">
              <Tilt className="rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 sm:p-8 transition-all hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)]/5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--accent)] font-semibold">
                      {study.tag}
                    </span>
                    <span className="text-[var(--fg-muted)]">·</span>
                    <span className="font-mono text-[11px] text-[var(--fg-muted)] tracking-wider">
                      {study.meta}
                    </span>
                  </div>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-0.5 font-mono text-[10px] text-[var(--accent)] font-medium">
                    Read Case Study &rarr;
                  </span>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_2fr]">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-medium text-[var(--fg)] group-hover:underline">
                      {study.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-[var(--fg-muted)] leading-snug">
                      {study.subtitle}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {study.badges.map((b) => (
                        <span
                          key={b}
                          className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 font-mono text-[10px] text-[var(--fg-muted)]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 text-xs text-[var(--fg-muted)] border-t border-[var(--line)]/50 pt-4 lg:border-t-0 lg:border-l lg:border-[var(--line)] lg:pl-6 lg:pt-0">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg)] font-semibold block mb-1">
                        The Problem
                      </span>
                      <p className="leading-relaxed">{study.problem}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] font-semibold block mb-1">
                        Technical Solution
                      </span>
                      <p className="leading-relaxed text-[var(--fg)]">{study.solution}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg)] font-semibold block mb-1">
                        Empirical Proof
                      </span>
                      <p className="leading-relaxed">{study.verification}</p>
                    </div>
                  </div>
                </div>
              </Tilt>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
