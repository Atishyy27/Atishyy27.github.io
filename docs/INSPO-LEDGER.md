# Inspiration ledger

Research for the portfolio revamp. Appended per batch, newest batch at the bottom.

Rule for this file: no bare adjectives. "Clean" and "modern" tell you nothing and cannot
be implemented. Every entry names a specific mechanism you could copy tomorrow.

Standing constraint that kills a lot of otherwise good ideas: **he has no project
screenshots and no photography.** Any pattern that needs imagery produces empty boxes,
which reads as unfinished. Text rows and numbers read as finished.

---

## Batch 0: the reference he chose himself

**rajath.blog** (a colleague's site, fetched 2026-09-29)
- Black text on white. One accent colour, used only for links.
- Serif headings, sans body.
- Single centred column, roughly 700px.
- Writings as a vertical list: thumbnail left, title, then date and read time, then a
  one-line description. Example row: "Apple didn't invent the foldable. It redesigned
  the experience", 15 Sep 2026, 12 min read.
- A bookshelf section (currently reading, favourites) linking out to Goodreads. A
  personal section that is not work.
- **Zero motion, zero 3D, zero effects.** Its distinctiveness is content and restraint.

Why this matters: it is the opposite of the effects-heavy brief. It is the single
reference he picked, and he rates the effects-heavy version of his own site 0 out of 10.

---

## Batch 1: UI and product designers

Method note from the researcher: 28 sites opened, 25 returned real content, 19 more were
listing-only and are excluded. It could read structure, copy, nav and ordering, but not
CSS, so there are no pixel values here. Several galleries (Land-book, Bestfolios, Godly,
Simon Pan) returned 401, 403 or empty.

| Site | The one thing worth stealing | Use it? |
|---|---|---|
| rauno.me | Opens with one sentence of role, then 7 short principle lines all starting "Make it". Email is click-to-copy with a "Copied" state. | Yes, states taste with no imagery |
| rauno.me/craft | Each item is title, month-year, and one link labelled by type ("Read Essay"). Newest first, back to 2021. | Yes, works without thumbnails |
| brianlovin.com | Four plain sections. Each project is a link, a colon, a short descriptor. Footer links Source, llms.txt, sitemap.xml. | Yes, zero imagery; the Source link suits an engineer |
| paco.me | Sections named as states: Building, Projects, Writing, Now, Connect. | Yes, "Building" and "Now" fit someone mid-internship |
| emilkowal.ski | No nav at all. One column: intro, 4 projects each with a 4 to 6 word label, 10 article titles, socials. | Yes, the tiny label per project carries the list |
| benji.org | "Updated Aug 22, 2026" at the top, and a live footer line, "12:00am in Los Angeles". | Yes, a footer timestamp gives the page a bottom edge |
| samuelkraft.com | Intro states years in field, past employers, city. Sections split by horizontal rules. | Partly, keep the rule rhythm, skip the image cards |
| lynnandtonic.com | Home is a numbered list of six links. The home link reads "v. XIX", the site's version. | Yes, a version number is free and reads as maintained |
| leerob.com | "Notes" as topic links, separate from dated blog posts. | Yes, a place for engineering thinking |
| adhamdannaway.com | Hero is two stacked identity blocks, "designer" and "&lt;coder&gt;", each with its own claim. | Yes, he has more than one identity to state |
| kiaradigregorio.com | Top-level split: "Real work" and "Playground". | Yes, separates OSS and shipped work from experiments |
| leedave.com | One-line outcome per project. Footer stamps the last update as "02/26". | Partly, the outcome line yes, the GIFs no |
| ryanquintal.com | Headline is a stance: "STRONG OPINIONS, LOOSELY HELD." | Partly, a stance beats a job title |
| joshuabaker.com | Projects as text links, not cards. Adds "Now" and "Uses" pages. | Partly, no client wall to copy |
| jenny-du.com | Each project ends with a bullet list of what she personally contributed. | Yes, replaces the screenshot with substance |
| lucasnasson.com | Homepage is numbered sections 01 to 07, separated by horizontal rules. | Yes, this is the anti-floating pattern |
| maximiliankaspar.com | Metadata order per project: title, then discipline and year, then paragraph, then credits in lighter text. | Partly, the order yes, the 8 to 15 images no |
| jonathanbaek.com | A link that honestly reads "Coming soon" rather than a dead link. | Yes, better than a broken promise |
| xanvierallison.com | Awards as a year-descending list: year, name, result. | Yes, this is the shape for ICPC, merges, launches |
| hellodani.co | Two tags per project ("medtech, ai"). | Partly |
| glorialo.design | Nav grouped into WORK and PLAY. | Partly, same split as Kiara |
| joshwcomeau.com | Nav organised by topic taxonomy rather than by page. | Partly, fits a writing section |
| felixpeault.com, kaiblamey.com | Photo-driven grids. | No, entirely imagery |
| jhey.dev | Footer widgets: weather, Spotify, CodePen. | No, more floating parts |

**Patterns by frequency, out of the 25 read:** single-column vertical page 15; nav of 5
items or fewer, or none, 14; intro sentence naming current role 11; image thumbnail per
project 11 (unusable here); a writing section beside the work 9; socials as plain text
links in the footer 9; work as a text list with a one-line descriptor 7; per-project
metadata such as category, role, year 7; dated entries 5; numbered sections or rules 4.

**The five moves that apply to him:**
1. **Kill the floating with fixed structure.** One column, one left edge, numbered
   sections, a rule between each, and a footer that closes the page: last updated, local
   time, version tag. Nothing positioned outside a section.
2. **Open with one sentence and a stance**, then 4 to 7 principle lines. Optionally a
   second identity block, since mechanical engineering and AI are both true.
3. **Make the proof a dated ledger**, year descending: ICPC regional, each merged PR with
   repo and number, each Play Store launch. This is the substitute for screenshots.
4. **Projects as text rows** with a 4 to 6 word label, and on the detail page a bullet
   list of what he personally did. A "Coming soon" state instead of a dead link.
5. **Split real work from playground**, and add "Now" and "Notes".

**Do not copy:** image or GIF cards per project (empty boxes with no screenshots);
client-logo walls and testimonials (he has no client list, it reads as padding); live
widgets and template leftovers (several of these sites ship an inert cart icon showing
"0", which is exactly the kind of detail that makes a page feel unfinished).

---

## Batch 2: frontend and backend engineers

Method note: 48 sites opened, 0 listing-only, 3 fetches failed (rich-harris.dev,
evanw.github.io, stevenklabnik.com). Same limit: structure and copy read, CSS never seen.
Gap worth naming: no competitive-programmer sites found, and only one Bitcoin developer.

| Site | The one thing worth stealing | Use it? |
|---|---|---|
| rsms.me | Home shows a few projects then "See all 75 projects →". Tells the reader the real size. | Yes, "See all 18" |
| maxleiter.com | Each project has exactly 4 fields: title, 1-2 sentences, a date range ("2016 to present"), one link. | Yes, the date range shows sustained work |
| antfu.me/projects | Every item carries a role label: "Maintainer", "Team member". No star counts. | Yes, he is a contributor not owner on most OSS |
| danluu.com | Every row is `MM/YY` then title. 200+ rows, one page, no pagination, no tags. | Yes, a 5-character date column |
| tonsky.me | Posts grouped under year headings, 2026 down to 2014. | Yes, cheap segmentation for 18 projects |
| brianlovin.com | Home is three plain lists: Writing, Projects, Elsewhere. One row type throughout. | Yes |
| paco.me | Project is a linked name plus one clause. Plus a "Now" section. | Yes |
| delba.dev | Bullets lead with the verb: "Built, authored, and maintained". | Yes, suits merged PRs |
| overreacted.io | Row = title, date, one-line description. No nav, no tags. | Yes, smallest complete unit |
| maximeheckel.com | Footer shows browser, local time, window size and the build commit hash. | Yes, real-time proof of engineering |
| wesbos.com | Footer carries the build commit reference. | Yes |
| lukew.com | States counts as proof: "2140 articles, 384 presentations, 31 years". | Yes, denominators instead of adjectives |
| kleppmann.com | Publications split into four labelled groups by kind, not one list. | Yes, split merged PRs from shipped apps |
| brendangregg.com | Proof is artifacts he can link: docs, videos, software, slides. | Yes, that is his proof model too |
| burntsushi.net | Each post row carries an audience label ("Beginning Rust programmers"). | Yes, cheap per-row metadata |
| lucumr.pocoo.org | Footer has an "AI transparency" page. | Yes, real differentiator for an AI intern |
| gwern.net | Per-item confidence tag and status field from a fixed list. | Yes, "status: pilot, n=10" |
| ciechanow.ski | Interactive simulations replace screenshots entirely. | Partly, one project only |
| samuelkraft.com, tomweightman.com, jeffgeerling.com | Image cards. | No, he has no images |
| jhey.dev | Weather and Spotify widgets. | No, more floating parts |
| evanyou.me | Site is one paragraph. | No, only works with name recognition |

**Patterns by frequency, out of 48:** dated single-column text-only list ~20; project as
name plus 1-2 sentences with no image ~11; fixed left date or year column ~9; proof via
primary artifacts ~9; short slice on home with "see all" overflow ~8; writing and work in
the same row format ~8; footer as colophon (source link, commit hash, licence, AI-use) ~7;
small per-row metadata to help a reader choose ~7; grouping only once the list is long ~6;
counts stated with a denominator ~5.

**The projects-index spec** (synthesised from Max Leiter, rsms, antfu, Brian Lovin):
- Data fields: `name`, `href`, `oneLine` (max 90 chars), `start`, `end`, `kind` (shipped,
  merged-pr, contest, research), `role` (author, maintainer, contributor), `featured`.
- Home renders the 5 featured rows, then "See all 18 projects".
- `/projects` is one table: fixed-width year column, then name as link, then the one line,
  then a small right-aligned kind label. One row height, 1px separator, no cards, no icons.
- At most three groups by kind, each showing its count.
- Every row links to the artifact itself. A row with no real proof says so in the row text.

---

## Batch 3: AI, ML and MLOps

Method note: 40 entries, 34 personal sites plus 6 non-personal sources kept because they
show evaluation presentation well. Three speech-adjacent personal sites 404'd or failed DNS,
so speech coverage is thin. No personal site anywhere was found that presents speech-recognition
evaluation, which is itself the finding: that space is empty.

| Source | The one thing worth stealing | Use it? |
|---|---|---|
| hamel.dev/blog/posts/evals-faq | Opens with "These are sharp opinions, not universal truths". Every recommendation carries a number: review 30 traces, saturation near 100, 30-50 pass and fail examples. | Yes |
| eugeneyan.com/writing/llm-evaluators | States gaps in cited work: "the paper did not report recall and precision thus we can't tell". | Yes, that is the honest-limit voice |
| artificialanalysis.ai (STT) | The metric has a **version**: "AA-WER v2". Each dataset listed with its weight and hours. Methodology page linked. | Yes, closest template for his own results |
| Open ASR Leaderboard paper | Dataset table: task, duration, licence, source, style. Normalization rules written out. Admits test-set contamination cannot be ruled out. | Yes, his Hindi and Hinglish normalization is what gets questioned |
| evanmiller.org | An article about what goes wrong: premature stopping moves the false-positive rate from 5% to over 26%, labelled worst case, with a corrected-threshold lookup table. | Yes, "how not to read a WER number" |
| gwern.net | Confidence tag from a fixed list plus a status field and importance decile. | Yes |
| colah.github.io | An explicit low-effort tier, "Rough Notes", stated as such so polish is not the bar for publishing. | Yes, permission to post unpolished eval notes |
| ljvmiranda921.github.io | A benchmark project paired with its own essay. Multilingual benchmark author. | Yes, closest analogue to his lane |
| carlini.com | Claims scoped by conditions in one clause: "given query access to GPT-2". | Yes, for the AML and FL projects |
| sh-reya.com | Outputs stated as counts with units: "3,700+ stars", "50+ submissions". | Yes, matches his "top 5 of 500+ teams" |
| sander.ai | Numbered footnotes, a BibTeX block to cite the post, and an AI-disclosure statement. | Yes |
| karpathy.github.io | Each row is date, title, one sentence naming the deliverable. | Yes, cheapest format on the list |
| vickiboykis.com, evjang.com | Writing-only, no cards, no imagery at all. | Yes, the imagery-free precedent |
| desh2608.github.io | A speech researcher stating DER results as plain facts in a dated updates feed. | Yes, format only, no tables there |
| mitchellsparrow.com | Skill proficiency bars: Python 90%, React 90%. No outcome numbers anywhere. | **No. Anti-pattern.** |
| interconnects.ai | Authority via testimonials and subscriber count. | **No. Anti-pattern.** |

**Patterns by frequency, out of 40:** writing, papers and projects in separate nav sections
18; dated post list with a one-line description 9; interactive tool beside prose 7; a visible
caveat or confidence label 7; reading time 6; a curated "Start Here" 6; paper row with PDF,
code, slides, BibTeX 6; numbered footnotes with arXiv ids 6; claims backed by a number and a
named dataset 5; counts shown on the page 5.

**The honest-result block** (composite, ordered):
1. Claim line with the number and its denominator: "WER 18.2% on 1,240 utterances, 6.1 hours".
2. Dataset table: name, source, hours, utterance count, language mix, licence.
3. Metric line with a version, and the normalization rules written out.
4. Result table: WER, CER and entity recall as separate columns. Never WER alone.
5. Sample-size status tag: "pilot, n=10" versus "full set".
6. A "what this does not show" block naming the conditions it does not cover.
7. A contamination and repeatability line.
8. Links: eval script, dataset card, methodology, review thread.

---

## What all three batches agree on

Three researchers, 116 sites, no contact with each other, same answer:

1. **Single column, text rows, no imagery.** The top pattern in every batch.
2. **A fixed left date or year column**, and one uniform row height. This is the direct
   answer to "everything feels floating": nothing sits outside the grid.
3. **A footer that closes the page**: last updated, commit hash, source link, local time.
4. **Proof by artifact link on every row**, not by adjective.
5. **Counts with denominators** in place of a hero image.
6. **Small per-row metadata** (role, kind, year, audience) so a reader can choose.
7. **Visible honesty labels** (status, confidence, "what this does not show"), which is the
   AI batch's contribution and the one that suits his measurement work best.

And the reference he chose himself, rajath.blog, is exactly this: one 700px column, text
rows with dates, no motion, no 3D.
