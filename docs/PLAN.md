# Portfolio revamp: plan

One doc, appended as slices land. Written 2026-09-28.

Not in the README on purpose: the README is public-facing repo documentation, this is
working state that changes every slice.

## What he asked for, in his words, translated to buildable things

| He said | What it means here |
|---|---|
| crazy landing page, Apple feel | scroll-driven narrative on the home route, long easings, few elements, heavy whitespace |
| my own avatar as a 3D model | a rigged GLB of him, lazy loaded, with a static poster fallback |
| a cool 3D element, keyboard or similar | one signature interactive 3D object, not many |
| calendar, like the internet archive | a year grid of journal entries, click a day to read it |
| projects gallery | card grid, each project has live link, repo link, stack, a short story, optional long post |
| every project has a blog | short `story` required in data, long-form entry optional and linked both ways |
| Twitter | he cross-posts by hand. No API sync: syncing would make the site a mirror and kill its reason to exist |

## Three honest constraints, decided up front

1. **Apple feel is restraint, not volume.** What reads as expensive is few elements, one
   idea per screen, long slow easings, and type that breathes. Piling on effects reads
   cheap. So the motion budget is deliberately small: one scroll narrative, one 3D object,
   one avatar. Not five.
2. **Static export on GitHub Pages.** No server. Everything renders at build time, all 3D
   assets are static files served from the same origin, and page weight is the real limit.
   Budget: under 3 MB for the avatar GLB, 3D lazy loaded and never blocking first paint.
3. **Mobile and reduced-motion are not an afterthought.** Every 3D surface needs a static
   fallback. Target: no horizontal scroll at 360 px, and the site fully usable with
   `prefers-reduced-motion: reduce` and with WebGL unavailable.

## Libraries: already installed, nothing new needed for motion

`three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion`, `lenis` are all in
`package.json` already, and `Scene.tsx` already renders WebGL. The current site does not
look weak because libraries are missing. It looks weak because of layout, type scale and
hierarchy. That is what slice 3 fixes, and it is the slice that changes the most.

Added this round: `gray-matter` and `marked`, for the journal content model.

## Slices

Time-blocks, not clock times. One at a time, each proven before the next.

- **0. Journal infrastructure. DONE (`dec3257`).** Content model, `/journal`, `/journal/[slug]`,
  build-time draft and unlisted filtering, 8 checks against the built output.
- **1. Projects gallery.** `src/content/projects.ts`, `/projects`, `/projects/[slug]`. Live
  link, repo link, stack, required short story, optional linked journal entry. A check that
  every project has a story and that every `project` back-link resolves. 1 block.
- **2. Archive calendar.** Year grid of journal entries, click a day to open it. Extends the
  existing `UnifiedHeatmap.tsx` rather than adding a second grid component. 1 block.
- **3. Design system.** Type scale, spacing scale, motion tokens, colour as CSS variables in
  light and dark. This is the slice that makes it stop looking like plain HTML. 1 to 2 blocks.
- **4. Scroll narrative on home.** `lenis` for smooth scroll, `framer-motion` `useScroll` and
  `useTransform` for scroll-linked transforms. One idea per screen. 2 blocks.
- **5. Signature 3D object.** A keyboard built procedurally in R3F rather than a downloaded
  GLB: no asset to ship, full control over the keys, and it can react to real data (his
  solved-problem counts) instead of just spinning. 2 blocks.
- **6. 3D avatar.** Lazy-loaded GLB with `useGLTF`, idle animation, head follows the pointer,
  static poster image fallback. **Blocked on him producing the asset.** 2 blocks.
- **7. Numbers from data.** `src/content/stats.ts` with `last_verified` and source per number,
  read from `cnc/OSS/PORTFOLIO.md`, plus fixing the two false claims currently live (PFMS
  labelled Angular when the repo is React and TypeScript, and the unverified 5k-concurrent
  figure). 1 block.
- **8. Budget pass.** Lighthouse on mobile, image sizes, font loading, keyboard navigation,
  contrast, 404 page, sitemap with unlisted excluded. 1 block.
- **9. Release.** Preview, he checks on his phone, then production. Old URLs keep working.

## The avatar, the one thing only he can make

Three routes, cheapest first:

1. **Avatar generator from a selfie** (Ready Player Me or similar). Free, a few minutes,
   returns a rigged GLB around 2 to 5 MB. Stylised, not photoreal. Recommended.
2. **Phone photogrammetry scan** (Polycam, Luma). Looks like him, but raw scans are heavy
   and need decimating, and scan artefacts around hair and glasses are common.
3. **Commission or hand-model.** Best result, real cost, slowest.

Whichever he picks, the asset goes in `public/avatar.glb` and the site lazy loads it.

## What would prove this plan wrong

- The avatar GLB cannot get under about 3 MB without looking bad, in which case the hero
  uses the procedural 3D object and the avatar becomes a secondary section.
- Lighthouse mobile performance cannot clear a reasonable bar with WebGL in the hero, in
  which case 3D moves below the fold and the hero becomes type only.
- The scroll narrative fights the existing `Scene.tsx` backdrop badly enough that one has to go.
