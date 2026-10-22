/**
 * Achievements, with a denominator on every one.
 *
 * Every line here is copied from projects/cv/data/facts.json, which is the one
 * place a fact about him lives and the file the resume is built from. Nothing
 * is restated more generously than it is there: "top 2 in college" is not
 * "national finalist", and a qualifier is a qualifier.
 *
 * `photos` is the key into content/photos.ts. Photos are imported from a local
 * folder by scripts/import-photos.mjs; an achievement with none renders as a
 * row and gains its strip the moment the files exist, with no change here.
 */

export type Achievement = {
  /** Sorts the list. Year only where only the year is known: no invented dates. */
  year: string;
  title: string;
  /** The result, with the denominator. */ 
  result: string;
  /** Why it is here, in one line. Omitted where the result speaks for itself. */
  note?: string;
  /** Folder name under photos-inbox/ and the key in content/photos.ts. */
  photos: string;
  links?: { label: string; href: string }[];
};

export const achievements: Achievement[] = [
  {
    year: "2025",
    title: "ACM ICPC, Mysuru on-site regionals",
    result: "Rank 12, four problems solved",
    note: "The one on this list with no partial credit: the scoreboard is public and the problems are either accepted or they are not.",
    photos: "icpc-2025",
    links: [{ label: "Stats", href: "/stats/" }],
  },
  {
    year: "2025",
    title: "Cyber Shield hackathon, Indore region",
    result: "5th place, top 10 of roughly 1,200 teams",
    photos: "cyber-shield-2025",
  },
  {
    year: "2025",
    title: "Adobe India Hackathon",
    result: "550 of more than 90,000, top 0.66%",
    note: "Document intelligence, scoped to what could actually be finished inside the window.",
    photos: "adobe-2025",
  },
  {
    year: "2025",
    title: "TruthTell Hackathon",
    result: "25 of more than 4,000, top 0.60%",
    note: "Real-time misinformation detection under a hackathon clock.",
    photos: "truthtell-2025",
  },
  {
    year: "2025",
    title: "NationBuilding Hackathon",
    result: "497 of more than 57,000, top 0.87%",
    photos: "nationbuilding-2025",
  },
  {
    year: "2025",
    title: "Goldman Sachs India Hackathon",
    result: "Top 2 in college",
    photos: "goldman-sachs-2025",
  },
  {
    year: "2025",
    title: "Smart India Hackathon",
    result: "First in the internal round",
    photos: "sih-2025",
  },
  {
    year: "2026",
    title: "Summer of Bitcoin",
    result: "Qualifier",
    note: "Qualified, not selected. The work that came out of it is in the open-source record.",
    photos: "summer-of-bitcoin-2026",
    links: [{ label: "Open source", href: "/oss/" }],
  },
  {
    year: "2024",
    title: "GirlScript Summer of Code, extended edition",
    result: "Rank 312, top 3.8%",
    photos: "gssoc-2024",
  },
];
