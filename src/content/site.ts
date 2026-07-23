/**
 * Single source of truth. Mirrors `me/MASTER-CV.md`.
 * No em dashes in prose (they read as machine-written). Every claim links, or says private.
 */

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

export const proof = [
  { stat: "Rank 12", label: "ICPC Mysuru on-site regionals 2025", href: "#cp" },
  { stat: "74 PRs", label: "opened across open-source infrastructure", href: "#opensource" },
  { stat: "2 apps", label: "live on the Play Store for the MP government", href: "#work" },
];

export const cpProfiles = [
  { site: "LeetCode", handle: "atishayjain78001", rank: "Knight", detail: "947 solved, peak 1860", href: "https://leetcode.com/u/atishayjain78001/" },
  { site: "Codeforces", handle: "sethatishayjain", rank: "Specialist", detail: "max 1524", href: "https://codeforces.com/profile/sethatishayjain" },
  { site: "CodeChef", handle: "fever_tub_71", rank: "4 star", detail: "max 1805", href: "https://www.codechef.com/users/fever_tub_71" },
  { site: "AtCoder", handle: "fever_tub_71", rank: "Kyu 7", detail: "max 546", href: "https://atcoder.jp/users/fever_tub_71" },
];

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
    points: [
      "Built the preprocessing and quality-control pipeline over BraTS 2023 MRI data, 1,250+ patients, benchmarked against SOTA.",
      "Wrote nibabel loaders and visualisation tooling, normalised voxel intensity, and cut training latency.",
    ],
  },
  {
    org: "Heizen (formerly OpenGig)",
    role: "Technical Program Manager Intern",
    dates: "Aug – Sept 2025",
    place: "Remote",
    note: "Titan Capital-backed",
    domain: "heizen.work",
    points: [
      "Turned product requirements into technical workflows and execution plans for 3 enterprise clients, building 0-to-1 prototypes under heavy ambiguity.",
      "Coordinated sprints and releases at 90%+ on-time delivery.",
    ],
  },
  {
    org: "ABV-IIITM Gwalior · C3iHub, IIT Kanpur",
    role: "Research Intern, Federated Learning for Healthcare",
    dates: "May – Aug 2025",
    place: "Gwalior, onsite",
    domain: "iiitm.ac.in",
    points: [
      "Modular federated-learning pipeline with DenseNet and EfficientNet for pneumonia detection across chest X-rays and EHR data.",
      "Blockchain audit layer on Hyperledger Fabric for tamper-proof model-update logging. 94.2% AUC on non-IID data.",
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
  { org: "Roomzy", role: "Developer Intern", dates: "2024" },
  { org: "E-Notebook", role: "Developer Intern", dates: "2024", note: "SGSITS", domain: "sgsits.ac.in" },
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
};

export const govtWork: Work[] = [
  {
    name: "YES, Wellness Platform",
    org: "Ministry of Ayush, Govt. of MP",
    domain: "mp.gov.in",
    blurb:
      "State-wide wellness platform, launched by the Chief Minister of MP. I built the backend for ~5k concurrent users and killed a booking race condition with PostgreSQL row-level locking that was double-allocating slots under peak load. K6 stress testing to a sub-100ms P95.",
    stack: ["Flutter", "MERN", "C#", "AWS", "PostgreSQL"],
    links: [{ label: "Play Store", href: "https://play.google.com/store/apps/details?id=in.gov.mp.shree.yes" }],
    featured: true,
  },
  {
    name: "SRAM",
    org: "Ministry of Labour, Govt. of MP",
    domain: "mp.gov.in",
    blurb: "Labour-department platform, shipped to the Play Store.",
    stack: ["React Native", "Django", "C#", "AWS"],
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
  { name: "dlab", blurb: "Full-stack web and mobile build.", stack: ["Flutter", "MERN"], links: [], privateNote: "Private client repo." },
  { name: "Livehood", blurb: "Fixed core defects and optimised an existing production site.", stack: ["PHP", "Laravel"], links: [], privateNote: "Private client work." },
  { name: "GuardianAgent Pro", org: "Skhy", blurb: "Agentic AI system.", stack: ["Agentic AI", "Python"], links: [{ label: "Code", href: "https://github.com/Atishyy27/GuardianAgent-Pro" }] },
  { name: "Logistik", blurb: "Logistics platform with real-time tracking over maps.", stack: ["Flutter", "MERN"], links: [], privateNote: "Private client repo." },
];

export const orgWork: Work[] = [
  {
    name: "SGSITS Techfest 2025",
    domain: "sgsits.ac.in",
    blurb: "The college techfest site, built with another developer against a hard public deadline. Hindi and English localisation, 3D hero, real launch-day traffic.",
    stack: ["React", "Supabase", "three.js"],
    links: [
      { label: "Live", href: "https://sgsits-techfest-2025.vercel.app/" },
      { label: "Code", href: "https://github.com/Atishyy27/SGSITS-techfest-2025" },
    ],
  },
  {
    name: "PF Management System",
    org: "SGSITS",
    domain: "sgsits.ac.in",
    blurb: "Provident-fund system for the institute finance department. ₹1Cr+ in monthly funds, automated reconciliation, bulk imports of 10K+ records, RBAC and persistent audit logging.",
    stack: ["Spring Boot", "Angular", "MySQL"],
    links: [{ label: "Code", href: "https://github.com/Atishyy27/PFMS" }],
  },
  { name: "DAVV Incubation Centre", domain: "davvincubationcentre.com", blurb: "CMS platform for the university incubation centre.", stack: ["WordPress"], links: [{ label: "Live", href: "https://davvincubationcentre.com/" }] },
  { name: "SGSITS Incubation Forum", domain: "sgsitsincubationforum.com", blurb: "Built on WordPress, later migrated to Wix.", stack: ["WordPress", "Wix"], links: [{ label: "Live", href: "https://www.sgsitsincubationforum.com/" }] },
];

export const extensions: Work[] = [
  {
    name: "PRD Verification Tool",
    blurb: "PDF compression, conversion and renaming with auto-filled Google Forms. 150 users.",
    stack: ["Chrome APIs", "JavaScript"],
    links: [{ label: "Chrome Web Store", href: "https://chromewebstore.google.com/detail/prd-verification-tool/lhebknliliiigghklkdkljobkkmbhaoj" }],
  },
  {
    name: "LeetCode Analytics",
    blurb: "CP-focused metrics injected directly into LeetCode profiles: difficulty spread, topic breakdown, trends, over their GraphQL API with no data collection. 130 users.",
    stack: ["Chrome APIs", "GraphQL"],
    links: [
      { label: "Chrome Web Store", href: "https://chromewebstore.google.com/detail/leetcode-analytics/pcgnpclciloahjpjhhmjbalpcdmlkpba" },
      { label: "Code", href: "https://github.com/Atishyy27/leetcode-analytics" },
    ],
  },
];

export const hackathons: Work[] = [
  {
    name: "CIIS, Anti-money-laundering detection",
    blurb:
      "Graph neural network finding anomalous transaction clusters across 1M+ records, with a SHAP explainability layer so an analyst can see why a case was flagged. Top 5 of 500+ teams (SBI, ClearTrail, MP Police), converted into an internship offer.",
    stack: ["PyTorch Geometric", "Neo4j", "FastAPI", "React"],
    links: [
      { label: "Live demo", href: "https://ciis-demo.vercel.app/" },
      { label: "Code", href: "https://github.com/Atishyy27/xai-aml" },
    ],
    featured: true,
  },
  { name: "SIH 2025, GeoYield", blurb: "Farm-yield optimisation from ISRO geospatial data.", stack: ["Python", "Geospatial", "React"], links: [{ label: "Live", href: "https://geoyield.vercel.app/" }] },
  { name: "TruthTell, TruthTrack", blurb: "Real-time misinformation detection. Top 0.60%, 25 of 4,000+.", stack: ["Python", "React"], links: [{ label: "Code", href: "https://github.com/Atishyy27/TruthTrack" }] },
  { name: "Adobe India Hackathon 2025", blurb: "Document intelligence. Top 0.66%, 550 of 90,000+.", stack: ["Python"], links: [{ label: "Code", href: "https://github.com/Atishyy27/Adobe-1A" }] },
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

export const publications = [
  { title: "Blockchain-Secured Federated Learning for Multi-Modal Healthcare", detail: "Privacy-preserving pneumonia detection. Presented at the IIITM Gwalior research symposium.", href: "" },
  { title: "Research paper, second work", detail: "In progress.", href: "" },
  { title: "Kaggle dataset", detail: "Published dataset.", href: "" },
];

export const education = {
  school: "Shri G. S. Institute of Technology & Science, Indore",
  note: "One of India's top GFTIs",
  degree: "B.Tech Mechanical Engineering, Minor in Machine Learning",
  cgpa: "CGPA 7.75, Minor 8.00",
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
