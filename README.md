# atishay.tech

Personal site. Next.js 15 (App Router), Tailwind v4, **static export** — no server, deploys anywhere.

See [`PRD.md`](PRD.md) for what this is and why each decision was made.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # -> out/   (static, verified passing 23 Jul 2026)
```

## The one rule

**All content lives in [`src/content/site.ts`](src/content/site.ts), and that file mirrors
`me/MASTER-CV.md`.** Fix a fact in MASTER-CV first, then mirror it here. Components never hardcode
a claim. This is the fix for three resume variants that drifted into disagreeing about the same CGPA.

Every claim carries a link, or plainly says it's private. No unlinked superlatives — that's the
credibility of the whole site, not a style preference.

Deliberately absent, do not add: `jumbl` (another company's take-home), WasmEdge / ardupilot
(idle forks, nothing submitted), `paisa` as a portfolio project (his call — private, "just a toy";
it may be *mentioned* in About with no repo link and no real figures).

## ⛔ Blocker before this goes live

`public/Atishay_Jain_Resume.pdf` is a copy of the 8 Jun 2026 PDF and **it contains a false claim** —
"LeetCode: 7700+ problems" (real number: 947). See `me/MASTER-CV.md` §"FIX BEFORE SENDING".

Publishing it would break the site's own principle on the very first click. **Regenerate the PDF from
the corrected LaTeX, then replace this file.** Same pass should settle the CGPA (7.75, not 7.2) and
the job titles that differ across variants.

## Deploy

1. `gh auth switch --user Atishyy27` ← **check this first, `gh` keeps reverting to `atishyy278`**
2. Push the repo, import it in Vercel (framework auto-detects; output is `out/`)
3. Add `atishay.tech` as a custom domain in Vercel
4. In Namify DNS, add the A / CNAME records Vercel gives you — **today only an SOA record exists,
   so the domain does not resolve at all**
5. In Namify, turn **WHOIS Privacy Protection ON** — currently `None`, so name/address/phone/email
   are in the public WHOIS record

## Roadmap

- **P1 — 3D avatar** in the hero. Space is already reserved so dropping the canvas in won't shift
  layout. Contract: ≤1.5 MB, static poster fallback, static on mobile, off under
  `prefers-reduced-motion`, Lighthouse mobile ≥90 or it ships static.
- **P2 — JD-targeted variants.** `/for/infra`, `/for/fullstack`, `/for/ml` — reorder sections and
  swap the headline off one param. Cheap, because content is already typed data. His idea, and a
  good one.
- **P3** — per-project OG images, `/now`, writing.
