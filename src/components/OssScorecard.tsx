import card from "@/content/oss-scorecard.json";

// How the work lands, not how much of it there is. Numbers come from
// oss-scorecard.json, written nightly by the private dashboard script with
// public fields only.
export default function OssScorecard() {
  const rate = card.mergeRate === null ? "n/a" : `${Math.round(card.mergeRate * 100)}%`;
  const tiles: [string, string, string][] = [
    ["Merge rate", rate, `${card.merged} merged of ${card.decided} decided`],
    ["Maintainers", String(card.maintainersWhoMerged), `merged my work, across ${card.reposWithMerge} repos`],
    ["To first review", `${card.medianHoursToFirstReview}h`, "median"],
    ["To merge", `${card.medianDaysToMerge}d`, "median"],
  ];
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
              const pct = b.decided ? Math.round((100 * b.merged) / b.decided) : 0;
              return (
                <div key={b.bucket} className="text-[length:var(--step-small)]">
                  <div className="flex justify-between tabular-nums">
                    <span>{b.bucket} lines</span>
                    <span className="text-[var(--fg-muted)]">{b.decided ? `${pct}% (${b.merged}/${b.decided})` : "none yet"}</span>
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
          <div className="mt-3 flex h-28 items-end gap-1.5">
            {card.byMonth.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1" title={`${m.month}: ${m.merged}`}>
                <div className="w-full rounded-sm bg-[var(--accent)]" style={{ height: `${(100 * m.merged) / top}%` }} />
                <span className="font-mono text-[9px] text-[var(--fg-muted)]">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
        Decided means merged or closed; open pull requests are left out of the rate. Snapshot {card.snapshot}.
      </p>
    </section>
  );
}
