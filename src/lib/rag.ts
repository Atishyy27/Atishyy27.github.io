"use client";

/**
 * In-browser RAG engine, shared by the terminal.
 * MiniLM embeddings for semantic retrieval + a small Flan-T5 to phrase the
 * answer from retrieved context. WASM/CPU, no API. Grounded to real content.
 */

import {
  about, currentWork, experience, govtWork, clientWork, orgWork,
  extensions, hackathons, cpProfiles, skills, education, person,
} from "@/content/site";

export type Chunk = { label: string; href?: string; text: string };

export function buildCorpus(): Chunk[] {
  const c: Chunk[] = [];
  c.push({ label: "About", text: `${person.name}. ${about.join(" ")}` });
  c.push({ label: "Open source", href: "#opensource", text: `${currentWork.title}. ${currentWork.detail}. ${currentWork.badge}. 74 pull requests across open-source infrastructure, merged fixes in rust-lightning, OPA, Meshery, zowe-cli and braidpool.` });
  // skills — this is why "have you worked in Java" must resolve
  c.push({ label: "Languages", href: "#about", text: `Atishay's primary language is Java, used for competitive programming and data structures. He also programs in Python, TypeScript, JavaScript, Rust, C, C++, C# and SQL. Yes, he has worked extensively in Java.` });
  skills.forEach((s) => c.push({ label: s.group, href: "#about", text: `${s.group}: ${s.items.join(", ")}.` }));
  c.push({ label: "Education", text: `${education.degree} at ${education.school}. ${education.cgpa}. ${education.note}.` });
  experience.forEach((e) => c.push({ label: e.org, text: `At ${e.org}, ${e.role} (${e.dates}). ${(e.points ?? []).join(" ")}` }));
  [...govtWork, ...clientWork, ...orgWork, ...extensions, ...hackathons].forEach((w) =>
    c.push({ label: w.name, href: w.links[0]?.href, text: `${w.name}${w.org ? ` for ${w.org}` : ""}. ${w.blurb} Built with ${w.stack.join(", ")}.` })
  );
  c.push({ label: "Competitive programming", href: "#cp", text: `ICPC 2025 rank 12 at the Mysuru regionals. ${cpProfiles.map((p) => `${p.site} ${p.rank} ${p.detail}`).join(". ")}.` });
  return c;
}

function cosine(a: number[], b: number[]) {
  let d = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return d / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

let extractor: unknown = null;
let generator: unknown = null;
let vectors: number[][] | null = null;
let corpusCache: Chunk[] | null = null;

type Extract = (t: string, o: object) => Promise<{ data: Float32Array }>;
type Generate = (t: string, o: object) => Promise<{ generated_text: string }[]>;

export async function ensureModels(onStatus: (s: string) => void) {
  const TF = await import("@xenova/transformers");
  TF.env.allowLocalModels = false;
  TF.env.useBrowserCache = true;

  const cb = (name: string) => (p: { status: string; progress?: number }) => {
    if (p.status === "progress" && p.progress) onStatus(`downloading ${name} ${Math.round(p.progress)}%`);
  };

  if (!extractor) { onStatus("waking the retriever"); extractor = await TF.pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { progress_callback: cb("retriever") }); }
  if (!corpusCache) corpusCache = buildCorpus();
  if (!vectors) {
    onStatus("indexing my work");
    vectors = [];
    for (const ch of corpusCache) {
      const out = await (extractor as Extract)(ch.text, { pooling: "mean", normalize: true });
      vectors.push(Array.from(out.data));
    }
  }
  if (!generator) { onStatus("waking the writer"); generator = await TF.pipeline("text2text-generation", "Xenova/LaMini-Flan-T5-77M", { progress_callback: cb("writer") }); }
}

export async function answer(q: string, onStatus: (s: string) => void): Promise<{ text: string; sources: Chunk[] }> {
  await ensureModels(onStatus);
  onStatus("searching my work");
  const qv = await (extractor as Extract)(q, { pooling: "mean", normalize: true });
  const qvec = Array.from(qv.data);
  const ranked = corpusCache!
    .map((ch, i) => ({ ch, s: cosine(qvec, vectors![i]) }))
    .sort((a, b) => b.s - a.s);
  const top = ranked.slice(0, 3).filter((r) => r.s > 0.1);
  if (!top.length) return { text: "I don't have anything on that in my work. Ask about my projects, open source, skills, or internships.", sources: [] };

  onStatus("writing an answer");
  const context = top.map((r) => r.ch.text).join("\n");
  const prompt = `Read the context and answer the question in 2 or 3 sentences. If the context supports it, answer positively and give specifics.\n\nContext:\n${context}\n\nQuestion: ${q}\nAnswer:`;
  const out = await (generator as Generate)(prompt, { max_new_tokens: 130, temperature: 0.3, repetition_penalty: 1.3 });
  const text = out[0]?.generated_text?.trim() || top[0].ch.text;
  return { text, sources: top.map((r) => r.ch) };
}
