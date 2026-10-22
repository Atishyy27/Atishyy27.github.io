// scripts/check-site-claims.mjs
// The banned-string check that check-resume.mjs runs on the PDF, run on the
// built site as well.
//
// WHY. On 22 Oct 2026 the published resume had been cleaned of "CGPA 7.75" and
// the build would fail if it came back, while site.ts:347 was still rendering
// "CGPA 7.75, Minor 8.00" onto the About page and into the RAG index. The PDF
// was guarded and the website it was linked from was not. Same claim, same
// person reading it, two different standards.
//
// 7.75 is his best single semester, not a CGPA. CGPA is omitted everywhere on
// his instruction, 21 Oct 2026.
//
// Runs over out/, so it sees the rendered text, not the source. A string that
// only appears after interpolation is exactly the kind this is meant to catch.

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");

const BANNED = [
  ["CGPA", "CGPA is omitted from everything he publishes."],
  ["7.75", "His best single semester, never his CGPA."],
  ["7.06", "CGPA, omitted on his instruction."],
  ["3 enterprise", "Heizen had two enterprise clients, ITC and Spry."],
  ["Founding Engineering", "Drifted Heizen title. It is Technical Project Manager Intern."],
  ["7700", "The old LeetCode figure. False and checkable in one click."],
  ["108-test", "He called that coverage claim unsupported."],
];

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(html|txt|json|xml)$/.test(e.name)) out.push(p);
  }
  return out;
}

if (!fs.existsSync(OUT)) {
  console.log("FAIL  out/ does not exist; run the build first");
  process.exit(1);
}

const files = walk(OUT);
const fails = [];
let pass = 0;

for (const [needle, why] of BANNED) {
  const hits = files.filter((f) => fs.readFileSync(f, "utf8").includes(needle));
  if (hits.length) {
    fails.push(`"${needle}" appears in ${hits.length} built file(s). ${why}`);
    console.log(`FAIL  "${needle}" in ${hits.length} file(s): ${hits.slice(0, 3).map((f) => path.relative(OUT, f)).join(", ")}`);
  } else {
    pass++;
    console.log(`PASS  no "${needle}" anywhere in the built site`);
  }
}

console.log(`\nscanned ${files.length} built files, ${pass} PASS, ${fails.length} FAIL`);
if (fails.length) process.exit(1);
console.log("ALL PASS");
