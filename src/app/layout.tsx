import type { Metadata } from "next";
import { person } from "@/content/site";
import "./globals.css";
import Colophon from "@/components/Colophon";
import Nav from "@/components/Nav";
import Palette from "@/components/Palette";
import { listedEntries, allTags, tagSlug } from "@/lib/journal";
import Track from "@/components/Track";
import { SmoothScroll, ScrollProgress } from "@/components/Chrome";

const SITE = "https://atishay.tech";
const CLARITY = process.env.NEXT_PUBLIC_CLARITY_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: `${person.name} · ${person.tagline}`,
  description: person.blurb,
  keywords: [
    "Atishay Jain",
    "software engineer",
    "Rust",
    "rust-lightning",
    "full-stack developer",
    "ICPC",
    "Indore",
  ],
  authors: [{ name: person.name, url: SITE }],
  openGraph: {
    type: "profile",
    url: SITE,
    title: `${person.name} · ${person.tagline}`,
    description: person.blurb,
    siteName: person.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${person.name} · ${person.tagline}`,
    description: person.blurb,
    creator: "@atishyy27",
  },
  alternates: { canonical: SITE },
};

/** Makes "Atishay Jain" resolve to this page rather than a scraper site. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  url: SITE,
  email: `mailto:${person.email}`,
  jobTitle: person.tagline,
  address: { "@type": "PostalAddress", addressLocality: "Indore", addressCountry: "IN" },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Shri G. S. Institute of Technology and Science, Indore",
  },
  sameAs: person.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Computed here because this is a Server Component and the palette is not.
  // Only the fields the palette searches are passed, so the client bundle does
  // not carry every entry's body.
  const journalIndex = listedEntries().map((e) => ({
    slug: e.slug,
    title: e.title,
    date: e.date,
  }));
  const tagIndex = allTags().map((t) => ({
    tag: t.tag,
    slug: tagSlug(t.tag),
    count: t.count,
  }));

  return (
    <html lang="en">
      <body>
        {CLARITY && (
          <script
            dangerouslySetInnerHTML={{ __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY}");` }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {/* Both of these were written and then mounted on no page, which is why
            the site scrolled like a plain document. SmoothScroll bails out under
            prefers-reduced-motion and lazy-loads Lenis, so it costs nothing to
            a visitor who does not get it. */}
        <SmoothScroll />
        <ScrollProgress />
        <Nav />
        <Palette journalIndex={journalIndex} tagIndex={tagIndex} />
        <Track />
        {children}
        <Colophon />
      </body>
    </html>
  );
}
