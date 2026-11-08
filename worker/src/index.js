/* The private area of atishay.tech, served by this Worker behind Cloudflare
   Access. Everything here is deny-by-default: a request is served ONLY if it
   matches an explicit route, and every route except the few public ones
   requires a verified, allowed identity. An unmatched path is 404, never a
   fall-through that reaches data.

   The public site (OSS tier section, writing marked visibility: public, the
   landing) is served separately by GitHub Pages and never touches this Worker.
   The board and private pages handlers land in the next commits; this commit is
   the auth gate and the route skeleton, for review before anything is wired to
   the Sheet or the private repo. */
import { verifyAccess } from "./auth.js";

// Public routes need no identity. Kept tiny on purpose: this Worker exists to
// serve PRIVATE things, so the only public route is a health check. Real public
// pages live on GitHub Pages.
const PUBLIC_ROUTES = [{ method: "GET", path: "/healthz" }];

function matchPublic(request, url) {
  return PUBLIC_ROUTES.some(r => r.method === request.method && r.path === url.pathname);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (matchPublic(request, url)) {
      return new Response("ok", { headers: { "content-type": "text/plain" } });
    }

    // Deny by default: nothing below runs without a verified, allowed identity.
    const auth = await verifyAccess(request, env);
    if (!auth.ok) {
      return new Response(auth.msg, {
        status: auth.status,
        headers: { "content-type": "text/plain" },
      });
    }

    // Authenticated and allowed. Private route table. Each route is explicit;
    // an unmatched one falls through to 404, never to data.
    const route = `${request.method} ${url.pathname}`;
    switch (route) {
      case "GET /api/me":
        return Response.json({ ok: true, email: auth.email });
      // Board + private-page routes are added next, each behind this same gate:
      //   GET/POST/PATCH/DELETE /api/tasks[...]  (the Sheet, via a server-side SA)
      //   GET /p/:slug                           (private markdown from the cnc repo)
      default:
        return new Response("not found", { status: 404 });
    }
  },
};
