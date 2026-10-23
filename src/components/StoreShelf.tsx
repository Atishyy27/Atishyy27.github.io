"use client";

/**
 * The published work, as store listings.
 *
 * Four of these things are installable right now and the site was making
 * people read a paragraph and follow two links to find that out. A store
 * listing is a shape every visitor already knows how to read: icon, name,
 * publisher, how many people use it, one button. The button goes to the store,
 * not to a project page that then links to the store.
 *
 * Every install click is recorded. Without that, "265 users" is a number with
 * no story behind it: there is no way to know whether the site sends anyone to
 * the store at all, which is exactly the question to answer before spending a
 * week marketing the extensions.
 */

import { listings, type Listing } from "@/content/store";
import { allProjects, pagedProjects } from "@/content/projects";
import { Reveal, Tilt } from "./Chrome";
import { capture } from "@/lib/posthog";

/** Store wordmarks are trademarks, so the button says the words and skips the
 *  logo. An approximation of someone else's badge is worse than plain text. */
function Monogram({ name }: { name: string }) {
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <div
      aria-hidden
      className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)] font-mono text-lg tracking-tight text-[var(--accent)]"
    >
      {initials}
    </div>
  );
}

function Card({ listing }: { listing: Listing }) {
  // Blurb and stack are read from the project record rather than restated, so
  // editing one description cannot leave the other one stale.
  const project = allProjects.find((p) => p.name === listing.name);
  // Only a project with a story gets a detail page, so the link is offered
  // only when one exists. Linking every listing unconditionally shipped a
  // href to a page that was never generated, which check-projects.mjs caught.
  const hasPage = project ? pagedProjects.some((p) => p.slug === project.slug) : false;

  return (
    <Tilt className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-5">
      <div className="flex items-start gap-4">
        {listing.icon ? (
          <img
            src={listing.icon}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            decoding="async"
            className="h-16 w-16 shrink-0 rounded-2xl border border-[var(--line)] bg-[var(--bg)] object-contain"
          />
        ) : (
          <Monogram name={listing.name} />
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[1.0625rem] font-medium tracking-tight">{listing.name}</h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--fg-muted)]">
            {listing.store}
          </p>
          <p className="mt-2 font-mono text-[11px] text-[var(--fg-muted)]">
            {listing.users ? (
              <>
                {listing.users}
                {listing.countedOn ? (
                  <span className="text-[var(--fg-muted)]"> · counted {listing.countedOn}</span>
                ) : null}
              </>
            ) : (
              // Said plainly rather than left blank. A listing with no number
              // next to two that have one reads as a worse product otherwise.
              "install count not public on this listing"
            )}
          </p>
        </div>
      </div>

      {project?.blurb ? (
        <p className="mt-4 text-[length:var(--step-small)] leading-relaxed text-[var(--fg-muted)]">
          {project.blurb}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        <a
          href={listing.href}
          target="_blank"
          rel="noopener noreferrer"
          data-track={`install:${listing.slug}`}
          onClick={() =>
            capture("store_click", { slug: listing.slug, store: listing.store, href: listing.href })
          }
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-[length:var(--step-small)] font-medium text-[#06181a] transition-opacity hover:opacity-90"
        >
          {listing.cta}
        </a>
        {project && hasPage ? (
          <a
            href={`/projects/${project.slug}/`}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            how it was built
          </a>
        ) : null}
      </div>
    </Tilt>
  );
}

export default function StoreShelf() {
  return (
    <Reveal>
      <section id="stores" className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-[length:var(--step-h2)] font-medium">Installable right now</h2>
          <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">
            Three Chrome extensions and two Play Store apps. The buttons go to the store.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {listings.map((l) => (
            <Card key={l.slug} listing={l} />
          ))}
        </div>
      </section>
    </Reveal>
  );
}
