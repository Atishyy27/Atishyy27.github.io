/* Tests the auth gate end to end: real RS256 JWTs signed with a local key, run
   through the actual Worker fetch handler. env.__jwks injects the local public
   key in place of Cloudflare's remote JWKS, so no network and no real Access.
   Run: cd worker && npm install && node --test */
import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, SignJWT } from "jose";
import worker from "../src/index.js";

const TEAM = "https://team.cloudflareaccess.com";
const AUD = "test-aud";
const EMAIL = "him@example.com";

const { publicKey, privateKey } = await generateKeyPair("RS256");
const env = { TEAM_DOMAIN: TEAM, POLICY_AUD: AUD, ALLOWED_EMAIL: EMAIL, __jwks: publicKey };

function sign({ aud = AUD, email = EMAIL, iss = TEAM, alg = "RS256" } = {}) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg })
    .setIssuer(iss)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);
}
function req(path, { method = "GET", token } = {}) {
  const headers = {};
  if (token) headers["cf-access-jwt-assertion"] = token;
  return new Request(`https://app.atishay.tech${path}`, { method, headers });
}

test("missing Access header is 403", async () => {
  const r = await worker.fetch(req("/api/me"), env);
  assert.equal(r.status, 403);
});

test("wrong audience is 403", async () => {
  const r = await worker.fetch(req("/api/me", { token: await sign({ aud: "someone-else" }) }), env);
  assert.equal(r.status, 403);
});

test("valid signature but another email is 403", async () => {
  const r = await worker.fetch(req("/api/me", { token: await sign({ email: "stranger@example.com" }) }), env);
  assert.equal(r.status, 403);
});

test("allowed identity on an unknown route is 404, not a data leak", async () => {
  const r = await worker.fetch(req("/secrets", { token: await sign() }), env);
  assert.equal(r.status, 404);
});

test("allowed identity on /api/me is 200 with the email", async () => {
  const r = await worker.fetch(req("/api/me", { token: await sign() }), env);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).email, EMAIL);
});

test("healthz is 200, no-store, and carries no data", async () => {
  const r = await worker.fetch(req("/healthz"), env);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("cache-control"), "private, no-store");
  assert.equal(r.headers.get("access-control-allow-origin"), null);
});

test("board sends CSP with the script hash, nosniff and frame denial; 403 body is generic", async () => {
  const { BOARD_SCRIPT } = await import("../src/board.js");
  const hash = Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(BOARD_SCRIPT))).toString("base64");
  const ok = await worker.fetch(new Request("https://x/board", { headers: { "cf-access-jwt-assertion": await sign() } }), env);
  assert.equal(ok.status, 200);
  assert.ok(ok.headers.get("content-security-policy").includes(`'sha256-${hash}'`));
  assert.equal(ok.headers.get("x-content-type-options"), "nosniff");
  assert.match(ok.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.match(await ok.text(), /<script>/);
  const bad = await worker.fetch(new Request("https://x/board"), env);
  assert.equal(bad.status, 403);
  assert.equal(await bad.text(), "forbidden");
});
