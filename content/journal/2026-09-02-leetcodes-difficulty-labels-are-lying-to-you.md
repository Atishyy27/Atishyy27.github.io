---
title: Easy, medium and hard are hiding the thing you want to know
date: "2026-09-02"
tags: [Chrome extensions, GraphQL, measurement]
project: "leetcode-analytics"
status: published
visibility: public
---

LeetCode sorts problems into easy, medium and hard, and that is the number everyone quotes about themselves: so many easies, so many mediums. The problem is that the buckets are wide enough to be nearly useless. Some easies are harder than some mediums. Two people with identical bucket counts can be at genuinely different levels, and neither of them can see it.

What you actually want is the distribution. Not three numbers but the spread: at what difficulty do your solves start thinning out, and which topics are carrying you versus which ones you have quietly never touched. That exists in the data. It is just not what the profile shows you.

So the extension injects it into the profile page itself. Difficulty spread rather than three buckets, a topic breakdown, and the trend over time, read from LeetCode's own GraphQL API, which is how their own front end gets it. No account connection and no data collection, because there is nothing to collect: the page you are looking at already has the right to that data and the work happens in your browser.

Two things I would say about building it. The first is that reading an API a site uses for its own front end is the cheapest possible source of truth, and it also means the numbers cannot disagree with the site, because they came from the site. The second is that the whole value of the thing is a reframing rather than a feature. The data was always there. What was missing was presenting it along the axis that answers the question people are actually asking, which is not "how many have I done" but "where am I weak".

As of the last time I checked the Web Store listing it has 265 users. For something that exists to argue with a number, that is a satisfying amount of agreement.
