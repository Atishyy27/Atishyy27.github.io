"use client";

import { useEffect } from "react";
import { track, analyticsEnabled } from "@/lib/analytics";
import { capture, posthogEnabled } from "@/lib/posthog";

/**
 * Mounts once. Measures how long each <section id> is on screen (dwell),
 * and logs link/button clicks. Sends to Supabase via the analytics lib.
 */
export default function Track() {
  useEffect(() => {
    // Was gated entirely on the Supabase keys, which have never been set, so
    // this whole component did nothing. PostHog is the thing that is actually
    // running, so each sink is now checked on its own.
    if (!analyticsEnabled && !posthogEnabled) return;

    track({ type: "view", target: location.pathname });

    // dwell per section
    const enter = new Map<string, number>();
    const dwell = new Map<string, number>();
    const secs = Array.from(document.querySelectorAll<HTMLElement>("section[id], footer[id]"));

    const io = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        for (const e of entries) {
          const id = e.target.id;
          if (e.isIntersecting) {
            if (!enter.has(id)) enter.set(id, now);
          } else if (enter.has(id)) {
            dwell.set(id, (dwell.get(id) ?? 0) + (now - enter.get(id)!));
            enter.delete(id);
          }
        }
      },
      { threshold: 0.5 }
    );
    secs.forEach((s) => io.observe(s));

    const flush = () => {
      const now = performance.now();
      for (const [id, t] of enter) {
        dwell.set(id, (dwell.get(id) ?? 0) + (now - t));
        enter.set(id, now);
      }
      for (const [id, ms] of dwell) {
        if (ms > 800) {
          track({ type: "dwell", target: id, ms: Math.round(ms) });
          capture("section_dwell", { section: id, ms: Math.round(ms), page: location.pathname });
        }
      }
      dwell.clear();
    };

    // clicks on links / tracked buttons
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("a, [data-track]") as HTMLElement | null;
      if (!el) return;
      const target = el.getAttribute("href") || el.getAttribute("data-track") || el.textContent?.slice(0, 40) || "?";
      track({ type: "click", target });
      // Mirrored into PostHog as a named event as well as autocapture, because
      // an autocaptured click is identified by a CSS selector and this one is
      // identified by where it goes, which is the question worth asking.
      capture("link_click", {
        target,
        outbound: target.startsWith("http"),
        page: location.pathname,
      });
    };
    document.addEventListener("click", onClick, { capture: true });

    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    const interval = setInterval(flush, 20000); // periodic flush for long sessions

    return () => {
      flush();
      io.disconnect();
      document.removeEventListener("click", onClick, { capture: true } as EventListenerOptions);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      clearInterval(interval);
    };
  }, []);

  return null;
}
