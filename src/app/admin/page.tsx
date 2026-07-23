"use client";

import { useEffect, useMemo, useState } from "react";
import { person, about as aboutDefault } from "@/content/site";
import { readOverrides, writeOverrides, OV_KEY, type Overrides } from "@/lib/overrides";
import { fetchEvents, analyticsEnabled } from "@/lib/analytics";

/**
 * Local content editor. No auth theatre — this is a static site, there's
 * nothing to protect: every edit lives only in THIS browser's localStorage
 * and can't reach anyone else. The optional passphrase just stops a shoulder-
 * surfer, it is not security.
 */
const GATE = "atishay"; // cosmetic

function Analytics() {
  const [rows, setRows] = useState<{ type: string; target: string; ms: number | null; session: string }[] | null>(null);

  useEffect(() => {
    if (analyticsEnabled) fetchEvents().then(setRows);
  }, []);

  const stats = useMemo(() => {
    if (!rows) return null;
    const sessions = new Set(rows.map((r) => r.session)).size;
    const views = rows.filter((r) => r.type === "view").length;
    const dwell = new Map<string, number>();
    for (const r of rows.filter((r) => r.type === "dwell")) dwell.set(r.target, (dwell.get(r.target) ?? 0) + (r.ms ?? 0));
    const clicks = new Map<string, number>();
    for (const r of rows.filter((r) => r.type === "click")) clicks.set(r.target, (clicks.get(r.target) ?? 0) + 1);
    const top = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { sessions, views, dwell: top(dwell), clicks: top(clicks) };
  }, [rows]);

  if (!analyticsEnabled) {
    return (
      <div className="mt-8 rounded-xl border border-[var(--line)] p-5 text-sm text-[var(--fg-muted)]">
        Analytics is off. Add <code className="text-[var(--accent)]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-[var(--accent)]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (and the table in{" "}
        <code>src/lib/analytics.ts</code>) to see which sections visitors dwell on and what they click.
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="display text-2xl">Analytics</h2>
      {!stats ? (
        <p className="mt-4 text-sm text-[var(--fg-muted)]">Loading…</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--line)] p-4">
              <div className="text-2xl font-semibold">{stats.sessions}</div>
              <div className="text-xs text-[var(--fg-muted)]">visitors</div>
            </div>
            <div className="rounded-xl border border-[var(--line)] p-4">
              <div className="text-2xl font-semibold">{stats.views}</div>
              <div className="text-xs text-[var(--fg-muted)]">page views</div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent)]">MOST DWELL (SECTION)</h3>
              <ul className="mt-3 space-y-2">
                {stats.dwell.map(([id, ms]) => (
                  <li key={id} className="flex justify-between text-sm">
                    <span>{id}</span>
                    <span className="font-mono text-xs text-[var(--fg-muted)]">{Math.round(ms / 1000)}s</span>
                  </li>
                ))}
                {stats.dwell.length === 0 && <li className="text-sm text-[var(--fg-muted)]">no data yet</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent)]">MOST CLICKED</h3>
              <ul className="mt-3 space-y-2">
                {stats.clicks.map(([t, n]) => (
                  <li key={t} className="flex justify-between gap-4 text-sm">
                    <span className="truncate">{t}</span>
                    <span className="font-mono text-xs text-[var(--fg-muted)]">{n}</span>
                  </li>
                ))}
                {stats.clicks.length === 0 && <li className="text-sm text-[var(--fg-muted)]">no data yet</li>}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default function Admin() {
  const [ok, setOk] = useState(false);
  const [pass, setPass] = useState("");
  const [tagline, setTagline] = useState("");
  const [blurb, setBlurb] = useState("");
  const [about, setAbout] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const ov = readOverrides();
    setTagline(ov.tagline ?? person.tagline);
    setBlurb(ov.blurb ?? person.blurb);
    setAbout(ov.about ?? aboutDefault);
  }, []);

  function save() {
    const ov: Overrides = { tagline, blurb, about };
    writeOverrides(ov);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function reset() {
    localStorage.removeItem(OV_KEY);
    setTagline(person.tagline);
    setBlurb(person.blurb);
    setAbout(aboutDefault);
    writeOverrides({});
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ tagline, blurb, about }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "folio-overrides.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!ok) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="display text-3xl">Content editor</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Edits are stored only in this browser and never affect other visitors.
        </p>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pass === GATE && setOk(true)}
          placeholder="passphrase"
          className="mt-6 rounded-lg border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={() => pass === GATE && setOk(true)}
          className="mt-3 rounded-full border border-[var(--accent)] px-5 py-2.5 text-sm text-[var(--accent)]"
        >
          Enter →
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl">Admin</h1>
        <a href="/" className="link text-sm text-[var(--fg-muted)]">
          ← back to site
        </a>
      </div>

      <Analytics />

      <h2 className="display mt-16 text-2xl">Content editor</h2>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">
        Changes apply live and persist in this browser only. To publish for everyone, export the
        JSON and commit it into <code className="text-[var(--accent)]">content/site.ts</code>.
      </p>

      <section className="mt-10 space-y-2">
        <label className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">TAGLINE</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full rounded-lg border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
        />
      </section>

      <section className="mt-6 space-y-2">
        <label className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">HERO BLURB</label>
        <textarea
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-lg border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
        />
      </section>

      <section className="mt-6 space-y-3">
        <label className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">ABOUT PARAGRAPHS</label>
        {about.map((p, i) => (
          <textarea
            key={i}
            value={p}
            onChange={(e) => {
              const next = [...about];
              next[i] = e.target.value;
              setAbout(next);
            }}
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        ))}
        <div className="flex gap-3">
          <button
            onClick={() => setAbout([...about, ""])}
            className="rounded-full border border-[var(--line)] px-4 py-1.5 text-xs hover:border-[var(--accent)]"
          >
            + paragraph
          </button>
          {about.length > 1 && (
            <button
              onClick={() => setAbout(about.slice(0, -1))}
              className="rounded-full border border-[var(--line)] px-4 py-1.5 text-xs hover:border-[var(--accent-2)]"
            >
              − last
            </button>
          )}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={save}
          className="rounded-full border border-[var(--accent)] px-6 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--accent-soft)]"
        >
          {saved ? "Saved ✓" : "Save (this browser)"}
        </button>
        <button onClick={exportJson} className="rounded-full border border-[var(--line)] px-6 py-2.5 text-sm hover:border-[var(--accent)]">
          Export JSON
        </button>
        <button onClick={reset} className="rounded-full border border-[var(--line)] px-6 py-2.5 text-sm text-[var(--fg-muted)] hover:border-[var(--accent-2)]">
          Reset to defaults
        </button>
      </div>
    </main>
  );
}
