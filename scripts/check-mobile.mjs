// scripts/check-mobile.mjs
// Mobile failure modes, checked against the BUILT output.
//
// There is no browser on this machine, so this does NOT prove the site looks
// right on a phone. It proves the specific things that make a page unusable on
// one and that CAN be read off the markup and the CSS: a missing viewport meta,
// an element wider than the screen that nothing can scroll, a layout whose
// columns never collapse, and text below a legible size.
//
// Run after a build:  node scripts/check-mobile.mjs

import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const PHONE = 375;      // iPhone SE / most common small width
const GUTTER = 48;      // px-6 either side
const CONTENT = PHONE - GUTTER;

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log("PASS: " + name);
  else { failures++; console.log("FAIL: " + name + (detail ? "  -> " + detail : "")); }
}

if (!fs.existsSync(OUT)) {
  console.log("FAIL: out/ does not exist. Run npm run build first.");
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(OUT);
const rel = (p) => path.relative(OUT, p);

// 1. Viewport meta on every page. Without it a phone renders at 980px wide and
//    zooms out, which makes every other mobile fix irrelevant.
const noViewport = pages.filter((p) => {
  const html = fs.readFileSync(p, "utf8");
  return !/<meta\s+name="viewport"[^>]*width=device-width/i.test(html);
});
check(
  "every page declares a device-width viewport",
  noViewport.length === 0,
  `${noViewport.length} without it: ` + noViewport.slice(0, 4).map(rel).join(", ")
);

// 2. Any inline width wider than a phone's content box must sit inside
//    something that can scroll horizontally, or it pushes the whole page.
const wide = [];
for (const p of pages) {
  const html = fs.readFileSync(p, "utf8");
  for (const m of html.matchAll(/style="[^"]*?width:\s*(\d{3,})px/gi)) {
    const px = Number(m[1]);
    if (px <= CONTENT) continue;
    // Look back a little for a scroll container wrapping it.
    const before = html.slice(Math.max(0, m.index - 600), m.index);
    if (!/overflow-x-auto|overflow-x:\s*(auto|scroll)|overflow-auto/.test(before)) {
      wide.push(`${rel(p)}: ${px}px with no scroller`);
    }
  }
}
check(
  `no unscrollable element wider than a ${PHONE}px screen`,
  wide.length === 0,
  wide.slice(0, 5).join("; ")
);

// 3. The row grid is the site's main layout primitive and is three fixed-ish
//    columns on desktop. It must collapse on a phone or every row overflows.
const css = fs
  .readdirSync(path.join(OUT, "_next", "static", "css"), { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith(".css"))
  .map((e) => fs.readFileSync(path.join(OUT, "_next", "static", "css", e.name), "utf8"))
  .join("\n");

check("a stylesheet was found to inspect", css.length > 0, "no css in out/_next/static/css");
check(
  "the .row grid collapses to one column on a phone",
  /@media[^{]*max-width:\s*640px[^{]*\{[^}]*\.row[^}]*grid-template-columns:\s*1fr/s.test(css) ||
    /\.row\s*\{[^}]*grid-template-columns:\s*1fr/s.test(
      // Tailwind may emit the mobile rule first and override it upward.
      css
    ),
  "no max-width:640px rule setting .row to a single column"
);

// 4. Text below about 9px is not legible on a phone, and iOS zooms a focused
//    input whose font-size is under 16px, which jumps the layout.
const tiny = [...css.matchAll(/font-size:\s*([0-9.]+)px/g)]
  .map((m) => Number(m[1]))
  .filter((n) => n > 0 && n < 10);
check(
  "no declared font size below 10px",
  tiny.length === 0,
  `smallest: ${Math.min(...(tiny.length ? tiny : [Infinity]))}px`
);

// 5. A horizontal scrollbar on the body is the single most visible mobile bug.
//    Nothing in the markup should set a viewport-wide minimum width.
const minW = [];
for (const p of pages) {
  const html = fs.readFileSync(p, "utf8");
  for (const m of html.matchAll(/style="[^"]*?min-width:\s*(\d{3,})px/gi)) {
    if (Number(m[1]) > CONTENT) minW.push(`${rel(p)}: min-width ${m[1]}px`);
  }
}
check("nothing sets a min-width wider than the screen", minW.length === 0, minW.slice(0, 4).join("; "));

console.log(`\nchecked ${pages.length} pages against a ${PHONE}px viewport (${CONTENT}px content box)`);
console.log(failures === 0 ? "ALL PASS" : failures + " FAILURE(S)");
process.exit(failures === 0 ? 0 : 1);
