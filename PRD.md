# atishay.tech — Product Requirements

**Owner:** Atishay Jain · **Written:** 23 Jul 2026 · **Status:** draft, pre-build
**Domain:** `atishay.tech` (Namify, expires 22 Jul 2027, auto-renew on) — **registered, not yet pointed**

---

## 1. Why this exists

Right now every opportunity runs through a PDF attached to an email, or a GitHub profile that
under-sells him. Both are lossy:

- A resume can't show a **live Play Store app**, a **merged PR in Bitcoin infra**, or a parser that
  refuses to import unless it reconciles to the paisa.
- The GitHub profile page ranks by *repo count*, which is his weakest metric — 52 originals, 4 with
  stars. It buries the 6 merged upstream PRs that are the actual credential.
- Three resume variants have already drifted into contradicting each other (see
  `me/MASTER-CV.md` §"FIX BEFORE SENDING"). One canonical public surface stops that drift.

**The job of this site:** be the single link he sends — to a recruiter, an agency like Atomicia, a
gig client, or an OSS maintainer — that answers *"is this person real?"* in under 30 seconds, and
**survives someone checking.**

## 2. The one principle everything else obeys

> **Every claim on this site must be independently verifiable, and it must link to the proof.**

This is not a style preference — it's the finding of the 23 Jul audit. "Actively contributing across
seven orgs" collapsed on inspection (two were idle forks). "6 merged PRs in rust-lightning, OPA,
Meshery, zowe-cli and braidpool" is *smaller* and **stronger**, because every word of it holds when
clicked.

So: no unlinked superlatives. Every project card carries a live link, a repo link, or a PR link. If
a thing can't be linked, it gets described plainly and marked private — never dressed up.

## 3. Audiences, in priority order

| # | Who | What they need in 30s | What they click |
|---|---|---|---|
| 1 | **Recruiter / hiring manager** | Is he employable, what stack, is he real | Experience → one project → resume PDF |
| 2 | **Agency / gig client** (Atomicia-type) | Has he shipped this exact thing for someone else before | Projects → live links |
| 3 | **OSS maintainer / SoB mentor** | Does he write real code in real codebases | Open Source → merged PRs |
| 4 | **Peers / campus** | The CP + hackathon record | Achievements |

Audience 1 and 2 decide the layout. Audience 3 decides what's *below* the fold but must be one
click, never buried.

## 4. Structure

**He asked for internships and projects as separate sections — honoured. They answer different
questions** ("has someone trusted him?" vs "what can he build alone?") and merging them hides both.

```
/                 Hero (3D avatar) · one-line positioning · 3 proof stats · primary CTA
/#experience      Internships — company, title, dates, 2-3 outcome bullets
/#projects        Projects — cards, filterable by stack
/#opensource      Merged upstream PRs (the honest 6) + current LDK work
/#achievements    ICPC rank 12, CP ratings, hackathon percentiles
/#about           The real story: mechanical branch → software, breadth → depth
/resume           Always-current PDF, generated from the same source
/contact          Email, socials, "available for X"
```

**Hero proof stats — pick 3, all clickable:**
`ICPC Rank 12, Mysuru on-site` · `6 merged PRs in production infra` · `Live on Play Store`

Not "15+ projects". Volume is his weakest signal; specificity is his strongest.

## 5. The 3D avatar — scope it hard

He wants a 3D version of himself. Good — it's memorable and nobody else in his cohort has one. But
this is also the single most likely thing to sink the site, so it gets a contract:

**Requirements**
- Lives **in the hero only.** It is a greeting, not a navigation metaphor. No 3D scene-based routing.
- **Hard budget: ≤ 1.5 MB total for model + textures**, and it must not block first paint.
- **Static image fallback**, served immediately, swapped for the canvas once loaded. If WebGL is
  unavailable, low-power mode is on, or `prefers-reduced-motion` is set — the image *is* the site.
- **Mobile: static by default.** Over half of recruiter traffic is phone; a 3D canvas there costs
  battery and buys nothing.
- Interaction ceiling: idle animation + cursor-follow head/eyes. **No dragging, no orbit controls, no
  scroll-driven camera.** Anything a recruiter has to figure out is a bug.
- Lighthouse **Performance ≥ 90 on mobile with the avatar enabled.** If it can't hit that, it ships
  static and the 3D becomes a `/playground` easter egg.

