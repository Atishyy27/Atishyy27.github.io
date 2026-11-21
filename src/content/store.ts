/**
 * The four things that are actually published in a store, as store listings.
 *
 * They already appear in the project grid, but a card that says "Chrome Web
 * Store" and then makes you read a paragraph before you can install is not how
 * anyone has ever installed anything. The shelf puts the icon, the install
 * count and one button in the shape people already know, and the button goes
 * straight to the store rather than to a project page that then links to it.
 *
 * THIS FILE OWNS THE USER COUNTS. They were in two places until 27 Oct 2026:
 * here and inside the extension blurbs in site.ts. I corrected site.ts on the
 * 24th and missed this file, so the shelf said 265 while the same extension's
 * card said 260 for three days. One home now, and site.ts reads the headline
 * total off this array.
 *
 * Names and blurbs are NOT restated here. They are read out of
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
    users: "220 users",
    countedOn: "2026-11-21",
    icon: "/ext/leetcode-analytics.webp",
  },
  {
    slug: "sync-lis-and-the-mehfil-jukebox",
    name: "sync-lis, and the mehfil jukebox",
    store: "Chrome Web Store",
    cta: "Add to Chrome",
    href: "https://chromewebstore.google.com/detail/sync-lis/hcpjipoofgpnenpfjddkkodbobehonlb",
    users: "13 users",
    countedOn: "2026-11-21",
    icon: "/ext/sync-lis.webp",
  },
  {
    // No icon: the source is private, so there is no shipped icon128.png to
    // read, and the Web Store does not serve one to a scraper. Monogram tile.
    slug: "prd-verification-tool",
    name: "PRD Verification Tool",
    store: "Chrome Web Store",
    cta: "Add to Chrome",
    href: "https://chromewebstore.google.com/detail/prd-verification-tool/lhebknliliiigghklkdkljobkkmbhaoj",
    users: "133 users",
    countedOn: "2026-11-21",
  },
  {
    slug: "yes-wellness-platform",
    name: "YES, Wellness Platform",
    store: "Google Play",
    cta: "Get it on Google Play",
    href: "https://play.google.com/store/apps/details?id=in.gov.mp.shree.yes",
    users: "500+ downloads",
    countedOn: "2026-11-15",
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

export const STORE_USERS = listings
  .filter((l) => l.store === "Chrome Web Store")
  .reduce((acc, l) => acc + (parseInt(l.users ?? "0", 10) || 0), 0);

