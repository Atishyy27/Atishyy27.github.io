// scripts/fetch-store-users.mjs
// Scrapes the live active user counts for Chrome Web Store extensions
// and updates src/content/store.ts.
//
// Refresh: npm run fetch:store-users

import fs from "node:fs";
import path from "node:path";

const STORE_TS = path.join(process.cwd(), "src", "content", "store.ts");
const TODAY = new Date().toISOString().slice(0, 10);

const EXTENSIONS = [
  {
    slug: "leetcode-analytics",
    url: "https://chromewebstore.google.com/detail/leetcode-analytics/pcgnpclciloahjpjhhmjbalpcdmlkpba",
  },
  {
    slug: "sync-lis-and-the-mehfil-jukebox",
    url: "https://chromewebstore.google.com/detail/sync-lis/hcpjipoofgpnenpfjddkkodbobehonlb",
  },
  {
    slug: "prd-verification-tool",
    url: "https://chromewebstore.google.com/detail/prd-verification-tool/lhebknliliiigghklkdkljobkkmbhaoj",
  },
];

async function fetchUserCount(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  const html = await res.text();
  const match = html.match(/(\d[\d,]*)\s+users/i);
  if (!match) throw new Error(`Could not find user count on ${url}`);
  return match[1].replace(/,/g, "");
}

async function main() {
  let content = fs.readFileSync(STORE_TS, "utf8");

  for (const ext of EXTENSIONS) {
    try {
      const users = await fetchUserCount(ext.url);
      console.log(`  ${ext.slug}: ${users} users`);

      // Update in store.ts
      const regex = new RegExp(
        `(slug:\\s*"${ext.slug}"[\\s\\S]*?users:\\s*")\\d+\\s+users("[\\s\\S]*?countedOn:\\s*")[^"]+(")`,
        "m"
      );
      content = content.replace(regex, `$1${users} users$2${TODAY}$3`);
    } catch (err) {
      console.warn(`  ${ext.slug}: FAILED (${err.message})`);
    }
  }

  fs.writeFileSync(STORE_TS, content);
  console.log(`Updated ${STORE_TS}`);
}

main().catch(console.error);
