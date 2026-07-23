"use client";

/**
 * One fetch of daily activity, shared by every view that draws it.
 *
 * GitHub + Codeforces + LeetCode, summed per day. All three are CORS-open
 * public endpoints hit from the browser. A source that fails is reported as
 * unavailable and skipped; it never contributes zeros pretending to be real
 * data. The result is cached at module scope so the flat grid and the 3D
 * skyline don't fetch twice.
 */

import { useEffect, useState } from "react";

export const HANDLES = {
  github: "Atishyy27",
  codeforces: "sethatishayjain",
  leetcode: "atishayjain78001",
};

export const PROFILE_URL: Record<string, string> = {
  github: `https://github.com/${HANDLES.github}`,
  codeforces: `https://codeforces.com/profile/${HANDLES.codeforces}`,
  leetcode: `https://leetcode.com/u/${HANDLES.leetcode}/`,
};

export type DayMap = Record<string, number>;
export type Source = { key: string; label: string; total: number; ok: boolean; color: string };
export type Activity = {
  merged: DayMap;
  perDay: Record<string, DayMap>;
  sources: Source[];
  loading: boolean;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const t = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
  return Promise.race([p, t]);
}

async function fetchGitHub(): Promise<DayMap> {
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
  if (j.status !== "OK") throw new Error("codeforces");
  const out: DayMap = {};
  for (const s of j.result ?? []) {
    const d = iso(new Date(s.creationTimeSeconds * 1000));
    out[d] = (out[d] ?? 0) + 1;
  }
  return out;
}

async function fetchLeetCode(): Promise<DayMap> {
  // no official CORS endpoint; community proxy, cold-starts and sometimes fails
  const r = await withTimeout(fetch(`https://alfa-leetcode-api.onrender.com/${HANDLES.leetcode}/calendar`), 9000);
  const j = await r.json();
  const cal = JSON.parse(j.submissionCalendar ?? "{}") as Record<string, number>;
  const out: DayMap = {};
  for (const [ts, n] of Object.entries(cal)) out[iso(new Date(Number(ts) * 1000))] = n;
  return out;
}

const DEFS = [
  { key: "github", label: "GitHub", fn: fetchGitHub, color: "#3fbdbd" },
  { key: "codeforces", label: "Codeforces", fn: fetchCodeforces, color: "#7c9cff" },
  { key: "leetcode", label: "LeetCode", fn: fetchLeetCode, color: "#ff9d5c" },
];

let cache: Promise<Omit<Activity, "loading">> | null = null;

export function loadActivity() {
  cache ??= Promise.allSettled(DEFS.map((d) => d.fn())).then((res) => {
    const merged: DayMap = {};
    const perDay: Record<string, DayMap> = {};
    const sources: Source[] = [];
    res.forEach((r, i) => {
      const def = DEFS[i];
      if (r.status !== "fulfilled") {
        sources.push({ key: def.key, label: def.label, total: 0, ok: false, color: def.color });
        return;
      }
      let total = 0;
      for (const [date, n] of Object.entries(r.value)) {
        merged[date] = (merged[date] ?? 0) + n;
        (perDay[date] ??= {})[def.key] = n;
        total += n;
      }
      sources.push({ key: def.key, label: def.label, total, ok: true, color: def.color });
    });
    return { merged, perDay, sources };
  });
  return cache;
}

export function useActivity(): Activity {
  const [state, setState] = useState<Activity>({ merged: {}, perDay: {}, sources: [], loading: true });
  useEffect(() => {
    let alive = true;
    loadActivity().then((a) => alive && setState({ ...a, loading: false }));
    return () => { alive = false; };
  }, []);
  return state;
}

/** 53 weeks of cells ending today, aligned so each column starts on a Sunday. */
export function buildWeeks(merged: DayMap, days = 371) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  start.setDate(start.getDate() - start.getDay());

  const cells: { date: string; count: number }[] = [];
  let max = 0;
  let grandTotal = 0;
  for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const date = iso(d);
    const count = merged[date] ?? 0;
    cells.push({ date, count });
    if (count > max) max = count;
    grandTotal += count;
  }

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, col) => {
    const first = w[0];
    if (!first) return;
    const m = new Date(first.date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ col, label: new Date(first.date).toLocaleString("en", { month: "short" }) });
      lastMonth = m;
    }
  });

  return { weeks, max, grandTotal, monthLabels };
}
