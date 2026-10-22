import type { Metadata } from "next";
import { listedEntries, readingMinutes } from "@/lib/journal";
import { oss } from "@/content/oss";
import { log } from "@/content/log";
import WritingFeed, { type FeedItem } from "@/components/WritingFeed";
import Terminal from "@/components/Terminal";
import { Keyboard3DMount } from "@/components/SceneMount";
import { Head, Wrap } from "@/components/Section";

export const metadata: Metadata = {
  title: "Writing · Atishay Jain",
  description:
    "Everything dated: journal entries, build-log notes and every upstream pull request, in one feed.",
};

// /journal, /log and /archive merged here on 22 Oct 2026. /archive already
// carried all three sources, which made it a superset of the other two rather
// than a different view of them, and the nav offered all three as separate
// places to go.
//
// The pull requests are in the same feed on purpose. They are by far the
// densest dated record, and a calendar of only the writing shows a dozen dots
// in a year where several hundred things happened. They are off by default
// because 151 of them would bury 26 pieces of writing.

export default function Writing() {
  const journal: FeedItem[] = listedEntries().map((e) => ({
    kind: "journal",
    date: e.date,
    title: e.title,
    href: `/journal/${e.slug}/`,
    note: `${readingMinutes(e)} min`,
  }));

  const prs: FeedItem[] = oss.repos.flatMap((r) =>
    r.prs.map((pr) => ({
      kind: "pr" as const,
      date: pr.created,
      title: pr.title,
      href: pr.url,
      note: `${r.full} · ${pr.state}`,
    }))
  );

  return (
    <main className="relative pt-24">
      <Wrap id="writing">
        <Head
          n="01"
          title="Writing"
          kicker={`${journal.length} journal entries, ${log.length} build-log notes and ${prs.length} pull requests, newest first. One page, because they were three and said the same things.`}
        />
        <WritingFeed journal={journal} prs={prs} />
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
