"use client";

import { useEffect, useState } from "react";

/**
 * Client-side content overrides.
 *
 * Stored in localStorage, so they are LOCAL to whoever's browser made them.
 * Anyone can open /admin and tweak the copy they see — it never touches the
 * deployed site for other visitors. To publish a change for everyone, export
 * the JSON from /admin and commit it into `content/site.ts` (or hand it to
 * Atishay). That "edits stay on your own machine unless the owner bakes them
 * in" property is exactly what static hosting gives us for free.
 */

export const OV_KEY = "folio_overrides_v1";

export type Overrides = {
  tagline?: string;
  blurb?: string;
  about?: string[];
};

export function readOverrides(): Overrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(OV_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeOverrides(o: Overrides) {
  localStorage.setItem(OV_KEY, JSON.stringify(o));
  // let the live page pick it up without a reload
  window.dispatchEvent(new CustomEvent("folio-overrides"));
}

export function useOverrides(): Overrides {
  const [ov, setOv] = useState<Overrides>({});
  useEffect(() => {
    const sync = () => setOv(readOverrides());
    sync();
    window.addEventListener("folio-overrides", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("folio-overrides", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return ov;
}
