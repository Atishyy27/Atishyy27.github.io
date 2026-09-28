import Link from "next/link";
import type { Metadata } from "next";
import { allProjects, pagedProjects, CATEGORY_LABEL, type ProjectCategory } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects · Atishay Jain",
  description: "Government platforms, client builds, extensions and hackathon systems.",
};

const ORDER: ProjectCategory[] = ["government", "client", "institution", "extension", "hackathon"];

// Text-only cards on purpose: public/ carries no screenshots, and an invented
// placeholder image is worse than none. Type and spacing carry the card instead.
export default function ProjectsIndex() {
  const paged = new Set(pagedProjects.map((p) => p.slug));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8">
      <p className="font-mono text-xs tracking-[0.3em] text-[var(--accent)]">PROJECTS</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">Things that shipped</h1>
      <p className="mt-4 max-w-xl text-[var(--fg-muted)]">
        Grouped by who they were for. Each one links to the code or the live thing where
        that exists, and says plainly where it does not.
      </p>

      {ORDER.map((cat) => {
        const items = allProjects.filter((p) => p.category === cat);
        if (items.length === 0) return null;

        return (
          <section key={cat} className="mt-16">
            <h2 className="font-mono text-xs tracking-[0.25em] text-[var(--fg-muted)]">
              {CATEGORY_LABEL[cat].toUpperCase()}
            </h2>

            <ul className="mt-6 space-y-px">
              {items.map((p) => {
                const hasPage = paged.has(p.slug);
                const Inner = (
                  <>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-lg font-medium tracking-tight group-hover:text-[var(--accent)]">
                        {p.name}
                      </h3>
                      {p.org ? (
                        <span className="font-mono text-[10px] tracking-wider text-[var(--fg-muted)]">
                          {p.org}
                        </span>
                      ) : null}
                    </div>

                    {p.story ? (
                      <p className="mt-2 max-w-2xl text-sm text-[var(--fg-muted)]">{p.story}</p>
                    ) : (
                      <p className="mt-2 max-w-2xl text-sm text-[var(--fg-muted)]">{p.blurb}</p>
                    )}

                    <p className="mt-3 font-mono text-[10px] tracking-wider text-[var(--fg-muted)]">
                      {p.stack.join(" · ")}
                    </p>
                  </>
                );

                return (
                  <li key={p.slug} className="border-t border-[var(--line)]">
                    {hasPage ? (
                      <Link href={`/projects/${p.slug}/`} className="group block py-6">
                        {Inner}
                      </Link>
                    ) : (
                      <div className="py-6">{Inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="mt-20 border-t border-[var(--line)] pt-6">
        <Link href="/" className="link font-mono text-xs tracking-[0.2em]">
          BACK
        </Link>
      </div>
    </main>
  );
}
