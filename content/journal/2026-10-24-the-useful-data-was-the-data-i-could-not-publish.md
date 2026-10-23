---
title: The useful data was the data I could not publish
date: "2026-10-24"
tags: [placement cell, privacy, data]
status: published
visibility: public
---

I built a session site for the two junior batches in my institute's placement cell, about finding work off campus. The first version was a deck that restated what I had dictated into it. I threw it away, which was the right call and took longer to accept than it should have.

The reason it was worthless is specific. Everything in it was advice anyone could give: apply early, write to people, keep a tracker. None of it was from our cell. We have three years of our own registration data, our own drive records, and our own pattern of who ends up looking off campus and when. A junior does not need my opinion about applying early. They need to know what actually happened to the batch two years above them.

So the real constraint showed up immediately: that data is other students' personal data. Names, enrolment numbers, outcomes. It cannot go on a public URL, and it should not sit in a git repository either, because a repository is a thing that gets cloned, mirrored and pushed somewhere else by accident exactly once.

What I ended up with is a pipeline with a deliberate cut in the middle. A read-only puller copies the cell's sheets into a local folder that is in `.gitignore` and never leaves the machine. A second step reduces that to aggregates and writes a small derived file. Only the derived file is committed, and only the derived file is what the site is built from. Nobody appears in it. The published artifact cannot leak the source because the source was never in the same place as the publish step.

That cut is the whole design, and it is not a privacy feature bolted on afterwards. If I had started from "build a site with the data", I would have had the sheets inside the project directory on day one, and every subsequent decision would have been about remembering not to commit them. Remembering is not a control. The folder being outside the committed tree is a control, because it fails closed: if the derivation step has not run, the build has nothing to show, rather than quietly shipping the raw thing.

The lesson I keep relearning in a different costume: when the sensitive data is also the useful data, do not try to publish it carefully. Derive from it and publish the derivation, and put real distance between the two so that a bad day cannot collapse it.

One honest caveat. Aggregates are not automatically anonymous. A batch is small, and a count of one is a name to anyone who was there. I checked the derived file for that specific shape before anything went up, which is a check I had to think to do rather than one the pipeline does for me. The next version should refuse to emit a bucket below a floor instead of leaving that to me noticing.
