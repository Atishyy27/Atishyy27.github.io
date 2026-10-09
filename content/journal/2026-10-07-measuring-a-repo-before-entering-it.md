---
title: I stopped picking open-source projects by how famous they were
date: "2026-10-07"
tags: [open source, method]
status: published
visibility: public
---

For a long time I chose what to contribute to the way everyone does: find a project I had heard of, sort the issues by whichever label sounds welcoming, pick one. That selects almost perfectly for the worst option available. A well-known repository has the longest review queue and the most competition for exactly the issues designed to be easy, so the thing you can do fastest is the thing forty other people can also do fastest.

What I measure first now is whether the project can merge an outsider at all. Specifically: how many pull requests from people who are not maintainers have landed in the last ninety days, and how long they waited. That is one query and it answers the only question that matters before you spend a weekend.

If the number is near zero I do not walk away immediately, because zero has two completely different causes. The project might be dormant, in which case nothing you do will land. Or it might be closed in practice, with a core team that writes everything itself and treats outside patches as noise. Those look identical from the outside and need opposite responses, so the next step is to read why, not to guess.

I ran this across eleven projects in one ecosystem over sixty days. Two were worth entering. Two more turned out to have policies that excluded how I work entirely, which is the kind of thing you want to discover before the first commit rather than after the first rejection. The remaining seven were neither dead nor hostile, just slow enough that the effort was better spent elsewhere.

The part I did not expect is how much this changed what I read. When the question is "can this project merge me", you end up reading merge history, review threads and contributing policy instead of source code. You learn how the project makes decisions before you learn how it works. That turns out to be the right order.
