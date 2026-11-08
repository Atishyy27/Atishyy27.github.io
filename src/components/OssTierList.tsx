"use client";

/* A tiermaker-style view of the open-source record: one colored band per tier
   (L4 at the top down to L1), each repo a card placed in its band with its owner
   logo, merge count and reach badge. The Kind filter dims the cards that do not
   hold that kind of work, so the shape stays readable while you narrow it. All
   data is computed at build time in content/oss.ts; this component only filters. */
import { useState } from "react";
import RepoLogo from "@/components/RepoLogo";
import type { Tier } from "@/content/oss";

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
              {t.repos.length === 0 ? (
                <span className="px-2 text-[length:var(--step-small)] text-[var(--fg-muted)]">
                  nothing here yet, the next climb
                </span>
              ) : (
                t.repos.map((r) => {
                  const dim = kind !== null && !r.kinds.includes(kind);
                  const internal = Boolean(r.slug);
                  const href = internal ? `/oss/${r.slug}/` : `https://github.com/${r.full}`;
                  return (
                    <a
                      key={r.full}
                      href={href}
                      target={internal ? undefined : "_blank"}
                      rel={internal ? undefined : "noopener"}
                      title={r.prs.map((p) => `#${p.number}  ${p.title}`).join("\n")}
                      className={`flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg-raised)] px-2.5 py-1.5 transition duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)] ${
                        dim ? "opacity-20" : "opacity-100"
                      }`}
                    >
                      <RepoLogo owner={r.owner} size={20} />
                      <span className="text-sm font-medium">{r.short}</span>
                      <span className="tabular-nums text-[length:var(--step-small)] text-[var(--fg-muted)]">
                        {r.merges}
                      </span>
                      <span className="rounded border border-[var(--line)] px-1 font-mono text-[9px] leading-4 text-[var(--fg-muted)]">
                        {r.reach}
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
        One card per repository, in its tier. The number is merges there; the letter is
        reach (A is an org over 10k stars, down to D for an individual&apos;s project).
        Filter by the kind of work above.
      </p>
    </div>
  );
}