**Non-goal:** a 3D world, a game, a scroll-jacked narrative. Those read as student projects. A clean
site with one beautifully-done avatar reads as a professional who can also do graphics — which is
the actual claim.

## 6. Content source of truth

**`me/MASTER-CV.md` is upstream of this site.** Content lives there in structured form; the site
renders it; the PDF at `/resume` generates from it.

This is the fix for the three-drifting-resumes problem: one place to change a date, a title or a
CGPA. **The site must never become a fourth place where facts live.**

Practical form: a typed content module (`content/experience.ts`, `content/projects.ts`,
`content/oss.ts`) kept in sync with MASTER-CV, so drift is a code review away instead of invisible.

## 7. What must NOT appear

- `jumbl` — another company's ATS intern assignment.
- **WasmEdge, ardupilot** as contributions — idle forks, zero submitted work.
- youki / urunc / kubernetes-website framed as "contributed" — nothing merged yet. They can appear
  as *"open PRs under review"* if labelled exactly that.
- **paisa** as a portfolio project — his call: *"keep it private, it's a toy."* It may be *mentioned*
  in About as a personal tool (the honest-numbers thesis is genuinely interesting), with **no repo
  link and no screenshots of real figures**.
- Any real financial figure, family detail, or client name that a client hasn't approved.
- Dead work: dlab and the small one-off projects. Cut, don't archive on-site.

## 8. Tech

**Recommendation — Next.js (static export) + Tailwind + react-three-fiber, on Vercel.**

Rationale: he already ships Next.js (jumbl, paisa) and React + Tailwind (breatheESG), and R3F is the
lowest-friction path to one GLB avatar. Static export keeps it free, instant, and impossible to break
at 3am. Vercel because paisa already deploys there.

- **Avatar:** Ready Player Me or a Blender-exported GLB, Draft-compressed, `<Suspense>` + static
  poster fallback.
- **Analytics:** privacy-friendly (Vercel Analytics or Plausible). He'll want to know if the Atomicia
  email actually got clicked.
- **SEO/OG:** proper OG image, JSON-LD `Person` schema. When someone Googles "Atishay Jain", this
  should outrank everything else.
- **A11y:** keyboard-navigable, real contrast, avatar canvas marked `aria-hidden` with a text
  alternative. Not optional — audience 1 sometimes has a screen reader.

## 9. Phases

**P0 — get it live (target: this week).** DNS pointed, static site, all content, resume PDF, contact.
**Static hero image, no 3D.** A live honest site beats a perfect unbuilt one, and it's linkable in
the next application immediately.

**P1 — the avatar.** Model, fallback chain, perf budget enforced. Ship only if Lighthouse holds.

**P2 — polish.** Project filtering, OG per-project, dark mode, a `/now` page, view counts on OSS
cards.

**P3 — optional.** `/playground` for the 3D experiments, writing/blog if he actually wants to write.

## 10. Before any code — do these two

- [ ] **Turn on WHOIS Privacy Protection.** It currently says `None`, which means his name, address,
      phone and email are in the public WHOIS record. Namify usually offers this free.
- [ ] **Point the domain.** Only an SOA record exists today — `atishay.tech` does not resolve. Add
      the A/CNAME records once the Vercel project exists.

## 11. Open questions

1. **Positioning line.** The site needs ONE. Candidates from his own material: *"ICPC Regionalist ·
   explosive builder & troubleshooter"* (his words, energetic) vs something like *"Systems engineer
   — Bitcoin infra, production backends, and the occasional 3D avatar"* (matches the actual
   breadth→depth pivot). These pull in different directions; pick before designing the hero.
2. **Is `dev masti/Portfolio` (existing local folder) worth salvaging**, or is this greenfield?
3. **Avatar source** — Ready Player Me scan (fast, generic) or custom Blender model (slower, actually
   looks like him)? P1 timing depends on this.
4. **Does `/resume` serve one PDF or several?** He maintains role-specific variants — one canonical
   general PDF is simpler and less contradictory; per-role links can stay private.

## 12. Success

- Someone lands, and within 30 seconds can name his strongest credential without scrolling.
- He replies to a job post with **one link** instead of a PDF and a paragraph.
- Every claim on the page still holds after being clicked. Nothing needs walking back.
