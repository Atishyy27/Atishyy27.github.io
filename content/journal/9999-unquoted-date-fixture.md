---
title: "Fixture: unquoted date"
date: 2026-03-04
place: "fixture"
tags: [fixture]
status: published
visibility: public
fixture: true
---

The date in this file's front matter is deliberately NOT quoted. YAML parses it
into a Date object rather than a string, which once broke the build outright and
would silently shift the day by one if normalised in local time east of
Greenwich. This fixture exists so that regression fails a check instead of
shipping a wrong date.
