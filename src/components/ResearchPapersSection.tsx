"use client";

import { useState } from "react";

export default function ResearchPapersSection() {
  const [expandedPaper, setExpandedPaper] = useState<string | null>("fl-healthcare");

  const papers = [
    {
      id: "fl-healthcare",
      title: "Blockchain-Secured Federated Learning for Multi-Modal Healthcare",
      venue: "IIITM Gwalior Research Symposium · C3iHub IIT Kanpur",
      role: "Lead Architecture & Pipeline Intern",
      status: "Presented & Archived",
      badges: ["Federated Learning", "Hyperledger Fabric", "PyTorch", "Healthcare AI"],
      summary:
        "Privacy-preserving pneumonia diagnosis across distributed clinical institutions without transferring raw patient radiographs or EHR data.",
      metrics: [
        { label: "AUC-ROC", value: "94.2%", detail: "on non-IID split" },
        { label: "Backbones", value: "DenseNet / EfficientNet", detail: "swappable modules" },
        { label: "Audit Layer", value: "Hyperledger Fabric", detail: "tamper-proof ledger" },
        { label: "Privacy", value: "Zero Data Egress", detail: "local gradient updates" },
      ],
      details: [
        "Architected a modular federated learning framework separating local client training logic from server-side aggregation (FedAvg with adaptive momentum).",
        "Integrated a Hyperledger Fabric distributed ledger where every federation round records model weight hashes, client contributions, and validation scores, preventing post-round manipulation.",
        "Validated across non-IID multi-modal datasets (Chest X-Rays paired with clinical tabular EHR), achieving 94.2% AUC under extreme inter-hospital feature skew.",
      ],
    },
    {
      id: "graph-forensics",
      title: "Graph-Feature Machine Learning & Explainable AI for Anti-Money Laundering",
      venue: "CIIS 2025 · National CyberShield Hackathon Finalist",
      role: "Algorithm & Explainability Lead",
      status: "National Top 5 (of 500+ teams)",
      badges: ["Graph ML", "SHAP XAI", "Gradient Boosted Trees", "Financial Forensics"],
      summary:
        "Topological network feature extraction paired with gradient-boosted trees and SHAP explainability to identify mule networks and layering schemes across ~51,000 synthetic transactions.",
      metrics: [
        { label: "National Standing", value: "Top 5", detail: "of 500+ teams" },
        { label: "Dataset Scale", value: "~51,000", detail: "synthetic transactions" },
        { label: "Explainability", value: "SHAP Layer", detail: "per-flag feature vector" },
        { label: "Detection Scope", value: "Mules & Layering", detail: "graph flow velocity" },
      ],
      details: [
        "Extracted structural graph topology metrics (in/out degree ratios, temporal flow velocity, cycle indicators) to capture multi-hop layering and smurfing rings that bypass threshold-based alerts.",
        "Built a gradient-boosted classifier combined with a real-time SHAP explanation engine, translating model decisions into human-interpretable feature vectors so financial intelligence analysts can immediately justify freezing flagged accounts.",
      ],
    },
    {
      id: "synthetic-dataset",
      title: "Synthetic Sign Classifier Dataset",
      venue: "Kaggle Open Dataset · CC BY 4.0",
      role: "Dataset Creator",
      status: "Published Open Dataset",
      badges: ["Computer Vision", "Dataset Engineering", "Data Augmentation"],
      summary:
        "A 258.7 MB procedurally generated and augmented visual dataset designed to solve critical training data scarcity in rare multi-class sign detection.",
      metrics: [
        { label: "Size", value: "258.7 MB", detail: "curated images" },
        { label: "License", value: "CC BY 4.0", detail: "open academic use" },
        { label: "Platform", value: "Kaggle", detail: "verified dataset" },
      ],
      details: [
        "Synthetically generated edge-case visual signage with varied chromatic aberrations, lighting conditions, and perspective warping to prevent model overfitting on rare categories.",
      ],
      link: "https://www.kaggle.com/datasets/atzjit/synthetic-sign-classifier-dataset",
    },
  ];

  return (
    <section className="mt-12 rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-medium">Research Work & Technical Preprints</h2>
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--accent)] font-medium">
              3 Papers & Datasets
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[var(--fg-muted)] max-w-2xl leading-relaxed">
            Architectural investigations in federated systems, tamper-evident distributed ledgers, explainable machine
            learning, and synthetic benchmark design.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {papers.map((paper) => {
          const isExpanded = expandedPaper === paper.id;

          return (
            <div
              key={paper.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-5 sm:p-6 transition-all hover:border-[var(--line-strong)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-[var(--accent)] font-medium">{paper.venue}</span>
                    <span className="rounded bg-[var(--bg-raised)] px-2 py-0.5 font-mono text-[10px] text-[var(--fg-muted)] border border-[var(--line)]">
                      {paper.status}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-[var(--fg)]">{paper.title}</h3>
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{paper.summary}</p>
                </div>

                {paper.link && (
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-1 font-mono text-xs text-[var(--accent)] hover:border-[var(--accent)] shrink-0"
                  >
                    Open Dataset ↗
                  </a>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[var(--line)]/60 pt-4">
                {paper.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg bg-[var(--bg-raised)]/60 p-3 border border-[var(--line)]/40">
                    <div className="font-mono text-[10px] uppercase text-[var(--fg-muted)] tracking-wider">{m.label}</div>
                    <div className="text-base sm:text-lg font-medium text-[var(--accent)] mt-0.5">{m.value}</div>
                    <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">{m.detail}</div>
                  </div>
                ))}
              </div>

              {/* Badges & Expandable Deep Dive */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {paper.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded bg-[var(--bg-raised)] px-2 py-0.5 font-mono text-[10px] text-[var(--fg-muted)] border border-[var(--line)]/50"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                  className="font-mono text-xs text-[var(--accent)] hover:underline"
                >
                  {isExpanded ? "Hide architecture details ↑" : "Architecture & methodology breakdown ↓"}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 rounded-lg bg-[var(--bg-raised)]/40 p-4 border border-[var(--line)]/60">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] font-semibold mb-2">
                    Methodology & Engineering Specifications
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
                    {paper.details.map((d, idx) => (
                      <li key={idx} className="flex gap-2.5">
                        <span className="text-[var(--accent)] shrink-0 font-mono">▸</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
