"use client";

import { useState } from "react";
import { person } from "@/content/site";
import { copyText } from "@/lib/contact";
import { capture } from "@/lib/posthog";

/**
 * The address as text, with a copy button. A mailto link alone does nothing on
 * a machine with no mail client, and a recruiter on webmail has no way to get
 * the address out of it.
 */
export default function EmailCopy({ from, className = "" }: { from: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const ok = await copyText(person.email);
    capture("email_copy", { from, ok });
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm ${className}`}>
      <a href={`mailto:${person.email}`} className="link select-all break-all">
        {person.email}
      </a>
      <button
        type="button"
        onClick={onCopy}
        data-cursor
        className="min-h-11 rounded-full border border-[var(--line)] px-4 text-xs text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </p>
  );
}
