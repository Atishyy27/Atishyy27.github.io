"use client";

import dynamic from "next/dynamic";
import {
  person, proof, experience, govtWork, clientWork, orgWork, extensions,
  hackathons, otherHackathons, currentWork, ossPrograms,
  publications, education, skills, about as aboutDefault,
} from "@/content/site";
import {
  Cursor, Marquee, Preloader, Reveal, ScrollProgress, SmoothScroll, SplitHeading, Tilt,
} from "@/components/Chrome";
import { CpSection, WorkGrid, WorkExplorer, ResumeEmbed } from "@/components/Panels";
import GitHubActivity from "@/components/GitHubActivity";
import { Logo } from "@/components/Logo";
import Nav from "@/components/Nav";
import Contact from "@/components/Contact";
import Eggs from "@/components/Eggs";
import Terminal from "@/components/Terminal";
import Track from "@/components/Track";
import Palette from "@/components/Palette";
import BuildLog from "@/components/BuildLog";
import { useOverrides } from "@/lib/overrides";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

function Head({ n, title, kicker }: { n: string; title: string; kicker?: string }) {
  return (
    <Reveal className="mb-10">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-[var(--accent)]">{n}</span>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>
      <h2 className="display mt-4 text-4xl sm:text-6xl">{title}</h2>
      {kicker && <p className="mt-3 max-w-2xl text-[var(--fg-muted)]">{kicker}</p>}
    </Reveal>
  );
}

const Wrap = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-20 px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
    <div className="mx-auto w-full max-w-6xl">{children}</div>
  </section>
);

