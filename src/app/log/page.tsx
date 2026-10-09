"use client";

import BuildLog from "@/components/BuildLog";
import Terminal from "@/components/Terminal";
import { Head, Wrap } from "@/components/Section";
import { Keyboard3DMount } from "@/components/SceneMount";

export default function Log() {
  return (
    <main className="relative pt-24">
      {/* BUILD LOG */}
      <Wrap id="log">
        <Head n="01" title="Build log" kicker="Notes from building things, with the thing itself embedded rather than described." />
        <BuildLog />
      </Wrap>

      {/* THE KEYBOARD. On the typing page rather than the home page, and it
          earns its place by documenting the site's real shortcuts: the lit
          caps are the ones Palette.tsx actually listens for. */}
      <Wrap id="keyboard">
        <Head
          n="02"
          title="Shortcuts"
          kicker="Your keyboard drives this one. The lit caps do something here; command or control plus K opens the palette."
        />
        <Keyboard3DMount />
      </Wrap>

      {/* ASK / TERMINAL */}
      <Wrap id="terminal">
        <Head n="03" title="Or just ask" kicker="Search my work from the shell. The answer is the real sentence from the real source, not a paraphrase of it." />
        <Terminal />
      </Wrap>
    </main>
  );
}
