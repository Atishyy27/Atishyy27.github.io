import test from "node:test";
import assert from "node:assert/strict";
import { activeNav, NAV_LINKS } from "../../src/lib/nav.ts";

test("each nav link owns its own route, with or without the trailing slash", () => {
  for (const [, href] of NAV_LINKS) {
    assert.equal(activeNav(href), href);
    assert.equal(activeNav(href.replace(/\/$/, "")), href);
  }
});

test("detail pages belong to their section", () => {
  assert.equal(activeNav("/projects/yes-wellness-platform/"), "/projects/");
  assert.equal(activeNav("/oss/org/cilium/"), "/oss/");
  assert.equal(activeNav("/oss/tier-game/"), "/oss/");
});

test("a journal entry is writing", () => {
  assert.equal(activeNav("/journal/some-entry/"), "/writing/");
  assert.equal(activeNav("/journal/tag/rust/"), "/writing/");
});

test("home, unknown and look-alike paths mark nothing", () => {
  assert.equal(activeNav("/"), "");
  assert.equal(activeNav(""), "");
  assert.equal(activeNav("/projectsx/"), "");
  assert.equal(activeNav("/admin/desk/"), "");
});
