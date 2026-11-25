// Product team and QA: what a visitor gets on first paint, rendered from the
// real components with react-dom/server. Initial state only; clicks, the
// clipboard and the failing relay run in a real browser in e2e/, in CI.
import test from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import { person } from "../../src/content/site.ts";
import EmailCopy from "../../src/components/EmailCopy.tsx";
import Contact from "../../src/components/Contact.tsx";

const esc = person.email.replace(/[.]/g, "[.]");

test("EmailCopy shows the address as text, a mailto link and a copy button", () => {
  const html = render(h(EmailCopy, { from: "test" }));
  assert.match(html, new RegExp(`>${esc}<`));
  assert.match(html, new RegExp(`href="mailto:${esc}"`));
  assert.match(html, />Copy</);
});

test("EmailCopy lets a long address wrap instead of overflowing a 360px screen", () => {
  const html = render(h(EmailCopy, { from: "test" }));
  assert.match(html, /break-all/);
  assert.match(html, /flex-wrap/);
});

test("contact section carries the address and the form, and says it opens the mail app when no key is set", () => {
  const html = render(h(Contact));
  assert.ok(html.includes(person.email));
  assert.match(html, /<form/);
  assert.match(html, /Opens your mail app\./);
  assert.doesNotMatch(html, /Something broke|That took too long|If your mail app did not open/);
});
