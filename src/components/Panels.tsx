"use client";

import { useState } from "react";
import Link from "next/link";
import { cpProfiles, person } from "@/content/site";
import { Reveal, Tilt } from "./Chrome";
import UnifiedHeatmap from "./UnifiedHeatmap";
import UnifiedRatingChart from "./UnifiedRatingChart";
import OssHeadline from "@/components/OssHeadline";
import { STORE_USERS } from "@/content/store";
import { RELEASE_CITATIONS } from "@/content/citations";
import rawIssues from "@/content/oss-issues.json";
import { PHOTOS } from "@/content/photos";

export function CpSection() {
  const totalCitations = RELEASE_CITATIONS.length;
  const totalIssues = (rawIssues as unknown[]).length;
  const icpcPhotos = PHOTOS["icpc-2025"] ?? [];
  const [activePhoto, setActivePhoto] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* ICPC Regional On-Site Banner with Photos */}
      <Reveal>
        <div className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-soft)] p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-semibold">
                ICPC Regional Highlight
              </span>
              <h3 className="display mt-2 text-2xl sm:text-3xl font-medium">
                Rank 12 · ICPC Asia Amritapuri Multisite Regional 2025
              </h3>
              <p className="mt-2 text-sm text-[var(--fg-muted)] max-w-2xl leading-relaxed">
                Competed on-site at the Mysuru regional finals. Solved 4 algorithmic problems under strict 5-hour
                ACM contest constraints against India&apos;s top university teams.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--accent)]/50 bg-[var(--bg)] px-4 py-2 font-mono text-xs text-[var(--accent)] shrink-0">
              Mysuru Site · On-Site Finalist
            </div>
          </div>

          {/* ICPC Photo Strip */}
          {icpcPhotos.length > 0 && (
            <div className="mt-5 border-t border-[var(--accent)]/20 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] block mb-2 font-medium">
                On-Site Final Photos (Mysuru Venue)
              </span>
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
                {icpcPhotos.map((p, i) => (
                  <button
                    key={p.src}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className="group h-[110px] shrink-0 snap-start overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg)] transition-colors hover:border-[var(--accent)]"
                    style={{ width: Math.round((110 * p.w) / p.h) }}
                    aria-label={`ICPC Mysuru photo ${i + 1}`}
                  >
                    <img
                      src={p.src}
                      width={p.w}
                      height={p.h}
                      alt={`ICPC Mysuru photo ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePhoto !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
              onClick={() => setActivePhoto(null)}
              role="dialog"
              aria-modal="true"
            >
              <img
                src={icpcPhotos[activePhoto]?.src}
                alt="ICPC Mysuru Regional"
                className="max-h-[85vh] max-w-full rounded-xl border border-[var(--line)] object-contain"
              />
            </div>
          )}
        </div>
      </Reveal>

      {/* 4 CP Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cpProfiles.map((p, i) => {
          const raw = (p as unknown as { raw?: Record<string, number | string> }).raw;

          return (
            <Reveal key={p.site} delay={i * 0.06}>
              <Tilt className="glass h-full rounded-2xl p-6 flex flex-col justify-between">
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">
                      {p.site.toUpperCase()}
                    </div>
                    <span className="font-mono text-[10px] text-[var(--accent)] opacity-70 group-hover:opacity-100" aria-hidden>
                      ↗
                    </span>
                  </div>
                  <div className="display mt-3 text-3xl text-[var(--accent)]">{p.rank}</div>
                  <div className="mt-2 text-sm text-[var(--fg-muted)]">{p.detail}</div>

                  {/* LeetCode Sub-Breakdown */}
                  {p.site === "LeetCode" && raw?.easy !== undefined && (
                    <div className="mt-4 space-y-1.5 border-t border-[var(--line)] pt-3 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#00b8a3]">Easy</span>
                        <span className="tabular-nums text-[var(--fg)]">{raw.easy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#ffc01e]">Med</span>
                        <span className="tabular-nums text-[var(--fg)]">{raw.medium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#ff375f]">Hard</span>
                        <span className="tabular-nums text-[var(--fg)]">{raw.hard}</span>
                      </div>
                      {raw.topPercentage && (
                        <div className="pt-1 text-[10px] text-[var(--fg-muted)]">
                          Top {raw.topPercentage}% globally
                        </div>
                      )}
                    </div>
                  )}

                  {/* Codeforces Max vs Current */}
                  {p.site === "Codeforces" && raw?.maxRating !== undefined && (
                    <div className="mt-4 border-t border-[var(--line)] pt-3 text-[11px] font-mono">
                      <div className="flex justify-between text-[var(--fg-muted)]">
                        <span>Max Rating</span>
                        <span className="text-[var(--accent)] font-semibold">{raw.maxRating}</span>
                      </div>
                      <div className="flex justify-between text-[var(--fg-muted)] mt-1">
                        <span>Max Rank</span>
                        <span className="text-[var(--fg)] capitalize">{raw.maxRank}</span>
                      </div>
                    </div>
                  )}

                  {/* CodeChef Stars */}
                  {p.site === "CodeChef" && raw?.stars !== undefined && (
                    <div className="mt-4 border-t border-[var(--line)] pt-3 text-[11px] font-mono">
                      <div className="flex justify-between text-[var(--fg-muted)]">
                        <span>Division</span>
                        <span className="text-[var(--accent)] font-semibold">{raw.stars}★ Star</span>
                      </div>
                      <div className="flex justify-between text-[var(--fg-muted)] mt-1">
                        <span>Max Rating</span>
                        <span className="text-[var(--fg)]">{raw.maxRating}</span>
                      </div>
                    </div>
                  )}

                  {/* AtCoder Contests */}
                  {p.site === "AtCoder" && raw?.contests !== undefined && (
                    <div className="mt-4 border-t border-[var(--line)] pt-3 text-[11px] font-mono">
                      <div className="flex justify-between text-[var(--fg-muted)]">
                        <span>Rated Contests</span>
                        <span className="text-[var(--fg)]">{raw.contests}</span>
                      </div>
                      <div className="flex justify-between text-[var(--fg-muted)] mt-1">
                        <span>Highest</span>
                        <span className="text-[var(--accent)] font-semibold">{raw.maxRating}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 font-mono text-[10px] text-[var(--fg-muted)]">@{p.handle}</div>
                </a>
              </Tilt>
            </Reveal>
          );
        })}
      </div>

      {/* Multi-Platform Unified Rating Graph */}
      <Reveal>
        <UnifiedRatingChart />
      </Reveal>

      {/* Cross-Platform Activity Skyline & Heatmap */}
      <UnifiedHeatmap />

      {/* Engineering Impact by Numbers */}
      <Reveal>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <h3 className="text-lg font-medium">Engineering Impact by Numbers</h3>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                Directly checkable proof across open source systems, web store users, and production releases.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Link href="/oss/" className="group">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">Open Source</span>
              <OssHeadline variant="stack" className="mt-1 [&>p:first-child]:text-[var(--accent)]" />
            </Link>

            <Link href="/oss/" className="group">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">Release Citations</span>
              <div className="text-2xl sm:text-3xl font-medium mt-1 text-[var(--accent)] tabular-nums">
                {totalCitations} Releases
              </div>
              <div className="text-xs text-[var(--fg-muted)] mt-0.5 group-hover:text-[var(--fg)]">
                Cilium, Fedimint, SHAP, Pixi, OTel
              </div>
            </Link>

            <Link href="/oss/" className="group">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">Upstream Issues</span>
              <div className="text-2xl sm:text-3xl font-medium mt-1 text-[var(--accent)] tabular-nums">
                {totalIssues} Self-Sourced
              </div>
              <div className="text-xs text-[var(--fg-muted)] mt-0.5 group-hover:text-[var(--fg)]">
                diagnosed bugs & security flaws
              </div>
            </Link>

            <Link href="/projects/" className="group">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">Live Users</span>
              <div className="text-2xl sm:text-3xl font-medium mt-1 text-[var(--accent)] tabular-nums">
                {STORE_USERS}+ Users
              </div>
              <div className="text-xs text-[var(--fg-muted)] mt-0.5 group-hover:text-[var(--fg)]">
                active on Chrome Web Store
              </div>
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------------- résumé, embedded ---------------- */

export function ResumeEmbed() {
  const [open, setOpen] = useState(false);
  return (
    <Reveal>
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h3 className="text-lg font-medium">Résumé</h3>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Read it here, or take the PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {open ? "Hide" : "Read here"}
            </button>
            <a
              href={person.resumeHref}
              download
              className="rounded-full border border-[var(--accent)] px-5 py-2.5 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              Download PDF ↓
            </a>
          </div>
        </div>
        {open && (
          <object
            data={`${person.resumeHref}#view=FitH`}
            type="application/pdf"
            className="h-[80vh] w-full border-t border-[var(--line)]"
          >
            <div className="p-6 text-sm text-[var(--fg-muted)]">
              Your browser can&apos;t display PDFs inline.{" "}
              <a href={person.resumeHref} className="link text-[var(--accent)]">
                Download it instead ↓
              </a>
            </div>
          </object>
        )}
      </div>
    </Reveal>
  );
}
