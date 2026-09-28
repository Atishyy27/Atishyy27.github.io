import Link from "next/link";
import type { Metadata } from "next";
import { listedEntries, formatDate } from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal · Atishay Jain",
  description: "Dated, first-person entries about things I actually lived.",
};

// Deliberately unstyled beyond the existing tokens in globals.css. The visual pass
// comes from his own references; this page exists to prove the content model works.
export default function JournalIndex() {
  const entries = listedEntries();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-20 sm:px-8">
      <h1 className="display text-5xl leading-[1.05] sm:text-6xl">Things I actually lived</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
        Written from my own narration. Dated, first person, nothing invented.
      </p>

      {entries.length === 0 ? (
        <p className="mt-16 text-[var(--fg-muted)]">No entries published yet.</p>
      ) : (
        <ul className="mt-16 space-y-px">
          {entries.map((e) => (
            <li key={e.slug} className="border-t border-[var(--line)]">
              <Link href={`/journal/${e.slug}/`} className="group block py-6">
                <div className="flex items-baseline justify-between gap-6">
                  <h2 className="text-lg font-medium tracking-tight group-hover:text-[var(--accent)]">
                    {e.title}
                  </h2>
                  <time
                    dateTime={e.date}
                    className="shrink-0 text-xs text-[var(--fg-muted)]"
                  >
                    {formatDate(e.date)}
                  </time>
                </div>
                {e.place ? (
                  <p className="mt-1 text-xs text-[var(--fg-muted)]">
                    {e.place}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-20 border-t border-[var(--line)] pt-6">
        <Link href="/" className="link text-sm">Back</Link>
      </div>
    </main>
  );
}
