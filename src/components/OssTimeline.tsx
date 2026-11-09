"use client";

/* Merged pull requests over time, one swimlane per repository, one dot per PR.
   Built from the committed merged_at dates in oss-prs.json. Hover (or focus) a
   dot to read repo, title and date in the caption underneath; click opens the
   pull request. No chart library: positions are plain percentages of the span. */
import { useMemo, useState } from "react";
import prsRaw from "@/content/oss-prs.json";
import { formatDate } from "@/lib/date";

type Pr = { repo: string; number: number; title: string; url: string; merged_at: string; kind: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const KIND_COLOR: Record<string, string> = {
  Fix: "#5eb3b3",
  Feature: "#a371f7",
  Docs: "#d29922",
  Infra: "#58a6ff",
};

export default function OssTimeline() {
  const [hot, setHot] = useState<Pr | null>(null);

  const { lanes, start, span, ticks } = useMemo(() => {
    const prs = (prsRaw as { prs: Pr[] }).prs.filter((p) => p.merged_at);
    const times = prs.map((p) => Date.parse(p.merged_at));
    const first = new Date(Math.min(...times));
    const last = Math.max(...times);
    // pad to whole months so the axis starts and ends on a tick
    const s = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1);
    const endD = new Date(last);
    const e = Date.UTC(endD.getUTCFullYear(), endD.getUTCMonth() + 1, 1);

    const byRepo = new Map<string, Pr[]>();
    for (const p of prs) byRepo.set(p.repo, [...(byRepo.get(p.repo) ?? []), p]);
    const ls = [...byRepo.entries()]
      .map(([repo, list]) => ({
        repo,
        list,
        first: Math.min(...list.map((p) => Date.parse(p.merged_at))),
      }))
      .sort((a, b) => a.first - b.first);

    const t: { at: number; label: string }[] = [];
    for (let d = new Date(s); d.getTime() <= e; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) {
      t.push({ at: d.getTime(), label: MONTHS[d.getUTCMonth()] });
    }
    return { lanes: ls, start: s, span: e - s, ticks: t };
  }, []);

  if (lanes.length === 0) return null;
  const pct = (ms: number) => ((ms - start) / span) * 100;

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 pb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
        {Object.entries(KIND_COLOR).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
            {k}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--line)] py-2">
        <div className="flex">
          <div className="w-28 shrink-0 sm:w-44" />
          <div className="relative mr-4 h-5 flex-1">
            {ticks.map((t) => (
              <span
                key={t.at}
                className="absolute top-0 -translate-x-1/2 font-mono text-[9px] uppercase text-[var(--fg-muted)]"
                style={{ left: `${pct(t.at)}%` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {lanes.map((l) => (
          <div key={l.repo} className="flex items-center">
            <span className="w-28 shrink-0 truncate px-3 text-[length:var(--step-small)] sm:w-44" title={l.repo}>
              {l.repo.split("/")[1]}
            </span>
            <div className="relative mr-4 h-6 flex-1">
              <div className="absolute inset-x-0 top-1/2 border-t border-[var(--line)]" />
              {ticks.map((t) => (
                <span
                  key={t.at}
                  className="absolute inset-y-0 border-l border-[var(--line)] opacity-40"
                  style={{ left: `${pct(t.at)}%` }}
                />
              ))}
              {l.list.map((p) => (
                <a
                  key={p.number}
                  href={p.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${p.repo} #${p.number}: ${p.title}`}
                  onMouseEnter={() => setHot(p)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(p)}
                  onBlur={() => setHot(null)}
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--bg)] transition hover:scale-150 focus:scale-150"
                  style={{ left: `${pct(Date.parse(p.merged_at))}%`, background: KIND_COLOR[p.kind] ?? "#5eb3b3" }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 min-h-[2.5rem] text-[length:var(--step-small)]">
        {hot ? (
          <span className="text-[var(--fg)]">
            {hot.repo} #{hot.number} · {formatDate(hot.merged_at.slice(0, 10))}
            <span className="block text-[var(--fg-muted)]">{hot.title}</span>
          </span>
        ) : (
          <span className="text-[var(--fg-muted)]">
            Hover a dot for the pull request, click to open it. Oldest repo first.
          </span>
        )}
      </p>
    </div>
  );
}
