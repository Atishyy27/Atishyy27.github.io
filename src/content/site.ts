/**
 * Single source of truth. Mirrors `me/MASTER-CV.md`.
 * No em dashes in prose (they read as machine-written). Every claim links, or says private.
 */

import { CP_PROFILES, CP_GENERATED } from "./cp";
import { OSS_STATS } from "./oss-stats";

export const person = {
  name: "Atishay Jain",
  tagline: "Systems & full-stack engineer",
  blurb:
    "Mechanical engineering undergrad at SGSITS Indore, writing software the whole way. ICPC regionalist. I build scalable systems from scratch and ship them: two government apps live on the Play Store, merged fixes in Bitcoin Lightning infrastructure, and a stack of client work across three years.",
  location: "Indore, India · open to remote",
  email: "atishayjain2708@gmail.com",
  phone: "+91 91317 21660",
  resumeHref: "/Atishay_Jain_Resume.pdf",
  domains: ["Web & App", "Systems", "Analysis", "Product engineering"],
  githubUser: "Atishyy27",
  socials: [
    { label: "GitHub", href: "https://github.com/Atishyy27" },
    { label: "LinkedIn", href: "https://linkedin.com/in/atishyy27" },
    { label: "LeetCode", href: "https://leetcode.com/u/atishayjain78001/" },
    { label: "Codeforces", href: "https://codeforces.com/profile/sethatishayjain" },
    { label: "CodeChef", href: "https://www.codechef.com/users/fever_tub_71" },
    { label: "AtCoder", href: "https://atcoder.jp/users/fever_tub_71" },
    { label: "X", href: "https://x.com/atishyy27" },
  ],
};

// The hrefs were "#cp", "#opensource" and "#work", anchors that stopped
// resolving the moment the single page became eight routes. They are routes now.
//
// "74 PRs" was here too. It matched no query: on 2026-09-30 the real figures
// were 172 opened upstream, 55 merged, 82 still open. Replaced with the merged
// count, which is smaller, true, and the one people actually weigh.
export const proof = [
  { stat: "Rank 12", label: "ICPC Mysuru on-site regionals 2025", href: "/stats/" },
  // Counted, not typed. It was "41 merged across 24 projects" by hand and the
  // real figures had already moved past it. Before that it said 55, which
  // counted two repositories that are not open-source contributions and are
  // permanently excluded; scripts/fetch-oss.mjs drops them in the query and
  // again in a filter, so this number cannot quietly pick them back up.
  {
    stat: `${OSS_STATS.merged} merged`,
    label: `pull requests into repos I do not own, across ${OSS_STATS.mergedRepos} projects`,
    href: "/oss/",
  },
  { stat: "392 users", label: "on my two Chrome extensions, Web Store, 30 Sep 2026", href: "/projects/" },
  { stat: "2 apps", label: "live on the Play Store for the MP government", href: "/projects/" },
];

// These four lines used to be typed here by hand and all four had drifted: the
// LeetCode count was 61 solves behind, both max ratings were understated and the
// AtCoder kyu was a band low. They are fetched in prebuild now, by
// scripts/gen-cp.mjs, so the page cannot be more stale than the last deploy.
export const cpProfiles: readonly {
  site: string;
  handle: string;
  rank: string;
  detail: string;
  href: string;
}[] = CP_PROFILES;

export const cpGenerated = CP_GENERATED;

export type Experience = {
  org: string;
  role: string;
  dates: string;
  place?: string;
  note?: string;
  domain?: string; // for the logo
  points?: string[];
};

