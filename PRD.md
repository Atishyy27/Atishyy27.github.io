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

---

# v2 — the re-plan, 22 Oct 2026

Written after he called the built site "barely 6/10" and asked for a product plan instead of more
patches. Everything above is the July pre-build PRD and still reads correctly. This section is about
the gap between it and what actually got built.

## 8. What was specified versus what exists

The July PRD specified **three routes**: one page with eight anchors, plus `/resume` and `/contact`.

What exists is **ten routes**: `/`, `/projects`, `/work`, `/oss`, `/stats`, `/log`, `/journal`,
`/archive`, `/about`, `/admin`, plus 19 project pages and the journal entries. The nav carries eight
items for one person's portfolio.

Nobody decided that. It accumulated.

## 9. The actual defect: four routes are views over the same rows

This is not an opinion about taste. It is in the imports.

| Route | What it imports | Overlap |
|---|---|---|
| `/archive` | `listedEntries` (journal) + `log` + `oss` | **Superset of three other routes** |
| `/journal` | `listedEntries` | Strict subset of `/archive` |
| `/log` | `content/log` + Terminal | Log half is a subset of `/archive` |
| `/oss` | `content/oss` | Subset of `/archive` |
| `/projects` | `allProjects` | |
| `/work` | `govtWork, clientWork, orgWork, extensions, hackathons` | **`allProjects` is built from exactly these five arrays** (`content/projects.ts:77-81`) |

So `/projects` and `/work` render the same data twice under two names, and `/archive` is a merged
feed of `/journal`, `/log` and `/oss`. Of nine public routes, **six are duplicates or supersets of
each other.** A visitor who clicks Work after Projects sees the same nineteen things and concludes
the site is padded. That is the 6/10.

Two more, smaller:

- `/stats` is a 22-line file that mounts one component. It is a section wearing a route.
- The home page carries a WebGL project graph that renders nothing into the HTML, so to a link
  preview, a scraper or a visitor with JS off, the centrepiece does not exist.

## 10. What the references support, and what they do not

Searched 22 Oct for engineer-portfolio evidence. **The search was thin**: most results were
architecture-portfolio and UX-designer advice, and nothing gave a measured number for nav items or
case-study length. Taking only what transfers and marking it as borrowed:

- Keep navigation flat, around five top-level items. (From architecture-portfolio guidance, not
  engineering. Directionally useful, not measured.)
- Problem → Process → Outcome case studies outperform galleries of finished screens, and quantified
  impact beats description. This is the one point every source agreed on.
- Layer the depth: a scanner should understand the work in about three minutes, a hiring manager
  should be able to drill into specific decisions, and the detail lives below that.
- A portfolio is a **risk-reduction tool** for the person deciding whether to spend an hour
  interviewing you. Tutorial-clone projects now carry negative signal.

The July PRD's own principle already says this better and is grounded in his real audit: every claim
links to proof. Nothing in the references overturns it. **The IA is what failed, not the principle.**

## 11. Target structure

Five nav items. Nothing is deleted; four surfaces merge into one each.

```
/            Who, one line. Three proof stats. Three featured projects with covers. One CTA.
/work        THE merged surface. 19 projects as cards, filterable by kind and stack.
             /projects and /work become one route; the other redirects.
/oss         Merged pull requests, live counts, per-repo detail. Unchanged, it is the strongest page.
/writing     /journal + /log + /archive become one dated feed with a type filter
             (journal entry · build note · shipped PR). /archive's merge logic already does this;
             it just needs to stop being a fourth copy.
/about       Experience, research, education, resume, contact. Already fixed today.
```

`/stats` folds into `/about` or `/oss` as a section. `/admin` stays unlinked.

## 12. The pieces, in order, each reviewed before the next is built

Agile in the only sense that matters here: each piece ships on its own, the site is never broken
between them, and he sees each one before the next starts.

