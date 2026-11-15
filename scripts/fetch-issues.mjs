// scripts/fetch-issues.mjs
import fs from "node:fs";

const EXCLUDED = new Set([
  "saloni0903/yoga-app",
  "iamrahulmahato/master-web-development",
  "ayush-that/FinVeda",
  "gauravsingh1281/Rentalog.in--Frontend",
  "pluja/awesome-privacy",
  "osmlab/awesome-openstreetmap",
  "anthropics/claude-code",
]);

async function run() {
  const q = "is:issue author:Atishyy27 -user:Atishyy27 is:public";
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-updater",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) {
    console.error("HTTP error:", res.status, res.statusText);
    return;
  }
  const data = await res.json();
  const rawItems = data.items || [];
  
  const issues = rawItems
    .filter((it) => {
      const repo = it.repository_url.replace("https://api.github.com/repos/", "");
      return !EXCLUDED.has(repo);
    })
    .map((it) => {
      const repo = it.repository_url.replace("https://api.github.com/repos/", "");
      return {
        title: it.title,
        number: it.number,
        repo,
        url: it.html_url,
        state: it.state,
        state_reason: it.state_reason,
        created_at: it.created_at,
        closed_at: it.closed_at,
        comments: it.comments,
      };
    });

  console.log(`Saved ${issues.length} verified upstream issues to src/content/oss-issues.json`);
  fs.writeFileSync("src/content/oss-issues.json", JSON.stringify(issues, null, 2));
}

run().catch(console.error);
