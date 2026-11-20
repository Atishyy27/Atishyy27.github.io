import { CLOSE_REASONS, groupClosed, type OssPr } from "@/content/oss";
import { formatDate } from "@/lib/date";

export type ClosedPr = OssPr & { repoName?: string };

const COLOR: Record<string, string> = {
  landed: "var(--accent)",
  superseded: "color-mix(in srgb, var(--accent) 55%, var(--bg))",
  resubmitted: "var(--accent-2)",
  auto: "color-mix(in srgb, var(--accent-2) 55%, var(--bg))",
  mine: "var(--fg-muted)",
  declined: "var(--fg)",
  unknown: "color-mix(in srgb, var(--fg-muted) 40%, var(--bg))",
};

/**
 * Pull requests that closed without merging, with the reason GitHub's own
 * record gives. Detail pages only: the summaries never carry this number.
 * The chart states counts and nothing else.
 */
export default function ClosedReasons({ prs, heading = "h2" }: { prs: ClosedPr[]; heading?: "h2" | "h3" }) {
  const groups = groupClosed(prs);
  const total = groups.reduce((n, g) => n + g.prs.length, 0);
  if (total === 0) return null;

  const Head = heading;
  const label = `${total} pull ${total === 1 ? "request" : "requests"} closed without merging: ${groups
    .map((g) => `${g.prs.length} ${g.label.toLowerCase()}`)
    .join(", ")}`;
  let x = 0;

  return (
    <section className="mt-16 border-t border-[var(--line)] pt-10">
      <Head className="text-[length:var(--step-h2)] font-medium">Pull requests that closed without merging</Head>
      <p className="mt-2 max-w-prose text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
        {total} in total. The reason is read from the GitHub record: who closed it, the pull request that
        replaced it, bot comments. Where the record says nothing it is marked as not recorded.
      </p>

      <svg role="img" aria-label={label} viewBox="0 0 100 6" preserveAspectRatio="none" className="mt-5 block h-4 w-full overflow-hidden rounded-sm">
        <title>{label}</title>
        {groups.map((g) => {
          const w = (100 * g.prs.length) / total;
          const rect = <rect key={g.key} x={x} y={0} width={w} height={6} style={{ fill: COLOR[g.key] }} stroke="var(--bg)" strokeWidth={0.4} vectorEffect="non-scaling-stroke" />;
          x += w;
          return rect;
        })}
      </svg>

      <ul className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {groups.map((g) => (
          <li key={g.key} className="flex items-center gap-2 text-[length:var(--step-small)]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: COLOR[g.key] }} aria-hidden />
            <span className="min-w-0">{g.label}</span>
            <span className="ml-auto tabular-nums text-[var(--fg-muted)]">{g.prs.length}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-8">
        {groups.map((g) => (
          <div key={g.key}>
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: COLOR[g.key] }} aria-hidden />
              {CLOSE_REASONS[g.key].label}
              <span className="tabular-nums text-[var(--fg-muted)]">{g.prs.length}</span>
            </h3>
            <p className="mt-1 text-[length:var(--step-small)] text-[var(--fg-muted)]">{g.desc}</p>
            <ul className="mt-2">
              {(g.prs as ClosedPr[]).map((pr) => (
                <li key={`${pr.repoName ?? ""}${pr.number}`} className="border-t border-[var(--line)]">
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block min-h-11 py-2.5 hover:text-[var(--accent)]"
                  >
                    <span className="text-sm">
                      {pr.repoName ? `${pr.repoName} ` : ""}#{pr.number} {pr.title}
                    </span>
                    <span className="block text-[length:var(--step-small)] text-[var(--fg-muted)]">
                      {pr.closedAt ? `closed ${formatDate(pr.closedAt.slice(0, 10))}` : "closed"}
                      {pr.closedBy ? ` by ${pr.closedBy}` : ""}
                      {pr.closeEvidence ? ` · ${pr.closeEvidence}` : ""}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