export const experience: Experience[] = [
  {
    // Added 2026-10-09. The role TITLE is the one field here I did not have a
    // source for and should be corrected if it is wrong. Everything else is
    // deliberately pitched at the level of method rather than product: no
    // client names, no model names, no internal numbers, nothing unreleased.
    org: "NeoSapien",
    role: "AI Engineer Intern",
    dates: "Jun 2026 – present",
    place: "Remote / Bengaluru",
    domain: "neosapien.ai",
    points: [
      "Speech-to-text evaluation for a shipping consumer wearable: harnesses that score transcription on hard, accented, code-switched Indian audio using word error rate, character error rate and entity recall together, because a single aggregate score hides exactly the failures that matter.",
      "Characterised failures by acoustic condition rather than ranking vendors, so a result answers what to change rather than only which option scored best.",
      "Wake-word evaluation across candidate trigger phrases, measuring detection rate and false-fire rate per phrase against a fixed recording set rather than on ad-hoc clips.",
      "Firmware-side test tooling for the device, including a USB command channel for microphone, tap and radio control so hardware behaviour can be exercised without a phone in the loop.",
    ],
  },
  {
    org: "Dept. of Labour, Govt. of Madhya Pradesh",
    role: "System Analyst Intern",
    dates: "Nov 2025 – Feb 2026",
    place: "Indore, onsite",
    note: "Client: MPSEDC",
    domain: "mp.gov.in",
    points: [
      "Built e-SAHAYAK, a full-stack ecosystem in Flutter and TypeScript managing employer and worker relations and rights awareness.",
      "Found and fixed critical wage-tracking flaws in the attendance modules during UAT, before the mobile launch.",
      "Audited data parity across the staging to production deployment for Sambal 2.0, on a platform serving millions.",
    ],
  },
  {
    org: "CytoScan Intelligence Technologies",
    role: "Data Infrastructure Intern",
    dates: "Sept – Nov 2025",
    place: "Remote / Chennai",
    // Expanded 2026-10-09 by explaining the facts that were already here, not
    // by adding achievements. No new claim, no new number.
    points: [
      "Owned the preprocessing and quality-control pipeline for BraTS 2023 brain-MRI data across 1,250+ patients, the stage that decides whether anything downstream is trustworthy.",
      "Voxel intensity normalisation across scans, because MRI values are not absolute: the same tissue reads differently between scanners and sessions, so a model trained on raw intensities learns the scanner rather than the pathology.",
      "nibabel-based loaders and visualisation tooling so a bad volume could be seen rather than inferred from a loss curve, which is the difference between finding a data fault in minutes and finding it after a training run.",
      "Benchmarked the resulting pipeline against published state-of-the-art results, and cut training latency.",
    ],
  },
  {
    org: "Heizen (formerly OpenGig)",
    role: "Technical Program Manager Intern",
    dates: "Aug – Sept 2025",
    place: "Remote",
    note: "Titan Capital-backed",
    domain: "heizen.work",
    // Expanded 2026-10-09 from the facts already recorded. The three clients
    // and the 90% figure are unchanged; nothing was added to them.
    points: [
      "Translated product requirements into technical workflows and execution plans for two enterprise clients, working from briefs that were still changing while the work was being scoped.",
      "Built 0-to-1 prototypes to settle open questions early, so a disagreement about what the product should do was resolved against something runnable rather than against a document.",
      "Ran sprint and release coordination across those engagements at 90%+ on-time delivery.",
    ],
  },
  {
    org: "ABV-IIITM Gwalior · C3iHub, IIT Kanpur",
    role: "Research Intern, Federated Learning for Healthcare",
    dates: "May – Aug 2025",
    place: "Gwalior, onsite",
    domain: "iiitm.ac.in",
    // Expanded 2026-10-09 from the facts already recorded, plus the research
    // write-up this produced, which is listed under Research.
    points: [
      "Modular federated-learning pipeline over chest X-rays and electronic health records for pneumonia detection, with DenseNet and EfficientNet backbones swappable without touching the federation logic.",
      "The point of federating it is that patient data never leaves the institution that holds it: only model updates move, so the privacy constraint is structural rather than a policy someone has to honour.",
      "Hyperledger Fabric audit layer recording every model update, so a federation round cannot be altered after the fact without the record disagreeing.",
      "94.2% AUC on non-IID data, which is the hard case: each site's data is distributed differently, so a result on evenly split data would not have told us anything about deployment.",
    ],
  },
  {
    org: "Kanthariya Technologies",
    role: "Software Engineer Intern",
    dates: "Dec 2024 – Apr 2025",
    place: "Indore, onsite",
    domain: "davvincubationcentre.com",
    points: [
      "CMS platform for the DAVV University incubation centre, 100+ startups, 10K+ monthly users.",
      "GA4 analytics, SEO metadata and lead funnels, doubling onboarding engagement.",
    ],
  },
  { org: "BuilderY", role: "Engineering Intern", dates: "2025" },
  { org: "CyberShield", role: "Digital Forensics Intern", dates: "2025", note: "offer via CIIS hackathon" },
  { org: "Roomzy", role: "Developer Intern", dates: "2024", domain: "roomzy.in" },
  { org: "E-Notebook", role: "Developer Intern", dates: "2024", note: "SGSITS", domain: "sgsits.ac.in" },
  {
    // Added 2026-10-24. Deliberately carries no placement statistics, no
    // company outcomes and no student names or counts: the cell's sheets hold
    // other students' personal data and none of it belongs on a public page.
    // What is here is his own role and the things he built for it.
    org: "SGSITS Training & Placement Cell",
    role: "Placement Manager",
    dates: "Jun 2024 – present",
    place: "Indore",
    note: "Coordinator from 2024, Manager for the 2026-27 season",
    domain: "sgsits.ac.in",
    points: [
      "Point of contact for a recruiting drive on the day it runs, including the visiting HR, under the cell's one-manager-per-drive rule.",
      "Ran recruitment and mid-session reviews for the two junior batches: review panels, scheduling, and the trackers the panels actually filled in.",
      "Built the PRD Verification Tool, a Chrome extension that does the placement-registration document checks the cell was doing by hand. The TPO asked for a test run in January 2026 and it has been in use since; it is on the Chrome Web Store and in the shelf above.",
      "Built and ran the off-campus session site for the 2028 and 2029 batches, from the cell's own numbers rather than from general advice.",
    ],
  },
];

