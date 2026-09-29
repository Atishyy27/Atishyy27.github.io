"use client";

import { useEffect, useState } from "react";
import { person } from "@/content/site";
import { formatDate } from "@/lib/date";

/**
 * Shows today's merged count next to the committed snapshot, so the table
 * below is visibly either current or out of date.
 *
 * The alternative was to state one number and hope. A snapshot that quietly
 * drifts is the same failure as a hand-typed count, just slower.
 */
export default function LiveOssCounts({
  snapshotMerged,
  snapshotAt,
}: {
  snapshotMerged: number;
  snapshotAt: string;
}) {
  const [live, setLive] = useState<number | null | false>(null);

  useEffect(() => {
    const q = `author:${person.githubUser} type:pr is:merged -user:${person.githubUser}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);

    fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=1`, {
      signal: ctrl.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => setLive(Number(j.total_count ?? 0)))
      .catch(() => setLive(false))
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  // Nothing to say while loading or when GitHub is unreachable: the snapshot
  // number above already stands on its own.
  if (live === null || live === false) return null;

  const drift = live - snapshotMerged;

  return (
    <p className="mt-4 font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
      {drift === 0 ? (
        <>checked against github just now · snapshot is current</>
      ) : (
        <>
          github says {live} merged right now ·{" "}
          {drift > 0 ? `${drift} more than` : `${Math.abs(drift)} fewer than`} the{" "}
          {formatDate(snapshotAt)} snapshot
        </>
      )}
    </p>
  );
}
