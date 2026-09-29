"use client";

import BuildLog from "@/components/BuildLog";
import Terminal from "@/components/Terminal";
import { Head, Wrap } from "@/components/Section";

export default function Log() {
  return (
    <main className="relative pt-24">
      {/* BUILD LOG */}
      <Wrap id="log">
        <Head n="01" title="Build log" kicker="Notes from building things, with the thing itself embedded rather than described." />
        <BuildLog />
      </Wrap>

      {/* ASK / TERMINAL */}
      <Wrap id="terminal">
        <Head n="02" title="Or just ask" kicker="A small language model runs in your browser and answers from my work. Or drop into the shell." />
        <Terminal />
      </Wrap>
    </main>
  );
}
