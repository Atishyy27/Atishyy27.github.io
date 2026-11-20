// Standing levels for an organisation (ATZOSS v2, source cnc/OSS/TIERS.md).
// Kept apart from oss.ts so client components can use the colours without
// pulling the whole data file into the browser bundle.

export const LEVELS = [
  { level: "L4", label: "Maintainer-track", meaning: "triage or write access inside a project", color: "#a371f7" },
  { level: "L3", label: "Trusted", meaning: "five or more merges, or a shipped feature", color: "#d29922" },
  { level: "L2", label: "Recurring", meaning: "a maintainer took the work more than once", color: "#3fb950" },
  { level: "L1", label: "Drive-by", meaning: "a single fix that landed", color: "#58a6ff" },
] as const;

export function levelColor(level: string): string | undefined {
  return LEVELS.find((l) => l.level === level)?.color;
}
