"use client";

import {
  experience, publications, education, skills, about as aboutDefault,
} from "@/content/site";
import { Reveal, Tilt } from "@/components/Chrome";
import { ResumeEmbed } from "@/components/Panels";
import { Logo } from "@/components/Logo";
import Contact from "@/components/Contact";
import { useOverrides } from "@/lib/overrides";
import { Avatar3DMount } from "@/components/SceneMount";
import { hasAvatar } from "@/content/assets";
import { Head, Wrap } from "@/components/Section";
import Achievements from "@/components/Achievements";

export default function About() {
  const ov = useOverrides();
  const about = ov.about ?? aboutDefault;

  let n = 0;
  const step = () => String(++n).padStart(2, "0");

  return (
    <main className="relative pt-24">
      <h1 className="sr-only">About Atishay Jain</h1>
      {/* 1. PINNED RESUME */}
      <Wrap id="resume">
        <Head
          n={step()}
          title="Résumé"
          kicker="Direct view of verified experience, technical stack, and education. Download PDF or read inline."
        />
        <ResumeEmbed />
      </Wrap>

      {/* 2. PINNED RESEARCH */}
      <Wrap id="publications">
        <Head
          n={step()}
          title="Research"
          kicker="Peer-reviewed symposium presentations, synthetic benchmark datasets, and federated learning architecture."
        />
        <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {publications.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <li className="py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-medium text-base sm:text-lg">
                    {p.href ? (
                      <a href={p.href} target="_blank" rel="noopener noreferrer" className="link text-[var(--accent)]">
                        {p.title} ↗
                      </a>
                    ) : (
                      p.title
                    )}
                  </h3>
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--accent)] font-medium">
                    Research
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--fg-muted)] leading-relaxed">{p.detail}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Wrap>

      {/* 3. ABOUT & EDUCATION */}
      <Wrap id="about">
        <Head n={step()} title="About" />
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {about.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className="text-lg leading-relaxed text-[var(--fg-muted)]">{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <img
              src="/me/atishay.webp"
              alt="Atishay Jain"
              width={480}
              height={480}
              className="mb-6 h-32 w-32 rounded-2xl border border-[var(--line)] object-cover"
            />
            <Tilt className="glass rounded-2xl p-7">
              <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent)]">EDUCATION</div>
              <h3 className="mt-3 font-medium leading-snug">{education.school}</h3>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">{education.note}</p>
              <p className="mt-4 text-sm text-[var(--fg-muted)]">{education.degree}</p>
              <p className="mt-1 font-mono text-[10px] text-[var(--fg-muted)]">{education.dates}</p>
            </Tilt>
          </Reveal>
        </div>
        <div className="mt-14 space-y-5">
          {skills.map((s, i) => (
            <Reveal key={s.group} delay={i * 0.04}>
              <div className="flex flex-col gap-2 border-b border-[var(--line)] pb-5 md:flex-row md:gap-10">
                <div className="w-40 shrink-0 font-medium">{s.group}</div>
                <div className="font-mono text-xs leading-loose text-[var(--fg-muted)]">{s.items.join("  ·  ")}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>

      {/* 4. ACHIEVEMENTS & ICPC PHOTOS */}
      <Wrap id="achievements">
        <Head
          n={step()}
          title="Achievements & Contests"
          kicker="ICPC Asia Amritapuri Regional on-site finals, National CyberShield Hackathon, and contest standings with full photo documentation."
        />
        <Achievements />
      </Wrap>

      {/* 5. EXPERIENCE */}
      <Wrap id="experience">
        <Head n={step()} title="Experience" kicker="Internships and paid engineering work." />
        <ol className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {experience.filter((e) => e.points?.length).map((e, i) => (
            <Reveal key={e.org} delay={Math.min(i, 4) * 0.04}>
              <li className="grid gap-4 py-8 md:grid-cols-[1fr_2fr] md:gap-12">
                <div className="flex gap-4">
                  <Logo name={e.org} domain={e.domain} />
                  <div>
                    <h3 className="text-lg font-medium tracking-tight">{e.org}</h3>
                    <p className="mt-1 font-mono text-xs text-[var(--accent)]">{e.dates}</p>
                    <p className="mt-1 text-sm text-[var(--fg-muted)]">{e.role}{e.place ? ` · ${e.place}` : ""}{e.note ? ` · ${e.note}` : ""}</p>
                  </div>
                </div>
                {e.points && (
                  <ul className="space-y-3">
                    {e.points.map((pt, k) => (
                      <li key={k} className="flex gap-3 leading-relaxed text-[var(--fg-muted)]">
                        <span aria-hidden className="text-[var(--accent)]">·</span><span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </Reveal>
          ))}
        </ol>
        {experience.some((e) => !e.points?.length) && (
          <p className="mt-8 border-t border-[var(--line)] pt-6 text-sm leading-relaxed text-[var(--fg-muted)]">
            <span className="text-[var(--fg)]">Earlier: </span>
            {experience
              .filter((e) => !e.points?.length)
              .map((e) => `${e.org} (${e.role}, ${e.dates})`)
              .join(" · ")}
          </p>
        )}
      </Wrap>

      {/* AVATAR */}
      {hasAvatar ? (
        <Wrap id="avatar">
          <Head n={step()} title="Me, roughly" kicker="A GLB file, turned in your browser. Not a render." />
          <Avatar3DMount present />
        </Wrap>
      ) : null}

      {/* 6. CONTACT */}
      <Wrap id="contact">
        <Head n={step()} title="Get in touch" kicker="Goes straight to my inbox." />
        <Contact />
      </Wrap>
    </main>
  );
}
