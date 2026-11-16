"use client";

import { Reveal, Tilt } from "./Chrome";

const PRINCIPLES = [
  {
    num: "01",
    title: "Correctness before cleverness.",
    body: "A booking system that occasionally allocates the same slot twice is not a scalable system, regardless of how many requests it handles. Concurrency invariants and transactional guarantees come before premature micro-optimizations.",
  },
  {
    num: "02",
    title: "Understand before rewriting.",
    body: "When contributing to complex unfamiliar codebases (like Cilium or rust-lightning), the instinct to refactor is usually wrong. I isolate the minimal reproduction, trace the execution boundary, and commit the smallest correct fix.",
  },
  {
    num: "03",
    title: "Measure, don't assume.",
    body: "Load tests, reproducible benchmarks, failure matrices, and real-time observability are structural requirements. A latency claim without its workload distribution, hardware, and methodology is not an engineering metric.",
  },
  {
    num: "04",
    title: "Build for actual users.",
    body: "I build software people can use without signing up for anything. High-leverage tools respect user autonomy, work under hostile real-world bandwidth constraints, and solve immediate problems cleanly.",
  },
  {
    num: "05",
    title: "Leave systems easier to understand.",
    body: "Good engineering is not just getting code accepted; it is making the next modification safer. Clear invariant assertions, strict type boundaries, and documented edge cases outlast the author.",
  },
];

export default function EngineeringPhilosophy() {
  return (
    <section className="border-t border-[var(--line)] pt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] font-semibold">
            05 / ENGINEERING PHILOSOPHY
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight">How I approach engineering</h2>
          <p className="mt-1 text-sm text-[var(--fg-muted)] max-w-xl">
            I care about the parts of software that become visible when things stop going according to plan.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.num} delay={i * 0.05}>
            <Tilt className="flex h-full flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-6 transition-all hover:border-[var(--accent)]/40">
              <div>
                <span className="font-mono text-xs text-[var(--accent)] font-semibold">
                  {p.num}
                </span>
                <h3 className="mt-3 font-medium text-base text-[var(--fg)] leading-snug">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-xs text-[var(--fg-muted)] leading-relaxed">
                  {p.body}
                </p>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
