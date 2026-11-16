"use client";

import Link from "next/link";
import { Reveal, Tilt } from "./Chrome";

interface ImpactItem {
  metric: string;
  label: string;
  context: string;
  href: string;
  badge: string;
}

const IMPACT_ITEMS: ImpactItem[] = [
  {
    metric: "51",
    label: "Merged Upstream PRs",
    context: "Accepted changes across 27 external repositories including Cilium (CNCF), rust-lightning, SHAP, and Pixi.",
    href: "/oss/",
    badge: "Open Source",
  },
  {
    metric: "5k",
    label: "Concurrent-User Capacity",
    context: "YES Wellness production backend validated with k6 distributed load tests, atomic slot reservation, and PostgreSQL row locks.",
    href: "/projects/yes-wellness-platform/",
    badge: "Production Backend",
  },
  {
    metric: "2",
    label: "Government Apps Shipped",
    context: "e-SAHAYAK and SRAM deployed on Google Play for the Madhya Pradesh Government (MPSEDC / Dept. of Labour).",
    href: "/projects/sram/",
    badge: "Mobile & Enterprise",
  },
  {
    metric: "94.2%",
    label: "Research AUC-ROC",
    context: "Multi-modal federated learning on extreme non-IID healthcare data (Chest X-Rays + EHR) with Hyperledger Fabric auditability.",
    href: "/writing/",
    badge: "Distributed ML",
  },
];

export default function SelectedImpact() {
  return (
    <section className="border-t border-[var(--line)] pt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-semibold">
            01 / SELECTED IMPACT
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight">Engineering impact</h2>
          <p className="mt-1 text-sm text-[var(--fg-muted)] max-w-xl">
            Measurable outcomes across production systems, distributed infrastructure, and empirical research.
          </p>
        </div>
        <Link href="/stats/" className="font-mono text-xs text-[var(--accent)] hover:underline">
          View full statistics &rarr;
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {IMPACT_ITEMS.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.06}>
            <Link href={item.href} className="group block h-full">
              <Tilt className="flex h-full flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 transition-all hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)]/10">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                      {item.metric}
                    </span>
                    <span className="rounded bg-[var(--line)]/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-medium text-base text-[var(--fg)] group-hover:underline">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">
                    {item.context}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 font-mono text-xs text-[var(--accent)] opacity-80 group-hover:opacity-100">
                  <span>Inspect evidence</span>
                  <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </div>
              </Tilt>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
