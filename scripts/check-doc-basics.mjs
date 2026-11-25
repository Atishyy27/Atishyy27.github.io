// What a visitor and a keyboard get on every built page, read from out/.
// Run after `next build`:  node scripts/check-doc-basics.mjs
//
// 25 Nov 2026 crawl of the live site: 0 of 167 pages showed the email address as
// text. This keeps it from going back to that.

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
let fails = 0;
const ok = (m) => console.log(`PASS: ${m}`);
const bad = (m) => { console.log(`FAIL: ${m}`); fails++; };

if (!fs.existsSync(OUT)) {
  console.log("FAIL: no out/ directory. Run next build first.");
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "index.html") pages.push(p);
  }
})(OUT);

const html = new Map(pages.map((p) => [path.relative(OUT, p).split(path.sep).join("/"), fs.readFileSync(p, "utf8")]));
// Redirect stubs are a meta refresh with no app shell.
const real = [...html].filter(([, h]) => !h.includes('http-equiv="refresh"'));

const emailText = (h) => {
  const body = h.replace(/<script[\s\S]*?<\/script>/g, "");
  return />[^<>]*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}[^<>]*</.test(body);
};
for (const page of ["index.html", "about/index.html"]) {
  const h = html.get(page);
  if (!h) bad(`${page} was not built`);
  else if (!emailText(h)) bad(`${page} does not show the email address as text`);
  else ok(`${page} shows the email address as text`);
}

if (fails) {
  console.log(`\n${fails} FAIL`);
  process.exit(1);
}
console.log(`\nALL PASS (${real.length} real pages read)`);
