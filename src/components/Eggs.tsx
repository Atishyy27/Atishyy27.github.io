"use client";

import { useEffect, useState } from "react";

/* ==================================================================
   Easter eggs. Nothing here is load-bearing — it's for the people who
   poke. Konami code, a console note for whoever opens devtools, and a
   logo that reacts if you keep clicking it (wired via a window event
   the Nav dispatches).
================================================================== */

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
];

export default function Eggs() {
  const [party, setParty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // console note for the curious
  useEffect(() => {
    const c = "color:#3fbdbd;font-family:monospace;font-size:12px";
    // eslint-disable-next-line no-console
    console.log("%c⌁ you opened the console. i like you already.", c);
    // eslint-disable-next-line no-console
    console.log("%cif you're reading this, you're probably hiring. atishayjain2708@gmail.com", "color:#98a2b3;font-family:monospace");
    // eslint-disable-next-line no-console
    console.log("%ctry the konami code ↑↑↓↓←→←→ b a", "color:#ff9d5c;font-family:monospace");
  }, []);

  // konami
  useEffect(() => {
    let seq: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      seq = [...seq, e.key].slice(-KONAMI.length);
      if (seq.join(",").toLowerCase() === KONAMI.join(",").toLowerCase()) {
        setParty((p) => !p);
        setToast("↑↑↓↓←→←→ba · gravity is a suggestion");
        setTimeout(() => setToast(null), 3200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // logo-spam egg (Nav dispatches "aj-logo-poke")
  useEffect(() => {
    let n = 0;
    let t = 0;
    const onPoke = () => {
      const now = performance.now();
      if (now - t > 900) n = 0;
      t = now;
      n++;
      if (n >= 5) {
        n = 0;
        setToast("built at 3am in Indore, mostly. thanks for clicking.");
        setTimeout(() => setToast(null), 3000);
      }
    };
    window.addEventListener("aj-logo-poke", onPoke);
    return () => window.removeEventListener("aj-logo-poke", onPoke);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("party", party);
    return () => document.body.classList.remove("party");
  }, [party]);

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-[var(--accent)] bg-[#0b0f16f2] px-5 py-2 font-mono text-xs text-[var(--accent)] backdrop-blur">
          {toast}
        </div>
      )}
    </>
  );
}
