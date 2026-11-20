import { ossHeadline as H } from "@/content/oss-headline";

type Variant = "hero" | "stack" | "compact" | "inline";

/**
 * The one way the site states its open-source number: contributions first,
 * merged and open directly under it. Every variant reads the same data.
 */
export default function OssHeadline({
  variant = "hero",
  orgs = true,
  className = "",
}: {
  variant?: Variant;
  orgs?: boolean;
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <span className={className}>
        <span data-oss-count="contributions">{H.contributions}</span> {H.noun} · {H.counts}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className={`inline-flex flex-col items-end text-right ${className}`}>
        <span>
          <span data-oss-count="contributions">{H.contributions}</span> {H.noun}
        </span>
        <span className="text-[10px] font-normal text-[var(--fg-muted)]">{H.counts}</span>
      </span>
    );
  }

  const big = variant === "hero" ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl";
  const word = variant === "hero" ? "text-xl sm:text-2xl" : "text-base sm:text-lg";
  return (
    <div className={className}>
      <p className={`${big} font-medium tabular-nums tracking-tight`}>
        <span data-oss-count="contributions">{H.contributions}</span> <span className={`${word} text-[var(--fg-muted)]`}>{H.noun}</span>
      </p>
      <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">{H.counts}</p>
      {orgs ? <p className="mt-0.5 text-[length:var(--step-small)] text-[var(--fg-muted)]">{H.orgs}</p> : null}
    </div>
  );
}
