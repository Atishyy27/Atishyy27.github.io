---
title: Six account types, real money, and the security pass before launch
date: "2026-09-14"
tags: [security, IDOR, authorisation]
project: "4moral"
status: published
visibility: public
---

One app, six different account types, real-time chat between them, and money moving through it. The interesting part was not building any one of those. It was that a security pass before launch found three separate classes of hole, and all three come from the same root.

Injection, first, which is the familiar one: input treated as instruction instead of as data.

Then IDOR, insecure direct object reference, which is the one worth explaining because it does not look like a bug while you are writing it. You build a page that shows a record, the page takes an id, you fetch the record with that id and render it. The code is correct. It is also missing a question: is the person asking allowed to see this particular record? With six account types that question has six different answers, and the natural way to build the feature never asks it, because while you are building it you are logged in as the account that should see it.

Third, mass assignment, which is the same mistake pointed at writes. You accept a form payload and update the record from it. Convenient, and it means any field in that record is settable by anyone who can edit any part of it, including the field that says which account type you are.

All three are the same root: trusting that the shape of a request matches the intent of the person making it. Injection trusts the content, IDOR trusts the identifier, mass assignment trusts the field list. Six account types is what made it dangerous, because every one of those holes is a privilege boundary and there were fifteen pairs of boundaries to get wrong.

What I would do differently is sequencing. The pass happened before launch, which is the right side of the line, but it happened after the features were built. Authorisation is not a layer you add over a finished feature; it is a property of each read and each write, and retrofitting it means revisiting every one of them. The second time, the question "who is allowed to see this row" goes in at the same moment the query does.
