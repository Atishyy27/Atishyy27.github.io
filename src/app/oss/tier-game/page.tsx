import Link from "next/link";
import type { Metadata } from "next";
import { ossTiers } from "@/content/oss";
import TierGame from "@/components/TierGame";

export const metadata: Metadata = {
  title: "Tier my repos · Atishay Jain",
  description: "Drag my merged open-source repos into S to C tiers, then see how close you got.",
};

export default function TierGamePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24 sm:px-8">
      <Link
        href="/oss/"
        className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)] hover:text-[var(--fg)]"
      >
        &larr; open source
      </Link>
      <h1 className="display mt-6 text-[length:var(--step-display)]">Tier my repos</h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-[var(--fg-muted)]">
        Every repository where a pull request of mine landed. Rank them yourself, then
        compare with the objective tiers (S is L4, A is L3, B is L2, C is L1).
      </p>
      <div className="mt-10">
        <TierGame tiers={ossTiers} />
      </div>
    </main>
  );
}
