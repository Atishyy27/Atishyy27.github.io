// scripts/check-resume.mjs
// Fails the build if the resume published on the site states something that is not true.
//
// Why this exists. On 21 Oct 2026 the PDF being served at atishay.tech/Atishay_Jain_Resume.pdf
// was a 28 Sep build carrying three claims at once that his own reconciled master file had
// already struck: "3 enterprise clients" at Heizen (there were two, ITC and Spry), the job title
// "Founding Engineering Intern" (it is Technical Project Manager Intern), and "CGPA 7.75" (that
// is his best single semester, not a CGPA). The site had been handing that to every recruiter who
// clicked Resume for three weeks, because a PDF is opaque: nothing in the build could see inside it.
//
// This opens it. Every string below was on a resume that was really sent. The client count is the
// one the master file singles out as the only claim in the whole record that would not survive a
// reference call, which is why a wrong resume is a build failure here and not a warning.
//
// Needs pdftotext (poppler). If it is missing the check cannot run, and a check that cannot run
// is treated as a failure rather than a pass, because the whole point is to not assume.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PDF = path.join(process.cwd(), "public", "Atishay_Jain_Resume.pdf");

const BANNED = [
  ["3 enterprise", "Heizen had two enterprise clients, ITC and Spry, not three."],
  ["three enterprise", "Same claim, spelled out."],
  ["Founding Engineering", "Drifted Heizen title. It is Technical Project Manager Intern."],
  ["7700", "The 7700+ LeetCode figure is false and checkable in one click."],
  ["7.75", "That is his best single semester, not his CGPA. CGPA is omitted entirely."],
  ["7.06", "CGPA is omitted from every CV on his instruction, 21 Oct 2026."],
  ["108-test", "He called the 108-test coverage claim unsupported."],
  ["jumbl", "Another company's ATS intern assignment."],
  ["Sarvam", "Never appeared in his Linear assignments; it was a misremember."],
];

// Claims of publication. The papers are submitted and under review until a DOI exists.
const PUBLICATION = /\bpublished\b/i;

let pass = 0;
const fails = [];
const ok = (m) => { pass++; console.log(`PASS  ${m}`); };
const bad = (m) => { fails.push(m); console.log(`FAIL  ${m}`); };

if (!fs.existsSync(PDF)) {
  console.log("FAIL  public/Atishay_Jain_Resume.pdf is missing, but site.ts links to it");
  process.exit(1);
}

let text;
try {
  text = execFileSync("pdftotext", [PDF, "-"], { encoding: "utf8" });
} catch (err) {
  console.log(`FAIL  could not read the resume text: ${err.message}`);
  console.log("      install poppler (brew install poppler) so this check can actually run");
  process.exit(1);
}

ok(`read ${text.split(/\s+/).filter(Boolean).length} words out of the published resume`);

for (const [needle, why] of BANNED) {
  if (text.toLowerCase().includes(needle.toLowerCase())) bad(`"${needle}" is in the published resume. ${why}`);
  else ok(`no "${needle}"`);
}

if (PUBLICATION.test(text)) bad('the resume says "published". The papers are submitted and under review until a DOI exists.');
else ok("no claim of a published paper");

// A resume nobody can read in one sitting is its own failure mode: his rule is 400 to 550 words.
const words = text.split(/\s+/).filter(Boolean).length;
if (words > 650) bad(`${words} words, which is past the 550-word rule by enough to matter`);
else ok(`${words} words, within the length rule`);

console.log(`\n${pass} PASS, ${fails.length} FAIL`);
if (fails.length) {
  console.log("\nfix:\n  cd ~/Desktop/codes_masti/masti/projects/cv && python3 build.py generalist");
  console.log("  then copy out/Atishay_Jain_Resume_Generalist_<date>.pdf to public/Atishay_Jain_Resume.pdf");
  process.exit(1);
}
console.log("ALL PASS");