**P1 — Merge `/projects` and `/work`.** One route, cards, filter by kind and stack. The loser
redirects so no link dies. *Done when:* nineteen projects appear exactly once on the site, the nav
has one entry for them, and `check-links` passes.

**P2 — Real cover images.** Headless Chrome is now installed
(`chrome-headless-shell`, 156.0.8078.47) but crashes with "GPU process isn't usable" on this Mac and
is not yet working. Six hosts permit framing and can be captured; the two Play Store apps already
have real screens. *Done when:* every card with a live URL shows that URL, captured, not generated.

**P3 — Merge the three timelines into `/writing`.** One feed, one filter, three sources.
*Done when:* `/journal`, `/log` and `/archive` resolve to one route and nothing is listed twice.

**P4 — Case studies on the top five projects.** Problem, what was tried, what shipped, what it cost.
This is the single highest-value piece and the one the references agree on; it is fourth only because
the first three stop the site contradicting itself. *Done when:* five project pages answer "what
decision did he make and why" without the reader needing to ask.

**P5 — Home page.** Replace the invisible WebGL graph with three featured project cards that exist in
the HTML, and keep the graph as a section further down or on `/work`. *Done when:* a link preview and
a JS-disabled load both show real content above the fold.

**P6 — Visual system.** Type scale, accent used with intent, consistent card and section rhythm.
Last on purpose: polish applied to a wrong structure has to be redone.

## 13. Not doing

- Flattening the project graph to 2D. He rejected it on 22 Oct; it stays 3D or moves.
- A light theme. Declined, and `globals.css:8` documents dark as deliberate.
- Any third-party screenshot service. It would mean sending his project URLs off the machine on
  every build.

## 14. Progress

**P1 done, 22 Oct 2026, commit `4c7af91`.** One change to the plan as written, stated here because
the plan said `/work` absorbs `/projects` and the opposite happened: the detail pages already live at
`/projects/<slug>` and are what `sitemap.ts` and `JsonLd.tsx` publish, so making `/work` the index
would have moved nineteen live URLs to save a word. `/projects` is the one index; `/work` is a static
redirect stub in `public/work/index.html`, excluded from the sitemap. Nav, command palette, home
index and the "2 apps" stat all point at `/projects/`. The filter, the stack-derived domain tags and
the other-hackathons line came across from the old route; nothing on it was dropped. `WorkExplorer`
and `WorkGrid` are deleted rather than left unmounted, so the orphan check stays meaningful.
Verified: `npm run verify` green, 111 pages, 1300 internal links, 0 FAIL, and no `href="/work/"`
anywhere in `out/`.

**P3 done, 22 Oct 2026.** `/journal`, `/log` and `/archive` are one route, `/writing`. The three were
not three things: `/archive` already merged all three sources, which made it a superset of the other
two rather than a different view, and the nav sold all three as separate destinations. One feed,
newest first, grouped by month, with five filters: Writing (26, the default), Journal (11), Build log
(15), Pull requests (151), Everything (177). Pull requests are off by default because 151 of them
bury 26 pieces of writing; they are in the same feed because they are the densest dated record he
has and a calendar of only the writing shows a dozen dots in a year where hundreds of things
happened. Journal entries keep `/journal/<slug>/` and the tag pages keep theirs, so no entry URL
moved. The ask terminal and the keyboard came across from `/log` and now sit under the feed as 02
and 03, which also fixes the duplicate "02" that page had been shipping. `/journal/`, `/log/` and
`/archive/` are redirect stubs. `BuildLog.tsx` is deleted, its entry rendering moved into
`WritingFeed.tsx`. Verified: `npm run verify` green, 112 pages, 1041 internal links, 0 FAIL, no
`href="/log/"`, `href="/archive/"` or `href="/journal/"` left in `out/`; the feed's HTML carries all
11 journal links and all 15 log bodies.

Nav is now five items: Projects, Open source, Stats, Writing, About. It was ten on 21 Oct.
