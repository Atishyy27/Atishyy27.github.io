import { person } from "@/content/site";
import { oss } from "@/content/oss";
import { ossHeadlineText } from "@/content/oss-headline";
import { pagedProjects } from "@/content/projects";

// output: "export" needs this, or the route is treated as dynamic.
export const dynamic = "force-static";

const SITE = "https://atishay.tech";

/**
 * /llms.txt, the plain-text map of the site that AI assistants (ChatGPT, Claude,
 * Perplexity) read instead of crawling every page. Format: llmstxt.org.
 * Built from the same data as the pages, so its numbers refresh with them.
 */
export function GET() {
  const orgs = [...oss.orgs]
    .filter((o) => o.contributions > 0)
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 12)
    .map((o) => `- [${o.org}](${SITE}/oss/org/${o.slug}/): ${o.contributions} ${o.contributions === 1 ? "contribution" : "contributions"}`);
  const projects = pagedProjects.map((p) => `- [${p.name}](${SITE}/projects/${p.slug}/): ${p.blurb}`);

  const body = [
    `# ${person.name}`,
    "",
    `> ${person.tagline}. ${person.blurb}`,
    "",
    `Open source: ${ossHeadlineText()}. Every number on the site is fetched from GitHub automatically.`,
    "",
    "## Pages",
    `- [Home](${SITE}/): overview`,
    `- [Open source](${SITE}/oss/): every pull request to projects I do not own, grouped by organisation`,
    `- [Projects](${SITE}/projects/): everything I have built`,
    `- [About](${SITE}/about/): experience, publications, education, contact`,
    `- [Stats](${SITE}/stats/): competitive programming ratings and coding activity`,
    `- [Writing](${SITE}/writing/): essays and build notes`,
    "",
    "## Open source, top organisations",
    ...orgs,
    "",
    "## Projects",
    ...projects,
    "",
    "## Contact",
    `- Email: ${person.email}`,
    ...person.socials.map((s) => `- ${s.label}: ${s.href}`),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
