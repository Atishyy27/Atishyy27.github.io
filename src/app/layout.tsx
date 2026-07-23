import type { Metadata } from "next";
import { person } from "@/content/site";
import "./globals.css";

const SITE = "https://atishay.tech";

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
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
