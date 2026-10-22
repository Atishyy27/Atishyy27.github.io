// scripts/fetch-shots.mjs
// Pulls the real app screenshots off the Play Store listings and writes them
// into public/shots/ as webp, plus src/content/shots.ts naming what landed.
//
// WHY THIS EXISTS. public/ held two files, the resume and CNAME. Not one image
// of any project on a site whose whole job is to show the work, while two of
// those projects have been sitting on the Play Store with developer-uploaded
// screenshots the entire time. Nothing had to be captured by hand; the listings
// are public and the CDN serves the originals.
//
// WHY THE OUTPUT IS COMMITTED. The deploy runs in GitHub Actions. A build that
// reaches out to Google's CDN for 17 images is a build that fails the first
// time Google rate-limits a runner IP, for pictures that change maybe once a
// year. So this is a manual refresh, like fetch:oss, and the webp files go into
// git.
//
// Refresh:  npm run fetch:shots      (then commit public/shots and the content file)

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Keyed by the project slug from content/projects.ts, so a project page can do
// SHOTS[project.slug] with nothing in between. `prefix` is only the filename stem.
const APPS = {
  "yes-wellness-platform": { id: "in.gov.mp.shree.yes", prefix: "yes" },
  sram: { id: "in.gov.mp.shree.sram", prefix: "sram" },
};

const OUT_DIR = path.join(process.cwd(), "public", "shots");
const OUT_TS = path.join(process.cwd(), "src", "content", "shots.ts");

// Displayed around 270 CSS px wide, so 540 covers a 2x screen and nothing more.
const WIDTH = 540;

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Every image on a listing page appears as a sized CDN url. The phone
 * screenshots are the ones the page requests at 1052x592: that is the size
 * Google's own carousel asks for, NOT the real aspect ratio. Asking the same
 * id for =s0 returns the file the developer uploaded, which for both of these
 * apps is 1080x2400 portrait. The icon and the little store badge come back in
 * the same sweep and are dropped by size.
 */
async function listingShots(appId) {
  const url = `https://play.google.com/store/apps/details?id=${appId}&hl=en&gl=IN`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-IN,en" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching the listing for ${appId}`);
  const html = await res.text();

  const widest = new Map();
  const re = /https:\/\/play-lh\.googleusercontent\.com\/([A-Za-z0-9_-]{40,})=w(\d+)-h(\d+)/g;
  for (const m of html.matchAll(re)) {
    const [, id, w, h] = m;
    const prev = widest.get(id) ?? 0;
    if (Number(w) > prev) widest.set(id, Number(w));
  }
  // The carousel asks for 1052 wide. The icon (480) and the store badge (96)
  // never do, which is the whole discriminator.
  const ids = [...widest.entries()].filter(([, w]) => w >= 1000).map(([id]) => id);
  if (!ids.length) throw new Error(`no screenshots found on the listing for ${appId}; the page markup probably changed`);
  return ids;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const manifest = {};
for (const [slug, { id: appId, prefix }] of Object.entries(APPS)) {
  const ids = await listingShots(appId);
  console.log(`${appId}: ${ids.length} screenshots on the listing`);
  // Download first, then pick. A listing carries more than one device class:
  // both of these apps have a phone set at 1080x2400 and a short tablet set at
  // 16:9 that re-shoots the SAME login and sign-up screens. Showing both means
  // showing the login twice, so only the device class with the most screens
  // survives. Deciding this on aspect ratio rather than on the listing order is
  // what makes it hold when the developer adds a screen.
  const downloaded = [];
  for (const id of ids) {
    const res = await fetch(`https://play-lh.googleusercontent.com/${id}=s0`, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`${res.status} downloading a screenshot of ${appId}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const { width, height } = await sharp(buf).metadata();
    downloaded.push({ buf, ratio: (width / height).toFixed(3) });
  }
  const byRatio = new Map();
  for (const d of downloaded) byRatio.set(d.ratio, [...(byRatio.get(d.ratio) ?? []), d]);
  const [keptRatio, kept] = [...byRatio.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  for (const [ratio, set] of byRatio) {
    if (ratio !== keptRatio) console.log(`  dropped ${set.length} at aspect ${ratio}, a second device class`);
  }

  const entries = [];
  let n = 0;
  for (const { buf } of kept) {
    n += 1;
    const name = `${prefix}-${String(n).padStart(2, "0")}.webp`;
    const out = await sharp(buf).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const meta = await sharp(out).metadata();
    fs.writeFileSync(path.join(OUT_DIR, name), out);
    entries.push({ src: `/shots/${name}`, w: meta.width, h: meta.height, bytes: out.length });
    console.log(`  ${name}  ${meta.width}x${meta.height}  ${(out.length / 1024).toFixed(0)} KB`);
  }
  manifest[slug] = entries;
}

const total = Object.values(manifest).flat().reduce((s, e) => s + e.bytes, 0);
console.log(`\n${Object.values(manifest).flat().length} images, ${(total / 1024).toFixed(0)} KB total`);

const body = Object.entries(manifest)
  .map(([slug, entries]) => {
    const rows = entries.map((e) => `    { src: "${e.src}", w: ${e.w}, h: ${e.h} },`).join("\n");
    return `  "${slug}": [\n${rows}\n  ],`;
  })
  .join("\n");

fs.writeFileSync(
  OUT_TS,
  `// GENERATED by scripts/fetch-shots.mjs. Do not edit.
// Screenshots taken from each app's own Play Store listing on ${new Date().toISOString().slice(0, 10)},
// resized to ${WIDTH}px wide and re-encoded as webp. These are the developer-uploaded
// listing images, already public on the store, not captures of a running account.
export type Shot = { src: string; w: number; h: number };

export const SHOTS: Record<string, Shot[]> = {
${body}
};
`
);
console.log(`wrote ${OUT_TS}`);
