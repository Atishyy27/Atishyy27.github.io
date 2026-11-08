/* Cloudflare Access verification for the private area of atishay.tech.

   Access sits at Cloudflare's edge and only lets his email through, then passes
   the request to this Worker with a signed JWT in the Cf-Access-Jwt-Assertion
   header. We still verify that JWT here: edge enforcement plus origin
   verification, so a misrouted or spoofed request can never reach private data.

   Verification follows Cloudflare's own guidance (jose jwtVerify against the
   team JWKS, checking issuer and audience). createRemoteJWKSet caches the keys
   and refetches on an unknown kid on its own, so we build it once per isolate.

   Defense in depth (journal's note): after the signature, issuer and audience
   check, we also require the email claim to equal the one allowed email, held
   as an env var, never hardcoded. If the Access policy is ever misconfigured to
   allow more identities, this still lets only him in. */
import { jwtVerify, createRemoteJWKSet } from "jose";

let jwks;
function getJwks(env) {
  if (env.__jwks) return env.__jwks;   // test seam: a local key, never set in prod
  if (!jwks) jwks = createRemoteJWKSet(new URL(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`));
  return jwks;
}

export async function verifyAccess(request, env) {
  // Missing config is a server fault, not a visitor fault, and must fail closed
  // rather than silently skip the check.
  if (!env.TEAM_DOMAIN || !env.POLICY_AUD || !env.ALLOWED_EMAIL) {
    return { ok: false, status: 500, msg: "auth not configured" };
  }
  // The header is the token to trust; the CF_Authorization cookie is not
  // guaranteed to be present, so we read the header, as Cloudflare recommends.
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return { ok: false, status: 403, msg: "no access token" };
  try {
    const { payload } = await jwtVerify(token, getJwks(env), {
      issuer: env.TEAM_DOMAIN,
      audience: env.POLICY_AUD,
      algorithms: ["RS256"],       // never accept alg:none or a downgraded alg
      clockTolerance: "30s",       // a small skew allowance for exp and nbf
    });
    const email = String(payload.email || "").trim().toLowerCase();
    if (!email || email !== env.ALLOWED_EMAIL.trim().toLowerCase()) {
      return { ok: false, status: 403, msg: "identity not allowed" };
    }
    return { ok: true, email, payload };
  } catch (e) {
    // Any failure (bad signature, wrong aud/iss, expired, unknown kid) is a 403.
    // The message is deliberately generic so it never leaks why to a caller.
    return { ok: false, status: 403, msg: "invalid token" };
  }
}