export type Work = {
  name: string;
  blurb: string;
  stack: string[];
  org?: string;
  domain?: string;
  links: { label: string; href: string }[];
  privateNote?: string;
  featured?: boolean;
  /**
   * A real image for this project, where one exists and is served by whoever
   * owns it. Play Store app icons were read off the listings on 2026-10-09.
   * Deliberately NOT a screenshot: there is no browser on the build machine,
   * so any screenshot here would be stale the moment the project changed.
   */
  image?: string;
  /**
   * Date a counted claim in `blurb` was last checked against its source, as
   * YYYY-MM-DD. Any blurb stating a number the Chrome Web Store or a platform
   * owns must carry this, because a bare "265 users" is a number that was true
   * once and silently rots afterwards. Rendered next to the claim.
   *
   * These cannot be fetched in the browser the way the GitHub and Codeforces
   * counts are: the Chrome Web Store serves no CORS-open API, so the number is
   * copied by hand and the date is what keeps it honest.
   */
  countsAsOf?: string;
};

export const govtWork: Work[] = [
  {
    name: "YES, Wellness Platform",
    org: "Ministry of Ayush, Govt. of MP",
    domain: "mp.gov.in",
    blurb:
      "State-wide wellness platform, launched by the Chief Minister of MP. I built the backend for ~5k concurrent users and killed a booking race condition with PostgreSQL row-level locking that was double-allocating slots under peak load. K6 stress testing to a sub-100ms P95.",
    stack: ["Flutter", "MERN", "C#", "AWS", "PostgreSQL"],
    image: "https://play-lh.googleusercontent.com/qU73J5mfE9i7YDE25ebbrJ3vYo0U1ZM9mKHbznvqOfivDmKwSRvPy7XUKCg1bvpKnxCxt27eCve3czT-PmLJ=s256",
    links: [{ label: "Play Store", href: "https://play.google.com/store/apps/details?id=in.gov.mp.shree.yes" }],
    featured: true,
  },
  {
    name: "SRAM",
    org: "Ministry of Labour, Govt. of MP",
    domain: "mp.gov.in",
    blurb: "Labour-department platform, shipped to the Play Store.",
    stack: ["React Native", "Django", "C#", "AWS"],
    image: "https://play-lh.googleusercontent.com/iJ2IoreKe1ayubz0bEoUURpFtwzKsxtieStg544447vodhF2VK5TIpq4RRPYe59bno_G_W1ir91jVY1_jfwOJg=s256",
    links: [{ label: "Play Store", href: "https://play.google.com/store/apps/details?id=in.gov.mp.shree.sram" }],
  },
];

