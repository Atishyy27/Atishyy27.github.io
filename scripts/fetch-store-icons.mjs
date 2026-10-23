// scripts/fetch-store-icons.mjs
// The store icon for every listed app and extension, into public/ext/.
//
// The store shelf on /projects is only convincing if the icons are the real
// ones. fetch-shots.mjs already sees these: it sweeps every CDN image on a Play
// listing and throws away everything under 1000px wide, which is exactly the
// icon. This takes the other half of that sweep.
//
// Chrome Web Store listings do not expose their icon the same way, so an
// extension's icon is read from its own repository instead, which is the file
// the developer actually shipped.
//
// Committed rather than fetched at build time, for the reason fetch-shots.mjs
// gives: a deploy that reaches Google's CDN is a deploy that fails the first
// time a runner IP is rate-limited, for images that change once a year.
//
// Refresh:  node scripts/fetch-store-icons.mjs    (then commit public/ext)

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PLAY = {
  "yes-wellness-platform": "in.gov.mp.shree.yes",
  sram: "in.gov.mp.shree.sram",
};

// Raw file in his own repo. An extension whose source is private has no entry
// here and falls back to a monogram tile in the component.
const REPO_ICONS = {
  "leetcode-analytics": "https://raw.githubusercontent.com/Atishyy27/leetcode-analytics/main/icons/icon128.png",
};

const OUT = path.join(process.cwd(), "public", "ext");
const SIZE = 128;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function playIcon(appId) {
  const url = `https://play.google.com/store/apps/details?id=${appId}&hl=en&gl=IN`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-IN,en" } });
  if (!res.ok) throw new Error(`${res.status} fetching the listing for ${appId}`);
  const html = await res.text();

  // The icon is the listing's og:image. The CDN-url sweep that fetch-shots.mjs
  // uses cannot find it: the icon is requested in the square "=s128-rw" form
  // rather than the "=w..-h.." form, and so are the icons of every "similar
  // app" further down the page, so size alone cannot tell them apart. og:image
  // is the one place the page states which app it is about.
  const og = html.match(/<meta property="og:image" content="(https:\/\/play-lh\.googleusercontent\.com\/[^"=]+)/);
  if (!og) throw new Error(`no og:image on the listing for ${appId}; the markup probably changed`);
  const img = await fetch(`${og[1]}=s256`, { headers: { "User-Agent": UA } });
  if (!img.ok) throw new Error(`${img.status} downloading the icon for ${appId}`);
  return Buffer.from(await img.arrayBuffer());
}

fs.mkdirSync(OUT, { recursive: true });
let n = 0;

for (const [slug, appId] of Object.entries(PLAY)) {
  const buf = await playIcon(appId);
  const out = await sharp(buf).resize(SIZE, SIZE, { fit: "cover" }).webp({ quality: 88 }).toBuffer();
  fs.writeFileSync(path.join(OUT, `${slug}.webp`), out);
  console.log(`${slug}.webp  ${SIZE}x${SIZE}  ${(out.length / 1024).toFixed(1)} KB  (play: ${appId})`);
  n += 1;
}

for (const [slug, url] of Object.entries(REPO_ICONS)) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  const out = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, `${slug}.webp`), out);
  console.log(`${slug}.webp  ${SIZE}x${SIZE}  ${(out.length / 1024).toFixed(1)} KB  (repo)`);
  n += 1;
}

console.log(`\n${n} icons in public/ext/`);
