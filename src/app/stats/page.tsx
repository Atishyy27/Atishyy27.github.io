"use client";

import { CpSection } from "@/components/Panels";
import UnifiedHeatmap from "@/components/UnifiedHeatmap";
import { Head, Wrap } from "@/components/Section";

export default function Stats() {
  return (
    <main className="relative pt-24">
      {/* COMPETITIVE PROGRAMMING */}
      <Wrap id="cp">
        <Head n="01" title="The numbers" kicker="ICPC 2025, Rank 12 at the Mysuru on-site regionals. Live cards, straight from each platform." />
        <CpSection />
      </Wrap>

      {/* ONE YEAR, EVERY PLATFORM — the same grid the home page shows, given room */}
      <Wrap id="year">
        <Head n="02" title="A year of days" kicker="GitHub, Codeforces and LeetCode summed into one cell per day. Orbit it in 3D, or read it flat." />
        <UnifiedHeatmap />
      </Wrap>
    </main>
  );
}
