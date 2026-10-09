---
title: A four-line fix got credited and a hundred-line one did not
date: "2026-10-02"
tags: [open source, observation]
status: published
visibility: public
---

Two things I assumed about open source turned out to be backwards, and both are measurable in my own record rather than matters of opinion.

The first is about speed. I expected large, well-known projects to be slow and small ones to be fast, because that is the intuitive story about review queues. Thirteen of my thirty merged pull requests merged within a day of being opened, and they are spread across projects of every size, including two CNCF graduated ones. The slowest took thirty-two and thirty-four days, in a project that is not especially large.

The variable is not project size. It is whether a specific maintainer who owns that code is active right now and has decided to look. When that is true, a graduated CNCF project will merge you in a day. When it is not, a small repository will sit on a three-line change for a month. You cannot read this off the star count, but you can read it off the last ninety days of merge history, which takes one query.

The second is about credit. I assumed getting named in release notes tracked how substantial the change was. It tracks the project's release-note habit and nothing else. A four-line change of mine is named in a release. A hundred-and-two-line change in a different project is linked in its notes without my name on it. Four of my merges sit in a project that has not cut a release since, so there is nothing to be named in yet.

That one has a practical consequence I did not expect. If being cited matters to you, it is a property of the project you choose, decided before you write any code, not a reward for the work you do afterwards. Picking a project that does not name contributors and then hoping to be named is choosing to lose.

The part worth sitting with is that both of these felt like knowledge. I would have repeated either of them confidently in a conversation. They lasted exactly as long as it took to count.
