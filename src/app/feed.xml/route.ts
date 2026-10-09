import { listedEntries, renderMarkdown } from "@/lib/journal";
import { person } from "@/content/site";

// A route handler under output: "export" must be static, or the build refuses
// it. This one reads files at build time and emits a fixed document, so there
// is nothing dynamic about it anyway.
export const dynamic = "force-static";

const SITE = "https://atishay.tech";

/** XML has five characters that cannot appear raw in text or an attribute. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const entries = listedEntries();

  // RFC 822 dates, which RSS requires. Built in UTC from the date-only front
  // matter so the published date cannot drift by a day across timezones.
  const rfc822 = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 9, 0, 0)).toUTCString();
  };

  const items = entries
    .map(
      (e) => `    <item>
      <title>${esc(e.title)}</title>
      <link>${SITE}/journal/${e.slug}/</link>
      <guid isPermaLink="true">${SITE}/journal/${e.slug}/</guid>
      <pubDate>${rfc822(e.date)}</pubDate>
${e.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
      <description><![CDATA[${renderMarkdown(e.body)}]]></description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(person.name)} · Journal</title>
    <link>${SITE}/journal/</link>
    <description>Written from my own narration. Dated, first person, nothing invented.</description>
    <language>en</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${entries[0] ? `    <lastBuildDate>${rfc822(entries[0].date)}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
