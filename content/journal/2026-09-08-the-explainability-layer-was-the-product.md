---
title: The model found the fraud ring. That was the easy half
date: "2026-09-08"
tags: [graph neural networks, SHAP, product]
project: "ciis-anti-money-laundering-detection"
status: published
visibility: public
---

The brief was anomaly detection over transaction data: find clusters of accounts behaving like a laundering ring across more than a million records. A graph neural network is the right tool, because the signal is not in any single transaction, it is in the shape of the relationships between accounts. Money moving in a circle is unremarkable transaction by transaction and obvious as a graph.

We built it, it worked, and it was not yet useful.

The reason is that the output of an anomaly detector is a list of flagged things with scores, and the person on the other end is an analyst who has to decide whether to act. Acting means freezing accounts and filing reports about real people. No analyst will do that because a model scored something 0.91, and they are right not to: a score is not a reason, and if the flag is wrong they are the one who has to explain it.

So the explainability layer was not a nice-to-have bolted on at the end. It was the product. We added SHAP on top, which attributes the score back to the features that drove it, so the analyst sees *why* this cluster was flagged rather than only that it was. That turns the output from a verdict into evidence, and evidence is the thing an analyst can work with.

It took top five of more than five hundred teams at a hackathon run with a bank, a defence-adjacent firm and the state police, and it converted into an internship offer. I think it placed because of the second half rather than the first. Plenty of teams can train a detector over a provided dataset. Fewer start from the question of what has to be true for someone to actually use the output, and that question changes what you build.

The generalisation I keep: for any model whose output triggers a human decision with consequences, the interface to the human is part of the model's job, not a separate concern downstream of it.
