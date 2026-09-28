// src/content/projects.ts
// One flat project list, derived from the arrays already in site.ts.
//
// Deliberately derived, not re-typed: duplicating the copy into a second file is how
// two sources of truth drift apart and the site starts contradicting itself. site.ts
// stays the place you edit a blurb. This file only adds routing and story metadata.

import { govtWork, clientWork, orgWork, extensions, hackathons, type Work } from "./site";

export type ProjectCategory = "government" | "client" | "institution" | "extension" | "hackathon";

export type Project = Work & {
  slug: string;
  category: ProjectCategory;
  /** Short, always present. The gallery shows this, not the long blurb. */
  story: string;
  /** Slug of a journal entry that tells the long version. Optional by design. */
  journalSlug?: string;
};

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The one-line story per project. Kept here rather than in site.ts because it is a
// property of the project page, not of the CV-style listing site.ts was built for.
// If a project has no story it does not get a page: a card with nothing behind it is
// worse than no card.
const STORIES: Record<string, string> = {
  "yes-wellness-platform":
    "A booking system was double-allocating slots under load. The fix was not more servers, it was row-level locking on the rows that actually contend.",
  sram: "A labour-department platform that had to survive being used by people on cheap phones and bad networks.",
  "4moral": "Six account types, real-time chat and money movement in one app, then a security pass before launch that found injection, IDOR and mass-assignment holes.",
  "genius-solar-services": "A small marketing site where the only metric that mattered was whether the lead form worked.",
  dlab: "Full-stack web and mobile build for a private client.",
  livehood: "Inherited a live site with real defects and made it behave, without a rewrite.",
  "guardianagent-pro": "An agentic system that orchestrates security scanners into something a human can actually read.",
  logistik: "Live tracking on a map, which sounds simple until the updates are frequent and the network is not.",
  "sgsits-techfest-2025":
    "Built with one other developer against a public launch date that could not move, in two languages, with real launch-day traffic.",
  "pf-management-system":
    "A trust running crores through paper forms. The hard part is not the CRUD, it is proving the ledger cannot silently drift.",
  "davv-incubation-centre": "A CMS platform for a university incubation centre.",
  "sgsits-incubation-forum": "Started on WordPress, later moved to Wix when maintenance mattered more than flexibility.",
  "prd-verification-tool":
    "A thousand students filling the same form wrong in the same ways. The tool makes the correct output the only possible output.",
  "leetcode-analytics":
    "LeetCode's easy, medium and hard buckets hide the truth, some easies are harder than some mediums. This puts the real rating distribution on your own profile.",
  "ciis-anti-money-laundering-detection":
    "Finding anomalous transaction clusters is only half the job. An analyst will not act on a flag they cannot explain, so the explainability layer was the product.",
  "sih-2025-geoyield": "Farm-yield optimisation from ISRO geospatial data.",
  "truthtell-truthtrack": "Real-time misinformation detection under a hackathon clock.",
  "adobe-india-hackathon-2025": "Document intelligence, scoped to what could actually be finished in the window.",
};

// Journal entries that tell the long version. Populated as entries get written.
const JOURNAL_LINKS: Record<string, string> = {};

function build(list: Work[], category: ProjectCategory): Project[] {
  return list.map((w) => {
    const slug = toSlug(w.name);
    return {
      ...w,
      slug,
      category,
      story: STORIES[slug] ?? "",
      journalSlug: JOURNAL_LINKS[slug],
    };
  });
}

export const allProjects: Project[] = [
  ...build(govtWork, "government"),
  ...build(clientWork, "client"),
  ...build(orgWork, "institution"),
  ...build(extensions, "extension"),
  ...build(hackathons, "hackathon"),
];

/** Only projects with a story get a page. */
export const pagedProjects: Project[] = allProjects.filter((p) => p.story.length > 0);

export function getProject(slug: string): Project | undefined {
  return pagedProjects.find((p) => p.slug === slug);
}

export const featuredProjects: Project[] = allProjects.filter((p) => p.featured);

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  government: "Government",
  client: "Client",
  institution: "Institution",
  extension: "Extension",
  hackathon: "Hackathon",
};
