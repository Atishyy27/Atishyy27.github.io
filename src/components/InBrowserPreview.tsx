"use client";

import { useState } from "react";

interface LiveProject {
  id: string;
  name: string;
  tagline: string;
  url: string;
  badge: string;
  description: string;
}

const LIVE_PROJECTS: LiveProject[] = [
  {
    id: "ek-awaaz",
    name: "Ek Awaaz",
    tagline: "Voice-AI Cross-Lingual Voiceover (Gnani AI Hackathon)",
    url: "https://gnani-entry.vercel.app",
    badge: "Voice AI",
    description:
      "Polished full-stack AI cross-lingual voice translation & dubbing web application. Live deployment on Vercel.",
  },
  {
    id: "techfest",
    name: "SGSITS Techfest 2025",
    tagline: "College Techfest Platform with 3D WebGL & Localisation",
    url: "https://sgsits-techfest-2025.vercel.app/",
    badge: "WebGL / Three.js",
    description:
      "Real-world high-traffic college techfest portal with 3D canvas visuals, bilingual Hindi/English localisation.",
  },
  {
    id: "genius-solar",
    name: "Genius Solar Services",
    tagline: "Commercial Solar Lead Capture & Energy Estimator",
    url: "https://geniussolarservices.com/",
    badge: "Production Client",
    description:
      "Clean production frontend built for a commercial solar energy provider with dynamic intake funnels.",
  },
];

export default function InBrowserPreview() {
  const [selectedId, setSelectedId] = useState(LIVE_PROJECTS[0].id);
  const [iframeKey, setIframeKey] = useState(0);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [hasLoaded, setHasLoaded] = useState(false);

  const current = LIVE_PROJECTS.find((p) => p.id === selectedId) || LIVE_PROJECTS[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setHasLoaded(false);
    setIframeKey((k) => k + 1);
  };

  const handleReload = () => {
    setHasLoaded(false);
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] overflow-hidden shadow-2xl">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg)]/70 px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-muted)] mr-1 hidden sm:inline">
            Live Previews:
          </span>
          {LIVE_PROJECTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors shrink-0 flex items-center gap-1.5 ${
                selectedId === p.id
                  ? "bg-[var(--accent)] text-[#06181a] font-medium shadow-sm"
                  : "bg-[var(--bg-raised)] text-[var(--fg-muted)] border border-[var(--line)] hover:text-[var(--fg)]"
              }`}
            >
              <span>{p.name}</span>
              <span className="opacity-70 text-[10px] hidden md:inline">({p.badge})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport size toggles */}
          <button
            type="button"
            onClick={() => setViewMode("desktop")}
            className={`rounded px-2.5 py-1 font-mono text-[10px] transition-colors ${
              viewMode === "desktop"
                ? "bg-[var(--line)] text-[var(--fg)] font-medium"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mobile")}
            className={`rounded px-2.5 py-1 font-mono text-[10px] transition-colors ${
              viewMode === "mobile"
                ? "bg-[var(--line)] text-[var(--fg)] font-medium"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            Mobile (375px)
          </button>
        </div>
      </div>

      {/* Browser Chrome Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg-raised)] px-4 py-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]/80" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/80" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]/80" />
          </div>
          <button
            type="button"
            onClick={handleReload}
            title="Reload preview"
            className="ml-2 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          >
            ↻
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex flex-1 max-w-xl items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-[var(--fg-muted)] truncate">
          <span className="text-[#3fb950] text-[10px]" title="Secure">🔒</span>
          <span className="text-[11px] text-[var(--fg)] truncate select-all">{current.url}</span>
        </div>

        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline shrink-0 text-xs"
        >
          Open Tab <span aria-hidden>↗</span>
        </a>
      </div>

      {/* Interactive In-Browser Viewport */}
      <div className="relative flex justify-center bg-[#0d1117] min-h-[520px] max-h-[680px] overflow-hidden">
        {!hasLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[var(--bg-raised)]/90 backdrop-blur-sm text-sm text-[var(--fg-muted)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            <span className="font-mono text-xs">Loading {current.name} in-browser preview...</span>
          </div>
        )}

        <div
          className={`h-[560px] sm:h-[640px] transition-all duration-300 w-full ${
            viewMode === "mobile" ? "max-w-[375px] shadow-2xl border-x border-[var(--line)]" : "max-w-full"
          }`}
        >
          <iframe
            key={`${current.id}-${iframeKey}`}
            src={current.url}
            title={current.name}
            onLoad={() => setHasLoaded(true)}
            className="h-full w-full bg-white border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
          />
        </div>
      </div>

      {/* Metadata footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--bg)] px-5 py-3 text-xs">
        <div>
          <span className="font-medium text-[var(--fg)]">{current.name}:</span>{" "}
          <span className="text-[var(--fg-muted)]">{current.description}</span>
        </div>
        <span className="font-mono text-[10px] text-[var(--accent)] font-medium">
          Interactive Live Sandbox
        </span>
      </div>
    </div>
  );
}
