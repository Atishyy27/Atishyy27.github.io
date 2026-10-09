---
title: Integers larger than 64 bits, quietly losing precision
date: "2026-09-26"
tags: [open source, Go, correctness]
status: published
visibility: public
---

The fix I am most pleased with is in a policy engine used to decide whether things are allowed to happen. It had a bug where arithmetic and aggregation over integers larger than sixty-four bits lost precision.

That class of bug is the one I find most interesting, because nothing crashes. There is no stack trace and no error. A number goes in, a slightly different number comes out, and every layer above it behaves correctly on the wrong value. In a policy engine, the thing the wrong value decides is whether an action is permitted.

It was reported by one of the project's own maintainers, which tells you something about where good outside contributions come from. The hard part of a bug like this is noticing it exists, and that had already been done by someone who knows the codebase far better than I do. What was left was the part an outsider can genuinely do: read how the arithmetic and the aggregate paths handle a value that no longer fits, make them agree, and write the test that pins the behaviour so it cannot drift back.

It shipped in the project's release, and the probe line is still in the aggregates file on the default branch today. I checked that rather than assuming it, because a fix that was merged and then quietly refactored away is not the same claim.

A second change of mine is in the same release, in the compiler rather than the runtime: restoring source location information on a particular class of error, so the message tells you where in your own policy the problem is instead of pointing at a rewritten internal name. Four of the five lines it added are still on the main branch; the error text itself was later reworded by someone else. That is the normal and correct fate of a small fix, and worth saying out loud, because "still present" and "still present verbatim" are different things and only one of them is true.

Neither change is large. Both are the kind where the work is almost entirely reading.
