/* Server-side Google Sheets read via a service account. Web Crypto only (no
   node:crypto). Flow per Google's service-account JWT-bearer grant:
   sign an RS256 JWT {iss, scope, aud=token endpoint, iat, exp<=1h} with the
   key's PKCS8 private_key, POST it as grant_type=jwt-bearer, get an access
   token, then call spreadsheets.values.get with Authorization: Bearer. */
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const DEFAULT_RANGE = "Tasks!A1:M1000";
// Dead as of 9 Nov; never surfaced.
const DROP_COLUMNS = new Set(["calendar"]);

const enc = new TextEncoder();

export function b64url(input) {
  const bytes = typeof input === "string" ? enc.encode(input) : new Uint8Array(input);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToDer(pem) {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const der = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) der[i] = bin.charCodeAt(i);
  return der.buffer;
}

export async function signJwt(sa, nowSec) {
  const header = { alg: "RS256", typ: "JWT" };
  const claims = { iss: sa.client_email, scope: SCOPE, aud: TOKEN_URL, iat: nowSec, exp: nowSec + 3600 };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(signingInput));
  return `${signingInput}.${b64url(sig)}`;
}

let cached = { token: null, exp: 0 };
export function _resetTokenCache() {
  cached = { token: null, exp: 0 };
}

export async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cached.token && now < cached.exp - 60) return cached.token;
  if (!env.GOOGLE_SA_KEY) throw new Error("GOOGLE_SA_KEY not set");
  const sa = JSON.parse(env.GOOGLE_SA_KEY);
  const assertion = await signJwt(sa, now);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });
  if (!res.ok) throw new Error(`token endpoint ${res.status}`);
  const j = await res.json();
  cached = { token: j.access_token, exp: now + (j.expires_in || 3600) };
  return cached.token;
}

// Row 1 = headers; later rows -> objects. Sheets drops trailing empty cells, so
// short rows are padded with "". Fully blank rows are skipped.
export function rowsToObjects(values) {
  const [headerRow = [], ...body] = values || [];
  const headers = headerRow.map(h => (DROP_COLUMNS.has(String(h).trim().toLowerCase()) ? "" : String(h).trim()));
  const rows = body
    .filter(r => r.some(c => String(c).trim() !== ""))
    .map(r => {
      const o = {};
      headers.forEach((h, i) => {
        if (h) o[h] = r[i] === undefined ? "" : r[i];
      });
      return o;
    });
  return { headers: headers.filter(Boolean), rows };
}

export async function getTasks(env, range = DEFAULT_RANGE) {
  if (!env.SHEET_ID || env.SHEET_ID.startsWith("REPLACE")) throw new Error("SHEET_ID not set");
  const token = await getAccessToken(env);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.SHEET_ID)}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`sheets ${res.status}`);
  const j = await res.json();
  return rowsToObjects(j.values);
}
