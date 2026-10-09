---
title: What 33 closed pull requests actually taught me
date: "2026-10-09"
tags: [open source, postmortem, method]
status: published
visibility: public
---

Everyone publishes their merge count. I pulled the other list: every pull request I opened against someone else's repository that was closed without being merged. Thirty-three of them. Then I sorted them by cause instead of reading them one at a time, because thirty-three anecdotes teach you nothing and a distribution teaches you where to stand.

## Six causes

Ten died of churn or silence, which is the largest group and the one I had least expected. Six were contribution-process violations, meaning the code was fine and I had broken a rule about how to submit it. Five were not preventable by me at all. Four were rejected on value or design, which is the honest category: the maintainer looked at what I had done and decided the project did not want it. Three were me misreading what was being asked for. Two started from a wrong premise about how the code worked. One was a mechanical git failure.

The useful split is not merged against closed. It is preventable against not. Fourteen of the thirty-three were things I could have stopped by knowing something I did not know, and that is the number worth carrying around.

## The one that still annoys me

A reviewer wrote that the fix looked right and explained why the change was safe. Then it was closed, because the issue it referenced did not carry a particular label that the contributing guide requires before a pull request is eligible. Correct code, reviewed positively, killed by a precondition I had never read.

That is not a sad story about bureaucracy. The precondition exists because the project is drowning in drive-by patches and the label is how a maintainer signals that a problem is actually agreed to be a problem. I had skipped the step that proves someone wants the fix, and then spent my effort on the part that was easy for me.

## Two things I believed that the data killed

I assumed linking an issue made a pull request more likely to merge. It does not. In my own data the closed ones are 42 percent issue-linked and the merged ones are 30 percent, so the merged work links issues *less*. Whatever issue-linking does for me, it is not that.

I also assumed closures clustered in projects that had never merged anything of mine, which would have been a tidy signal for where to stop trying. Seventeen against sixteen. No signal. Worse, the metric is circular: a repository that has never merged me can only ever produce closures, so of course they appear there.

Both of those felt true. Both were the kind of thing I would have written into a personal rulebook and then followed for a year. Checking them cost an afternoon.

## What changed

Three concrete habits came out of it. I read the contributing guide for preconditions before writing code, not before opening the pull request, because by then the work is already done and sunk. I never leave a pull request marked as a draft, since in several projects that puts it on a staleness timer that only an explicit ready-for-review click stops. And I measure a project's external-merge throughput before entering it, instead of picking by how well-known it is.

None of that came from the merges. The merges tell you what worked once. The closures tell you what will keep happening.
