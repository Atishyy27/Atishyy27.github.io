---
title: The booking system that sold the same slot twice
date: "2026-09-20"
tags: [PostgreSQL, concurrency, correctness]
project: "yes-wellness-platform"
status: published
visibility: public
---

A state-wide wellness platform was double-allocating appointment slots under load. Two people would book the same slot and both would get a confirmation. Under light traffic it never happened. At peak it happened repeatedly.

That pattern is the signature of a race, not of a logic error, and the reason is worth being precise about. The code almost certainly read the slot, saw capacity remaining, and then wrote a booking. Those are two statements with a gap between them, and under concurrency the gap is where the second request lives: both read the same remaining capacity, both concluded there was room, both wrote. Neither request was wrong on its own. They were wrong together.

The fix people reach for first is more servers, which makes it worse, because more concurrency means more requests landing inside that gap. The second thing people reach for is a lock around the whole booking path, which works and destroys throughput, because now every booking in the system waits behind every other booking regardless of whether they could possibly conflict.

What it actually needed was row-level locking: take the lock on the specific slot row being booked, so two people booking the same slot serialise and two people booking different slots do not interact at all. PostgreSQL gives you this directly, and the important property is that the contention is scoped to exactly the thing that is contended.

Then the part that is not optional: proving it. A fix for a race that only appears under load cannot be verified by trying it once. I stress-tested the booking path with k6 to around five thousand concurrent users and held the 95th percentile under a hundred milliseconds. Those two numbers belong together. A correctness fix that makes the endpoint slow has traded one failure for another, and on a platform launched by a state government the slow version is the one people notice.

The general lesson I took is about where to look rather than what to write. Any sequence of read, decide, write is a race unless something makes it atomic, and the bug does not appear until there is enough traffic for two requests to overlap. Which means it ships, and it surfaces on launch day.
