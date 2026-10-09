import { person } from "@/content/site";

/**
 * Schema.org structured data, rendered as a script tag.
 *
 * Why it matters here specifically: this is a static export with no server, so
 * there is nothing else telling a crawler that a journal entry is an article
 * with an author and a date rather than an arbitrary page. The layout already
 * declares a Person; these declare the things that Person made.
 *
 * Every value comes from content that is already on the page. Nothing is
 * asserted here that a reader cannot also see, which is the rule: structured
 * data that disagrees with the visible page is both a lie and a penalty.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE = "https://atishay.tech";

export const AUTHOR = {
  "@type": "Person",
  name: person.name,
  url: SITE,
} as const;

export function blogPosting(opts: {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  words: number;
  minutes: number;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    url: `${SITE}/journal/${opts.slug}/`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/journal/${opts.slug}/` },
    datePublished: opts.date,
    dateModified: opts.date,
    author: AUTHOR,
    publisher: AUTHOR,
    keywords: opts.tags.join(", "),
    wordCount: opts.words,
    timeRequired: `PT${opts.minutes}M`,
    inLanguage: "en",
    isAccessibleForFree: true,
  };
}

export function softwareProject(opts: {
  slug: string;
  name: string;
  blurb: string;
  stack: string[];
  links: { label: string; href: string }[];
  org?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: opts.name,
    url: `${SITE}/projects/${opts.slug}/`,
    description: opts.blurb,
    programmingLanguage: opts.stack,
    author: AUTHOR,
    ...(opts.org ? { sourceOrganization: { "@type": "Organization", name: opts.org } } : {}),
    // Only real outbound links. An empty array is omitted rather than shipped.
    ...(opts.links.length > 0 ? { sameAs: opts.links.map((l) => l.href) } : {}),
  };
}