export const clientWork: Work[] = [
  {
    name: "4Moral",
    blurb:
      "Production social and marketplace app. Six account types, real-time chat over sockets, orders using Mongo transactions, JWT auth, media pipeline, EC2. I also ran the pre-launch security pass, fixing NoSQL injection, IDOR and mass-assignment holes and taking dependency vulnerabilities from 21 to 9 without breaking the build.",
    stack: ["MERN", "Flutter", "AWS EC2"],
    links: [],
    privateNote: "Private client repo. Happy to walk through the architecture.",
    featured: true,
  },
  {
    name: "Genius Solar Services",
    domain: "geniussolarservices.com",
    blurb: "Marketing and lead-capture frontend for a solar installer.",
    stack: ["React"],
    links: [{ label: "Live", href: "https://geniussolarservices.com/" }],
  },
  {
    // dlab, Livehood and Logistik were three separate cards, each one line
    // long, each with no link, which read as three attempts to make the list
    // look longer. One honest line beats three thin ones. 4Moral is NOT in
    // here on purpose: it is the only private client project with a real
    // story and real numbers on it, and folding it in would delete them.
    name: "Other client work",
    blurb: "Three further client engagements under NDA: a Flutter and MERN logistics platform with live map tracking, a Flutter and MERN web and mobile build, and defect and performance work on an existing PHP and Laravel production site.",
    stack: ["Flutter", "MERN", "PHP", "Laravel"],
    links: [],
    privateNote: "Private client repositories. Happy to walk through the architecture of any of them.",
  },
  { name: "GuardianAgent Pro", org: "Skhy", blurb: "Agentic AI system.", stack: ["Agentic AI", "Python"], links: [{ label: "Code", href: "https://github.com/Atishyy27/GuardianAgent-Pro" }] },
];

