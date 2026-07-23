"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { Reveal } from "./Chrome";
import { useActivity, buildWeeks, PROFILE_URL } from "@/lib/activity";

/* ==================================================================
   One heatmap, every platform.

   Instead of a GitHub square next to a LeetCode square, this sums daily
   activity from GitHub + Codeforces + LeetCode into a single year-grid:
   one cell per day, its intensity = everything shipped or solved that
   day, everywhere.

   Two views over identical numbers: the flat grid, and the same year
   extruded into a skyline you can orbit. Any source that fails is
   reported as "unavailable" and skipped, never faked as zeros.
================================================================== */

const Skyline = dynamic(() => import("./Skyline"), { ssr: false });

const COLORS = ["#121821", "#0e4f52", "#12797d", "#2ba3a3", "#4fd0d0"];

export default function UnifiedHeatmap() {
  const { merged, perDay, sources, loading } = useActivity();
  const [view, setView] = useState<"grid" | "skyline">("grid");
  const [hover, setHover] = useState<{ date: string; x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { weeks, max, grandTotal, monthLabels } = useMemo(() => buildWeeks(merged), [merged]);

  const level = (c: number) => {
    if (c <= 0) return 0;
    const r = c / (max || 1);
    if (r > 0.66) return 4;
    if (r > 0.33) return 3;
    if (r > 0.12) return 2;
    return 1;
  };

  return (
    <Reveal>
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">One year, every platform</h3>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              GitHub commits, Codeforces submissions and LeetCode solves, summed into a single day.
            </p>
          </div>
          <div className="text-right">
            <div className="display text-3xl text-[var(--accent)]">
              {loading ? "…" : grandTotal.toLocaleString()}
            </div>
            <div className="font-mono text-[10px] tracking-[0.15em] text-[var(--fg-muted)]">
              CONTRIBUTIONS · 12 MONTHS
            </div>
          </div>
        </div>

        {/* view switch */}
        <div className="mt-5 inline-flex rounded-full border border-[var(--line)] p-1">
          {(["grid", "skyline"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`rounded-full px-4 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition ${
                view === v ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {v === "grid" ? "grid" : "3D skyline"}
            </button>
          ))}
        </div>

        {view === "skyline" ? (
          <div className="mt-5">
            {loading ? (
              <div className="grid h-[380px] place-items-center rounded-xl border border-[var(--line)] font-mono text-xs text-[var(--fg-muted)]">
                building the city…
              </div>
            ) : (
              <Skyline merged={merged} />
            )}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="relative inline-block min-w-full">
              <div className="mb-1 flex gap-[3px] pl-1 font-mono text-[9px] text-[var(--fg-muted)]">
                {weeks.map((_, ci) => {
                  const lab = monthLabels.find((m) => m.col === ci);
                  return <span key={ci} className="w-[11px]">{lab ? lab.label : ""}</span>;
                })}
              </div>
              <div ref={gridRef} className="flex gap-[3px]">
                {weeks.map((w, ci) => (
                  <div key={ci} className="flex flex-col gap-[3px]">
                    {w.map((cell) => (
                      <div
                        key={cell.date}
                        onMouseEnter={(e) => {
                          const host = gridRef.current?.getBoundingClientRect();
                          const r = e.currentTarget.getBoundingClientRect();
                          setHover({
                            date: cell.date,
                            x: r.left - (host?.left ?? 0) + 6,
                            y: r.top - (host?.top ?? 0),
                          });
                        }}
                        onMouseLeave={() => setHover(null)}
                        className="h-[11px] w-[11px] rounded-[2px] transition-transform hover:scale-[1.6]"
                        style={{ background: COLORS[level(cell.count)] }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {hover && (
                <div
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--accent)] bg-[#0b0f16f5] px-3 py-2 font-mono text-[10px]"
                  style={{ left: hover.x, top: hover.y - 6 }}
                >
                  <div className="text-[var(--fg)]">
                    {merged[hover.date] ?? 0} on {hover.date}
                  </div>
                  {perDay[hover.date] &&
                    Object.entries(perDay[hover.date]).map(([k, v]) => (
                      <div key={k} className="text-[var(--fg-muted)]">
                        {sources.find((s) => s.key === k)?.label}: {v}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* legend + source status */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {sources.map((s) => (
              <a
                key={s.key}
                href={PROFILE_URL[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: s.ok ? s.color : "#3a4453" }} />
                <span className={s.ok ? "text-[var(--fg-muted)]" : "text-[#5a6472] line-through"}>
                  {s.label}
                  {s.ok ? ` ${s.total.toLocaleString()}` : " unavailable"}
                </span>
              </a>
            ))}
          </div>
          {view === "grid" && (
            <div className="flex items-center gap-1 font-mono text-[9px] text-[var(--fg-muted)]">
              less
              {COLORS.map((c, i) => (
                <span key={i} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: c }} />
              ))}
              more
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}
