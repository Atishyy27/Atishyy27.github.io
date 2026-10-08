/**
 * The build log.
 *
 * Short technical notes with the thing itself embedded, not described. Add an
 * entry by pushing to this array; the newest sits on top. Keep every claim
 * checkable, same rule as the rest of the site.
 *
 * embed kinds:
 *   youtube  -> id is the video id
 *   gist     -> id is "<user>/<gist-id>"
 *   repo     -> id is "<owner>/<name>", renders a live GitHub card
 *   demo     -> id is any URL, renders a framed live page
 *   none     -> text only
 */

export type Entry = {
  date: string;          // ISO, sorts and displays
  title: string;
  tags: string[];
  body: string[];
  embed?: { kind: "youtube" | "gist" | "repo" | "demo"; id: string };
  links?: { label: string; href: string }[];
};

export const log: Entry[] = [
  {
    date: "2026-10-08",
    title: "Signed commits were a merge gate and no CI said so",
    tags: ["git", "GPG", "open source"],
    body: [
      "Eight finished branches sat unmergeable across two Bitcoin repos and I could not work out why. The PRs were green. Review comments were addressed. Nothing in any workflow file mentioned signing.",
      "Both projects merge only signed commits. That rule lived in a maintainer's head and in the merge queue, not in a check that runs on your pull request. A third repo in the same ecosystem does not care at all, which is exactly why I had no reason to suspect it: the same kind of project, the same kind of PR, two different invisible rules.",
      "The lesson is not \"sign your commits\". It is that a repository's real constraints are not always the ones its CI expresses. I now measure a target repo's merge behaviour before writing code for it, rather than reading its contributing guide and assuming that is the whole contract."
    ],
  },
  {
    date: "2026-10-02",
    title: "A repo's own config bans code the language allows",
    tags: ["semgrep", "ast-grep", "open source"],
    body: [
      "I kept getting review comments that read like personal preference until I found the file generating them. Several projects ship their own semgrep or ast-grep rules, and those rules ban patterns that compile perfectly and that no linter in my editor objects to.",
      "So the shape of an acceptable patch is not a style question you infer from reading the diff history. It is checked in. The same is true of the pull request itself: a repo's CLAUDE.md or contributing config will often dictate the commit granularity and the description sections, and a reviewer who has to ask for those is already annoyed.",
      "I wrote a script that reads both before I touch anything. It costs thirty seconds and has saved several round trips."
    ],
  },
  {
    date: "2026-09-28",
    title: "An issue you file is a claim with a clock on it",
    tags: ["open source", "process"],
    body: [
      "I found a real bug in a large project, wrote it up properly, filed it, and left it. Two months later someone else opened a pull request against my own issue and it was merged in three minutes.",
      "That is not unfair, it is how it works. An issue is not a reservation. The project wanted the fix, I had already done the hard part of locating it, and I handed a stranger a free, well-specified task.",
      "Now an issue I file either comes with a PR or comes with a date by which I will have one. If I cannot commit to that, filing it is still the right thing to do for the project, but I stop counting it as my work."
    ],
  },
  {
    date: "2026-09-22",
    title: "The default branch was frozen and I spent a day on dead code",
    tags: ["git", "open source"],
    body: [
      "I cloned a protocol implementation, read the code on the default branch, and built a change against it. The branch's last commit was from June 2025. Every merged pull request and all actual development targets a branch called dev.",
      "Worse, the module I had been reading exists only on the frozen branch. It is dead code preserved by inertia, and nothing in the repo says so.",
      "GitHub shows you the default branch and most tooling follows it, so \"read the code first\" quietly becomes \"read whatever HEAD happens to point at\". Now I check the last commit date on the default branch before I read a line, and if it is stale I go find where the commits actually land."
    ],
  },
  {
    date: "2026-09-18",
    title: "Rust builds kept dying and the disk was the bug",
    tags: ["Rust", "cargo", "macOS"],
    body: [
      "Builds started failing with \"No space left on device\" on a machine I thought had room. The Mac was effectively at 100 percent, and the reason was not my files.",
      "Cargo's incremental compilation caches under target/debug/incremental are enormous and completely disposable. Deleting them across a handful of checked-out Rust projects returned 8.9GB immediately, with no loss other than one slower rebuild.",
      "The general shape is worth remembering: a build system's caches are the first place to look when a disk fills up unexpectedly, because they are the only large thing on the machine that is both safe to delete and invisible in a normal file browser."
    ],
  },
  {
    date: "2026-09-15",
    title: "Random TLS failures that were actually broken IPv6",
    tags: ["networking", "IPv6", "debugging"],
    body: [
      "curl and git started failing intermittently with SSL_ERROR_SYSCALL. The same command would work on retry. It looked like a flaky certificate problem, which is the worst kind of wrong diagnosis because it sends you reading about TLS.",
      "The network advertises IPv6 and cannot route it. So the resolver returns an AAAA record, the connection opens to an address that goes nowhere, and the failure surfaces at the first point where bytes were expected: the TLS handshake.",
      "A transport failure can present as a protocol error at any layer above it. The tell was that it was intermittent and per-host, which is the signature of dual-stack resolution picking differently each time, not of anything to do with certificates."
    ],
  },
  {
    date: "2026-09-10",
    title: "Measuring whether a repo can merge me at all",
    tags: ["open source", "method"],
    body: [
      "I used to pick open-source targets by stars, which selects for repositories with the longest review queues and the most competition for the easy issues.",
      "Now the first thing I measure on a new target is external-merge throughput: how many pull requests from people who are not maintainers have landed in the last ninety days, and how long they waited. If that number is near zero I go and work out why before deciding, because the reason is usually either a dormant project or a closed one, and those need completely different handling.",
      "A fresh project with a high external-merge rate is worth more than a famous one with a stalled queue. I vetted eleven projects in one ecosystem this way over sixty days; two were worth entering, and two more turned out to have policies that excluded how I work entirely. Knowing that in advance is the whole value."
    ],
  },
  {
    date: "2026-09-05",
    title: "A token that can never read the thing it is asked to read",
    tags: ["GitHub Actions", "APIs"],
    body: [
      "I wrote a weekly job to record traffic stats for my own repositories. It failed every run with a permissions error, and no combination of workflow permissions fixed it.",
      "The traffic API requires the administration scope, and administration is not a grantable permission for the automatic GITHUB_TOKEN. There is no setting. The job needs a personal access token or it cannot exist.",
      "Not every permission error is a misconfiguration. Some are the platform telling you the thing is not possible with the credential you have, and the sooner you read the permission table instead of guessing at the YAML, the sooner you stop."
    ],
  },
  {
    date: "2026-08-30",
    title: "An error handler that wrote a 142GB log file",
    tags: ["Node.js", "EPIPE", "postmortem"],
    body: [
      "A tool's sidecar process filled an entire disk. One log file, 142 gigabytes.",
      "The cause was a loop with no base case. Writing to a closed pipe raises EPIPE. The error handler logged the error. Logging wrote to the same closed pipe, which raised EPIPE, which called the handler. Each turn of the loop appended more bytes than the last because the message accumulated context.",
      "Any error handler that uses the failing resource to report the failure is a potential infinite loop, and the logger is the most common instance because logging feels like the safe thing to do on every path. The fix is that the handler for a transport failure must not use that transport, and that an unbounded log needs a ceiling regardless."
    ],
  },
  {
    date: "2026-08-20",
    title: "Guardrails in prose die on the next switch",
    tags: ["tooling", "process"],
    body: [
      "I had a rule written down: never act as the wrong account. It held until a config switch silently changed which account was active, and the rule, being prose in a file, did nothing.",
      "A guardrail that lives in instructions depends on something reading and obeying them every single time. A guardrail that lives in the tool holds even when nothing is paying attention. The same switch also dropped every configured integration, because those live in a different file than the one that looks like it holds settings, which is its own version of the same lesson.",
      "Everything load-bearing is now a check that runs and fails loudly. The written rule stays, but only as documentation of the check, not as the mechanism."
    ],
  },
  {
    date: "2026-09-30",
    title: "I deleted the language model from my own site",
    tags: ["BM25", "retrieval", "performance"],
    body: [
      "The ask box used to load two models before it would answer anything: MiniLM to embed, and a 77M-parameter Flan-T5 to phrase the result. Together that is 118 to 174MB, downloaded on a page whose whole pitch is that it is quick to look at. On mobile data it is not a feature, it is a toll.",
      "The corpus is 38 short chunks. At that size a lexical ranker is not a downgrade, it is the right tool: BM25 over 38 documents is exact, runs in well under a millisecond, and ships zero bytes. Writing it took less code than the model loader it replaced.",
      "Removing the generator turned out to matter more than the size. A small model's job was to rephrase retrieved text, and rephrasing is exactly where it could quietly invent an internship I never did. Now the answer is the sentence I actually wrote, with the link attached. Less fluent, and it cannot lie.",
      "I wrote tests first this time, and they caught four bugs I would have shipped. Hyphenated phrases were indexed whole, so \"anti-money-laundering\" could not be found by searching \"money\". Stripping \"ing\" off \"programming\" left \"programm\", which never matched \"program\". \"where did you study\" matched nothing because the education chunk contained the institute's name but not one word a person would type. And \"do you keep bees in antarctica\" confidently returned my About section, because it matched the single word \"keep\".",
      "That last one is the one worth keeping in mind. A retrieval system with no confidence floor always has an answer, and an answer that is always available is not evidence of anything. It now requires the top chunk to cover at least half the terms you asked about, or it says it has nothing.",
    ],
    embed: { kind: "repo", id: "Atishyy27/Atishyy27.github.io" },
  },
  {
    // Superseded by the 2026-09-30 entry above. Left as written: this is a log,
    // and what I believed in July is part of the record.
    date: "2026-07-23",
    title: "A language model that answers from my work, with no API behind it",
    tags: ["transformers.js", "RAG", "WASM"],
    body: [
      "The ask section on this page runs two models in your browser and nothing leaves it. MiniLM embeds every chunk of my real content, cosine similarity picks the closest three, and a 77M-parameter Flan-T5 phrases the answer from only those chunks. No inference API, no key, no cost per question.",
      "The first version failed on a question as basic as \"have you worked in Java\". The retrieval was fine; the corpus was the bug. I had indexed projects and experience but never the skills list, so the one chunk that could answer it did not exist. Worth remembering that a RAG system fails silently in exactly this shape: fluent, confident, and about a document you forgot to feed it.",
      "It is deliberately a small model. A big one would be smoother and would also invent an internship I never did. The whole point of this site is that every claim is checkable, so the generator only gets to rephrase retrieved text.",
    ],
    embed: { kind: "repo", id: "Atishyy27/Atishyy27.github.io" },
  },
  {
    date: "2026-07-22",
    title: "Two browser windows that know about each other",
    tags: ["three.js", "localStorage"],
    body: [
      "Open this site in two windows and drag them apart. The shapes reach for each other across the gap.",
      "There is no server involved. Each window writes its own screenX, screenY, width and height into its own localStorage key on a heartbeat, and reads everyone else's. The trick that makes it line up is the camera: an orthographic camera at zoom 1 means one world unit equals one screen pixel, so a position computed in screen coordinates lands exactly where the other window physically is on your desk.",
      "Each window owning a separate key matters. A shared key means the last writer clobbers everyone, and windows start flickering out of existence. Stale keys get pruned after 1.6 seconds, which is how a closed window disappears without anything telling anyone it closed.",
    ],
  },
  {
    date: "2026-07-21",
    title: "Merging four contribution graphs into one, and why the first API was lying",
    tags: ["data", "GitHub", "Codeforces"],
    body: [
      "Every platform ships its own heatmap and none of them agree, so this one sums GitHub commits, Codeforces submissions and LeetCode solves into a single day cell. The same numbers also drive the 3D skyline view.",
      "The version before this looked perfect and was empty. The contributions API I had wired up returned HTTP 000, and the failure path filled the grid with zeros, which renders as a real-looking year of doing nothing. That is the worst kind of bug in a data view: it does not look broken.",
      "Now a source that fails is drawn struck through and labelled unavailable. A grid that cannot prove a number does not draw one.",
    ],
    links: [{ label: "GitHub profile", href: "https://github.com/Atishyy27" }],
  },
];
