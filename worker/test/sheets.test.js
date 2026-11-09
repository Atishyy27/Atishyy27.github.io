/* sheets.js with a mocked fetch: real RS256 signing against a locally
   generated key (verified with the public half), no network. */
import test from "node:test";
import assert from "node:assert/strict";
import { rowsToObjects, getTasks, _resetTokenCache, b64url } from "../src/sheets.js";

const { publicKey, privateKey } = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true,
  ["sign", "verify"],
);
const der = Buffer.from(await crypto.subtle.exportKey("pkcs8", privateKey)).toString("base64");
const pem = `-----BEGIN PRIVATE KEY-----\n${der.match(/.{1,64}/g).join("\n")}\n-----END PRIVATE KEY-----\n`;
const env = {
  GOOGLE_SA_KEY: JSON.stringify({ client_email: "sa@proj.iam.gserviceaccount.com", private_key: pem }),
  SHEET_ID: "sheet123",
};

test("rowsToObjects maps headers, pads short rows, skips blanks", () => {
  const out = rowsToObjects([["Title", "Status", "Due"], ["a", "todo"], [], ["b", "done", "2026-11-10"]]);
  assert.deepEqual(out.headers, ["Title", "Status", "Due"]);
  assert.deepEqual(out.rows, [
    { Title: "a", Status: "todo", Due: "" },
    { Title: "b", Status: "done", Due: "2026-11-10" },
  ]);
  assert.deepEqual(rowsToObjects(undefined), { headers: [], rows: [] });
});

test("getTasks: signs a valid RS256 assertion, calls Sheets with bearer, caches token", async () => {
  _resetTokenCache();
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).startsWith("https://oauth2.googleapis.com/token")) {
      return Response.json({ access_token: "tok", expires_in: 3600 });
    }
    return Response.json({ values: [["title", "status"], ["x", "todo"]] });
  };
  const r1 = await getTasks(env);
  await getTasks(env);
  assert.deepEqual(r1.rows, [{ title: "x", status: "todo" }]);
  assert.equal(calls.filter(c => c.url.includes("oauth2")).length, 1, "token cached");

  const form = new URLSearchParams(calls[0].init.body);
  assert.equal(form.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
  const [h, c, s] = form.get("assertion").split(".");
  const dec = x => JSON.parse(Buffer.from(x, "base64url").toString());
  assert.deepEqual(dec(h), { alg: "RS256", typ: "JWT" });
  const claims = dec(c);
  assert.equal(claims.iss, "sa@proj.iam.gserviceaccount.com");
  assert.equal(claims.aud, "https://oauth2.googleapis.com/token");
  assert.equal(claims.scope, "https://www.googleapis.com/auth/spreadsheets.readonly");
  assert.equal(claims.exp - claims.iat, 3600);
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", publicKey, Buffer.from(s, "base64url"), new TextEncoder().encode(`${h}.${c}`),
  );
  assert.ok(ok, "signature verifies with the public key");

  assert.match(calls[1].url, /spreadsheets\/sheet123\/values\/Tasks!A1%3AM1000$/);
  assert.equal(calls[1].init.headers.authorization, "Bearer tok");
});

test("getTasks rejects placeholder SHEET_ID and missing key", async () => {
  _resetTokenCache();
  await assert.rejects(getTasks({ ...env, SHEET_ID: "REPLACE-with-the-sheet-id" }), /SHEET_ID/);
  await assert.rejects(getTasks({ SHEET_ID: "x" }), /GOOGLE_SA_KEY/);
});

test("Calendar column is dropped", () => {
  const out = rowsToObjects([["Tag", "Calendar", "Task"], ["x", "cal", "t"]]);
  assert.deepEqual(out.headers, ["Tag", "Task"]);
  assert.deepEqual(out.rows, [{ Tag: "x", Task: "t" }]);
});

test("b64url has no padding or unsafe chars", () => {
  assert.equal(b64url(new Uint8Array([251, 255, 254])), "-__-");
});
