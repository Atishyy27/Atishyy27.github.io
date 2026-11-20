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
 * A page that sets openGraph also drops the root card image, so it is named here;
 * scripts/fix-og.mjs repoints /opengraph-image at /og.png after the build.
 */
const CARD = { url: "/opengraph-image", width: 1200, height: 630, alt: `${person.name}, ${person.tagline}` };

export function seo(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title, description, siteName: person.name, images: [CARD] },
    twitter: { card: "summary_large_image", title, description, creator: "@atishyy27", images: [CARD] },
  };
}
