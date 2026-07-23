"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal } from "./Chrome";

/* ==================================================================
   One heatmap, every platform.

   Instead of a GitHub square next to a LeetCode square, this fetches
   daily activity from GitHub + Codeforces + LeetCode and SUMS it into
   a single year-grid: one cell per day, its intensity = everything he
   shipped/solved that day, everywhere.

   All fetches are client-side against CORS-open public endpoints. Any
   source that fails is skipped and reported — the grid still renders
   from whatever loaded. Nothing is invented; a dead source shows as
   "unavailable", never as zeros pretending to be real.
================================================================== */

const HANDLES = {
  github: "Atishyy27",
  codeforces: "sethatishayjain",
  leetcode: "atishayjain78001",
};

type DayMap = Record<string, number>;
type Source = { key: string; label: string; total: number; ok: boolean; color: string };

const DAYS = 371; // 53 weeks

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p;
  } finally {
    clearTimeout(t);
  }
}

async function fetchGitHub(): Promise<DayMap> {
  // deno.dev proxy returns weeks[] of days[] with { date, contributionCount }
  const r = await withTimeout(fetch(`https://github-contributions-api.deno.dev/${HANDLES.github}.json`), 9000);
  const j = await r.json();
  const out: DayMap = {};
  const weeks: { date: string; contributionCount: number }[][] = j.contributions ?? [];
  for (const week of weeks) for (const d of week) out[d.date] = d.contributionCount;
  return out;
}

async function fetchCodeforces(): Promise<DayMap> {
  const r = await withTimeout(
    fetch(`https://codeforces.com/api/user.status?handle=${HANDLES.codeforces}&from=1&count=5000`),
    9000
  );
  const j = await r.json();
  const out: DayMap = {};
  if (j.status !== "OK") throw new Error("cf");
  for (const s of j.result ?? []) {
    const d = iso(new Date(s.creationTimeSeconds * 1000));
    out[d] = (out[d] ?? 0) + 1;
  }
  return out;
}

async function fetchLeetCode(): Promise<DayMap> {
  // no official CORS endpoint; community proxy, may cold-start or fail
  const r = await withTimeout(
    fetch(`https://alfa-leetcode-api.onrender.com/${HANDLES.leetcode}/calendar`),
    9000
  );
  const j = await r.json();
  const cal = JSON.parse(j.submissionCalendar ?? "{}") as Record<string, number>;
  const out: DayMap = {};
  for (const [ts, n] of Object.entries(cal)) {
    out[iso(new Date(Number(ts) * 1000))] = n;
  }
  return out;
}

export default function UnifiedHeatmap() {
  const [merged, setMerged] = useState<DayMap>({});
  const [perDay, setPerDay] = useState<Record<string, Record<string, number>>>({});
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState<{ date: string; x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const defs = [
      { key: "github", label: "GitHub", fn: fetchGitHub, color: "#3fbdbd" },
      { key: "codeforces", label: "Codeforces", fn: fetchCodeforces, color: "#7c9cff" },
      { key: "leetcode", label: "LeetCode", fn: fetchLeetCode, color: "#ff9d5c" },
    ];
    Promise.allSettled(defs.map((d) => d.fn())).then((res) => {
      const sum: DayMap = {};
      const breakdown: Record<string, Record<string, number>> = {};
      const srcs: Source[] = [];
      res.forEach((r, i) => {
        const def = defs[i];
        if (r.status === "fulfilled") {
          let total = 0;
          for (const [date, n] of Object.entries(r.value)) {
            sum[date] = (sum[date] ?? 0) + n;
            (breakdown[date] ??= {})[def.key] = n;
            total += n;
          }
          srcs.push({ key: def.key, label: def.label, total, ok: true, color: def.color });
        } else {
          srcs.push({ key: def.key, label: def.label, total: 0, ok: false, color: def.color });
        }
      });
      setMerged(sum);
      setPerDay(breakdown);
      setSources(srcs);
      setLoading(false);
    });
  }, []);

  const { weeks, max, grandTotal, monthLabels } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (DAYS - 1));
    // align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const cells: { date: string; count: number }[] = [];
    let mx = 0;
    let total = 0;
    const d = new Date(start);
    while (d <= today) {
      const key = iso(d);
      const count = merged[key] ?? 0;
      cells.push({ date: key, count });
      mx = Math.max(mx, count);
      total += count;
      d.setDate(d.getDate() + 1);
    }

    const wk: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) wk.push(cells.slice(i, i + 7));

    // month labels above the columns
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    wk.forEach((w, ci) => {
      const first = w[0];
      if (!first) return;
      const m = new Date(first.date).getMonth();
      if (m !== lastMonth) {
        labels.push({ col: ci, label: new Date(first.date).toLocaleString("en", { month: "short" }) });
        lastMonth = m;
      }
    });

    return { weeks: wk, max: mx, grandTotal: total, monthLabels: labels };
  }, [merged]);

  const level = (c: number) => {
    if (c <= 0) return 0;
    const r = c / (max || 1);
    if (r > 0.66) return 4;
    if (r > 0.33) return 3;
    if (r > 0.12) return 2;
    return 1;
  };
  const COLORS = ["#121821", "#0e4f52", "#12797d", "#2ba3a3", "#4fd0d0"];

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

        {/* grid */}
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="relative inline-block min-w-full">
            <div className="mb-1 flex gap-[3px] pl-1 font-mono text-[9px] text-[var(--fg-muted)]">
              {weeks.map((_, ci) => {
                const lab = monthLabels.find((m) => m.col === ci);
                return (
                  <span key={ci} className="w-[11px]">
                    {lab ? lab.label : ""}
                  </span>
                );
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

        {/* legend + source status */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {sources.map((s) => (
              <a
                key={s.key}
                href={
                  s.key === "github"
                    ? `https://github.com/${HANDLES.github}`
                    : s.key === "codeforces"
                    ? `https://codeforces.com/profile/${HANDLES.codeforces}`
                    : `https://leetcode.com/u/${HANDLES.leetcode}/`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.ok ? s.color : "#3a4453" }}
                />
                <span className={s.ok ? "text-[var(--fg-muted)]" : "text-[#5a6472] line-through"}>
                  {s.label}
                  {s.ok ? ` ${s.total.toLocaleString()}` : " unavailable"}
                </span>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] text-[var(--fg-muted)]">
            less
            {COLORS.map((c, i) => (
              <span key={i} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: c }} />
            ))}
            more
          </div>
        </div>
      </div>
    </Reveal>
  );
}
