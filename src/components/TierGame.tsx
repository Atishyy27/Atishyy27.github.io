"use client";

/* A playable tier maker over the real open-source record. Every merged repo
   starts in the pool; drag a card into S/A/B/C (or tap a card, then tap a band,
   for touch). Once all are placed it scores you against the objective tiers
   from content/oss.ts. Pure client state, no backend, nothing persisted. */
import { useEffect, useMemo, useState } from "react";
import RepoLogo from "@/components/RepoLogo";
import type { Tier, TierRepo } from "@/content/oss";

const BANDS = [
  { id: "S", color: "#a371f7", real: "L4" },
  { id: "A", color: "#d29922", real: "L3" },
  { id: "B", color: "#3fb950", real: "L2" },
  { id: "C", color: "#58a6ff", real: "L1" },
] as const;

type Slot = (typeof BANDS)[number]["id"] | "pool";

function chip(active: boolean) {
  return `rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
    active
      ? "border-[var(--accent)] text-[var(--accent)]"
      : "border-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
  }`;
}

export default function TierGame({ tiers }: { tiers: Tier[] }) {
  const repos = useMemo(() => tiers.flatMap((t) => t.repos), [tiers]);
  const real = useMemo(() => {
    const m: Record<string, Slot> = {};
    for (const t of tiers) {
      const band = BANDS.find((b) => b.real === t.level);
      for (const r of t.repos) m[r.full] = band ? band.id : "C";
    }
    return m;
  }, [tiers]);

  const empty = (): Record<string, Slot> =>
    Object.fromEntries(repos.map((r) => [r.full, "pool" as Slot]));
  const [place, setPlace] = useState<Record<string, Slot>>(empty);
  const [held, setHeld] = useState<string | null>(null);
  const [over, setOver] = useState<Slot | null>(null);
  const [revealed, setRevealed] = useState(false);
  // Native drag-and-drop does not fire from a finger swipe (it needs a long
  // press, which also opens the OS selection menu on some phones), so on touch
  // the cards are not draggable and tap-then-tap is the interaction.
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const put = (full: string, slot: Slot) => {
    setPlace((p) => ({ ...p, [full]: slot }));
    setHeld(null);
    setOver(null);
  };

  const inSlot = (slot: Slot) => repos.filter((r) => place[r.full] === slot);
  const placed = repos.filter((r) => place[r.full] !== "pool").length;
  const done = repos.length > 0 && placed === repos.length;
  const right = repos.filter((r) => place[r.full] === real[r.full]).length;
  const close = repos.filter((r) => {
    const a = BANDS.findIndex((b) => b.id === place[r.full]);
    const b = BANDS.findIndex((x) => x.id === real[r.full]);
    return a >= 0 && Math.abs(a - b) === 1;
  }).length;

  const card = (r: TierRepo, ghost = false) => (
    <div
      key={r.full}
      draggable={!coarse}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", r.full);
        e.dataTransfer.effectAllowed = "move";
        setHeld(r.full);
      }}
      onDragEnd={() => {
        setHeld(null);
        setOver(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        // holding a card and tapping one that already sits in a band means
        // "put it in that band": the cards fill the band, so there is little
        // bare band left to tap on a phone
        const there = place[r.full];
        if (held && held !== r.full && there !== "pool") {
          put(held, there);
          return;
        }
        setHeld(held === r.full ? null : r.full);
      }}
      role="button"
      tabIndex={0}
      aria-pressed={held === r.full}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setHeld(held === r.full ? null : r.full);
        }
      }}
      title={`${r.full}, ${r.merges} merged`}
      className={`flex min-h-[44px] max-w-full cursor-grab touch-manipulation select-none items-center gap-2 rounded-lg border bg-[var(--bg-raised)] px-2.5 py-1.5 transition duration-150 [-webkit-touch-callout:none] active:cursor-grabbing sm:min-h-0 ${
        held === r.full
          ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
          : "border-[var(--line)] hover:border-[var(--accent)]"
      } ${ghost ? "opacity-60" : ""}`}
    >
      <RepoLogo owner={r.owner} size={20} />
      <span className="min-w-0 truncate text-sm font-medium">{r.short}</span>
      <span className="tabular-nums text-[length:var(--step-small)] text-[var(--fg-muted)]">
        {r.merges}
      </span>
    </div>
  );

  const dropProps = (slot: Slot) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(slot);
    },
    onDragLeave: () => setOver((o) => (o === slot ? null : o)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const full = e.dataTransfer.getData("text/plain");
      if (full && full in place) put(full, slot);
    },
    onClick: () => {
      if (held) put(held, slot);
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
          {placed}/{repos.length} placed
        </span>
        <button
          type="button"
          className={chip(false)}
          onClick={() => {
            setPlace(empty());
            setHeld(null);
            setRevealed(false);
          }}
        >
          reset
        </button>
        <button type="button" className={chip(revealed)} onClick={() => setRevealed((v) => !v)}>
          {revealed ? "hide real tiers" : "show my real tiers"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--line)]">
        {BANDS.map((b) => (
          <div key={b.id} className="flex items-stretch border-b border-[var(--line)] last:border-b-0">
            <div
              className="flex w-11 shrink-0 items-center justify-center text-2xl font-bold text-black/85 sm:w-20"
              style={{ background: b.color }}
            >
              {b.id}
            </div>
            <div
              {...dropProps(b.id)}
              className={`flex min-h-[64px] min-w-0 flex-1 flex-wrap content-center items-center gap-2 p-2 transition sm:p-3 ${
                over === b.id || held ? "bg-[var(--bg-raised)]" : ""
              } ${over === b.id ? "outline outline-1 -outline-offset-4 outline-[var(--accent)]" : ""}`}
            >
              {inSlot(b.id).map((r) => (
                <span key={r.full} className="inline-flex flex-col items-start gap-1">
                  {card(r)}
                  {done || revealed ? (
                    <span className="font-mono text-[9px] text-[var(--fg-muted)]">
                      real: {real[r.full]}
                      {real[r.full] === b.id ? " (match)" : ""}
                    </span>
                  ) : null}
                </span>
              ))}
              {inSlot(b.id).length === 0 ? (
                <span className="px-2 text-[length:var(--step-small)] text-[var(--fg-muted)]">
                  {coarse ? "tap here to place" : "drop repos here"}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div
        {...dropProps("pool")}
        className={`mt-6 flex min-h-[64px] flex-wrap items-center gap-2 rounded-xl border border-dashed p-3 ${
          over === "pool" ? "border-[var(--accent)]" : "border-[var(--line)]"
        }`}
      >
        {inSlot("pool").map((r) => card(r))}
        {inSlot("pool").length === 0 ? (
          <span className="px-2 text-[length:var(--step-small)] text-[var(--fg-muted)]">
            all placed. {coarse ? "pick a card, then tap here" : "drag a card back here"} to take it out.
          </span>
        ) : null}
      </div>

      <p aria-live="polite" className="mt-4 min-h-[1.5rem] text-[length:var(--step-small)] text-[var(--fg-muted)]">
        {done ? (
          <span className="text-[var(--fg)]">
            {right} of {repos.length} match my tiers exactly, {close} are one band off.
          </span>
        ) : held ? (
          "Now tap a band to place it."
        ) : coarse ? (
          "Tap a repo, then tap a band. The number is merged PRs there."
        ) : (
          "Drag a repo into a band, or tap a repo and then a band. The number is merged PRs there."
        )}
      </p>

      {/* Phone only. A held card in the pool can be a screen away from the
          band it is meant for, so the destinations ride along at the bottom. */}
      {held ? (
        <div
          role="group"
          aria-label="place the selected repo"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--bg)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:hidden"
        >
          <p className="mb-2 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
            place {repos.find((r) => r.full === held)?.short}
          </p>
          <div className="grid grid-cols-6 gap-2">
            {BANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => put(held, b.id)}
                className="min-h-[44px] rounded-lg text-lg font-bold text-black/85"
                style={{ background: b.color }}
              >
                {b.id}
              </button>
            ))}
            <button type="button" onClick={() => put(held, "pool")} className={`${chip(false)} min-h-[44px]`}>
              pool
            </button>
            <button type="button" onClick={() => setHeld(null)} className={`${chip(false)} min-h-[44px]`}>
              x
            </button>
          </div>
        </div>
      ) : null}

      {revealed ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)]">
          {BANDS.map((b) => (
            <div key={b.id} className="flex items-stretch border-b border-[var(--line)] last:border-b-0">
              <div
                className="flex w-11 shrink-0 items-center justify-center text-sm font-bold text-black/85 sm:w-20"
                style={{ background: b.color }}
              >
                {b.real}
              </div>
              <div className="flex flex-1 flex-wrap items-center gap-2 p-3">
                {repos.filter((r) => real[r.full] === b.id).map((r) => card(r, true))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
