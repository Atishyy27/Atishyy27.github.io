/**
 * The four things that are actually published in a store, as store listings.
 *
 * They already appear in the project grid, but a card that says "Chrome Web
 * Store" and then makes you read a paragraph before you can install is not how
 * anyone has ever installed anything. The shelf puts the icon, the install
 * count and one button in the shape people already know, and the button goes
 * straight to the store rather than to a project page that then links to it.
 *
 * Names, blurbs and user counts are NOT restated here. They are read out of
 * content/site.ts by slug, so the shelf cannot drift from the grid. Only the
 * things a store listing needs and a project card does not live in this file.
 */

export type Listing = {
  /** Matches the project slug, which is also the icon filename in public/ext/. */
  slug: string;
  /** The name in site.ts, used to find the entry. */
  name: string;
  store: "Chrome Web Store" | "Google Play";
  /** The words the store itself puts on the button. */
  cta: string;
  href: string;
  /**
   * Installs or users, exactly as the store reported them on `countedOn`.
   * Omitted where the store does not publish a figure to a developer's own
   * listing page, which is the case for both government apps.
   */
  users?: string;
  countedOn?: string;
  /** Local copy, fetched by scripts/fetch-store-icons.mjs. Missing ones get a monogram. */
  icon?: string;
};

export const listings: Listing[] = [
  {
    slug: "leetcode-analytics",
    name: "LeetCode Analytics",
    store: "Chrome Web Store",
    cta: "Add to Chrome",
    href: "https://chromewebstore.google.com/detail/leetcode-analytics/pcgnpclciloahjpjhhmjbalpcdmlkpba",
    users: "265 users",
    countedOn: "2026-09-29",
    icon: "/ext/leetcode-analytics.webp",
  },
  {
    // No icon: the source is private, so there is no shipped icon128.png to
    // read, and the Web Store does not serve one to a scraper. Monogram tile.
    slug: "prd-verification-tool",
    name: "PRD Verification Tool",
    store: "Chrome Web Store",
    cta: "Add to Chrome",
    href: "https://chromewebstore.google.com/detail/prd-verification-tool/lhebknliliiigghklkdkljobkkmbhaoj",
    users: "127 users",
    countedOn: "2026-09-29",
  },
  {
    slug: "yes-wellness-platform",
    name: "YES, Wellness Platform",
    store: "Google Play",
    cta: "Get it on Google Play",
    href: "https://play.google.com/store/apps/details?id=in.gov.mp.shree.yes",
    icon: "/ext/yes-wellness-platform.webp",
  },
  {
    slug: "sram",
    name: "SRAM",
    store: "Google Play",
    cta: "Get it on Google Play",
    href: "https://play.google.com/store/apps/details?id=in.gov.mp.shree.sram",
    icon: "/ext/sram.webp",
  },
];
