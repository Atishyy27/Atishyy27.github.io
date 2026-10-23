// src/lib/embeddable.ts
// Which of my live project URLs may be shown in an iframe.
//
// This is a plain module, not a client one, because the project page decides on
// the server whether to render the embed at all. A "use client" module's
// exports are references the server cannot call, which is exactly how the first
// version of this broke the static export.
//
// Every host here was checked by reading its real response headers on
// 2026-10-09, not assumed:
//
// Re-checked 2026-10-22, every host below, by reading live response headers:
//
//   allows framing (no X-Frame-Options, no CSP frame-ancestors):
//     atishyy27.github.io (tripkit, hhgoa-frame-generator)
//     breatheesg-gg71.onrender.com   tele-med-pilot.vercel.app
//     ciis-demo.vercel.app            geoyield.vercel.app
//     sgsits-techfest-2025.vercel.app davvincubationcentre.com
//     www.sgsitsincubationforum.com   gs27.vercel.app
//
//   refuses:
//     geniussolarservices.com   X-Frame-Options: SAMEORIGIN
//     play.google.com, chromewebstore.google.com, github.com
//
// The store fronts are the reason components/Shots.tsx exists: the two Play
// Store apps can never be framed, so they are shown as screenshots instead.
//
// A blocked iframe renders as a blank rectangle with the reason only in the
// console, which looks identical to a broken project. So the list is an
// allowlist, and anything not on it simply keeps its link.
export const EMBEDDABLE_HOSTS = new Set([
  // Added 2026-10-24, all four checked by reading their live response headers
  // the same day: none sends X-Frame-Options or a frame-ancestors directive.
  "atishyy27.github.io",
  "breatheesg-gg71.onrender.com",
  "tele-med-pilot.vercel.app",
  "ciis-demo.vercel.app",
  "geoyield.vercel.app",
  "sgsits-techfest-2025.vercel.app",
  "davvincubationcentre.com",
  "www.sgsitsincubationforum.com",
  "gs27.vercel.app",
]);

export function canEmbed(href: string): boolean {
  try {
    return EMBEDDABLE_HOSTS.has(new URL(href).hostname);
  } catch {
    return false;
  }
}
