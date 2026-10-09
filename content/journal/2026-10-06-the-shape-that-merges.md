---
title: "27 of my 30 merged pull requests were the same kind of change"
date: "2026-10-06"
tags: [open source, method]
status: published
visibility: public
---

I went back through every pull request of mine that has been merged into a project I do not own, and sorted them by what kind of change they were. Twenty-seven of thirty are correctness fixes. Panics, nil pointer dereferences, integer overflow, empty-input handling, lost precision. Two are documentation. One is CI.

Not one of them is a feature.

That was not a strategy. It is what happened, and once I saw the distribution I understood why. A feature needs someone to have already agreed that the project wants it, which is a conversation, and that conversation is the actual work. A crash needs no agreement. If I can show you the input that breaks your code, we are not negotiating about whether it is a problem.

The shape that merges, stated as plainly as I can: a real bug, with a test that reproduces it, in code a maintainer currently owns. All three clauses are load-bearing. A real bug rather than a style preference. A reproducing test, because the test is what converts your claim into something the reviewer can check in thirty seconds instead of reasoning about. And code someone currently owns, because an unowned file has no one with both the authority and the motivation to press merge.

One of them is a four-line change. One is a slice-bounds panic in a project's own test utilities, which is a satisfying place to find a bug because the thing meant to catch problems had one. The largest is 169 lines. There is no relationship between size and whether it landed.

The thing I would tell someone starting out is to stop looking for issues labelled as suitable for newcomers and start looking for inputs that are not handled. Those labels are a queue with forty people in it. An unhandled nil is a queue with one.
