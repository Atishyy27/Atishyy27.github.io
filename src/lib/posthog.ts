"use client";

/**
 * PostHog, behind an env var.
 *
 * Why a third analytics thing exists on one small site, stated plainly: the
 * other two are not running. lib/analytics.ts writes to a Supabase table whose
 * keys have never been set, and the Clarity tag needs an id that has never
 * been set either, so today the site measures nothing at all. PostHog is the
 * one of the three he can switch on alone, with a free tier and no table to
 * create first, which is why it is here.
 *
 * It answers one question the others cannot: whether this site actually sends
 * anyone to the Chrome Web Store. "265 users" is a number with no story until
 * something counts the clicks that produced it.
 *
 * Loaded by dynamic import so posthog-js lands in its own chunk. A visitor on
 * a build with no key never downloads it, and neither does anyone who has set
 * the lights flat before the script would have run.
 *
 * Set in .env.local, and in the Actions secret of the same name for the deploy:
 *   NEXT_PUBLIC_POSTHOG_KEY=phc_...
 *   NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com   (optional; US is the default)
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export const posthogEnabled = Boolean(KEY);

type Client = {
  init: (key: string, opts: Record<string, unknown>) => void;
  capture: (event: string, props?: Record<string, unknown>) => void;
};

let client: Client | null = null;
let starting: Promise<Client | null> | null = null;

/** Queued until the chunk arrives, so a click in the first second is not lost. */
const pending: [string, Record<string, unknown> | undefined][] = [];

export function startPosthog(): Promise<Client | null> {
  if (!KEY) return Promise.resolve(null);
  if (starting) return starting;
  starting = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(KEY, {
        api_host: HOST,
        // The site is a static export with real routes, so PostHog's own
        // history hook is the thing that sees navigation, not React.
        capture_pageview: true,
        capture_pageleave: true,
        // Autocapture ON, at his explicit ask on 24 Oct 2026: he wants every
        // click, not a shortlist someone chose in advance. The cost is noise;
        // the benefit is that a question nobody thought to instrument can
        // still be answered later from data already collected.
        autocapture: true,
        // Heatmaps need this as well as autocapture. They are the thing he
        // actually described wanting: where people look on the home page.
        enable_heatmaps: true,
        // Input VALUES are never sent. The contact form on /about takes a
        // name, an email and a message, and none of that is analytics data.
        mask_all_text: false,
        mask_personal_data_properties: true,
        persistence: "localStorage",
      });
      client = posthog as unknown as Client;
      for (const [event, props] of pending.splice(0)) client.capture(event, props);
      return client;
    })
    .catch(() => null);
  return starting;
}

/** Safe everywhere: a no-op when there is no key, queued before the chunk lands. */
export function capture(event: string, props?: Record<string, unknown>) {
  if (!KEY) return;
  if (client) client.capture(event, props);
  else {
    pending.push([event, props]);
    void startPosthog();
  }
}
