"use client";

import { useEffect, useState } from "react";
import LightsToggle from "./LightsToggle";

const LINKS: [string, string][] = [
  ["Projects", "/projects/"],
  ["Open source", "/oss/"],
  ["Stats", "/stats/"],
  ["Writing", "/writing/"],
  ["About", "/about/"],
];

// Real routes, not anchors on this page. Kept separate so the scroll-spy above
// never tries to observe an element that does not exist on the current page.

export default function Nav() {
  const [active, setActive] = useState("");
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const ids: string[] = [];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        solid || open ? "border-b border-[var(--line)] bg-[#07090df2] backdrop-blur-lg md:bg-[#07090dcc]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-10 sm:py-4 lg:px-16">
        <a
          href="/"
          onClick={() => window.dispatchEvent(new CustomEvent("aj-logo-poke"))}
          className="inline-flex min-h-11 items-center font-mono text-sm font-medium tracking-tight"
        >
          AJ<span className="text-[var(--accent)]">.</span>
        </a>
        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map(([label, id]) => (
            <a
              key={id}
              href={id}
              className={`text-xs transition-colors ${
                active === id ? "text-[var(--accent)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {label}
            </a>
          ))}
                            </div>
        <div className="flex items-center gap-3">
          {/* Sits next to Contact rather than with the links, because it acts
              on the page you are already on, not on where you go next. Shown
              at every width on purpose: the phones that need it most are the
              ones the nav links are hidden on. */}
          <LightsToggle />
          <a
            href="/about/#contact"
            className="hidden rounded-full border border-[var(--line)] px-4 py-1.5 text-xs sm:inline-block transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Contact
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M3 5h12M3 9h12M3 13h12" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-[var(--line)] px-4 pb-4 pt-2 md:hidden">
          {[...LINKS, ["Contact", "/about/#contact"] as [string, string]].map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex min-h-12 items-center border-b border-[var(--line)] text-base last:border-b-0 ${
                active === href ? "text-[var(--accent)]" : "text-[var(--fg)]"
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
