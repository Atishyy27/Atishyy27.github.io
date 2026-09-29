// scripts/check-rag.mjs
// The ask box answers from a BM25 index over site content. This asserts that
// known questions rank the right chunk first, which is the only thing that can
// silently rot when someone edits a blurb.
//
// Run:  node --experimental-strip-types --import ./scripts/alias-hook-register.mjs scripts/check-rag.mjs
//       (or: npm run check:rag)

import { rank, buildCorpus, answer } from "../src/lib/rag.ts";

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log("PASS: " + name);
  else { failures++; console.log("FAIL: " + name + (detail ? "  -> " + detail : "")); }
}

const corpus = buildCorpus();
check("corpus is not empty", corpus.length > 0, "0 chunks");
check("every chunk has text", corpus.every((c) => c.text.trim().length > 20), "a chunk is empty or near-empty");
check("every chunk has a label", corpus.every((c) => c.label.trim().length > 0));

// Questions a visitor actually asks, and the chunk that should win.
const CASES = [
  ["have you worked in java", "Languages"],
  ["what open source have you contributed to", "Open source"],
  ["tell me about competitive programming", "Competitive programming"],
  ["where did you study", "Education"],
  ["what chrome extensions have you built", /extension|LeetCode Analytics|PRD Verification/i],
  ["anti money laundering", /money/i],
];

for (const [q, want] of CASES) {
  const r = rank(q);
  const top = r[0]?.label ?? "(nothing)";
  const ok = want instanceof RegExp ? want.test(top) : top === want;
  check(`"${q}" -> ${want instanceof RegExp ? want : want}`, ok, `got "${top}"`);
}

// A question about something he has never touched must not confidently return
// the nearest chunk. This is the failure the generator used to hide.
const nonsense = await answer("do you keep bees in antarctica", () => {});
check(
  "an unrelated question returns nothing rather than the closest chunk",
  nonsense.sources.length === 0,
  `returned ${nonsense.sources.length} source(s): ${nonsense.sources.map((s) => s.label).join(", ")}`
);

// No model download may sneak back in.
const src = await import("node:fs").then((fs) => fs.readFileSync("src/lib/rag.ts", "utf8"));
check(
  "rag.ts imports no model runtime",
  !/from ["']@xenova|pipeline\(/.test(src),
  "a transformers import or pipeline() call is back"
);

console.log(`\n${corpus.length} chunks indexed`);
console.log(failures === 0 ? "ALL PASS" : failures + " FAILURE(S)");
process.exit(failures === 0 ? 0 : 1);
