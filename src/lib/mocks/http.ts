// Synthetic stand-ins for every third-party host the site calls from the browser.
// Used by the tests (passed in as the fetch implementation) and by `npm run dev`
// when NEXT_PUBLIC_MOCK_API=1. Every value is made up.
//
// A failure is asked for with `?mock=500|403|timeout|network` on the URL, or for
// every call with NEXT_PUBLIC_MOCK_MODE (the contact POST has no query string).

export type MockMode = "ok" | "500" | "403" | "timeout" | "network";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const FIXTURES = {
  githubSearch: { total_count: 7, incomplete_results: false, items: [] },
  githubRepo: { description: "A synthetic repository.", stargazers_count: 3, language: "TypeScript" },
  codeforcesInfo: { status: "OK", result: [{ handle: "synthetic", rating: 1500, maxRating: 1600 }] },
  codeforcesStatus: { status: "OK", result: [{ creationTimeSeconds: 1760000000 }] },
  contributions: { contributions: [{ date: "2026-01-02", count: 3 }] },
  web3forms: { success: true, message: "Email sent successfully!" },
};

function modeOf(url: string): MockMode {
  const m = /[?&]mock=([a-z0-9]+)/.exec(url);
  return ((m?.[1] ?? process.env.NEXT_PUBLIC_MOCK_MODE) as MockMode | undefined) ?? "ok";
}

export async function mockFetch(input: string, init?: RequestInit): Promise<Response> {
  const mode = modeOf(input);
  if (mode === "network") throw new TypeError("Failed to fetch");
  if (mode === "timeout") {
    // Never settles on its own, but honours an abort like the real thing.
    return new Promise((_, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    });
  }
  if (mode === "500" || mode === "403") return json({ message: "mock failure" }, Number(mode));

  const u = new URL(input);
  if (u.host === "api.github.com" && u.pathname.startsWith("/search/")) return json(FIXTURES.githubSearch);
  if (u.host === "api.github.com" && u.pathname.startsWith("/repos/")) return json(FIXTURES.githubRepo);
  if (u.host === "codeforces.com" && u.pathname.endsWith("/user.info")) return json(FIXTURES.codeforcesInfo);
  if (u.host === "codeforces.com" && u.pathname.endsWith("/user.status")) return json(FIXTURES.codeforcesStatus);
  if (u.host === "github-contributions-api.jogruber.de") return json(FIXTURES.contributions);
  if (u.host === "api.web3forms.com") return json(FIXTURES.web3forms);
  return json({ message: `no mock for ${u.host}` }, 404);
}
