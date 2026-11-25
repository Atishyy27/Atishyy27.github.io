// Tech team: the contact logic against a fake Web3Forms. No network, no key.
import test from "node:test";
import assert from "node:assert/strict";
import { submitContact, copyText, mailtoHref, WEB3FORMS_URL } from "../../src/lib/contact.ts";
import { mockFetch, FIXTURES } from "../../src/lib/mocks/http.ts";

const form = (o = {}) => {
  const d = new FormData();
  d.set("name", o.name ?? "Ada");
  if (o.email !== "") d.set("email", o.email ?? "ada@example.com");
  d.set("message", o.message ?? "hello there");
  return d;
};
const opts = (extra = {}) => ({ key: "k", to: "me@example.com", ...extra });

test("no key: returns a mailto with the message and sender in the body", async () => {
  const r = await submitContact(form(), opts({ key: "" }));
  assert.equal(r.kind, "mailto");
  const url = new URL(r.href);
  assert.equal(url.protocol, "mailto:");
  assert.equal(decodeURIComponent(url.pathname), "me@example.com");
  assert.match(url.searchParams.get("body"), /hello there/);
  assert.match(url.searchParams.get("body"), /Ada \(ada@example\.com\)/);
});

test("no key and no email given: the body says anonymous, the name defaults", () => {
  const href = mailtoHref("me@example.com", "someone", "no email — anonymous", "hi");
  assert.match(decodeURIComponent(href), /someone \(no email — anonymous\)/);
});

test("no key: never calls the network", async () => {
  let called = false;
  await submitContact(form(), opts({ key: "", fetchImpl: async () => ((called = true), new Response("{}")) }));
  assert.equal(called, false);
});

test("key set: posts the form to Web3Forms and reports sent", async () => {
  let seen;
  const r = await submitContact(form(), opts({ fetchImpl: (u, i) => ((seen = { u, i }), mockFetch(u, i)) }));
  assert.deepEqual(r, { kind: "sent" });
  assert.equal(seen.u, WEB3FORMS_URL);
  assert.equal(seen.i.method, "POST");
  assert.equal(seen.i.body.get("message"), "hello there");
});

test("mock fixture for the relay is the shape the real one documents", async () => {
  const res = await mockFetch(WEB3FORMS_URL, { method: "POST" });
  assert.deepEqual(await res.json(), FIXTURES.web3forms);
});

test("HTTP 500 and 403 are errors carrying the status", async () => {
  for (const status of [500, 403]) {
    const r = await submitContact(form(), opts({ fetchImpl: async () => new Response("{}", { status }) }));
    assert.deepEqual(r, { kind: "error", reason: "http", status });
  }
});

test("a rejected fetch is a network error", async () => {
  const r = await submitContact(form(), opts({ fetchImpl: async () => { throw new TypeError("Failed to fetch"); } }));
  assert.deepEqual(r, { kind: "error", reason: "network" });
});

test("a relay that never answers ends in timeout when it honours the abort signal", async () => {
  process.env.NEXT_PUBLIC_MOCK_MODE = "timeout";
  try {
    const t0 = Date.now();
    const r = await submitContact(form(), opts({ fetchImpl: mockFetch, timeoutMs: 40 }));
    assert.deepEqual(r, { kind: "error", reason: "timeout" });
    assert.ok(Date.now() - t0 < 1000);
  } finally {
    delete process.env.NEXT_PUBLIC_MOCK_MODE;
  }
});

test("a relay that ignores the abort signal still times out", async () => {
  const r = await submitContact(form(), opts({ fetchImpl: () => new Promise(() => {}), timeoutMs: 40 }));
  assert.deepEqual(r, { kind: "error", reason: "timeout" });
});

test("a slow but answering relay inside the limit is still sent", async () => {
  const slow = () => new Promise((res) => setTimeout(() => res(new Response("{}")), 30));
  const r = await submitContact(form(), opts({ fetchImpl: slow, timeoutMs: 500 }));
  assert.deepEqual(r, { kind: "sent" });
});

test("mock mode via NEXT_PUBLIC_MOCK_MODE gives 500 / network", async () => {
  process.env.NEXT_PUBLIC_MOCK_MODE = "500";
  assert.equal((await mockFetch(WEB3FORMS_URL, {})).status, 500);
  process.env.NEXT_PUBLIC_MOCK_MODE = "network";
  await assert.rejects(() => mockFetch(WEB3FORMS_URL, {}), TypeError);
  delete process.env.NEXT_PUBLIC_MOCK_MODE;
});

test("copyText: writes to the clipboard, reports false when it is missing or refuses", async () => {
  let written;
  assert.equal(await copyText("a@b.c", { writeText: async (t) => { written = t; } }), true);
  assert.equal(written, "a@b.c");
  assert.equal(await copyText("a@b.c", undefined), false);
  assert.equal(await copyText("a@b.c", {}), false);
  assert.equal(await copyText("a@b.c", { writeText: async () => { throw new Error("denied"); } }), false);
});

test("the test runner has no real network", () => {
  assert.throws(() => fetch("https://example.com"), /real network/);
});
