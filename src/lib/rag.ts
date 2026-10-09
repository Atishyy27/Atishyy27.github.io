"use client";

/**
 * In-browser retrieval over my own content, for the ask box.
 *
 * WHY THERE IS NO MODEL HERE ANY MORE
 *
 * This used to load two models through @xenova/transformers: MiniLM for
 * embeddings (~23MB) and LaMini-Flan-T5-77M to phrase the answer (~95-151MB).
 * That is 118 to 174MB downloaded before a visitor sees a single word, on a
 * page whose entire point is to be quick to look at. On mobile data it is not
 * a feature, it is an insult.
 *
 * The corpus is about forty short chunks. At that size a lexical ranker is not
 * a compromise, it is the correct tool: BM25 over forty documents is exact,
 * runs in under a millisecond, ships zero bytes and cannot hallucinate. The
 * generator was the part that could invent a project I never built, and it is
 * the part that is gone.
 *
 * What is lost: answers are no longer phrased as prose. They are the real
 * sentence from the real source, with the link attached. For "what has he
 * built", that is strictly better than a 77M-parameter paraphrase of it.
 */

import {
  about, currentWork, experience, govtWork, clientWork, orgWork,
  extensions, hackathons, cpProfiles, skills, education, person,
} from "@/content/site";

export type Chunk = { label: string; href?: string; text: string };

export function buildCorpus(): Chunk[] {
  const c: Chunk[] = [];
  c.push({ label: "About", text: `${person.name}. ${about.join(" ")}` });

  // Counted claim, verified against the GitHub search API on 2026-10-09:
  //   author:Atishyy27 type:pr is:merged -user:Atishyy27  ->  60
  //   minus repo:saloni0903/yoga-app (16) and
  //         repo:iamrahulmahato/master-web-development (3)  ->  41
  // Those two are permanently excluded: they are not open-source contributions.
  // Earlier versions of this chunk said 74, then 55. Both were wrong.
  c.push({
    label: "Open source",
    href: "/oss/",
    text: `Open source contributions. Contributed upstream as an outside contributor. ${currentWork.title}. ${currentWork.detail}. ${currentWork.badge}. 41 pull requests merged into repositories he does not own, across 24 projects, including cilium, kubernetes/website, open-policy-agent/opa, meshery, kmesh, opentelemetry, hyperledger/fabric, podman, fedimint, lightningdevkit/rust-lightning, braidpool, openswap and zowe-cli. 153 pull requests opened upstream and 76 still open. Counted 9 October 2026; the live figure is on the open source page.`,
  });

  // Asked often enough to deserve its own chunk: "have you worked in Java".
  c.push({
    label: "Languages",
    href: "/about/",
    text: `Atishay's primary language is Java, used for competitive programming and data structures. He also programs in Python, TypeScript, JavaScript, Rust, C, C++, C# and SQL. Yes, he has worked extensively in Java.`,
  });

  skills.forEach((s) => c.push({ label: s.group, href: "/about/", text: `${s.group}: ${s.items.join(", ")}.` }));
  // The raw fields contain the institute's name but not one word a visitor would
  // type. "where did you study" matched nothing until these were added.
  c.push({
    label: "Education",
    href: "/about/",
    text: `Education. He studies at ${education.school}, where he is doing a ${education.degree}. College, university, institute, degree, studied, student. ${education.cgpa}. ${education.note}.`,
  });
  experience.forEach((e) =>
    c.push({ label: e.org, href: "/about/", text: `At ${e.org}, ${e.role} (${e.dates}). ${(e.points ?? []).join(" ")}` })
  );
  // The category goes into the text on purpose. "what chrome extensions have you
  // built" used to rank the About paragraph above both extensions, because the
  // word "extension" appeared in neither chunk: it was only ever the category,
  // which was not indexed. A chunk has to contain the word a person would type.
  const withKind: [typeof govtWork, string][] = [
    [govtWork, "Government platform"],
    [clientWork, "Client project"],
    [orgWork, "Institution project"],
    [extensions, "Chrome extension, browser extension"],
    [hackathons, "Hackathon project"],
  ];
  for (const [list, kind] of withKind) {
    for (const w of list) {
      c.push({
        label: w.name,
        href: w.links[0]?.href,
        text: `${w.name}${w.org ? ` for ${w.org}` : ""}. ${kind}. ${w.blurb} Built with ${w.stack.join(", ")}.`,
      });
    }
  }
  c.push({
    label: "Competitive programming",
    href: "/stats/",
    text: `ICPC 2025 rank 12 at the Mysuru regionals. ${cpProfiles.map((p) => `${p.site} ${p.rank} ${p.detail}`).join(". ")}.`,
  });
  return c;
}

/* ------------------------------ tokenizing ------------------------------ */

// Short function words carry no signal over forty documents and, worse, they
// match everything, so a query like "what is he building" would rank by "is".
const STOP = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "did", "do", "does",
  "for", "from", "had", "has", "have", "he", "her", "his", "how", "i", "in", "is", "it",
  "its", "of", "on", "or", "s", "she", "that", "the", "their", "them", "they", "this",
  "to", "was", "were", "what", "when", "where", "which", "who", "why", "will", "with",
  "you", "your", "me", "my", "any", "can", "does", "did", "there", "about", "tell",
]);

/**
 * Crude suffix stripping, on purpose. A real stemmer is a dependency and a
 * download; this only has to make "projects" match "project" and "building"
 * match "build" across forty documents.
 */
