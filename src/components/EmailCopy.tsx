"use client";

import { useEffect, useRef, useState } from "react";
import { person } from "@/content/site";
import { copyText } from "@/lib/contact";
import { capture } from "@/lib/posthog";

/**
 * The address as text, with a copy button. A mailto link alone does nothing on
 * a machine with no mail client, and a recruiter on webmail has no way to get
 * the address out of it.
 */
export default function EmailCopy({ from, className = "" }: { from: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function onCopy() {
    const ok = await copyText(person.email);
    capture("email_copy", { from, ok });
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), ok ? 1600 : 4000);
  }

  return (
    <p data-email-copy className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm ${className}`}>
      <a href={`mailto:${person.email}`} className="link select-all break-all">
        {person.email}
      </a>
      <button
        type="button"
        onClick={onCopy}
        data-cursor
        className="min-h-11 rounded-full border border-[var(--line)] px-4 text-xs text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {state === "copied" ? "Copied" : "Copy"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Email address copied" : state === "failed" ? "Could not copy, select the address instead" : ""}
      </span>
      {state === "failed" ? (
        <span className="w-full text-xs text-[var(--fg-muted)]">Could not copy. Select the address instead.</span>
      ) : null}
    </p>
  );
}
