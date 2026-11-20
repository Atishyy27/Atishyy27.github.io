import cardRaw from "@/content/oss-scorecard.json";
import { formatIst } from "@/lib/date";

type Card = {
  snapshot: string;
  merged: number;
  contributions?: number;
  maintainersWhoMerged: number;
  orgsWithMerge?: number;
  medianDaysToMerge: number;
  medianHoursToFirstReview: number;
  bySize: { bucket: string; merged: number }[];
  byMonth: { month: string; merged: number }[];
};
const card = cardRaw as unknown as Card;

// How the work lands, not how much of it there is. Numbers come from
// oss-scorecard.json, written by the same fetch as the rest of the open-source data.
export default function OssScorecard() {
  const landed = card.contributions ?? card.merged;
  const tiles: [string, string, string][] = [
    ["Contributions landed", String(landed), `${card.merged} merged pull requests plus carried commits and fixed reports`],
    [
      "Maintainers",
      String(card.maintainersWhoMerged),
      card.orgsWithMerge ? `merged my work, across ${card.orgsWithMerge} organisations` : "merged my work",
    ],
    ["To first review", `${card.medianHoursToFirstReview}h`, "median"],
    ["To merge", `${card.medianDaysToMerge}d`, "median"],
  ];
  const topSize = Math.max(1, ...card.bySize.map((b) => b.merged));
  const top = Math.max(1, ...card.byMonth.map((m) => m.merged));
  return (
    <section className="mt-16 border-t border-[var(--line)] pt-8">
      <h2 className="text-[length:var(--step-h2)] font-medium">How it lands</h2>
      <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {tiles.map(([label, big, sub]) => (
          <div key={label}>
            <dt className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">{label}</dt>
            <dd className="mt-1 text-2xl font-medium tabular-nums">{big}</dd>
            <dd className="text-[length:var(--step-small)] text-[var(--fg-muted)]">{sub}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">Merged by size</h3>
          <div className="mt-3 space-y-2">
            {card.bySize.map((b) => {
              const pct = Math.round((100 * b.merged) / topSize);
              return (
                <div key={b.bucket} className="text-[length:var(--step-small)]">
                  <div className="flex justify-between tabular-nums">
                    <span>{b.bucket} lines</span>
                    <span className="text-[var(--fg-muted)]">{b.merged ? `${b.merged} merged` : "none yet"}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[var(--line)]">
                    <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">Merged per month</h3>
          <div className="mt-3 flex h-28 items-end gap-2 pt-2">
            {card.byMonth.map((m) => {
              const pct = Math.round((100 * m.merged) / top);
              return (
                <div key={m.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${m.month}: ${m.merged} merged`}>
                  <span className="font-mono text-[10px] tabular-nums text-[var(--fg-muted)]">{m.merged}</span>
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full rounded-sm bg-[var(--accent)] min-h-[4px]" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-[var(--fg-muted)]">{m.month.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
        Counted {formatIst(card.snapshot)}.
      </p>
    </section>
  );
}
