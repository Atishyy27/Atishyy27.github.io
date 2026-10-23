"use client";

import { useEffect } from "react";
import { startPosthog } from "@/lib/posthog";

/**
 * Starts PostHog once, after paint. Renders nothing.
 *
 * A component rather than a call inside the layout because the layout is a
 * Server Component, and because the import has to happen in an effect: loading
 * an analytics chunk during render would put it on the critical path of a site
 * whose whole pitch is that it is fast.
 */
export default function Posthog() {
  useEffect(() => {
    void startPosthog();
  }, []);
  return null;
}
