import type { MetadataRoute } from "next";
import { pagedProjects } from "@/content/projects";
import { listedEntries } from "@/lib/journal";
import { oss } from "@/content/oss";

const SITE = "https://atishay.tech";

// output: "export" needs this declared, or the route is treated as dynamic and the
// build refuses it.
export const dynamic = "force-static";

// Two deliberate omissions, both checked by scripts/check-links.mjs:
//
//   /admin    a local-only editor. Nothing to index, and no reason to advertise it.
//   unlisted journal entries, which are reachable by link but must not be
//   listed anywhere. listedEntries() already drops them, and drafts never build.
//
// Everything else must be here. This file previously listed only the home page,
// /projects and /journal and their children: 21 urls, while the site built 88
// pages. /work, /oss, /stats, /log, /about and all 58 repository pages were
// invisible to search engines.
export const SITEMAP_EXCLUDE = ["/admin/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${SITE}/`, lastModified: now, priority: 1 },

    // Top-level sections.
    ...["/projects/", "/oss/", "/work/", "/stats/", "/journal/", "/log/", "/about/"].map((path) => ({
      url: `${SITE}${path}`,
      lastModified: now,
      priority: 0.8,
    })),

    ...pagedProjects.map((p) => ({
      url: `${SITE}/projects/${p.slug}/`,
      lastModified: now,
      priority: 0.6,
    })),

    // One per repository he has contributed to.
    ...oss.repos.map((r) => ({
      url: `${SITE}/oss/${r.slug}/`,
      lastModified: new Date(oss.fetchedAt),
      // Repos where something landed are the ones worth surfacing.
      priority: r.merged > 0 ? 0.6 : 0.4,
    })),

    ...listedEntries().map((e) => ({
      url: `${SITE}/journal/${e.slug}/`,
      lastModified: new Date(e.date),
      priority: 0.6,
    })),
  ];
}
