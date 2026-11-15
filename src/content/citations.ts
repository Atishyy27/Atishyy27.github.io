// src/content/citations.ts
// Official production release notes and upstream changelogs referencing Atishyy27's work.
//
// Every row links directly to the official GitHub release and the matching PR.
// Stronger than a merged tag: verifiable proof the code shipped to users in production releases.

export type CitationPr = {
  number: number;
  title: string;
  url: string;
  quote?: string;
  impact: string;
};

export type ReleaseCitation = {
  project: string;
  repo: string;
  tier?: string;
  releaseTag: string;
  releaseName?: string;
  releaseUrl: string;
  prs: CitationPr[];
};

export const RELEASE_CITATIONS: ReleaseCitation[] = [
  {
    project: "Cilium",
    repo: "cilium/cilium",
    tier: "CNCF Graduated",
    releaseTag: "v1.21.0-pre.0",
    releaseUrl: "https://github.com/cilium/cilium/releases/tag/v1.21.0-pre.0",
    prs: [
      {
        number: 47516,
        title: "envoy/xds: use netip.ParseAddr to validate the node IP",
        url: "https://github.com/cilium/cilium/pull/47516",
        quote: "* envoy/xds: use netip.ParseAddr to validate the node IP (cilium/cilium#47516, @Atishyy27)",
        impact: "Validates envoy XDS node IPs using netip.ParseAddr, preventing improper node registration across clusters.",
      },
    ],
  },
  {
    project: "SHAP",
    repo: "shap/shap",
    tier: "ML Interpretability (25k+ stars)",
    releaseTag: "v0.53.0",
    releaseUrl: "https://github.com/shap/shap/releases/tag/v0.53.0",
    prs: [
      {
        number: 5164,
        title: "Match KernelExplainer DataFrame columns to the background by name",
        url: "https://github.com/shap/shap/pull/5164",
        quote: "* Match KernelExplainer DataFrame columns to the background by name... By @Atishyy27",
        impact: "Aligns KernelExplainer feature columns by name rather than position, raising clean errors on duplicates.",
      },
    ],
  },
  {
    project: "Pixi",
    repo: "prefix-dev/pixi",
    tier: "Package Management (6k+ stars)",
    releaseTag: "v0.82.0",
    releaseUrl: "https://github.com/prefix-dev/pixi/releases/tag/v0.82.0",
    prs: [
      {
        number: 7095,
        title: "fix(cli): don't suggest a one-character alias for an unrelated subcommand",
        url: "https://github.com/prefix-dev/pixi/pull/7095",
        quote: "- Don't suggest a one-character alias for an unrelated subcommand by @Atishyy27 in #7095",
        impact: "Eliminates misleading single-character suggestion aliases on CLI command mismatch.",
      },
    ],
  },
  {
    project: "Fedimint",
    repo: "fedimint/fedimint",
    tier: "Bitcoin Lightning & Chaumian Ecash",
    releaseTag: "v0.13.0",
    releaseName: "Steady State",
    releaseUrl: "https://github.com/fedimint/fedimint/releases/tag/v0.13.0",
    prs: [
      {
        number: 9198,
        title: "Fix P2P receive handling between frames",
        url: "https://github.com/fedimint/fedimint/pull/9198",
        quote: "Guardians no longer silently drop out of consensus",
        impact: "Fixes P2P frame boundary stalls so consensus guardians stay connected under network latency.",
      },
      {
        number: 8854,
        title: "Prevent panics decoding untrusted Duration and SystemTime",
        url: "https://github.com/fedimint/fedimint/pull/8854",
        quote: "Less CPU, fewer crashes",
        impact: "Eliminates panic crash vectors when decoding untrusted time structures sent over the network.",
      },
      {
        number: 9182,
        title: "Lightning address validation against LUD-16",
        url: "https://github.com/fedimint/fedimint/pull/9182",
        quote: "Gateway & Lightning",
        impact: "Validates lightning address halves against the LUD-16 RFC charset.",
      },
      {
        number: 9143,
        title: "fix(gateway): select mintv2 module by asset unit, not first instance",
        url: "https://github.com/fedimint/fedimint/pull/9143",
        quote: "Operator ecash endpoints pick the mintv2 module by asset unit",
        impact: "Prevents routing funds through incorrect mint modules when multi-asset federations are deployed.",
      },
    ],
  },
  {
    project: "Fedimint",
    repo: "fedimint/fedimint",
    tier: "Bitcoin Lightning & Chaumian Ecash",
    releaseTag: "v0.12.0",
    releaseName: "Second Nature",
    releaseUrl: "https://github.com/fedimint/fedimint/releases/tag/v0.12.0",
    prs: [
      {
        number: 8921,
        title: "Check both PaymentFee components against fee limits",
        url: "https://github.com/fedimint/fedimint/pull/8921",
        quote: "Gateway & Lightning – stricter fee limit verification",
        impact: "Enforces strict limits across base and proportional routing fees in Lightning payments.",
      },
    ],
  },
  {
    project: "OpenSwap",
    repo: "citadel-foss/openswap",
    tier: "Atomic Swaps & Bitcoin Privacy",
    releaseTag: "v0.2.3",
    releaseUrl: "https://github.com/citadel-foss/openswap/releases/tag/v0.2.3",
    prs: [
      {
        number: 1035,
        title: "Reject multisig redeemscripts too short to hold both pubkeys",
        url: "https://github.com/citadel-foss/openswap/pull/1035",
        quote: "Reject multisig redeemscripts too short to hold both pubkeys... | Atishyy27",
        impact: "Security fix: prevents malicious peers from crashing the maker swap thread reading proof of funding.",
      },
    ],
  },
  {
    project: "OpenTelemetry",
    repo: "open-telemetry/opentelemetry-python-contrib",
    tier: "CNCF Graduated",
    releaseTag: "v0.66b0",
    releaseUrl: "https://github.com/open-telemetry/opentelemetry-python-contrib/releases/tag/v0.66b0",
    prs: [
      {
        number: 4942,
        title: "avoid IndexError in get_operation_name for comment-only statements",
        url: "https://github.com/open-telemetry/opentelemetry-python-contrib/pull/4942",
        quote: "opentelemetry-instrumentation-psycopg2: avoid IndexError in get_operation_name",
        impact: "Prevents tracer crashes on empty or comment-only SQL statements in psycopg2.",
      },
      {
        number: 4943,
        title: "avoid IndexError in _operation_name for comment-only statements",
        url: "https://github.com/open-telemetry/opentelemetry-python-contrib/pull/4943",
        quote: "opentelemetry-instrumentation-sqlalchemy: avoid IndexError in _operation_name",
        impact: "Prevents tracer crashes on comment-only SQL queries in SQLAlchemy instrumentation.",
      },
      {
        number: 4936,
        title: "avoid IndexError in get_operation_name for Composed statements",
        url: "https://github.com/open-telemetry/opentelemetry-python-contrib/pull/4936",
        quote: "opentelemetry-instrumentation-psycopg: avoid IndexError in get_operation_name",
        impact: "Fixes crash on psycopg3 Composed statement telemetry extraction.",
      },
    ],
  },
  {
    project: "Meshery",
    repo: "meshery/meshery",
    tier: "CNCF",
    releaseTag: "v1.0.60",
    releaseUrl: "https://github.com/meshery/meshery/releases/tag/v1.0.60",
    prs: [
      {
        number: 20733,
        title: "Fix nil pointer crash in MeshSync auto-registration",
        url: "https://github.com/meshery/meshery/pull/20733",
        quote: "- [Server] Fix nil pointer crash in MeshSync auto-registration @Atishyy27 (#20733)",
        impact: "Resolves server panic during MeshSync multi-cluster cluster synchronizer handshake.",
      },
    ],
  },
  {
    project: "OpenEverest",
    repo: "openeverest/openeverest",
    tier: "Cloud Database Platform",
    releaseTag: "v2.0.0-dev.2",
    releaseUrl: "https://github.com/openeverest/openeverest/releases/tag/v2.0.0-dev.2",
    prs: [
      {
        number: 2851,
        title: "Nil pointer panic when JWT private key PEM was invalid",
        url: "https://github.com/openeverest/openeverest/pull/2851",
        quote: "- Nil pointer panic when the JWT private key PEM was invalid (#2851). (by @Atishyy27)",
        impact: "Hardens API auth gate against nil-pointer panics on malformed PEM keys.",
      },
    ],
  },
  {
    project: "UIAutomator2",
    repo: "openatx/uiautomator2",
    tier: "Mobile Automation",
    releaseTag: "3.7.1",
    releaseUrl: "https://github.com/openatx/uiautomator2/releases/tag/3.7.1",
    prs: [
      {
        number: 1195,
        title: "correct ends-with match on @content-desc in strict_xpath",
        url: "https://github.com/openatx/uiautomator2/pull/1195",
        quote: "- fix: correct ends-with match on @content-desc in strict_xpath (#1195)",
        impact: "Fixes XPath selector engine evaluation for accessibility content-description queries.",
      },
    ],
  },
  {
    project: "ServiceNow Go SDK",
    repo: "michaeldcanady/servicenow-sdk-go",
    tier: "Enterprise SDK",
    releaseTag: "v2.0.1",
    releaseUrl: "https://github.com/michaeldcanady/servicenow-sdk-go/releases/tag/v2.0.1",
    prs: [
      {
        number: 644,
        title: "restore and extend nil-receiver guard on error Error() methods",
        url: "https://github.com/michaeldcanady/servicenow-sdk-go/pull/644",
        impact: "Guards nil receivers across error formatting methods, eliminating runtime panics on empty responses.",
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
