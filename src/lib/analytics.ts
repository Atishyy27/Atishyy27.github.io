"use client";

/**
 * Dirt-cheap analytics: your own Supabase free tier (no paid product).
 * Records which section each visitor dwelled on and which links they
 * clicked, into one table. /admin reads it back as a dashboard.
 *
 * Graceful no-op if the env vars aren't set, so the site works with or
 * without it. Setup (one time, free):
 *
 *   create table folio_events (
 *     id uuid default gen_random_uuid() primary key,
 *     created_at timestamptz default now(),
 *     session text, type text, target text, ms int
 *   );
 *   alter table folio_events enable row level security;
 *   create policy "anon insert" on folio_events for insert to anon with check (true);
 *   create policy "anon read"   on folio_events for select to anon using (true);
 *
 * Then set in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...      NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const analyticsEnabled = !!(URL && KEY);

function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let s = localStorage.getItem("folio_sid");
  if (!s) {
    s = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
    localStorage.setItem("folio_sid", s);
  }
  return s;
}

type Ev = { type: string; target: string; ms?: number };

export function track({ type, target, ms }: Ev) {
  if (!analyticsEnabled) return;
  const body = JSON.stringify([{ session: sessionId(), type, target, ms: ms ?? null }]);
  const headers = { "Content-Type": "application/json", apikey: KEY!, Authorization: `Bearer ${KEY}` };
  // sendBeacon survives page unload; fetch keepalive is the fallback
  try {
    fetch(`${URL}/rest/v1/folio_events`, { method: "POST", headers, body, keepalive: true }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export async function fetchEvents(): Promise<{ type: string; target: string; ms: number | null; session: string }[]> {
  if (!analyticsEnabled) return [];
  const res = await fetch(`${URL}/rest/v1/folio_events?select=type,target,ms,session&order=created_at.desc&limit=5000`, {
    headers: { apikey: KEY!, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) return [];
  return res.json();
}
