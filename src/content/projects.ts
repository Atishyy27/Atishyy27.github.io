// src/content/projects.ts
// One flat project list, derived from the arrays already in site.ts.
//
// Deliberately derived, not re-typed: duplicating the copy into a second file is how
// two sources of truth drift apart and the site starts contradicting itself. site.ts
// stays the place you edit a blurb. This file only adds routing and story metadata.

import { govtWork, clientWork, orgWork, extensions, hackathons, ownWork, devTools, type Work } from "./site";

export type ProjectCategory = "government" | "client" | "institution" | "extension" | "hackathon" | "own" | "tool";

export type Learning = { title: string; body: string };

export type Project = Work & {
  slug: string;
  category: ProjectCategory;
  /** Short, always present. The gallery shows this, not the long blurb. */
  story: string;
  /** Formal, resume-grade bullets: what it is and what was done. Point by point,
   *  no prose padding. Empty falls back to the blurb. */
  points: string[];
  /** Informal reflections, rendered as dropdowns on the page. The honest "what I
   *  learnt" that would otherwise sit unread in a journal. His own words only. */
  learnt: Learning[];
  /**
   * Broad technical domains, derived from `stack`. These drive the second
   * filter on the index. Derived rather than hand-tagged for the same reason
   * the list itself is derived: a hand-kept tag on nineteen projects goes stale
   * the first time a stack line is edited and nobody updates the tag.
   */
  domains: string[];
  // There was a `journalSlug` here, plus a JOURNAL_LINKS map to populate it.
  // Both were assigned and never read: the real link runs the other way, from
  // a journal entry's `project:` front matter, which lib/journal.ts resolves
  // with entriesForProject(). Two mechanisms for one relationship is how they
  // drift, so the unused direction is gone.
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
  baithak:
    "Most notetakers stop at a transcript. This one pulls out who owns which task and gives each person only theirs, keeps every account's history private, and is pluggable at the speech-to-text layer, so you bring your own engine, not just your own key.",
  tripkit:
    "A travel guide that reads the clock: what is open right now in a town, from open data, where the real work is timezone arithmetic, not a model.",
  "sync-lis-and-the-mehfil-jukebox":
    "A LAN jukebox where everyone hears the same track clock-aligned, no screen-share and no accounts: the server fetches, every browser streams from it.",
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
  gs27:
    "Started in first year as a page of notes and past papers. The rebuild keeps the same idea, students helping the batch after them, and adds a library shared across colleges because syllabi mostly overlap.",
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

// Formal, de-larped bullets per project. Resume-grade: what it is, what was done,
// no inflation. Only filled where the honest version exists; others fall back to
// the blurb.
const POINTS: Record<string, string[]> = {
  baithak: [
    "Voice-AI meeting notetaker: records the mic or a meeting tab, or takes an uploaded file, and returns a transcript, a topic-wise summary, and action items grouped by the person who owns them.",
    "Accounts with per-user data isolation: every session is scoped to its owner at the query layer, so no account can read or edit another's.",
    "Pluggable speech-to-text: a provider adapter lets a user point transcription at their own OpenAI-compatible engine, not just their own key.",
    "Open public demo on server keys, with optional sign-in that saves history.",
  ],
  tripkit: [
    "Travel guide that shows what is open right now in a town, built from OpenStreetMap and Wikivoyage data.",
    "No install, no account, no model: opening hours are a data problem, so the work is the timezone arithmetic, not inference.",
    "Ships as a static PWA.",
  ],
  "yes-wellness-platform": [
    "State-wide wellness platform for the MP Ministry of Ayush, launched by the Chief Minister.",
    "Built the backend for about 5k concurrent users.",
    "Fixed a booking race that double-allocated slots, using PostgreSQL row-level locking.",
    "Load-tested with k6 to a sub-100ms P95.",
  ],
  sram: [
    "Labour-department platform for the MP Ministry of Labour, shipped to the Play Store.",
    "React Native app on a Django backend.",
  ],
  "sync-lis-and-the-mehfil-jukebox": [
    "Self-hosted LAN jukebox plus the Chrome extension that drives it: paste a YouTube, Spotify or SoundCloud link and it plays for everyone on the network, clock-aligned, one shared queue, no accounts.",
    "The server fetches each track and every browser streams it from the server, so there is no screen-share and no audio capture.",
    "Spotify audio is DRM'd, so a Spotify link is resolved through oEmbed metadata and matched on YouTube instead.",
    "Tested with protocol suites, a chaos harness of random actions, and a real two-browser end-to-end run.",
  ],
  "prd-verification-tool": [
    "Chrome extension that compresses, converts and renames PDFs, then auto-fills the matching Google Form.",
    "Published on the Chrome Web Store.",
  ],
  "leetcode-analytics": [
    "Chrome extension that injects CP-focused metrics into LeetCode profiles: difficulty spread, topic breakdown and trends.",
    "Reads the profile over LeetCode's GraphQL API, with no data collection.",
  ],
};

// Informal "what I learnt" per project, rendered as dropdowns. His own words.
const LEARNT: Record<string, Learning[]> = {
  baithak: [
    {
      title: "Serverless keeps no memory between requests",
      body: "The first version worked locally and lost every session in production. An in-process store is per-instance and resets on cold starts, only an external database is shared across requests. History, add-task, and 'it feels like a product' turned out to be the same bug: no real persistence.",
    },
    {
      title: "Auth is data scoping, not a login button",
      body: "The login screen is the easy half. The half that matters is a filter by user id on every read and write, miss it on one query and people see each other's meetings. I tested the isolation harder than the login.",
    },
    {
      title: "A demo dies the moment it asks you to sign up",
      body: "I gated recording behind an account and it killed the demo. The fix was to make auth additive, not a gate: the public path runs and signing in only adds saved history.",
    },
    {
      title: "Bring-your-own-provider is a seam, not a rewrite",
      body: "Putting every provider call behind one module meant adding a whole new speech-to-text engine is one adapter file plus a dropdown, not a change to the routes or the UI.",
    },
  ],
};

// Which stack entries count as which domain. Substring match, so "Next.js 15"
// and "Next.js" both land under Frontend. Moved here from the old /work page's
// explorer when the two routes merged, so there is one copy of this mapping.
const DOMAIN: Record<string, string[]> = {
  Backend: ["Node", "Express", "Spring Boot", "Django", "FastAPI", "Laravel", "MongoDB", "PostgreSQL", "MySQL", "Supabase", "MERN"],
  Frontend: ["React", "Next.js", "Vite", "three.js", "WordPress", "Wix", "React Native"],
  Mobile: ["Flutter", "React Native"],
  "ML / AI": ["PyTorch", "Agentic AI", "Federated ML", "Python", "SHAP", "Geospatial", "Whisper", "Gemini", "Groq"],
  Systems: ["Rust", "Docker", "AWS", "C#", "Linux"],
  Blockchain: ["Blockchain", "Hyperledger", "Solidity"],
};

export const DOMAIN_ORDER: string[] = Object.keys(DOMAIN);

function domainsFor(w: Work): string[] {
  const out: string[] = [];
  for (const [domain, keys] of Object.entries(DOMAIN)) {
    if (w.stack.some((s) => keys.some((k) => s.toLowerCase().includes(k.toLowerCase())))) out.push(domain);
  }
  return out;
}

function build(list: Work[], category: ProjectCategory): Project[] {
  return list.map((w) => {
    const slug = toSlug(w.name);
    return {
      ...w,
      slug,
      category,
      story: STORIES[slug] ?? "",
      points: POINTS[slug] ?? [],
      learnt: LEARNT[slug] ?? [],
      domains: domainsFor(w),
    };
  });
}

export const allProjects: Project[] = [
  ...build(govtWork, "government"),
  ...build(clientWork, "client"),
  ...build(orgWork, "institution"),
  ...build(extensions, "extension"),
  ...build(ownWork, "own"),
  ...build(devTools, "tool"),
  ...build(hackathons, "hackathon"),
];

/** Only projects with a story get a page. */
export const pagedProjects: Project[] = allProjects.filter((p) => p.story.length > 0);

export function getProject(slug: string): Project | undefined {
  return pagedProjects.find((p) => p.slug === slug);
}

export const featuredProjects: Project[] = allProjects.filter((p) => p.featured);

// The "live, open and try" set: shipped, usable products a visitor can open right
// now (store apps, published extensions, live web apps). This is an editorial call,
// not derivable from the data: a store app that works and a half-finished repo both
// "have a link", so the difference has to be stated, not inferred.
export const SHOWCASE_SLUGS: string[] = [
  "baithak",
  "tripkit",
  "yes-wellness-platform",
  "sram",
  "leetcode-analytics",
  "prd-verification-tool",
  "sync-lis-and-the-mehfil-jukebox",
];

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  own: "Own builds",
  tool: "Developer tools",
  government: "Government",
  client: "Client",
  institution: "Institution",
  extension: "Extension",
  hackathon: "Hackathon",
};
