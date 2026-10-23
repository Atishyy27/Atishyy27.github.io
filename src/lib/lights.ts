"use client";

import { useEffect, useState } from "react";

/**
 * Lights: one switch between the full WebGL site and a flat, fast version of
 * the same pages.
 *
 * It is deliberately NOT a light theme. globals.css is dark-committed because
 * the canvases are the light source, and a light palette would fight them.
 * What this turns off is the canvases themselves, the backdrop blur, the hover
 * sheen and the scroll animation, which is what actually costs a visitor on a
 * weak machine, a throttled connection or a battery.
 *
 * The mode lives on <html data-lights> so plain CSS can act on it without
 * waiting for React, and in localStorage so it survives a route change. An
 * inline script in the layout applies it before first paint. Without that
 * script every page would show one frame of the full site before flipping,
 * because this is a static export: every route ships the same HTML.
 */

export type Lights = "full" | "flat";

export const LIGHTS_KEY = "aj-lights";
const EVENT = "aj-lights-change";

/**
 * Inlined into the document head and run before anything paints, so it is kept
 * small and wrapped: localStorage throws outright in a locked-down browser,
 * and an exception here would stop the rest of the head executing.
 */
export const LIGHTS_BOOT =
  `try{var m=localStorage.getItem('${LIGHTS_KEY}');` +
  `if(m==='flat')document.documentElement.dataset.lights='flat';}catch(e){}`;

export function readLights(): Lights {
  if (typeof document === "undefined") return "full";
  return document.documentElement.dataset.lights === "flat" ? "flat" : "full";
}

export function setLights(mode: Lights) {
  if (mode === "flat") document.documentElement.dataset.lights = "flat";
  else delete document.documentElement.dataset.lights;
  try {
    localStorage.setItem(LIGHTS_KEY, mode);
  } catch {
    // Private windows and blocked site data: the switch still works for this
    // page view, it just will not be remembered. Not worth telling anyone.
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * "unknown" until the first effect runs. The server cannot know the visitor's
 * choice, so every caller must render the same thing on the server and on the
 * first client pass; reading the attribute during render instead would be a
 * hydration mismatch on every page.
 */
export function useLights(): Lights | "unknown" {
  const [mode, setMode] = useState<Lights | "unknown">("unknown");
  useEffect(() => {
    const sync = () => setMode(readLights());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return mode;
}
