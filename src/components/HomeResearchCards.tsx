"use client";

import Link from "next/link";
import { Reveal, Tilt } from "./Chrome";

interface ResearchPaper {
  id: string;
  title: string;
  venue: string;
  metricHighlight: {
    value: string;
    label: string;
  };
  badges: string[];
  summary: string;
  architecturePoints: string[];
  href: string;
  isExternal?: boolean;
}

const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "fl-healthcare",
    title: "Blockchain-Secured Federated Learning for Multi-Modal Healthcare",
    venue: "IIITM Gwalior Research Symposium · C3iHub IIT Kanpur",
    metricHighlight: {
      value: "94.2% AUC-ROC",
      label: "non-IID clinical split",
    },
    badges: ["Federated Learning", "Hyperledger Fabric", "PyTorch", "Zero Egress"],
    summary:
      "Privacy-preserving multi-modal pneumonia diagnosis across distributed clinical partitions without moving raw patient radiographs or EHR records.",
    architecturePoints: [
      "Decoupled local client execution (DenseNet/EfficientNet backbones) from server-side FedAvg momentum aggregation.",
      "Integrated Hyperledger Fabric distributed ledger: model parameter hashes and client updates are cryptographically committed every round.",
    ],
    href: "/writing/",
  },
  {
    id: "graph-forensics",
    title: "Graph-Feature Machine Learning & Explainable AI for Anti-Money Laundering",
    venue: "CIIS 2025 · National CyberShield Hackathon Finalist",
    metricHighlight: {
      value: "Top 5 Finalist",
      label: "of 500+ national teams",
    },
    badges: ["Graph ML", "SHAP XAI", "Gradient Boosted Trees", "~51K Graphs"],
    summary:
      "Topological network feature extraction paired with gradient-boosted trees and SHAP explainability to unmask mule accounts and multi-hop layering rings.",
    architecturePoints: [
      "Calculated structural graph metrics (temporal flow velocity, cycle indicators, in/out degree ratios) across ~51,000 synthetic transactions.",
      "Engineered real-time SHAP explanation vectors enabling human compliance officers to justify asset-freeze orders immediately.",
    ],
    href: "/writing/",
  },
  {
    id: "synthetic-dataset",
    title: "Synthetic Sign Classifier Dataset",
    venue: "Kaggle Open Dataset · CC BY 4.0 License",
    metricHighlight: {
      value: "258.7 MB",
      label: "curated open dataset",
    },
    badges: ["Computer Vision", "Dataset Engineering", "CC BY 4.0", "Kaggle"],
    summary:
      "Procedurally generated and augmented visual dataset created to eliminate severe training data scarcity in rare multi-class sign detection.",
    architecturePoints: [
      "Synthetic rendering with chromatic aberrations, varied lighting, and perspective warping to mitigate extreme real-world overfitting.",
      "100% open-access artifact available publicly for academic benchmark replication.",
    ],
    href: "https://www.kaggle.com/datasets/atzjit/synthetic-sign-classifier-dataset",
    isExternal: true,
  },
];

export default function HomeResearchCards() {
  return (
    <section className="border-t border-[var(--line)] pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <h2 className="text-[length:var(--step-h2)] font-medium">Systems Research & Preprints</h2>
          <p className="mt-1 text-[length:var(--step-small)] text-[var(--fg-muted)]">
            Empirical validation, privacy-preserving distributed architectures, and topological forensics.
          </p>
        </div>
        <Link href="/writing/" className="font-mono text-xs text-[var(--accent)] hover:underline">
          View full research section &rarr;
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {RESEARCH_PAPERS.map((paper, i) => (
          <Reveal key={paper.id} delay={i * 0.08}>
            <Tilt className="flex h-full flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 transition-all hover:border-[var(--accent)]/50">
              <div>
                {/* Metric Hero Tag */}
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <div>
                    <div className="font-mono text-2xl font-semibold tracking-tight text-[var(--accent)]">
                      {paper.metricHighlight.value}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--fg-muted)]">
                      {paper.metricHighlight.label}
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--accent)] font-medium">
                    Research
                  </span>
                </div>

                {/* Title & Venue */}
                <h3 className="mt-4 font-medium text-base leading-snug text-[var(--fg)]">
                  {paper.title}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-[var(--fg-muted)]">
                  {paper.venue}
                </p>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {paper.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 font-mono text-[10px] text-[var(--fg-muted)]"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                {/* Summary */}
                <p className="mt-3 text-xs leading-relaxed text-[var(--fg-muted)]">
                  {paper.summary}
                </p>

                {/* Technical Bullet Highlights */}
                <ul className="mt-3 space-y-1.5 border-t border-[var(--line)]/50 pt-3 text-[11px] text-[var(--fg-muted)]">
                  {paper.architecturePoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[var(--accent)] select-none shrink-0">›</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Link */}
              <div className="mt-6 border-t border-[var(--line)] pt-3">
                {paper.isExternal ? (
                  <a
                    href={paper.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 font-mono text-xs text-[var(--accent)] hover:underline"
                  >
                    <span>Open Dataset on Kaggle</span>
                    <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                  </a>
                ) : (
                  <Link
                    href={paper.href}
                    className="group inline-flex items-center gap-1.5 font-mono text-xs text-[var(--accent)] hover:underline"
                  >
                    <span>Read Technical Specification</span>
                    <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                  </Link>
                )}
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
