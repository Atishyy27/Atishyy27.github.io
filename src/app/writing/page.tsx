import type { Metadata } from "next";
import { listedEntries, readingMinutes } from "@/lib/journal";
import { log } from "@/content/log";
import WritingFeed, { type FeedItem } from "@/components/WritingFeed";
import Terminal from "@/components/Terminal";
import { Keyboard3DMount } from "@/components/SceneMount";
import { Head, Wrap } from "@/components/Section";

export const metadata: Metadata = {
  title: "Writing · Atishay Jain",
  description:
    "Essays and build-log notes on shipping software: what broke, what the number actually was, and what the fix cost."
};

// /journal, /log and /archive merged here on 22 Oct 2026. /archive already
// carried all three sources, which made it a superset of the other two rather
// than a different view of them, and the nav offered all three as separate
// places to go.
//
// The pull requests were in this feed until 24 Oct 2026 and are now out. 151
// of them against 26 pieces of writing made the page a changelog with essays
// hidden inside it, and a changelog is a thing only its author reads. They
// live on /oss, which is the page they are actually about.

export default function Writing() {
  const journal: FeedItem[] = listedEntries().map((e) => ({
    kind: "journal",
    date: e.date,
    title: e.title,
    href: `/journal/${e.slug}/`,
    note: `${readingMinutes(e)} min`,
  }));

  return (
    <main className="relative pt-24">
      <Wrap id="writing">
        <Head
          n="01"
          title="Writing"
          kicker={`${journal.length} essays and ${log.length} build-log notes, newest first. Each one is a thing that went wrong, or a number that turned out to be false, written up while it was still fresh.`}
        />
        <WritingFeed journal={journal} />
      </Wrap>

      <Wrap id="terminal">
        <Head
          n="02"
          title="Or just ask"
          kicker="Search my work from the shell. The answer is the real sentence from the real source, not a paraphrase of it."
        />
        <Terminal />
      </Wrap>

      {/* The keyboard earns its place here: the lit caps are the shortcuts
          Palette.tsx actually listens for, and this is the page with a shell
          on it. */}
      <Wrap id="keyboard">
        <Head
          n="03"
          title="Shortcuts"
          kicker="Your keyboard drives this one. The lit caps do something here; command or control plus K opens the palette."
        />
        <Keyboard3DMount />
      </Wrap>
    </main>
  );
}
