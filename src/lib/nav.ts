// Which nav link owns a path. Pure, so the current-page marker can be tested
// without rendering the nav.

export const NAV_LINKS: [string, string][] = [
  ["Projects", "/projects/"],
  ["Open source", "/oss/"],
  ["Stats", "/stats/"],
  ["Writing", "/writing/"],
  ["About", "/about/"],
];

// A journal entry is writing, and its URL kept /journal/ when the three
// timelines merged into /writing/ (docs in PRD.md, P3), so the prefix is not the route name.
const OWNS: Record<string, string[]> = {
  "/writing/": ["/writing", "/journal"],
};

/** The href of the nav link for this path, or "" on the home page and on pages no link leads to. */
export function activeNav(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  for (const [, href] of NAV_LINKS) {
    const prefixes = OWNS[href] ?? [href.replace(/\/$/, "")];
    if (prefixes.some((p) => path === p || path.startsWith(p + "/"))) return href;
  }
  return "";
}
