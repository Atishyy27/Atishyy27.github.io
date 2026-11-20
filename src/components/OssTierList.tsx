"use client";

/* A tiermaker-style view of the open-source record: one colored band per tier
   (L4 at the top down to L1), each organisation a card placed in its band with its
   logo, contribution count and reach badge. The Kind filter dims the cards that do not
   hold that kind of work, so the shape stays readable while you narrow it. All
   data is computed at build time in content/oss.ts; this component only filters. */
import { useState } from "react";
import RepoLogo from "@/components/RepoLogo";
import type { Tier } from "@/content/oss";
import { OSS_STATS } from "@/content/oss-stats";

const KINDS = ["Fix", "Feature", "Docs", "Infra"] as const;

function chip(active: boolean) {
  return `rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
    active
      ? "border-[var(--accent)] text-[var(--accent)]"
      : "border-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
  }`;
}

export default function OssTierList({ tiers }: { tiers: Tier[] }) {
  const [kind, setKind] = useState<string | null>(null);
  const placed = tiers.reduce((n, t) => n + t.orgs.reduce((m, o) => m + o.contributions, 0), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setKind(null)} className={chip(kind === null)}>
          all kinds
        </button>
        {KINDS.map((k) => (
          <button
            type="button"
            key={k}
            onClick={() => setKind(kind === k ? null : k)}
            className={chip(kind === k)}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--line)]">
        {tiers.map((t) => (
          <div key={t.level} className="flex items-stretch border-b border-[var(--line)] last:border-b-0">
            <div
              className="flex w-20 shrink-0 flex-col items-center justify-center px-2 py-4 text-center sm:w-24"
              style={{ background: t.color }}
            >
              <span className="text-xl font-bold leading-none text-black/85">{t.level}</span>
              <span className="mt-1 text-[10px] font-medium leading-tight text-black/70">{t.label}</span>
            </div>

            <div className="flex flex-1 flex-wrap content-center items-center gap-2 p-3">
              {t.orgs.length === 0 ? (
                <span className="px-2 text-[length:var(--step-small)] text-[var(--fg-muted)]">
                  nothing here yet, the next climb
                </span>
              ) : (
                t.orgs.map((o) => {
                  const dim = kind !== null && !o.kinds.includes(kind);
                  return (
                    <a
                      key={o.org}
                      href={`/oss/org/${o.slug}/`}
                      title={o.prs.map((p) => `#${p.number}  ${p.title}`).join("\n")}
                      className={`flex min-h-11 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg-raised)] px-2.5 py-1.5 transition duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)] sm:min-h-0 ${
                        dim ? "opacity-20" : "opacity-100"
                      }`}
                    >
                      <RepoLogo owner={o.org} size={20} />
                      <span className="text-sm font-medium">{o.org}</span>
                      <span className="tabular-nums text-[length:var(--step-small)] text-[var(--fg-muted)]">
                        {o.contributions}
                      </span>
                      <span className="rounded border border-[var(--line)] px-1 font-mono text-[10px] leading-4 text-[var(--fg-muted)]">
                        {o.reach}
                      </span>
                    </a>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
        One card per organisation, in its tier. The number is contributions there; the letter is
        reach (A is an org over 10k stars, down to D for an individual&apos;s project). The cards
        hold {placed} of {OSS_STATS.contributions} contributions; the rest sit in organisations
        without a level yet. Filter by the kind of work above.
      </p>
    </div>
  );
}
