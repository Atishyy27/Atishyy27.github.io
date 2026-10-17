"use client";

/**
 * Daily activity across GitHub, Codeforces and LeetCode.
 *
 * This used to be three fetches from the visitor's browser. Two of the three
 * had died by 15 Oct 2026: the GitHub proxy was hosted on Deno Deploy
 * Classic, which was sunset on 20 Jul 2026 and now 404s everything, and the
 * LeetCode proxy is a single free Render instance whose per-IP rate limit is
 * shared globally, so it answers 429 for hours at a time. The page printed
 * "GitHub unavailable" and "LeetCode unavailable" for three months.
 *
 * So the numbers are fetched at build time now, by scripts/gen-activity.mjs,
 * and shipped as a static snapshot. The page renders them with no network at
 * all. LeetCode has no alternative: leetcode.com/graphql sends no
 * access-control-allow-origin, so a browser on this domain can never call it,
 * only node can.
 *
 * The two sources that are CORS-open are still refreshed live, in the
 * background, after the snapshot has already painted. If that refresh fails
 * nothing changes on screen, because the snapshot is already correct enough.
 */

import { useEffect, useState } from "react";
import { ACTIVITY } from "@/content/activity";

export const HANDLES = ACTIVITY.handles;

export const PROFILE_URL: Record<string, string> = {
  github: `https://github.com/${HANDLES.github}`,
  codeforces: `https://codeforces.com/profile/${HANDLES.codeforces}`,
  leetcode: `https://leetcode.com/u/${HANDLES.leetcode}/`,
};

export type DayMap = Record<string, number>;
export type Source = {
  key: string;
  label: string;
  total: number;
  ok: boolean;
  color: string;
  live: boolean;
};
export type Activity = {
  merged: DayMap;
  perDay: Record<string, DayMap>;
  sources: Source[];
  loading: boolean;
  generated: string;
};

const DEFS = [
  { key: "github", label: "GitHub", color: "#3fbdbd" },
  { key: "codeforces", label: "Codeforces", color: "#7c9cff" },
  { key: "leetcode", label: "LeetCode", color: "#ff9d5c" },
] as const;

const WINDOW_DAYS = 371;
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** The same window the grid draws, so the legend adds up to the headline. */
export function windowStart(days = WINDOW_DAYS) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return iso(start);
}

function assemble(byKey: Record<string, DayMap>, liveKeys: Set<string>): Omit<Activity, "loading"> {
  const from = windowStart();
  const merged: DayMap = {};
  const perDay: Record<string, DayMap> = {};
  const sources: Source[] = [];

  for (const def of DEFS) {
    const days = byKey[def.key] ?? {};
    const ok = Object.keys(days).length > 0;
    let total = 0;

    for (const [date, n] of Object.entries(days)) {
      merged[date] = (merged[date] ?? 0) + n;
      (perDay[date] ??= {})[def.key] = n;
      // The legend counts only what the grid can show. Codeforces returning
      // 225 lifetime submissions next to a headline of 95 for the year was
      // two different questions answered in the same row.
      if (date >= from) total += n;
    }

    sources.push({ ...def, total, ok, live: liveKeys.has(def.key) });
  }

  return { merged, perDay, sources, generated: ACTIVITY.generated };
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const t = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
  return Promise.race([p, t]);
}

/** Only the two endpoints that actually send CORS headers. */
async function refreshGitHub(): Promise<DayMap> {
  const r = await withTimeout(
    fetch(`https://github-contributions-api.jogruber.de/v4/${HANDLES.github}?y=last`),
    8000
  );
  const j = await r.json();
  const out: DayMap = {};
  for (const d of j.contributions ?? []) if (d.count > 0) out[d.date] = d.count;
  if (Object.keys(out).length === 0) throw new Error("empty");
  return out;
}

async function refreshCodeforces(): Promise<DayMap> {
  const r = await withTimeout(
    fetch(`https://codeforces.com/api/user.status?handle=${HANDLES.codeforces}&from=1&count=10000`),
    8000
  );
  const j = await r.json();
  if (j.status !== "OK") throw new Error("not OK");
  const out: DayMap = {};
  for (const s of j.result ?? []) {
    const d = iso(new Date(s.creationTimeSeconds * 1000));
    out[d] = (out[d] ?? 0) + 1;
  }
  return out;
}

let refreshed: Promise<Omit<Activity, "loading">> | null = null;

function loadRefreshed() {
  refreshed ??= (async () => {
    const base: Record<string, DayMap> = { ...(ACTIVITY.data as unknown as Record<string, DayMap>) };
    const live = new Set<string>();

    const [gh, cf] = await Promise.allSettled([refreshGitHub(), refreshCodeforces()]);
    if (gh.status === "fulfilled") {
      base.github = gh.value;
      live.add("github");
    }
    if (cf.status === "fulfilled") {
      base.codeforces = cf.value;
      live.add("codeforces");
    }
    return assemble(base, live);
  })();
  return refreshed;
}

export function useActivity(): Activity {
  // The snapshot is the first render, synchronously. There is no spinner
  // because there is nothing to wait for.
  const [state, setState] = useState<Activity>(() => ({
    ...assemble(ACTIVITY.data as unknown as Record<string, DayMap>, new Set()),
    loading: false,
  }));

  useEffect(() => {
    let alive = true;
    loadRefreshed()
      .then((a) => alive && setState({ ...a, loading: false }))
      .catch(() => {
        /* the snapshot is already on screen; a failed refresh changes nothing */
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

/** 53 weeks of cells ending today, aligned so each column starts on a Sunday. */
export function buildWeeks(merged: DayMap, days = WINDOW_DAYS) {
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
