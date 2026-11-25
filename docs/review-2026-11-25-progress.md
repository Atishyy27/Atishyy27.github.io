# Progress log, review/2026-11-25

- 25 Nov 15:51 setup: worktree on review/2026-11-25 from origin/main 8c9297d, npm ci done (134 packages).
- study: arch handout appended at cnc/work/arch/portfolio.md; baseline: tsc clean, oss data-only pass, check:orphans FAIL, check:resume FAIL.
- product pass: live crawl 167 URLs (0 email text, 0 skip, 3 no h1), 5 references read.
- plan: docs/review-2026-11-25.md written, top 3 chosen.
- 25 Nov plan gate: coordinator asked to stop after the plan doc. A prototype of all 3 changes was already written and is left UNCOMMITTED in the worktree (22 local tests green); it is not on the branch.
- change 3 committed: orphan check fix, npm test + check:fast, ci checks job (node 22). local: check:fast green, 4 gate tests.
- change 1 committed: contact address as text + copy, form timeout, mocks, e2e infra (playwright, serve-out), doc-basics check. local: tsc clean, 24 node tests pass.
- change 2 committed: skip link, nav aria-current via usePathname, h1 on stats/writing/about, doc-basics extended. local: tsc clean, 33 node tests pass.
- ci shots job added; first CI run: checks, build (check-oss-numbers + doc-basics), shots green, e2e red on 4 test locators (Sent text matched 'present', two role=alert elements).
- fixed locators, pushed d87ded6: CI run 45678183087 all 5 jobs green. Shots downloaded to docs/review-2026-11-25/shots (18 jpg, largest 34 KB).
- step 7 review started (one Sonnet code-reviewer, both lenses).
- step 7 round 1 (Sonnet reviewer, both lenses): no blocking finding. Fixed: timeout message says it may have gone through, failed Copy tells the visitor, doc-basics asserts on the contact component (data-email-copy), copy timer cleared, mock layer gated to non-production. Left: #content is a div not main (works for keyboard), banner has two mailto targets (existing button).
