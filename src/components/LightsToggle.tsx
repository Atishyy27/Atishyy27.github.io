"use client";

import { useEffect, useState } from "react";
import { setLights, useLights, type Lights } from "@/lib/lights";

/**
 * The lights switch, in the nav.
 *
 * Two segments rather than one icon, because an icon-only toggle never says
 * which of the two states you are currently in. The active segment is chosen
 * by CSS from <html data-lights> (see globals.css), not from React state, so
 * a visitor who picked flat does not watch the pill snap across on every page
 * load: the boot script sets the attribute before the first paint, and the
 * pill is already correct in that frame. React state is still read here for
 * aria-pressed, which only settles after hydration, and that is fine for a
 * control whose visual state is already right.
 */

const MODES: [Lights, string, string][] = [
  ["full", "full", "3D, blur and motion on"],
  ["flat", "flat", "no 3D, no blur, no motion"],
];

export default function LightsToggle() {
  const mode = useLights();
  const [hint, setHint] = useState<string | null>(null);

  // Shift+L, for the same reason the keyboard on /writing exists: this site
  // tells people its shortcuts. Ignored while a field has focus, otherwise it
  // would fire mid-word in the command palette's search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() !== "l") return;
      const el = document.activeElement;
      const tag = el?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || (el as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      const next = document.documentElement.dataset.lights === "flat" ? "full" : "flat";
      setLights(next);
      setHint(next);
      window.setTimeout(() => setHint(null), 1400);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <div
        className="inline-flex rounded-full border border-[var(--line)] p-[3px]"
        role="group"
        aria-label="Page rendering"
      >
        {MODES.map(([m, label, title]) => (
          <button
            key={m}
            data-mode={m}
            onClick={() => setLights(m)}
            aria-pressed={mode === "unknown" ? m === "full" : mode === m}
            title={title}
            className="lights-seg rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Confirms the keyboard shortcut did something. Without it, Shift+L on a
          page with no canvas on screen looks like nothing happened. */}
      {hint && (
        <span className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded border border-[var(--line)] bg-[var(--bg-raised)] px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
          lights {hint}
        </span>
      )}
    </div>
  );
}