function stem(w: string): string {
  let out = w;
  if (out.length > 4 && out.endsWith("ing")) out = out.slice(0, -3);
  else if (out.length > 4 && out.endsWith("ed")) out = out.slice(0, -2);
  else if (out.length > 3 && out.endsWith("es")) out = out.slice(0, -2);
  else if (out.length > 3 && out.endsWith("s") && !out.endsWith("ss")) out = out.slice(0, -1);

  // Stripping "ing" off "programming" leaves "programm", which then fails to
  // match "program" from "programs in Python". Undo the doubled consonant.
  if (out.length > 3 && /([bdfglmnprt])\1$/.test(out)) out = out.slice(0, -1);

  // "studies" already stemmed to "studi" via the -es rule, but "study" did not,
  // so "where did you study" found nothing. Collapse both onto "studi".
  if (out.length > 3 && out.endsWith("y")) out = out.slice(0, -1) + "i";
  return out;
}

function tokenize(s: string): string[] {
  const words = s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\- ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const out: string[] = [];
  for (const w of words) {
    // Hyphenated phrases were indexed whole, so "anti-money-laundering" could
    // never be found by searching "money". Index the parts as well as the whole.
    const parts = w.includes("-") ? [w, ...w.split("-")] : [w];
    for (const part of parts) {
      if (part.length > 1 && !STOP.has(part)) out.push(stem(part));
    }
  }
  return out;
}

/* -------------------------------- BM25 --------------------------------- */

const K1 = 1.5; // term-frequency saturation: how fast repeats stop helping
const B = 0.55; // length normalisation. Lowered from 0.75: the open-source and
                // experience chunks are long *because* they are substantive, and
                // 0.75 was ranking a passing mention in a short chunk above them.

type Index = {
  chunks: Chunk[];
  tf: Map<string, number>[];
  len: number[];
  avgLen: number;
  df: Map<string, number>;
  n: number;
};

let index: Index | null = null;

function buildIndex(): Index {
  const chunks = buildCorpus();
  const tf: Map<string, number>[] = [];
  const len: number[] = [];
  const df = new Map<string, number>();

  // The label names what the chunk is ABOUT, so it is worth more than the same
  // word appearing in passing inside a paragraph. Without this, "competitive
  // programming" ranked the Languages chunk, which mentions the phrase once,
  // above the chunk actually titled "Competitive programming".
  const LABEL_WEIGHT = 2;

  for (const ch of chunks) {
    const labelToks = tokenize(ch.label);
    const toks = [...tokenize(ch.text)];
    for (let i = 0; i < LABEL_WEIGHT; i++) toks.push(...labelToks);
    const m = new Map<string, number>();
    for (const t of toks) m.set(t, (m.get(t) ?? 0) + 1);
    tf.push(m);
    len.push(toks.length);
    for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }

  return {
    chunks,
    tf,
    len,
    avgLen: len.reduce((a, b) => a + b, 0) / (len.length || 1),
    df,
    n: chunks.length,
  };
}

function score(idx: Index, doc: number, qTokens: string[]): number {
  let s = 0;
  for (const t of qTokens) {
    const f = idx.tf[doc].get(t);
    if (!f) continue;
    const n = idx.df.get(t) ?? 0;
    // +1 inside the log keeps IDF non-negative for a term present everywhere.
    const idf = Math.log(1 + (idx.n - n + 0.5) / (n + 0.5));
    const norm = f + K1 * (1 - B + (B * idx.len[doc]) / (idx.avgLen || 1));
    s += idf * ((f * (K1 + 1)) / norm);
  }
  return s;
}

/* -------------------------------- answer -------------------------------- */

export type Answer = { text: string; sources: Chunk[] };

const NOTHING =
  "I have nothing on that. Ask about my projects, open source, competitive programming, skills, or where I have worked.";

/**
 * Kept async and kept the `onStatus` callback so the terminal's call site did
 * not have to change. Neither is needed any more: this returns in well under a
 * millisecond, which is itself the point.
 */
export async function answer(q: string, onStatus: (s: string) => void): Promise<Answer> {
  index ??= buildIndex();
  onStatus("searching");

  const qTokens = tokenize(q);
  if (qTokens.length === 0) return { text: NOTHING, sources: [] };

  const ranked = index.chunks
    .map((ch, i) => ({ ch, s: score(index!, i, qTokens) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s);

  if (ranked.length === 0) return { text: NOTHING, sources: [] };

  // A score alone is not evidence the question was understood. "do you keep
  // bees in antarctica" matched one common word and confidently returned the
  // About chunk. Require that the winning chunk actually covers a fair share
  // of what was asked, not just one incidental term.
  const unique = [...new Set(qTokens)];
  const bestDoc = index.chunks.indexOf(ranked[0].ch);
  const matched = unique.filter((t) => index!.tf[bestDoc].has(t)).length;
  if (matched / unique.length < 0.5) return { text: NOTHING, sources: [] };

  // Only keep results close to the best one. Without this, a one-word query
  // drags in every chunk that happens to share a common term, and the answer
  // reads like a list of everything.
  const best = ranked[0].s;
  const top = ranked.filter((r) => r.s >= best * 0.45).slice(0, 3);

  return { text: top[0].ch.text, sources: top.map((r) => r.ch) };
}

/** Exported for the test script, which checks known questions hit known chunks. */
export function rank(q: string): { label: string; score: number }[] {
  index ??= buildIndex();
  const qTokens = tokenize(q);
  return index.chunks
    .map((ch, i) => ({ label: ch.label, score: score(index!, i, qTokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
