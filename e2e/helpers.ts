import type { Page } from "@playwright/test";
import { mockFetch } from "../src/lib/mocks/http";

/**
 * Answers every request that leaves localhost from the synthetic fixtures in
 * src/lib/mocks/http.ts, so a run needs no network and no token. Returns the
 * hosts that were asked for, so a test can see what the page reached for.
 */
export async function mockNetwork(page: Page, mode: string = "ok") {
  const hosts = new Set<string>();
  await page.route(/^https?:\/\/(?!localhost)/, async (route) => {
    const u = new URL(route.request().url());
    hosts.add(u.host);
    if (!/api\.web3forms\.com|api\.github\.com|codeforces\.com|jogruber\.de/.test(u.host)) {
      return route.fulfill({ status: 204, body: "" });
    }
    if (mode === "timeout" && u.host === "api.web3forms.com") return; // never answered
    if (mode === "slow" && u.host === "api.web3forms.com") await new Promise((r) => setTimeout(r, 2000));
    const withMode = mode === "ok" || mode === "slow" || u.search.includes("mock=") ? u.href : `${u.href}${u.search ? "&" : "?"}mock=${mode}`;
    try {
      const r = await mockFetch(withMode, {});
      route.fulfill({
        status: r.status,
        body: await r.text(),
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch {
      route.abort("failed");
    }
  });
  return hosts;
}
