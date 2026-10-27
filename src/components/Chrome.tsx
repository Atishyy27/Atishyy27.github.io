"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import { useLights } from "@/lib/lights";

/* ---------------- smooth scroll ---------------- */

export function SmoothScroll() {
  const lights = useLights();
  useEffect(() => {
    // Waits for the real answer rather than starting on "unknown" and tearing
    // down a frame later: Lenis takes over the scroll on construction, and
    // handing it back immediately is visible as a jolt.
    if (lights !== "full") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;

    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [lights]);
  return null;
}

/* ---------------- scroll progress bar ---------------- */

export function ScrollProgress() {
  const lights = useLights();
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  // Hooks run either way, because they cannot be called conditionally; only
  // the bar itself goes. A spring ticking every frame is exactly the kind of
  // thing the flat mode exists to stop.
  if (lights === "flat") return null;
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: x }}
      className="fixed left-0 top-0 z-50 h-[2px] w-full origin-left"
    >
      <div className="h-full w-full bg-[var(--accent)]" />
    </motion.div>
  );
}

/* ---------------- scroll reveal ---------------- */

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const lights = useLights();

  /**
   * Content is VISIBLE in the server HTML and stays visible unless we have
   * positively established, in a browser, that it is off screen and therefore
   * safe to hide and animate in.
   *
   * It used to be the other way round: `initial={{ opacity: 0 }}` put
   * opacity:0 into the shipped HTML and something had to arrive later to undo
   * it. Twice now that undo did not happen. First an observer margin of -12%
   * excluded the top of the viewport, so the "01 About" heading never
   * appeared. Then, after that fix, the store shelf on the home page stayed at
   * opacity 0 through a 90-second render even with a one-second failsafe, and
   * the shelf is the entire argument of that page. Two different causes, one
   * shared design fault: the page was one unfired callback away from being
   * blank, and a reveal animation is not worth that.
   *
   * Now the failure mode is inverted. If this hook never runs, if the observer
   * never fires, if framer-motion fails to load, the reader sees the content.
   * They just do not see it fade in, which nobody has ever complained about.
   *
   * `armed` is set in a layout effect, before paint, so an element that IS
   * below the fold still gets its animation with no flash of it sitting there
   * already visible.
   */
  const [armed, setArmed] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const belowFold = el.getBoundingClientRect().top > window.innerHeight * 0.92;
    if (belowFold) setArmed(true);
  }, []);

  // data-reveal is what the flat-mode rule in globals.css targets. It has to
  // be CSS and not only this branch: the branch cannot run until hydration.
  if (lights === "flat") {
    return (
      <div ref={ref} data-reveal className={className}>
        {children}
      </div>
    );
  }

  const hidden = armed && !inView;

  return (
    <motion.div
      ref={ref}
      data-reveal
      className={className}
      // `false`, not an object: this is what keeps opacity:0 out of the
      // server-rendered HTML entirely.
      initial={false}
      animate={hidden ? { opacity: 0, y } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- tilt card ---------------- */

// No 3D snap-back (that read as gimmicky). Just a cursor-following sheen and
// a steady lift on hover, handled in CSS. Both are switched off in flat mode
// by globals.css, so there is nothing to branch on here.
export function Tilt({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div ref={ref} onPointerMove={onMove} className={`tilt ${className ?? ""}`}>
      {children}
    </div>
  );
}
