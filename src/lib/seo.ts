import type { Metadata } from "next";
import { person } from "@/content/site";

/**
 * Title, description, canonical and share card for one page.
 *
 * Next merges metadata shallowly: a page that does not set alternates or openGraph
 * inherits the root layout's whole object. Until 21 Nov 2026 that meant every page
 * declared https://atishay.tech/ as its canonical, telling search engines that
 * /oss, /projects and the rest were copies of the home page, and every shared link
 * showed the home card. Every page calls this with its own path instead.
 * The card image comes from app/opengraph-image.tsx, which file metadata adds on top.
 */
export function seo(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title, description, siteName: person.name },
    twitter: { card: "summary_large_image", title, description, creator: "@atishyy27" },
  };
}
