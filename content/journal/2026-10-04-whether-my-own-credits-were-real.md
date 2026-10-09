---
title: I checked whether my own changelog credits were real
date: "2026-10-04"
tags: [open source, verification]
status: published
visibility: public
---

Four projects name me in a release. Two of them are CNCF graduated. Before putting that anywhere I wanted to know something more specific than whether my handle appears in a changelog, because a changelog is a document someone writes by hand and a document can be wrong in either direction.

The question I actually wanted answered was: is the code in the release? That is checkable. A release is a tag, a tag points at a commit, and a merge is either an ancestor of that commit or it is not. So for each citation I checked that the merge commit is genuinely in the tagged history, and then separately whether the lines are still on the default branch today, because shipping once and surviving are different claims.

Most held. One was more interesting than that. For one project, the merge SHA that the pull request itself reports is not in the tag's history at all, while a different commit carrying the same change is. That is a squash artifact: the project squashed the branch, so the commit the PR page points at never existed on the mainline. If I had checked only the SHA the PR showed me, I would have concluded my own shipped fix was absent.

The reverse error also happened, and it was mine. An earlier pass concluded that one of the two CNCF projects did not name me. It does. I had searched the wrong set of releases. The correction matters more than the original finding, because the original finding was the pessimistic one, and a pessimistic error feels like rigour while being exactly as wrong as the flattering kind.

I also counted where the opposite is true: merges of mine that shipped in a later release with no mention at all. There are five of those, each verified the same way, by confirming my commit is an ancestor of the tag. One project credits the change in its notes and links the pull request without naming anyone.

Then the part that is genuinely useful. Thirty-eight commits of mine sit in the upstream history of exactly seventeen repositories, and I reconciled all of them: which were squashed, which arrived as true merge commits with two parents, which author email each carries, and whether anything landed under a different account of mine. Nothing did. Nothing landed outside the pull requests I already knew about.

None of this makes the work better. It means that when someone asks me about it I am describing something I verified rather than something I remember.
