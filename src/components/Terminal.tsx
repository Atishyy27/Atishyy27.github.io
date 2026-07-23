"use client";

import { useEffect, useRef, useState } from "react";
import {
  person, about, experience, govtWork, clientWork, orgWork,
  extensions, hackathons, cpProfiles,
} from "@/content/site";
import { answer as ragAnswer } from "@/lib/rag";

/* ==================================================================
   The terminal. Commands run instantly; `ask <question>` boots the
   in-browser SLM (see lib/rag.ts) and answers from real content.
================================================================== */

type Line = { t: "in" | "out" | "sys" | "link" | "think"; text: string; href?: string };

const BANNER = [
  "atishay.tech, interactive shell",
  "type `help`, or `ask <anything about my work>` to boot the on-device model",
];

// one click each, so nobody has to guess what this thing knows
const SUGGESTIONS = [
  "ask have you worked in java",
  "ask what open source have you shipped",
  "ask what did you build for the government",
  "stats",
  "ls",
];

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(BANNER.map((text) => ({ t: "sys", text })));
  const [val, setVal] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo(0, scroller.current.scrollHeight);
  }, [lines]);

  // the command palette can hand focus straight here
  useEffect(() => {
    const focus = () => input.current?.focus();
    window.addEventListener("aj-focus-terminal", focus);
    return () => window.removeEventListener("aj-focus-terminal", focus);
  }, []);

  function push(...l: Line[]) {
    setLines((prev) => [...prev, ...l]);
  }
  // replace the last line (used to animate the model's status in place)
  function replaceLast(l: Line) {
    setLines((prev) => [...prev.slice(0, -1), l]);
  }

  async function runAsk(arg: string) {
    if (!arg) { push({ t: "out", text: "usage: ask <question>, e.g. ask have you worked in java" }); return; }
    setBusy(true);
    push({ t: "think", text: "booting model…" });
    try {
      const { text, sources } = await ragAnswer(arg, (s) => replaceLast({ t: "think", text: `${s}…` }));
      replaceLast({ t: "out", text });
      sources.forEach((s) => s.href && push({ t: "link", text: `↳ ${s.label}`, href: s.href }));
    } catch {
      replaceLast({ t: "out", text: "the model couldn't load here. try `ls` or ask me by email." });
    } finally {
      setBusy(false);
    }
  }

  function run(raw: string) {
    const cmd = raw.trim();
    push({ t: "in", text: cmd });
    if (!cmd) return;
    setHist((h) => [cmd, ...h]);
    setHi(-1);

    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");

    switch (name.toLowerCase()) {
      case "help":
        push({ t: "out", text: "help  whoami  about  ls  open <name>  oss  stats  resume  contact  social  ask <q>  clear" });
        break;
      case "whoami":
        push({ t: "out", text: `${person.name} · ${person.tagline}` }, { t: "out", text: person.blurb });
        break;
      case "about":
        about.forEach((p) => push({ t: "out", text: p }));
        break;
      case "ls":
      case "projects":
        push({ t: "out", text: [...govtWork, ...clientWork, ...orgWork, ...extensions, ...hackathons].map((w) => w.name).join("   ") });
        break;
      case "open": {
        const hit = [...govtWork, ...clientWork, ...orgWork, ...extensions, ...hackathons].find((w) => w.name.toLowerCase().includes(arg.toLowerCase()));
        if (hit?.links[0]) push({ t: "link", text: `opening ${hit.name}`, href: hit.links[0].href });
        else push({ t: "out", text: arg ? `no public link for "${arg}"` : "usage: open <name>" });
        break;
      }
      case "oss":
        push({ t: "out", text: "74 PRs across open-source infra. Merged fixes in rust-lightning, OPA, Meshery, zowe-cli, braidpool." }, { t: "link", text: "see the live list", href: "#opensource" });
        break;
      case "stats":
        cpProfiles.forEach((p) => push({ t: "out", text: `${p.site.padEnd(11)} ${p.rank} · ${p.detail}` }));
        break;
      case "resume":
        push({ t: "link", text: "opening resume.pdf", href: person.resumeHref });
        break;
      case "contact":
      case "email":
        push({ t: "link", text: person.email, href: `mailto:${person.email}` });
        break;
      case "social":
        person.socials.forEach((s) => push({ t: "link", text: s.label, href: s.href }));
        break;
      case "ask":
        runAsk(arg);
        break;
      case "sudo":
        push({ t: "sys", text: "nice try. you already have root here." });
        break;
      case "clear":
        setLines([]);
        break;
      case "hi":
      case "hello":
        push({ t: "out", text: "hey. `ask` me something about my work, or `ls` the projects." });
        break;
      default:
        push({ t: "out", text: `command not found: ${name}. try \`help\`.` });
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { run(val); setVal(""); }
    else if (e.key === "ArrowUp") { e.preventDefault(); const n = Math.min(hi + 1, hist.length - 1); if (hist[n] !== undefined) { setHi(n); setVal(hist[n]); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); const n = Math.max(hi - 1, -1); setHi(n); setVal(n === -1 ? "" : hist[n]); }
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#080b10]/90 font-mono text-sm shadow-2xl backdrop-blur"
      onClick={() => input.current?.focus()}
      data-cursor
    >
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-xs text-[var(--fg-muted)]">atishay@portfolio ~ %</span>
      </div>
      <div ref={scroller} className="h-72 space-y-1 overflow-y-auto px-4 py-4">
        {lines.map((l, i) =>
          l.t === "in" ? (
            <div key={i} className="flex gap-2">
              <span className="text-[var(--accent)]">❯</span>
              <span>{l.text}</span>
            </div>
          ) : l.t === "link" ? (
            <a key={i} href={l.href} target={l.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block pl-4 text-[var(--accent)] underline underline-offset-4">
              {l.text}
            </a>
          ) : l.t === "think" ? (
            <div key={i} className="flex items-center gap-2 pl-4 text-[var(--accent-2)]">
              <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[var(--accent-2)]" />
              {l.text}
            </div>
          ) : (
            <div key={i} className={`pl-4 ${l.t === "sys" ? "text-[var(--accent-2)]" : "text-[var(--fg-muted)]"}`}>
              {l.text}
            </div>
          )
        )}
        <div className="flex gap-2">
          <span className="text-[var(--accent)]">❯</span>
          <input
            ref={input}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-[var(--fg)] outline-none"
            aria-label="terminal input"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[var(--line)] px-4 py-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            disabled={busy}
            onClick={(e) => { e.stopPropagation(); run(s); }}
            className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
