/**
 * The build log.
 *
 * Short technical notes with the thing itself embedded, not described. Add an
 * entry by pushing to this array; the newest sits on top. Keep every claim
 * checkable, same rule as the rest of the site.
 *
 * embed kinds:
 *   youtube  -> id is the video id
 *   gist     -> id is "<user>/<gist-id>"
 *   repo     -> id is "<owner>/<name>", renders a live GitHub card
 *   demo     -> id is any URL, renders a framed live page
 *   none     -> text only
 */

export type Entry = {
  date: string;          // ISO, sorts and displays
  title: string;
  tags: string[];
  body: string[];
  embed?: { kind: "youtube" | "gist" | "repo" | "demo"; id: string };
  links?: { label: string; href: string }[];
};

export const log: Entry[] = [
  {
    date: "2026-09-30",
    title: "I deleted the language model from my own site",
    tags: ["BM25", "retrieval", "performance"],
    body: [
      "The ask box used to load two models before it would answer anything: MiniLM to embed, and a 77M-parameter Flan-T5 to phrase the result. Together that is 118 to 174MB, downloaded on a page whose whole pitch is that it is quick to look at. On mobile data it is not a feature, it is a toll.",
      "The corpus is 38 short chunks. At that size a lexical ranker is not a downgrade, it is the right tool: BM25 over 38 documents is exact, runs in well under a millisecond, and ships zero bytes. Writing it took less code than the model loader it replaced.",
      "Removing the generator turned out to matter more than the size. A small model's job was to rephrase retrieved text, and rephrasing is exactly where it could quietly invent an internship I never did. Now the answer is the sentence I actually wrote, with the link attached. Less fluent, and it cannot lie.",
      "I wrote tests first this time, and they caught four bugs I would have shipped. Hyphenated phrases were indexed whole, so \"anti-money-laundering\" could not be found by searching \"money\". Stripping \"ing\" off \"programming\" left \"programm\", which never matched \"program\". \"where did you study\" matched nothing because the education chunk contained the institute's name but not one word a person would type. And \"do you keep bees in antarctica\" confidently returned my About section, because it matched the single word \"keep\".",
      "That last one is the one worth keeping in mind. A retrieval system with no confidence floor always has an answer, and an answer that is always available is not evidence of anything. It now requires the top chunk to cover at least half the terms you asked about, or it says it has nothing.",
    ],
    embed: { kind: "repo", id: "Atishyy27/Atishyy27.github.io" },
  },
  {
    // Superseded by the 2026-09-30 entry above. Left as written: this is a log,
    // and what I believed in July is part of the record.
    date: "2026-07-23",
    title: "A language model that answers from my work, with no API behind it",
    tags: ["transformers.js", "RAG", "WASM"],
    body: [
      "The ask section on this page runs two models in your browser and nothing leaves it. MiniLM embeds every chunk of my real content, cosine similarity picks the closest three, and a 77M-parameter Flan-T5 phrases the answer from only those chunks. No inference API, no key, no cost per question.",
      "The first version failed on a question as basic as \"have you worked in Java\". The retrieval was fine; the corpus was the bug. I had indexed projects and experience but never the skills list, so the one chunk that could answer it did not exist. Worth remembering that a RAG system fails silently in exactly this shape: fluent, confident, and about a document you forgot to feed it.",
      "It is deliberately a small model. A big one would be smoother and would also invent an internship I never did. The whole point of this site is that every claim is checkable, so the generator only gets to rephrase retrieved text.",
    ],
    embed: { kind: "repo", id: "Atishyy27/Atishyy27.github.io" },
  },
  {
    date: "2026-07-22",
    title: "Two browser windows that know about each other",
    tags: ["three.js", "localStorage"],
    body: [
      "Open this site in two windows and drag them apart. The shapes reach for each other across the gap.",
      "There is no server involved. Each window writes its own screenX, screenY, width and height into its own localStorage key on a heartbeat, and reads everyone else's. The trick that makes it line up is the camera: an orthographic camera at zoom 1 means one world unit equals one screen pixel, so a position computed in screen coordinates lands exactly where the other window physically is on your desk.",
      "Each window owning a separate key matters. A shared key means the last writer clobbers everyone, and windows start flickering out of existence. Stale keys get pruned after 1.6 seconds, which is how a closed window disappears without anything telling anyone it closed.",
    ],
  },
  {
    date: "2026-07-21",
    title: "Merging four contribution graphs into one, and why the first API was lying",
    tags: ["data", "GitHub", "Codeforces"],
    body: [
      "Every platform ships its own heatmap and none of them agree, so this one sums GitHub commits, Codeforces submissions and LeetCode solves into a single day cell. The same numbers also drive the 3D skyline view.",
      "The version before this looked perfect and was empty. The contributions API I had wired up returned HTTP 000, and the failure path filled the grid with zeros, which renders as a real-looking year of doing nothing. That is the worst kind of bug in a data view: it does not look broken.",
      "Now a source that fails is drawn struck through and labelled unavailable. A grid that cannot prove a number does not draw one.",
    ],
    links: [{ label: "GitHub profile", href: "https://github.com/Atishyy27" }],
  },
];
