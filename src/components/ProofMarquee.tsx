"use client";

import Link from "next/link";

interface ProofItem {
  label: string;
  detail: string;
  tag: string;
  color: string;
  href?: string;
}

const PROOF_ITEMS: ProofItem[] = [
  {
    label: "500+ Android Installs",
    detail: "YES Wellness Platform",
    tag: "Google Play",
    color: "#3fb950",
    href: "https://play.google.com/store/apps/details?id=in.gov.mp.shree.yes",
  },
  {
    label: "223 Active Users",
    detail: "LeetCode Analytics",
    tag: "Chrome Store",
    color: "#ffa116",
    href: "https://chromewebstore.google.com/detail/leetcode-analytics/pcgnpclciloahjpjhhmjbalpcdmlkpba",
  },
  {
    label: "51 Merged Upstream PRs",
    detail: "across 27 repositories",
    tag: "Open Source",
    color: "#a371f7",
    href: "/oss/",
  },
  {
    label: "Cited in Releases",
    detail: "Cilium (CNCF), SHAP, Pixi, Fedimint",
    tag: "Citations",
    color: "#3fb950",
    href: "/oss/#citations",
  },
  {
    label: "94.2% AUC-ROC",
    detail: "Blockchain-Secured Federated Healthcare",
    tag: "Research",
    color: "#5eb3b3",
    href: "/writing/",
  },
  {
    label: "Rank 12 Regional",
    detail: "ICPC Asia Amritapuri Multisite 2025",
    tag: "ACM ICPC",
    color: "#ffa116",
    href: "/stats/",
  },
  {
    label: "National Top 5",
    detail: "CIIS 2025 CyberShield Hackathon",
    tag: "Security ML",
    color: "#a371f7",
    href: "/writing/",
  },
  {
    label: "1,812 Contributions",
    detail: "173 active days on GitHub",
    tag: "Activity",
    color: "#a371f7",
    href: "/stats/",
  },
  {
    label: "173 Rated Contests",
    detail: "4★ CodeChef (1809) · Knight (1786)",
    tag: "CP",
    color: "#ffa116",
    href: "/stats/",
  },
  {
    label: "50 Upstream Issues",
    detail: "self-sourced reports across OTel, Podman, jc",
    tag: "Upstream",
    color: "#5eb3b3",
    href: "/oss/",
  },
  {
    label: "258.7 MB Dataset",
    detail: "Synthetic Sign Classifier (CC BY 4.0)",
    tag: "Kaggle",
    color: "#5eb3b3",
    href: "https://www.kaggle.com/datasets/atzjit/synthetic-sign-classifier-dataset",
  },
];

export default function ProofMarquee() {
  const doubled = [...PROOF_ITEMS, ...PROOF_ITEMS];

  return (
    <div className="relative w-full overflow-hidden border-y border-[var(--line)] bg-[var(--bg-raised)]/60 py-3 backdrop-blur-sm">
      {/* Screen-reader-only accessible summary to avoid duplicate auditory content */}
      <div className="sr-only">
        Key engineering highlights: 500+ Android installs, 223 Chrome users, 51 merged open-source PRs, 
        production citations in Cilium, SHAP, and Pixi, 94.2% AUC federated learning research, and Rank 12 ICPC regional finalist.
      </div>

      {/* Edge Gradient Fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--bg)] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--bg)] to-transparent z-10" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center gap-4" aria-hidden="true">
        {doubled.map((item, i) => {
          const content = (
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--bg)] px-3.5 py-1.5 transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/20 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-mono text-xs font-semibold text-[var(--fg)]">{item.label}</span>
              <span className="text-xs text-[var(--fg-muted)]">·</span>
              <span className="text-xs text-[var(--fg-muted)]">{item.detail}</span>
              <span className="rounded bg-[var(--line)]/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)] font-medium">
                {item.tag}
              </span>
            </div>
          );

          return item.href?.startsWith("http") ? (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 group"
            >
              {content}
            </a>
          ) : item.href ? (
            <Link key={i} href={item.href} className="shrink-0 group">
              {content}
            </Link>
          ) : (
            <div key={i} className="shrink-0">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
