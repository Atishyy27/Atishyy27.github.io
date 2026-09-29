"use client";

import { useEffect, useState } from "react";
import { person } from "@/content/site";
import { HANDLES, PROFILE_URL } from "@/lib/activity";

/* ==================================================================
   Four numbers, none of them typed by hand.

   Every count here is fetched from the platform that owns it when the
   page loads. That is the point: a portfolio that states "12 merged
   PRs" in the source is a number that was true once. These go stale
   only if the platform does.

   A source that fails says "unavailable" and links out. It never
   falls back to a remembered number, because a remembered number
   presented as live is worse than no number.
================================================================== */

type Tile = {
  key: string;
  label: string;
  href: string;
  /** null = still loading, false = the fetch failed, number = real */
  value: number | null | false;
  /** shown under the number, e.g. "max 1247" */
  note?: string;
};

const USER = person.githubUser;

async function json(url: string, ms = 9000): Promise<Record<string, unknown>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

/** GitHub search returns total_count, so one call answers "how many", cheaply. */
async function ghCount(q: string): Promise<number> {
  const j = await json(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=1`);
  return Number(j.total_count ?? 0);
}

export default function LiveCounts() {
  // Each tile links to the GitHub search that produced its number, not to the
  // bare profile. A count you cannot click through to is a claim, not evidence.
  const search = (q: string) =>
    `https://github.com/search?q=${encodeURIComponent(q)}&type=pullrequests`;

  const [tiles, setTiles] = useState<Tile[]>([
    {
      key: "merged",
      label: "Merged upstream",
      href: search(`author:${USER} type:pr is:merged -user:${USER}`),
      value: null,
    },
    {
      key: "open",
      label: "Open upstream",
      href: search(`author:${USER} type:pr is:open -user:${USER}`),
      value: null,
    },
    {
      key: "issues",
      label: "Issues filed",
      href: `https://github.com/search?q=${encodeURIComponent(`author:${USER} type:issue`)}&type=issues`,
      value: null,
    },
    { key: "cf", label: "Codeforces rating", href: PROFILE_URL.codeforces, value: null },
  ]);
  const [at, setAt] = useState<string>("");

  useEffect(() => {
    let alive = true;

    const set = (key: string, patch: Partial<Tile>) =>
      alive && setTiles((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));

    // Each source settles on its own. One failing platform must not blank the
    // other three, which is why these are not a single Promise.all.
    // "-user:USER" excludes his own repositories. Merging your own pull request
    // is not an open-source contribution, and counting it as one is the single
    // easiest way to inflate this number.
    ghCount(`author:${USER} type:pr is:merged -user:${USER}`)
      .then((n) => set("merged", { value: n }))
      .catch(() => set("merged", { value: false }));

    ghCount(`author:${USER} type:pr is:open -user:${USER}`)
      .then((n) => set("open", { value: n }))
      .catch(() => set("open", { value: false }));

    ghCount(`author:${USER} type:issue`)
      .then((n) => set("issues", { value: n }))
      .catch(() => set("issues", { value: false }));

    json(`https://codeforces.com/api/user.info?handles=${HANDLES.codeforces}`)
      .then((j) => {
        const u = (j.result as Record<string, unknown>[] | undefined)?.[0];
        if (!u || j.status !== "OK") throw new Error("codeforces");
        const rating = Number(u.rating ?? 0);
        const max = Number(u.maxRating ?? 0);
        // An unrated account reports no rating at all. Saying 0 would be a lie.
        if (!rating) throw new Error("unrated");
        set("cf", { value: rating, note: max && max !== rating ? `peak ${max}` : undefined });
      })
      .catch(() => set("cf", { value: false }));

    setAt(
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section aria-label="Live counts">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[length:var(--step-h2)] font-medium">Right now</h2>
        <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
          {at ? `fetched ${at}` : "fetching"}
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-px sm:grid-cols-4">
        {tiles.map((t) => (
          <a
            key={t.key}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group border-t border-[var(--line)] pt-4 transition-colors hover:border-[var(--accent)]"
          >
            <dt className="text-2xl font-medium tabular-nums tracking-tight">
              {t.value === null ? (
                <span className="text-[var(--fg-muted)]">&middot;&middot;&middot;</span>
              ) : t.value === false ? (
                <span className="text-[length:var(--step-small)] font-normal text-[var(--fg-muted)]">
                  unavailable
                </span>
              ) : (
                t.value.toLocaleString()
              )}
            </dt>
            <dd className="mt-1 text-[length:var(--step-small)] text-[var(--fg-muted)] group-hover:text-[var(--fg)]">
              {t.label}
              {t.note ? <span className="ml-2 opacity-70">{t.note}</span> : null}
            </dd>
          </a>
        ))}
      </dl>
    </section>
  );
}
