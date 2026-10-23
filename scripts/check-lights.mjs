// scripts/check-lights.mjs
// The lights switch, asserted against the built output.
//
// This one is worth a guard because every part of it is invisible in the
// source review that would normally catch a break. The switch is a boot script
// inlined into every page, a set of CSS rules keyed off an attribute that is
// never present at build time, and a control that must appear in static HTML.
// Any of the three can be dropped by a refactor and the site still builds,
// still passes every other check, and silently loses the feature for the
// people it exists for.
//
// Run:  node scripts/check-lights.mjs

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

// The redirect stubs left behind by the route merges are three lines of meta
// refresh with no app shell, so they carry none of this and should not.
const isStub = (html) => html.includes('http-equiv="refresh"');
const real = pages.filter((p) => !isStub(fs.readFileSync(p, "utf8")));

const missingBoot = real.filter((p) => !fs.readFileSync(p, "utf8").includes("aj-lights"));
if (missingBoot.length) bad(`${missingBoot.length} of ${real.length} pages ship no boot script: ${missingBoot.slice(0, 3).join(", ")}`);
else ok(`all ${real.length} real pages inline the pre-paint boot script`);

const missingToggle = real.filter((p) => {
  const h = fs.readFileSync(p, "utf8");
  return !(h.includes('data-mode="full"') && h.includes('data-mode="flat"'));
});
if (missingToggle.length) bad(`${missingToggle.length} pages render no lights toggle: ${missingToggle.slice(0, 3).join(", ")}`);
else ok("every real page renders both segments of the toggle");

// The attribute must be absent from the shipped HTML. If a build ever bakes it
// in, one of the two modes becomes unreachable for anyone with JavaScript off
// and the stored preference stops being the source of truth.
const baked = real.filter((p) => /<html[^>]*data-lights/.test(fs.readFileSync(p, "utf8")));
if (baked.length) bad(`${baked.length} pages hardcode data-lights on <html>: ${baked.slice(0, 3).join(", ")}`);
else ok("no page bakes the mode into its HTML");

const cssDir = path.join(OUT, "_next", "static", "css");
const css = fs.existsSync(cssDir)
  ? fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"))
      .map((f) => fs.readFileSync(path.join(cssDir, f), "utf8")).join("\n")
  : "";

// Written unquoted because the minifier drops the quotes.
const RULES = [
  ["raised surfaces get their own edge", /data-lights=flat\]\{[^}]*--bg-raised/],
  ["the backdrop blur is dropped", /data-lights=flat\][^{]*\.glass\{[^}]*backdrop-filter:\s*none/],
  ["the hover sheen is dropped", /data-lights=flat\][^{]*\.tilt:after\{[^}]*display:\s*none/],
  ["revealed blocks are forced visible", /data-lights=flat\][^{]*\[data-reveal\]\{[^}]*opacity:1/],
  ["the switched-off placeholder is styled", /\.scene-off/],
];
for (const [what, re] of RULES) {
  if (re.test(css)) ok(what);
  else bad(`the stylesheet no longer says: ${what}`);
}

console.log(`\nchecked ${real.length} pages and ${css.length} bytes of CSS`);
console.log(fails ? `${fails} FAIL` : "ALL PASS");
process.exit(fails ? 1 : 0);
