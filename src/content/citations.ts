// src/content/citations.ts
// Production release notes and upstream citations referencing Atishyy27's work.
//
// Every claim here links directly to the official GitHub release and the matching PR.
// Stronger than a merged tag: evidence that the code shipped into stable releases.

export type CitationPr = {
  number: number;
  title: string;
  url: string;
  quote: string;
  impact: string;
};

export type ReleaseCitation = {
  project: string;
  repo: string;
  releaseTag: string;
  releaseName: string;
  releaseUrl: string;
  prs: CitationPr[];
};

export const RELEASE_CITATIONS: ReleaseCitation[] = [
  {
    project: "Fedimint",
    repo: "fedimint/fedimint",
    releaseTag: "v0.13.0",
    releaseName: "Steady State",
    releaseUrl: "https://github.com/fedimint/fedimint/releases/tag/v0.13.0",
    prs: [
      {
        number: 9198,
        title: "Fix P2P receive handling between frames",
        url: "https://github.com/fedimint/fedimint/pull/9198",
        quote: "Guardians no longer silently drop out of consensus",
        impact: "P2P consensus & network reliability under packet fragmentation",
      },
      {
        number: 8854,
        title: "Prevent panics decoding untrusted Duration and SystemTime",
        url: "https://github.com/fedimint/fedimint/pull/8854",
        quote: "Less CPU, fewer crashes",
        impact: "Prevents remote crash vectors on untrusted timestamp inputs",
      },
      {
        number: 9182,
        title: "Lightning address validation against LUD-16",
        url: "https://github.com/fedimint/fedimint/pull/9182",
        quote: "Gateway & Lightning",
        impact: "Stricter RFC validation preventing malformed invoice generation",
      },
    ],
  },
  {
    project: "Fedimint",
    repo: "fedimint/fedimint",
    releaseTag: "v0.12.0",
    releaseName: "Second Nature",
    releaseUrl: "https://github.com/fedimint/fedimint/releases/tag/v0.12.0",
    prs: [
      {
        number: 8921,
        title: "Check both PaymentFee components against fee limits",
        url: "https://github.com/fedimint/fedimint/pull/8921",
        quote: "Gateway & Lightning – stricter fee limit verification",
        impact: "Enforces strict limits across base and proportional routing fees",
      },
    ],
  },
];

export const RELATED_ARCHITECTURAL_ISSUES = [
  {
    repo: "fedimint/fedimint",
    issueNumber: 8927,
    title: "SystemTime encoding redesign",
    issueUrl: "https://github.com/fedimint/fedimint/issues/8927",
    resolvedInPr: 8931,
    resolvedInUrl: "https://github.com/fedimint/fedimint/pull/8931",
    authorOfFix: "dpc",
    note: "Identified platform-dependent SystemTime encoding flaws across consensus modules, resulting in upstream architecture migration to validated integer timestamps.",
  },
];
