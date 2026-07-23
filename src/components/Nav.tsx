"use client";

import { useEffect, useState } from "react";

const LINKS = [
  ["Open source", "opensource"],
  ["Shipped", "work"],
  ["Products", "products"],
  ["Hackathons", "hackathons"],
  ["Stats", "cp"],
  ["About", "about"],
];

export default function Nav() {
  const [active, setActive] = useState("");
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const ids = LINKS.map(([, id]) => id).concat("resume");
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
        solid ? "border-b border-[var(--line)] bg-[#07090dcc] backdrop-blur-lg" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <a
          href="#top"
          onClick={() => window.dispatchEvent(new CustomEvent("aj-logo-poke"))}
          className="font-mono text-sm font-medium tracking-tight"
        >
          AJ<span className="text-[var(--accent)]">.</span>
        </a>
        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className={`text-xs transition-colors ${
                active === id ? "text-[var(--accent)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="rounded-full border border-[var(--line)] px-4 py-1.5 text-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Contact
        </a>
      </div>
    </nav>
  );
}
