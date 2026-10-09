---
title: Three crashes in three projects, all the same shape
date: "2026-09-24"
tags: [open source, correctness]
status: published
visibility: public
---

Within a few weeks I fixed a nil pointer crash during service auto-registration in one project, a nil pointer panic when a JWT private key was supplied as invalid PEM in another, and a slice-bounds panic inside a third project's own test utilities. Different languages of problem, different domains, same shape every time: a value that the code assumed would be there, arriving absent or malformed, on a path nobody had exercised.

The auto-registration one is the clearest. Registration is the code that runs when something new appears and needs to be tracked. It is written while you are thinking about the thing appearing correctly, because that is the case you are building for. The case where the thing appears half-formed happens later, in production, to someone else.

The invalid-PEM one is the same story with a different cause. Nobody writes a key parser expecting to be handed something that is not a key. But a configuration value is a string from the outside world, and the entire job of code that reads configuration is to be handed the wrong thing.

The third one is my favourite, because the panic was in the project's test helpers. The code whose purpose is to catch problems had a problem. There is no irony in it, just the ordinary reason: test utilities get less review than the code they test, because reviewers are looking at the change and not at the scaffolding holding it up.

What I take from all three is where to look rather than what to look for. Not the main path, which has been exercised by every user of the project. The path that runs when something is absent, malformed, empty, or arriving for the first time. Each of those three fixes came with a test that produces the crash, which is the part that makes the pull request easy to say yes to: the reviewer does not have to trust my reasoning, they can run it.

All three merged. Two are named in their projects' releases. The third is in a project that has not cut a release since, which I only know because I went and checked.
