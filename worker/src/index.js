/* The private area of atishay.tech, served by this Worker behind Cloudflare
   Access. Everything here is deny-by-default: a request is served ONLY if it
   matches an explicit route, and every route except the few public ones
   requires a verified, allowed identity. An unmatched path is 404, never a
   fall-through that reaches data.

   The public site (OSS tier section, writing marked visibility: public, the
   landing) is served separately by GitHub Pages and never touches this Worker.
   The board and private-page handlers land in the next commits; this commit is
   the hardened auth gate and the route skeleton, reviewed before anything is
   wired to the Sheet or the private repo.

   Every response here is same-origin only (no CORS headers, ever) and private,
   no-store, because the content is per-user and must never sit in a shared or
   browser cache. Logs carry email, route and status only, never a token or a row. */
import { verifyAccess } from "./auth.js";
import { getTasks } from "./sheets.js";
import { BOARD_HTML } from "./board.js";

const PUBLIC_ROUTES = [{ method: "GET", path: "/healthz" }];

function matchPublic(request, url) {
  return PUBLIC_ROUTES.some(r => r.method === request.method && r.path === url.pathname);
}

function priv(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("cache-control", "private, no-store");
  return new Response(body, { ...init, headers });
}
function privJson(obj, status = 200) {
  return priv(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (matchPublic(request, url)) {
      return priv("ok", { headers: { "content-type": "text/plain" } });
    }

    // Deny by default: nothing below runs without a verified, allowed identity.
    const auth = await verifyAccess(request, env);
    if (!auth.ok) {
      console.log(`anon ${request.method} ${url.pathname} ${auth.status}`);
      return priv(auth.msg, { status: auth.status, headers: { "content-type": "text/plain" } });
    }

    // Authenticated and allowed. Explicit route table; an unmatched route is
    // 404, never a fall-through to data.
    const route = `${request.method} ${url.pathname}`;
    let res;
    switch (route) {
      case "GET /api/me":
        res = privJson({ ok: true, email: auth.email });
        break;
      case "GET /api/tasks":
        try {
          res = privJson(await getTasks(env));
        } catch (e) {
          console.log("tasks error: " + e.message);
          res = privJson({ error: "tasks unavailable" }, 502);
        }
        break;
      case "GET /":
        res = priv(null, { status: 302, headers: { location: "/board" } });
        break;
      case "GET /board":
        res = priv(BOARD_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
        break;
      // Added next, each behind this same gate:
      //   GET /p/:slug                           (private markdown from the cnc repo)
      default:
        res = priv("not found", { status: 404, headers: { "content-type": "text/plain" } });
    }
    console.log(`${auth.email} ${request.method} ${url.pathname} ${res.status}`);
    return res;
  },
};
