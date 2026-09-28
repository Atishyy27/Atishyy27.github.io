import type { MetadataRoute } from "next";
import { pagedProjects } from "@/content/projects";
import { listedEntries } from "@/lib/journal";

const SITE = "https://atishay.tech";

// output: "export" needs this declared, or the route is treated as dynamic and the
// build refuses it.
export const dynamic = "force-static";

// Unlisted journal entries are deliberately absent: they are reachable by link but
// must not be advertised. listedEntries() already drops them, and drafts never build.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${SITE}/`, lastModified: now, priority: 1 },
    { url: `${SITE}/projects/`, lastModified: now, priority: 0.8 },
    { url: `${SITE}/journal/`, lastModified: now, priority: 0.8 },
    ...pagedProjects.map((p) => ({
      url: `${SITE}/projects/${p.slug}/`,
      lastModified: now,
      priority: 0.6,
    })),
    ...listedEntries().map((e) => ({
      url: `${SITE}/journal/${e.slug}/`,
      lastModified: new Date(e.date),
      priority: 0.6,
    })),
  ];
}
