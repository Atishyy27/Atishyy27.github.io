"use client";

import { useState } from "react";
import { CP_PROFILES } from "@/content/cp";

export default function UnifiedRatingChart() {
  const [activeTab, setActiveTab] = useState<"ratings" | "contests">("ratings");

  // Normalized visual representation across different platform rating formulas:
  // CodeChef: max ~2800, 1800+ is 4-star (Div 2)
  // LeetCode: max ~3500, 1786 is Knight (Top 9%)
  // Codeforces: max ~3800, 1539 is Specialist (Div 2)
  // AtCoder: max ~4000, 641 is Kyu 6 (Brown)
  const platforms = [
    {
      name: "CodeChef",
      current: 1809,
      peak: 1838,
      rank: "4★ Star",
      division: "Division 2",
      percentile: "Top 4.2%",
      color: "#a371f7",
      contests: 38,
      handle: "fever_tub_71",
      href: "https://www.codechef.com/users/fever_tub_71",
      scaleMax: 2200,
    },
    {
      name: "LeetCode",
      current: 1786,
      peak: 1786,
      rank: "Knight",
      division: "Top 9.03% Global",
      percentile: "Top 9.0%",
      color: "#ffa116",
      contests: 84,
      handle: "atishayjain78001",
      href: "https://leetcode.com/u/atishayjain78001/",
      scaleMax: 2200,
    },
    {
      name: "Codeforces",
      current: 1314,
      peak: 1539,
      rank: "Specialist (Peak)",
      division: "Pupil / Specialist",
      percentile: "Div 2/3",
      color: "#2ba3a3",
      contests: 42,
      handle: "sethatishayjain",
      href: "https://codeforces.com/profile/sethatishayjain",
      scaleMax: 2200,
    },
    {
      name: "AtCoder",
      current: 641,
      peak: 641,
      rank: "Kyu 6",
      division: "ABC Regular",
      percentile: "Brown (Kyu 6)",
      color: "#3fb950",
      contests: 9,
      handle: "fever_tub_71",
      href: "https://atcoder.jp/users/fever_tub_71",
      scaleMax: 1200,
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-medium">Unified Competitive Programming Rating Graph</h3>
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--accent)] font-medium">
              4 Platforms
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Normalized rating bands, peak benchmarks, and contest history consolidated into a single comparison.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ratings")}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              activeTab === "ratings"
                ? "bg-[var(--accent)] text-[#06181a] font-medium"
                : "border border-[var(--line)] bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Ratings & Benchmarks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contests")}
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              activeTab === "contests"
                ? "bg-[var(--accent)] text-[#06181a] font-medium"
                : "border border-[var(--line)] bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Contest Volume
          </button>
        </div>
      </div>

      {activeTab === "ratings" ? (
        <div className="mt-6 space-y-6">
          {platforms.map((p) => {
            const currentPct = Math.min(100, Math.round((p.current / p.scaleMax) * 100));
            const peakPct = Math.min(100, Math.round((p.peak / p.scaleMax) * 100));

            return (
              <div key={p.name} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm sm:text-base hover:text-[var(--accent)] hover:underline"
                    >
                      {p.name} <span className="font-mono text-xs opacity-50" aria-hidden>↗</span>
                    </a>
                    <span className="rounded bg-[var(--bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--fg-muted)] border border-[var(--line)]">
                      {p.rank}
                    </span>
                  </div>
                  <div className="font-mono text-xs tabular-nums text-[var(--fg)]">
                    <span className="font-semibold text-sm">{p.current}</span>
                    {p.peak > p.current && (
                      <span className="text-[var(--fg-muted)] text-[11px] ml-1.5">(peak {p.peak})</span>
                    )}
                    <span className="text-[var(--fg-muted)] text-[11px] ml-2 font-normal hidden sm:inline">
                      · {p.division}
                    </span>
                  </div>
                </div>

                {/* Progress bar with peak marker */}
                <div className="relative h-3 w-full rounded-full bg-[var(--line)] overflow-hidden">
                  {/* Current Rating */}
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${currentPct}%`,
                      backgroundColor: p.color,
                      opacity: 0.9,
                    }}
                  />
                  {/* Peak Marker if higher than current */}
                  {p.peak > p.current && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white opacity-80"
                      style={{ left: `${peakPct}%` }}
                      title={`Peak: ${p.peak}`}
                    />
                  )}
                </div>

                <div className="flex justify-between font-mono text-[10px] text-[var(--fg-muted)]">
                  <span>0</span>
                  <span className="hidden sm:inline">Baseline</span>
                  <span>{p.percentile}</span>
                  <span>{p.scaleMax}+</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {platforms.map((p) => (
              <div key={p.name} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">{p.name}</span>
                <div className="display mt-1 text-2xl sm:text-3xl font-medium text-[var(--accent)] tabular-nums">
                  {p.contests}
                </div>
                <div className="mt-1 text-xs text-[var(--fg-muted)]">rated rounds</div>
                <div className="mt-2 font-mono text-[10px] text-[var(--fg-muted)] truncate">@{p.handle}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
            Total of 173 rated algorithmic contests across LeetCode Weekly/Biweekly, Codeforces Rounds, CodeChef Starters, and AtCoder Beginner Contests.
          </p>
        </div>
      )}
    </div>
  );
}
