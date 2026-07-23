"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useSpring } from "framer-motion";

/* ---------------- smooth scroll ---------------- */

export function SmoothScroll() {
  useEffect(() => {
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
  }, []);
  return null;
}

/* ---------------- scroll progress bar ---------------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
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

/* ---------------- custom cursor ---------------- */

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    // pointer:fine keeps this off touch devices, where it's meaningless
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const t = e.target as HTMLElement;
      const interactive = !!t.closest("a, button, [data-cursor]");
      ring.current?.classList.toggle("is-active", interactive);
    };

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.14;
      ringPos.y += (pos.y - ringPos.y) * 0.14;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] hidden md:block">
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </div>
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
  const inView = useInView(ref, { once: true, margin: "-12% 0px -8% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- word-by-word headline ---------------- */

export function SplitHeading({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1 className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/* ---------------- marquee ---------------- */

export function Marquee({ items, speed = 28 }: { items: string[]; speed?: number }) {
  const row = [...items, ...items];
  return (
    <div className="marquee-mask relative flex overflow-hidden py-5">
      <motion.div
        className="flex shrink-0 gap-8 pr-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {row.concat(row).map((t, i) => (
          <span
            key={i}
            className="whitespace-nowrap font-mono text-sm tracking-wide text-[var(--fg-muted)]"
          >
            {t}
            <span className="ml-8 text-[var(--accent)]">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------------- tilt card ---------------- */

// No 3D snap-back (that read as gimmicky). Just a cursor-following sheen and
// a steady lift on hover, handled in CSS.
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

/* ---------------- preloader ---------------- */

export function Preloader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + Math.random() * 18);
      setPct(Math.floor(v));
      if (v >= 100) {
        clearInterval(id);
        setTimeout(() => setDone(true), 380);
      }
    }, 90);
    return () => clearInterval(id);
  }, []);

  if (done) return null;
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-between bg-[#07090d] px-6 pb-6 sm:px-10 sm:pb-10"
      exit={{ opacity: 0 }}
      animate={{ opacity: pct >= 100 ? 0 : 1 }}
      transition={{ duration: 0.35 }}
    >
      <span className="font-mono text-xs tracking-[0.3em] text-[var(--fg-muted)]">
        ATISHAY JAIN
      </span>
      <span className="font-mono text-[12vw] leading-none text-[var(--fg)] sm:text-[7vw]">
        {String(pct).padStart(3, "0")}
      </span>
    </motion.div>
  );
}
