"use client";

/* Merged pull requests over time, one swimlane per repository, one dot per PR.
   Built from the committed merged_at dates in oss-prs.json. Hover (or focus) a
   dot to read repo, title and date in the caption underneath; click opens the
   pull request. No chart library: positions are plain percentages of the span. */
import { useEffect, useMemo, useRef, useState } from "react";
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
  // Hover and focus do not exist under a finger, and a tap on a link navigates
  // at once. On touch the first tap on a dot reads it, the second opens it.
  const touch = useRef(false);
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

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
        {/* Eight months of lanes do not fit 330px. Below sm the chart keeps a
            readable width and scrolls sideways, with the repo names pinned. */}
        <div className="overflow-x-auto overscroll-x-contain">
          <div className="min-w-[720px] sm:min-w-0">
            <div className="flex">
              <div className="sticky left-0 z-10 w-28 shrink-0 bg-[var(--bg)] sm:static sm:w-44" />
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
                <span
                  className="sticky left-0 z-10 w-28 shrink-0 truncate bg-[var(--bg)] px-3 text-[length:var(--step-small)] sm:static sm:w-44"
                  title={l.repo}
                >
                  {l.repo.split("/")[1]}
                </span>
                <div className="relative mr-4 h-8 flex-1 sm:h-6">
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
                      onPointerDown={(e) => {
                        touch.current = e.pointerType === "touch";
                      }}
                      onClick={(e) => {
                        // first tap reads the PR, second tap on the same dot opens it
                        if (touch.current && !(hot && hot.repo === p.repo && hot.number === p.number)) {
                          e.preventDefault();
                          setHot(p);
                        }
                      }}
                      // touch also fires emulated mouse and focus events before
                      // the click, which would pre-select the dot and make the
                      // first tap open the PR
                      onMouseEnter={() => !touch.current && setHot(p)}
                      onMouseLeave={() => !touch.current && setHot(null)}
                      onFocus={() => !touch.current && setHot(p)}
                      onBlur={() => !touch.current && setHot(null)}
                      className="group absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-3 sm:w-3"
                      style={{ left: `${pct(Date.parse(p.merged_at))}%` }}
                    >
                      <span
                        className={`h-3 w-3 rounded-full border transition group-hover:scale-150 group-focus:scale-150 ${
                          hot && hot.repo === p.repo && hot.number === p.number
                            ? "scale-150 border-[var(--fg)]"
                            : "border-[var(--bg)]"
                        }`}
                        style={{ background: KIND_COLOR[p.kind] ?? "#5eb3b3" }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 min-h-[2.5rem] text-[length:var(--step-small)]">
        {hot ? (
          <span className="text-[var(--fg)]">
            {hot.repo} #{hot.number} · {formatDate(hot.merged_at.slice(0, 10))}
            <span className="block text-[var(--fg-muted)]">{hot.title}</span>
            {coarse ? (
              <a
                href={hot.url}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-[40px] items-center text-[var(--accent)] underline"
              >
                open pull request
              </a>
            ) : null}
          </span>
        ) : (
          <span className="text-[var(--fg-muted)]">
            {coarse
              ? "Tap a dot for the pull request, tap it again to open it. Swipe the chart sideways. Oldest repo first."
              : "Hover a dot for the pull request, click to open it. Oldest repo first."}
          </span>
        )}
      </p>
    </div>
  );
}
