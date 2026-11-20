// src/lib/date.ts
// One date formatter, shared.
//
// It lives here rather than in journal.ts because journal.ts reads the
// filesystem at module scope. Importing it from a client component would drag
// node:fs into the browser bundle, so the pure function moves out and journal.ts
// re-exports it for the pages that already import it from there.

/** "2026-09-29" -> "29 Sep 2026". Parsed by hand so the local timezone cannot shift the day. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}

/** "2026-11-20T20:34:05Z" -> "21 Nov 2026, 02:04 IST". Fixed to Asia/Kolkata so the build machine's zone cannot change it. */
export function formatIst(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} IST`;
}
