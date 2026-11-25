// check-doc-basics reads out/, which only exists after a build in CI. These run it
// against a small synthetic out/ so the check itself is proven both ways here.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const script = path.resolve("scripts/check-doc-basics.mjs");

function site(pages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "docbasics-"));
  for (const [rel, html] of Object.entries(pages)) {
    const f = path.join(dir, "out", rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, html);
  }
  return dir;
}
const run = (cwd) => spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
const withMail = '<main><a href="mailto:a@example.com">a@example.com</a></main>';

test("passes when / and /about/ show the address as text", () => {
  const dir = site({ "index.html": withMail, "about/index.html": withMail });
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /ALL PASS/);
});

test("fails when the address is only inside a mailto href", () => {
  const dir = site({
    "index.html": withMail,
    "about/index.html": '<main><a href="mailto:a@example.com">Get in touch</a></main>',
  });
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /about\/index\.html does not show the email address as text/);
});

test("an address only inside a script (JSON-LD) does not count", () => {
  const dir = site({
    "index.html": withMail,
    "about/index.html": '<script type="application/ld+json">{"email":"a@example.com"}</script><main>hi</main>',
  });
  assert.equal(run(dir).status, 1);
});

test("fails with a clear message when nothing was built", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "docbasics-"));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /no out\/ directory/);
});
