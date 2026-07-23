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