export const orgWork: Work[] = [
  {
    name: "PlaceComm off-campus session",
    org: "SGSITS Training & Placement Cell",
    blurb:
      "Session site for the 2028 and 2029 batches on finding work off campus, built from the cell's own data rather than from general advice. Carries no student names, contacts or placement statistics.",
    stack: ["Static site", "Python"],
    links: [{ label: "Live", href: "https://placecom-session.vercel.app/" }],
  },
  {
    name: "SGSITS Techfest 2025",
    domain: "sgsits.ac.in",
    blurb: "The college techfest site, built with another developer against a hard public deadline. Hindi and English localisation, 3D hero, real launch-day traffic.",
    stack: ["React", "Supabase", "three.js"],
    // Checked authenticated on 2026-10-24: Atishyy27/SGSITS-techfest-2025 is
    // private, last pushed 2025-09-28. It is not deleted; GitHub returns 404
    // rather than 403 to anyone who cannot see a private repo, so the "Code"
    // badge was sending every visitor to a 404 page.
    links: [{ label: "Live", href: "https://sgsits-techfest-2025.vercel.app/" }],
    privateNote: "Repository is private. The live site is the artifact.",
  },
  {
    name: "PF Management System",
    org: "SGSITS",
    domain: "sgsits.ac.in",
    blurb: "Provident-fund system for the institute finance department. ₹1Cr+ in monthly funds, automated reconciliation, bulk imports of 10K+ records, RBAC and persistent audit logging.",
    // Listed as Angular until 2026-09-29. The repo has no angular.json and no
    // app.module.ts: Frontend/ and pwa/ are both React 18 on Vite, and the
    // default datasource in application.properties is MySQL.
    stack: ["Spring Boot", "React", "TypeScript", "MySQL", "Flyway"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/PFMS" }],
  },
  {
    name: "GS27",
    org: "SGSITS",
    domain: "sgsits.ac.in",
    blurb:
      "My first project (2023), first-year notes and past papers for SGSITS, and still the version serving today. The rebuild into a student platform (shared library across colleges, anonymous feed and groups, a Hall of Fame of student projects, a placement-cell console) is on a branch in Next.js, Supabase, Tailwind and MapLibre, and is not live yet.",
    // The shipped stack, not the rebuild's. GitHub reports the default branch
    // as 70,623 bytes of HTML, 23,070 of CSS and 105 of JavaScript, checked
    // 2026-10-24. Tagging it Next.js and Supabase described a branch the Code
    // link does not open, which is the one thing a visitor can check in a click.
    stack: ["HTML", "CSS", "JavaScript"],
    // The "Live" link to gs27.vercel.app came off on 2026-10-24. That host
    // returns HTTP 200 with valid Next.js HTML and then throws in the browser:
    // Next's own error boundary renders "This page couldn't load". Every check
    // this repo runs had passed it, because every one of them reads the status
    // code and a status code cannot see a client-side crash. A headless render
    // caught it the first time one was taken. It goes back the moment the
    // deploy works; shipping a badge that says Live to a page that errors is
    // the exact failure this site exists to avoid.
    links: [{ label: "Code", href: "https://github.com/Atishyy27/GS27" }],
  },
  { name: "DAVV Incubation Centre", domain: "davvincubationcentre.com", blurb: "CMS platform for the university incubation centre.", stack: ["WordPress"], links: [{ label: "Live", href: "https://davvincubationcentre.com/" }] },
  {
    // His word, 24 Oct 2026: he created this site. Recording the discrepancy
    // here rather than softening the claim: the live footer still reads
    // "Design and Developed by Adymade", copyright 2020, checked that day. The
    // page is his to claim and the footer is his to change on Wix; a visitor
    // who clicks will see the credit, so this comment exists so nobody
    // re-opens it as a finding without knowing it was already raised.
    name: "SGSITS Incubation Forum",
    domain: "sgsitsincubationforum.com",
    blurb: "The institute's incubation site. Built on WordPress, later migrated to Wix.",
    stack: ["WordPress", "Wix"],
    links: [{ label: "Live", href: "https://www.sgsitsincubationforum.com/" }],
  },
];

export const extensions: Work[] = [
  {
    // Added 24 Oct 2026, and corrected the same day: it IS on the Chrome Web
    // Store. The handout this was written from said submission was pending,
    // which was true when that note was written and is not true now. A second
    // source said otherwise and the store listing settled it.
    name: "sync-lis, and the mehfil jukebox",
    blurb:
      "A self-hosted LAN jukebox and the browser extension that drives it, on the Chrome Web Store with 13 users. Paste a YouTube, Spotify or SoundCloud link and it plays for everyone on the network, clock-aligned, with one shared queue and no accounts. Nobody shares a screen and nobody captures audio: the server fetches the track itself and every browser streams it from the server. Spotify audio is DRM'd and cannot be fetched, so a Spotify link is resolved through oEmbed metadata and matched on YouTube instead. Tested with four protocol suites, a chaos harness of random actions from many fake users, and a real two-browser end-to-end run with the extension loaded.",
    stack: ["Node", "WebSocket", "Chrome MV3", "yt-dlp", "ffmpeg"],
    countsAsOf: "2026-10-24",
    links: [
      { label: "Chrome Web Store", href: "https://chromewebstore.google.com/detail/sync-lis/hcpjipoofgpnenpfjddkkodbobehonlb" },
      { label: "Code", href: "https://github.com/Atishyy27/sync-lis" },
    ],
  },
  {
    name: "PRD Verification Tool",
    blurb: "PDF compression, conversion and renaming with auto-filled Google Forms. 121 users.",
    countsAsOf: "2026-10-24",
    stack: ["Chrome APIs", "JavaScript"],
    links: [{ label: "Chrome Web Store", href: "https://chromewebstore.google.com/detail/prd-verification-tool/lhebknliliiigghklkdkljobkkmbhaoj" }],
  },
  {
    name: "LeetCode Analytics",
    blurb: "CP-focused metrics injected directly into LeetCode profiles: difficulty spread, topic breakdown, trends, over their GraphQL API with no data collection. 260 users.",
    countsAsOf: "2026-10-24",
    stack: ["Chrome APIs", "GraphQL"],
    links: [
      { label: "Chrome Web Store", href: "https://chromewebstore.google.com/detail/leetcode-analytics/pcgnpclciloahjpjhhmjbalpcdmlkpba" },
      { label: "Code", href: "https://github.com/Atishyy27/leetcode-analytics" },
    ],
  },
];

/**
 * His own builds and tools, added 2026-10-24.
 *
 * These fourteen were in `cnc/Projects/PROJECTS.md` and on GitHub the whole
 * time and on this site nowhere. A diff of the ledger against the site on
 * 24 Oct 2026 found it was showing 19 of roughly 33 real builds, and the 14
 * missing public ones included the LFX work, the developer tooling and the
 * code behind the one research paper the site already cites.
 *
 * Every line below was read from the repository's own description or README
 * and each repo's visibility, language and last push were checked through the
 * GitHub API that day, not taken from the ledger: the ledger has its own
 * "CLAIMED but NOT git-verified" section and is not evidence by itself.
 */
export const ownWork: Work[] = [
  {
    name: "tripkit",
    blurb:
      "A travel guide that reads the clock. Type a town and see what is open right now, built from OpenStreetMap and Wikivoyage. No install, no account, no model: opening hours are a solved data problem and the hard part is the timezone arithmetic, not the inference.",
    stack: ["Python", "OpenStreetMap", "Overpass API", "PWA", "Static site"],
    links: [
      { label: "Live", href: "https://atishyy27.github.io/tripkit/" },
      { label: "Code", href: "https://github.com/Atishyy27/tripkit" },
    ],
  },
  {
    name: "med-flops",
    blurb:
      "The federated-learning pneumonia detector behind the research paper on this page. A modular system over chest X-rays where the data never leaves the institution holding it and only model updates move, with the model, the federation strategy and the data pipeline swappable through YAML rather than code edits.",
    stack: ["Python", "Federated learning", "PyTorch"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/med-flops" }],
  },
  {
    name: "flight-telemetry",
    blurb:
      "An offline, GPS-free flight timeline. Accelerometer and barometer fusion works out altitude and which phase of the flight you are in, which matters because GPS is the one sensor you are asked to switch off and pressure is the one that still tells you where you are vertically.",
    stack: ["Kotlin", "Android", "Sensor fusion"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/flight-telemetry" }],
  },
  {
    name: "contrails-ai",
    blurb: "Deepfake analyser that builds its evaluation set by scraping subreddits rather than using a curated benchmark, so it is scored against what people actually post.",
    stack: ["Python", "ML"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/contrails-ai" }],
  },
  {
    name: "breatheESG",
    blurb: "ESG platform that centralises emissions data and generates the sustainability reporting a business is obliged to file, with an assistant over the ledger.",
    stack: ["Python", "SaaS"],
    links: [
      { label: "Live", href: "https://breatheesg-gg71.onrender.com/" },
      { label: "Code", href: "https://github.com/Atishyy27/breatheESG" },
    ],
  },
  {
    name: "arogya, TeleMedPilot",
    blurb: "Telemedicine platform: video consultations, appointment booking, secure messaging and medical records in one place.",
    stack: ["JavaScript", "WebRTC"],
    links: [
      { label: "Live", href: "https://tele-med-pilot.vercel.app/" },
      { label: "Code", href: "https://github.com/Atishyy27/arogya" },
    ],
  },
  {
    name: "lastprep",
    blurb: "Parses a CV and turns it into last-minute interview prep: what is on the page, and what someone will ask about it.",
    stack: ["JavaScript"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/lastprep" }],
  },
];

/**
 * Tools built for other developers, rather than products for an end user.
 * Kept apart from ownWork because the audience is different and so is the
 * proof: nobody installs a CI triage script because it looks nice.
 */
export const devTools: Work[] = [
  {
    name: "claude-code-identity",
    blurb:
      "Run several Claude Code accounts on one machine with shared history, skills and agents but separate logins, plus a guard against the .claude.json corruption bug. macOS, Linux and Windows.",
    stack: ["Shell", "CLI"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/claude-code-identity" }],
  },
  {
    name: "usage-cost-plugin",
    blurb: "Claude Code plugin: a /cost command and a live status line estimating the day's token spend per model, read from local session transcripts rather than from an API.",
    stack: ["JavaScript", "Claude Code"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/usage-cost-plugin" }],
  },
  {
    name: "podman-flake-triage",
    blurb:
      "Classifies real Podman CI failures by mechanism rather than by test name. Ingests runs through the GitHub Actions API, anchors on terminal markers in the logs, and reports what recurs, because a flake that happens 40 times is one bug and a list of 40 red tests is not a finding.",
    stack: ["Python", "GitHub Actions API"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/podman-flake-triage" }],
  },
  {
    name: "kmesh-mcp-prototype",
    blurb: "MCP server prototype for Kmesh, written for LFX Term 3 against kmesh-net/kmesh#1800: four read-only tools over the status-server API, stdio transport.",
    stack: ["Go", "MCP", "CNCF"],
    links: [
      { label: "Code", href: "https://github.com/Atishyy27/kmesh-mcp-prototype" },
      { label: "The issue", href: "https://github.com/kmesh-net/kmesh/issues/1800" },
    ],
  },
  {
    name: "swiggy-mcp-toy",
    blurb: "Client for Swiggy's official MCP servers with OAuth 2.1 and PKCE, and a live tool-catalog dumper. A toy by its own label, kept because the auth flow is the real part.",
    stack: ["JavaScript", "MCP", "OAuth"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/swiggy-mcp-toy" }],
  },
];

export const hackathons: Work[] = [
  {
    name: "CIIS, Anti-money-laundering detection",
    blurb:
      "Graph neural network finding anomalous transaction clusters across 1M+ synthetic transactions, with a SHAP explainability layer so an analyst can see why a case was flagged. Team of five. Top 5 of 500+ teams (SBI, ClearTrail, MP Police), converted into an internship offer.",
    stack: ["PyTorch Geometric", "Neo4j", "FastAPI", "React"],
    links: [
      { label: "Live demo", href: "https://ciis-demo.vercel.app/" },
      { label: "Code", href: "https://github.com/Atishyy27/xai-aml" },
    ],
    featured: true,
  },
  { name: "SIH 2025, GeoYield", blurb: "Farm-yield optimisation from ISRO geospatial data. First in the college at the Smart India Hackathon internal round.", stack: ["Python", "Geospatial", "React"], links: [{ label: "Live", href: "https://geoyield.vercel.app/" }] },
  {
    // The repo is private, not deleted: GitHub answers 404 rather than 403 to
    // anyone who cannot see it, so that a response never confirms a private
    // repo exists. That is correct of GitHub and useless for a visitor, who
    // clicks "Code" and gets a 404 page. Checked authenticated on 2026-10-24:
    // Atishyy27/TruthTrack, private, last pushed 2025-02-03.
    name: "TruthTell, TruthTrack",
    blurb: "Real-time misinformation detection. Top 0.60%, 25 of 4,000+.",
    stack: ["Python", "React"],
    links: [],
    privateNote: "Repository is private. Happy to walk through it.",
  },
  {
    name: "Razorpay AI Buildathon, fraud rings",
    blurb: "Bust-out fraud-ring detector for track 02, the AI Risk Manager track. A bust-out ring looks like good customers right up until it does not, so the signal is in the group over time, not in any single account.",
    stack: ["Python", "Graph analysis"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/razorpay-buildathon-fraud-rings" }],
  },
  {
    name: "Hacker House Goa 2026, frame generator",
    blurb:
      "Task one of Hacker House Goa 2026: upload a photo, get a branded graphic in three formats. Background removal runs entirely in the browser through MediaPipe, so no photo is uploaded anywhere, and the Builder ID carries a working QR back to the tool.",
    stack: ["JavaScript", "MediaPipe", "Canvas"],
    links: [
      { label: "Live", href: "https://atishyy27.github.io/hhgoa-frame-generator/" },
      { label: "Code", href: "https://github.com/Atishyy27/hhgoa-frame-generator" },
    ],
  },
  { name: "Adobe India Hackathon 2025", blurb: "Document intelligence. Top 0.61%, 550 of 90,000+.", stack: ["Python"], links: [{ label: "Code", href: "https://github.com/Atishyy27/Adobe-1A" }] },
];

export const otherHackathons = [
  "Kriyeta (AITR)",
  "VoidHacks 6 (SVVV)",
  "HackIndore",
  "ABVP",
  "Goldman Sachs India 2025, top 2 in college",
  "NationBuilding, top 0.87%",
];

export const currentWork = {
  title: "rust-lightning (LDK), Bitcoin Lightning infrastructure",
  since: "Jan 2026",
  detail:
    "Fuzzing and CI infrastructure. Cross-version serialization coverage using isolated multi-version dependencies to validate ChannelMonitor compatibility, and state-shifting encoding that lets concurrent channel monitors be reload-tested independently during mid-fuzz node restarts, which surfaced state asymmetries upstream.",
  badge: "Summer of Bitcoin 2026 Qualifier",
};

export const ossPrograms = ["GSSoC 2024 Extd, rank 312, top 3.8%", "CCE"];

/**
 * Research and published data.
 *
 * This section was three rows on 24 Oct 2026 and two of them were placeholders:
 * "Research paper, second work / In progress" and "Kaggle dataset / Published
 * dataset", neither with a title or a link. A section that announces it has
 * nothing is worse than no section, and it is a large part of why the page
 * read as empty while the work behind it was real: one dataset with 30
 * downloads was on Kaggle the whole time under a profile the site never named.
 *
 * Rule for this list, same as everywhere else here: a row states what the
 * thing is, where it is, and a number someone can check. Nothing that is "in
 * progress" goes on a public page until it exists.
 */
export const publications = [
  {
    title: "Blockchain-Secured Federated Learning for Multi-Modal Healthcare",
    detail:
      "Privacy-preserving pneumonia detection over chest X-rays and electronic health records, with a Hyperledger Fabric audit layer so a federation round cannot be altered after the fact. 94.2% AUC on non-IID data. Presented at the IIITM Gwalior research symposium.",
    href: "",
  },
  {
    // Everything here was read off the Kaggle API on 2026-10-24, not from
    // memory: ref atzjit/synthetic-sign-classifier-dataset.
    title: "Synthetic Sign Classifier Dataset",
    detail:
      "A synthetic, augmented image dataset for multi-class sign classification, 258.7 MB, published under CC BY 4.0 on 17 June 2025. 30 downloads and 5 votes as of 24 October 2026. Generated rather than collected, which is the point: the classes that matter are the rare ones, and a scraped set never has enough of them.",
    href: "https://www.kaggle.com/datasets/atzjit/synthetic-sign-classifier-dataset",
  },
];

export const education = {
  school: "Shri G. S. Institute of Technology & Science, Indore",
  note: "One of India's top GFTIs",
  degree: "B.Tech Mechanical Engineering, Minor in Machine Learning",
  dates: "Sept 2023 – July 2027",
  domain: "sgsits.ac.in",
};

export const skills = [
  { group: "Languages", items: ["Java", "Python", "TypeScript", "JavaScript", "C/C++", "Rust", "C#", "SQL", "Bash"] },
  { group: "Web & backend", items: ["React", "Next.js", "Node / Express", "Spring Boot", "Django", "FastAPI", "Laravel", "PostgreSQL", "MongoDB", "MySQL", "Supabase"] },
  { group: "Mobile", items: ["Flutter", "React Native"] },
  { group: "ML & data", items: ["PyTorch", "PyTorch Geometric", "Flower (FL)", "SHAP", "Neo4j", "MLflow"] },
  { group: "Infra", items: ["Docker", "GitHub Actions", "Linux", "AWS", "OCI", "Prometheus", "Grafana", "K6"] },
  { group: "Other", items: ["Blockchain / Solidity", "Hyperledger Fabric", "three.js", "Figma"] },
];

export const about = [
  "I'm on a mechanical engineering degree and I've spent it writing software. That started as stubbornness and turned into the useful part. I don't have a lane I'm defending, so I go wherever the interesting problem is, Rust fuzzing infrastructure one month, a payments race condition the next.",
  "What I actually care about is building scalable systems from scratch. That has meant government platforms on the Play Store, a provident-fund system moving over a crore a month, client backends in production, and two Chrome extensions people installed without being asked to.",
  "For a while I contributed to open source the wide way, pull requests across a dozen projects at once. It taught me a lot and landed little. So I narrowed. Since January I've been in rust-lightning, on fuzzing and CI infrastructure, where the review bar is high and the code ships to people running Bitcoin nodes.",
];