export default function Home() {
  const ov = useOverrides();
  const blurb = ov.blurb ?? person.blurb;
  const about = ov.about ?? aboutDefault;

  return (
    <>
      <Preloader />
      <SmoothScroll />
      <ScrollProgress />
      <Cursor />
      <Eggs />
      <Track />
      <Nav />
      <Palette />
      <Scene />

      <main id="top" className="relative">
        {/* HERO */}
        <header className="relative flex min-h-[100svh] flex-col justify-center px-6 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal y={12}>
              <p className="mb-6 font-mono text-xs tracking-[0.3em] text-[var(--accent)]">
                {person.location.toUpperCase()}
              </p>
            </Reveal>

            <SplitHeading text="Atishay Jain" className="display text-[15vw] leading-[0.85] sm:text-[11vw] lg:text-[8.5rem]" />

            <Reveal delay={0.55} className="mt-6 max-w-2xl">
              <p className="text-lg leading-relaxed text-[var(--fg-muted)] sm:text-xl">{blurb}</p>
            </Reveal>

            <Reveal delay={0.65} className="mt-6 flex flex-wrap gap-2">
              {person.domains.map((d) => (
                <span key={d} className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[10px] text-[var(--fg-muted)]">
                  {d}
                </span>
              ))}
            </Reveal>

            <Reveal delay={0.75} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#contact" className="glass rounded-full px-6 py-3 text-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
                Get in touch →
              </a>
              <a href="#resume" className="link text-sm">Résumé</a>
              {person.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="link text-sm text-[var(--fg-muted)]">
                  {s.label}
                </a>
              ))}
            </Reveal>
          </div>

          <div className="absolute inset-x-0 bottom-8 mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--fg-muted)]">SCROLL ↓</span>
              <span className="hidden font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)] sm:block">
                OPEN THIS IN TWO WINDOWS ✦
              </span>
            </div>
          </div>
        </header>

        {/* PROOF — plain, like a resume line, not a billboard */}
        <section className="px-6 pb-6 sm:px-10 lg:px-16">
          <div className="mx-auto grid w-full max-w-6xl gap-x-10 gap-y-4 border-y border-[var(--line)] py-6 sm:grid-cols-3">
            {proof.map((p, i) => (
              <Reveal key={p.stat} delay={i * 0.06}>
                <a href={p.href} className="block">
                  <span className="font-medium text-[var(--fg)]">{p.stat}</span>
                  <span className="text-[var(--fg-muted)]">, {p.label}</span>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="border-y border-[var(--line)]">
          <Marquee items={["RUST","TYPESCRIPT","FLUTTER","NEXT.JS","SPRING BOOT","POSTGRES","PYTORCH","DOCKER","AWS","BITCOIN LIGHTNING","NEO4J","THREE.JS"]} />
        </div>

        {/* STATS — up top, as asked */}
        <Wrap id="cp">
          <Head n="01" title="The numbers" kicker="ICPC 2025, Rank 12 at the Mysuru on-site regionals. Live cards, straight from each platform." />
          <CpSection />
        </Wrap>

        {/* OPEN SOURCE — live from GitHub */}
        <Wrap id="opensource">
          <Head n="02" title="Open source" kicker="Every PR and issue, pulled live from GitHub. Nothing hand-picked." />
          <Reveal>
            <Tilt className="glass mb-8 rounded-2xl p-8">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h3 className="text-xl font-medium">{currentWork.title}</h3>
                <span className="font-mono text-xs text-[var(--fg-muted)]">since {currentWork.since}</span>
                <span className="rounded-full border border-[var(--accent)] px-3 py-1 font-mono text-[10px] text-[var(--accent)]">{currentWork.badge}</span>
              </div>
              <p className="mt-4 max-w-3xl leading-relaxed text-[var(--fg-muted)]">{currentWork.detail}</p>
            </Tilt>
          </Reveal>
          <GitHubActivity />
          <Reveal><p className="mt-4 font-mono text-xs text-[var(--fg-muted)]">Programs: {ossPrograms.join(" · ")}</p></Reveal>
        </Wrap>

        {/* SHIPPED — filterable, for the interviewer who's looking for one thing */}
        <Wrap id="work">
          <Head n="03" title="Shipped" kicker="Government platforms, client products, institute systems. Filter by what you're looking for." />
          <WorkExplorer
            groups={[
              { kind: "Government", items: govtWork },
              { kind: "Client", items: clientWork },
              { kind: "Institution", items: orgWork },
            ]}
          />
        </Wrap>

        {/* PRODUCTS */}
        <Wrap id="products">
          <Head n="04" title="Products" kicker="Two Chrome extensions people installed without being asked to." />
          <WorkGrid items={extensions} />
        </Wrap>

        {/* HACKATHONS */}
        <Wrap id="hackathons">
          <Head n="05" title="Hackathons" />
          <WorkGrid items={hackathons} />
          <Reveal><p className="mt-8 font-mono text-xs leading-loose text-[var(--fg-muted)]">{otherHackathons.join("  ·  ")}</p></Reveal>
        </Wrap>

        {/* EXPERIENCE */}
        <Wrap id="experience">
          <Head n="06" title="Experience" kicker="Internships and paid engineering work." />
          <ol className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {experience.map((e, i) => (
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
        </Wrap>

        {/* RESEARCH */}
        <Wrap id="publications">
          <Head n="07" title="Research" />
          <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {publications.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <li className="py-6">
                  <h3 className="font-medium">
                    {p.href ? <a href={p.href} target="_blank" rel="noopener noreferrer" className="link text-[var(--accent)]">{p.title} ↗</a> : p.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[var(--fg-muted)]">{p.detail}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Wrap>

        {/* BUILD LOG */}
        <Wrap id="log">
          <Head n="08" title="Build log" kicker="Notes from building things, with the thing itself embedded rather than described." />
          <BuildLog />
        </Wrap>

        {/* ASK / TERMINAL */}
        <Wrap id="terminal">
          <Head n="09" title="Or just ask" kicker="A small language model runs in your browser and answers from my work. Or drop into the shell." />
          <Terminal />
        </Wrap>

        {/* RESUME */}
        <Wrap id="resume"><ResumeEmbed /></Wrap>

        {/* ABOUT */}
        <Wrap id="about">
          <Head n="10" title="About" />
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              {about.map((p, i) => (
                <Reveal key={i} delay={i * 0.06}><p className="text-lg leading-relaxed text-[var(--fg-muted)]">{p}</p></Reveal>
              ))}
            </div>
            <Reveal delay={0.1}>
              <Tilt className="glass rounded-2xl p-7">
                <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent)]">EDUCATION</div>
                <h3 className="mt-3 font-medium leading-snug">{education.school}</h3>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">{education.note}</p>
                <p className="mt-4 text-sm text-[var(--fg-muted)]">{education.degree}</p>
                <p className="mt-1 font-mono text-xs text-[var(--accent)]">{education.cgpa}</p>
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

        {/* CONTACT */}
        <footer id="contact" className="scroll-mt-20 border-t border-[var(--line)] px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal><h2 className="display text-5xl sm:text-7xl">Let&apos;s build something.</h2></Reveal>
            <Reveal delay={0.05}><p className="mt-4 max-w-xl text-[var(--fg-muted)]">A message here reaches me directly, no login, and the email field is optional, so you can stay anonymous if you want. Or just mail me.</p></Reveal>
            <div className="mt-10 grid gap-8 lg:grid-cols-[3fr_2fr]">
              <Contact />
              <Reveal delay={0.1}>
                <div className="flex h-full flex-col justify-between gap-8">
                  <a href={`mailto:${person.email}`} className="link text-lg text-[var(--accent)] sm:text-2xl">{person.email}</a>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {person.socials.map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="link text-sm text-[var(--fg-muted)]">{s.label} ↗</a>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
            <p className="mt-16 font-mono text-[10px] tracking-[0.25em] text-[var(--fg-muted)]">© {new Date().getFullYear()} ATISHAY JAIN</p>
          </div>
        </footer>
      </main>
    </>
  );
}
