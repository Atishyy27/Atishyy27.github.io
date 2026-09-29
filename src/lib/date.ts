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
