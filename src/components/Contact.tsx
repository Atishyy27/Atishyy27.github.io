"use client";

import { useState } from "react";
import { person } from "@/content/site";
import { Reveal } from "./Chrome";

// Web3Forms: a static-friendly form relay — no server of ours needed.
// Get a free access key at https://web3forms.com (put it in .env.local as
// NEXT_PUBLIC_WEB3FORMS_KEY). Until then the form falls back to a mailto.
const KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

export default function Contact() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = (data.get("name") as string) || "someone";
    const mail = (data.get("email") as string) || "no email — anonymous";

    if (!KEY) {
      // no key configured → open the user's mail client, prefilled
      const body = `${data.get("message")}\n\n— ${name} (${mail})`;
      window.location.href = `mailto:${person.email}?subject=${encodeURIComponent(
        "Hello from atishay.tech"
      )}&body=${encodeURIComponent(body)}`;
      return;
    }

    setState("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      setState(res.ok ? "sent" : "error");
      if (res.ok) form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <Reveal>
        <div className="glass rounded-2xl p-10 text-center">
          <div className="display text-3xl text-[var(--accent)]">Sent ✦</div>
          <p className="mt-3 text-[var(--fg-muted)]">I&apos;ll get back to you. Thanks for reaching out.</p>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <form onSubmit={onSubmit} className="glass rounded-2xl p-7 sm:p-9">
        <input type="hidden" name="access_key" value={KEY} />
        <input type="hidden" name="subject" value="New message from atishay.tech" />
        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">NAME</span>
            <input
              name="name"
              required
              className="mt-2 w-full rounded-lg border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">EMAIL (OPTIONAL)</span>
            <input
              name="email"
              type="email"
              placeholder="leave blank to stay anonymous"
              className="mt-2 w-full rounded-lg border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#5a6472] focus:border-[var(--accent)]"
            />
          </label>
        </div>
        <label className="mt-5 block">
          <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">MESSAGE</span>
          <textarea
            name="message"
            required
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          />
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={state === "sending"}
            className="rounded-full border border-[var(--accent)] px-6 py-3 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)] disabled:opacity-50"
          >
            {state === "sending" ? "Sending…" : "Send message →"}
          </button>
          {state === "error" && (
            <span className="text-sm text-[var(--accent-2)]">
              Something broke. Email me directly at {person.email}
            </span>
          )}
          {!KEY && (
            <span className="text-xs text-[var(--fg-muted)]">Opens your mail app.</span>
          )}
        </div>
      </form>
    </Reveal>
  );
}
