"use client";

import { CpSection } from "@/components/Panels";
import { Head, Wrap } from "@/components/Section";

// CpSection already renders the unified heatmap after the CP cards, so this
// page must not mount a second one. Checked with:
//   grep -rn "<UnifiedHeatmap" src/ --include='*.tsx'
export default function Stats() {
  return (
    <main className="relative pt-24">
      <Wrap id="cp">
        <Head
          n="01"
          title="The numbers"
          kicker="ICPC 2025, Rank 12 at the Mysuru on-site regionals. Live cards straight from each platform, then a year of days summed across all three."
        />
        <CpSection />
      </Wrap>
    </main>
  );
}
