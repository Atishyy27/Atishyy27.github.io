// What a visitor and a keyboard get on every built page, read from out/.
// Run after `next build`:  node scripts/check-doc-basics.mjs
//
// 25 Nov 2026 crawl of the live site: 0 of 167 pages showed the email address as
// text, 0 had a skip link, and 3 (/stats/, /writing/, /about/) had no h1. This
// keeps it from going back to that.

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
// Redirect stubs are a meta refresh with no app shell. The private admin pages are
// not part of the public site and are not this check's to judge.
const real = [...html].filter(([p, h]) => !h.includes('http-equiv="refresh"') && !p.startsWith("admin/"));

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

const noSkip = real.filter(([, h]) => !/<a[^>]*href="#content"[^>]*>\s*Skip to content/.test(h)).map(([p]) => p);
if (noSkip.length) bad(`${noSkip.length} of ${real.length} pages have no skip link: ${noSkip.slice(0, 5).join(", ")}`);
else ok(`all ${real.length} real pages have a skip link`);

const badH1 = real
  .map(([p, h]) => [p, (h.replace(/<script[\s\S]*?<\/script>/g, "").match(/<h1[\s>]/g) ?? []).length])
  .filter(([, n]) => n !== 1);
if (badH1.length) bad(`${badH1.length} pages do not have exactly one h1: ${badH1.slice(0, 5).map(([p, n]) => `${p} (${n})`).join(", ")}`);
else ok(`all ${real.length} real pages have exactly one h1`);

if (fails) {
  console.log(`\n${fails} FAIL`);
  process.exit(1);
}
console.log(`\nALL PASS (${real.length} real pages read)`);
