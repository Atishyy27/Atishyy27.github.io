// The repo's own checks, run for real, so a check that is red on main fails here
// with its output instead of being found by hand.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const run = (script, args = []) =>
  spawnSync(process.execPath, [script, ...args], { encoding: "utf8", cwd: process.cwd() });

test("check-orphans passes on the real source tree, route handlers included", () => {
  const r = run("scripts/check-orphans.mjs");
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /no orphaned components/);
});

test("check-orphans still catches a component that nothing renders", () => {
  const stray = path.join("src", "components", "ZzOrphanProbe.tsx");
  fs.writeFileSync(stray, "export default function ZzOrphanProbe() { return null; }\n");
  try {
    const r = run("scripts/check-orphans.mjs");
    assert.equal(r.status, 1);
    assert.match(r.stdout, /ZzOrphanProbe/);
  } finally {
    fs.rmSync(stray, { force: true });
  }
});

test("check-orphans treats a route handler verb as a framework entry, not an orphan", () => {
  const probe = path.join("src", "app", "zz-probe");
  fs.mkdirSync(probe, { recursive: true });
  fs.writeFileSync(path.join(probe, "route.ts"), "export function GET() { return new Response('x'); }\n");
  try {
    const r = run("scripts/check-orphans.mjs");
    assert.equal(r.status, 0, r.stdout);
  } finally {
    fs.rmSync(probe, { recursive: true, force: true });
  }
});

test("the OSS numbers agree across the data files, with no network", () => {
  const r = run("scripts/check-oss-numbers.mjs", ["--data-only"]);
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /ALL PASS/);
});
