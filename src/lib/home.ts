/**
 * Homepage content.
 *
 * Yahoo Partner Portal copy is sourced from the YPP narrative draft and is
 * accurate. Everything else marked `draft: true` is scaffolding written to the
 * right shape and length — replace with real copy before this goes public.
 */

export type SubFeature = { title: string; description: string };

export type Project = {
  company: string;
  title: string;
  description: string;
  href: string | null;
  image: { src: string; alt: string; width: number; height: number } | null;
  imageLabel: string;
  subFeatures: SubFeature[];
  draft?: boolean;
};

export const projects: Project[] = [
  {
    company: "Yahoo",
    title: "Partner Portal",
    description:
      "A self-service portal for 8,700+ media partners that replaced a legacy reporting tool and a manually-maintained spreadsheet. Sole design credit from the first concept deck through launch.",
    href: "/work/yahoo-partner-portal",
    image: null,
    imageLabel: "",
    subFeatures: [
      {
        title: "Content Vitals",
        description:
          "Feed health built for firefighting, not monitoring — warnings and failures sorted by impact, with drill-down to the exact item.",
      },
      {
        title: "Multi-tenant rollups",
        description:
          "Business → brand → license navigation, including the license-level filter that came directly out of a partner research session.",
      },
      {
        title: "Two-tier access",
        description:
          "Admin and read-only with identical data access. The difference is who can invite — enough to unblock self-serve invites at launch.",
      },
    ],
  },
  {
    company: "Airbnb",
    title: "Account Creation & Onboarding",
    description:
      "Lead designer on hotel partner onboarding — a six-step manual, sales-assisted process redesigned into a self-service flow built on existing Airbnb infrastructure. Launched Q1 2020; vertical deprioritized after COVID-19.",
    href: "/work/airbnb-hotels",
    image: null,
    imageLabel: "",
    subFeatures: [
      {
        title: "Systems audit",
        description:
          "Found Airbnb Signup, Luxury Retreats onboarding, and Hubble as reusable infrastructure — no net-new systems required.",
      },
      {
        title: "Three rounds of testing",
        description:
          "5–10 hotels per round across multiple cities and roles — Revenue Managers, Front Desk Agents, Marketing Managers.",
      },
      {
        title: "Honest outcome",
        description:
          "Launched on schedule. COVID-19 hit. Hotels team deprioritized. No post-launch usage data collected.",
      },
    ],
  },
  {
    company: "Headspace",
    title: "Admin Portal Redesign",
    description:
      "A research-driven proposal for the next phase of Headspace's B2B Admin Portal — a prioritized roadmap and wireframe explorations built on 17 stakeholder interviews and a 147-respondent Admin survey, presented to leadership in Q1 2022.",
    href: "/work/headspace-admin-portal",
    image: null,
    imageLabel: "",
    subFeatures: [
      {
        title: "17-stakeholder research",
        description:
          "12 interviews spanning Admins, PSMs, Engineering, Data/Analytics, and Ginger — 167 discrete data points logged and cross-checked.",
      },
      {
        title: "The first direct Admin survey",
        description:
          "700 Admins surveyed, 147 responses — a strong rate for an unincentivized survey, broken out by company size with a Kano-style framework.",
      },
      {
        title: "Honest outcome",
        description:
          "Presented to leadership Q1 2022, well received. Phase 0 began rolling out after — but this was a roadmap and wireframe deliverable, not a shipped product.",
      },
    ],
  },
];

export type SmallProject = {
  company: string;
  title: string;
  description: string;
  href: string | null;
  draft?: boolean;
};

export const additionalWorkIntro =
  "Shorter engagements and internal work that didn't warrant a full case study, but shaped how I approach the bigger ones.";

export const additionalWork: SmallProject[] = [
  {
    company: "Hotel Tonight",
    title: "Perks",
    description:
      "A loyalty and rewards layer for last-minute bookers, built to reward frequency without a points economy.",
    href: "/case-studies/ht-perks",
    draft: true,
  },
  {
    company: "Yahoo",
    title: "Creator Onboarding",
    description:
      "313 Yahoo Creator accounts brought onto the Partner Portal platform through a one-time backfill the day after launch.",
    href: null,
  },
  {
    company: "Headspace",
    title: "Unified Enrollment",
    description:
      "The web enrollment experience for the first product shipped after the Headspace–Ginger acquisition — eligibility through a booked coaching session.",
    href: "/work/headspace-health-umd",
  },
  {
    company: "StitchFix",
    title: "Styling Tools",
    description:
      "Placeholder — internal tooling for the people doing the styling work.",
    href: null,
    draft: true,
  },
];

export type Role = {
  company: string;
  title: string;
  period: string;
  /** Always visible, collapsed or not — per the Figma row (177:112148). */
  intro: string;
  /** Revealed on expand (177:112150). */
  description: string;
  tags: string[];
  tooling: string[];
  category: string[];
  draft?: boolean;
};

export const roles: Role[] = [
  {
    company: "Yahoo",
    title: "Principal Product Designer, Platform",
    period: "2024 — 2026",
    intro:
      "Sole design credit on Yahoo Partner Portal, from the earliest strategic deck through public launch to 8,700+ media partners in June 2026.",
    description:
      "The brief was open-ended: imagine how the Yahoo brand could be expressed in a B2B context. Owned the scoping argument that cut a full self-service B2B platform down to an analytics dashboard, the information architecture that replaced a confusing four-level hierarchy with business → brand → source, and a two-phase research program with eleven publishers. Shipped on a unified codebase serving both external partners and internal Yahoo admins.",
    tags: [
      "B2B platform",
      "Legacy modernization",
      "Data visualization",
      "Multi-tenant",
      "Research program",
      "Design systems",
    ],
    tooling: ["Figma", "ECharts", "Next.js", "Tailwind", "Auth0", "Confluence"],
    category: [
      "Enterprise B2B",
      "Analytics & reporting",
      "Publisher tooling",
      "Internal admin",
    ],
  },
  {
    company: "Headspace",
    title: "Staff Product Designer",
    period: "2020 — 2023",
    intro:
      "Placeholder — one or two sentences that stand on their own with the row collapsed.",
    description:
      "Placeholder — a paragraph on scope, the teams you worked across, the problems you owned and what changed as a result. Same shape as the Yahoo entry above.",
    tags: ["Health & wellness", "Internal tooling", "Design systems"],
    tooling: ["Figma", "Add tooling"],
    category: ["Consumer", "Internal admin"],
    draft: true,
  },
  {
    company: "Airbnb",
    title: "Product Designer",
    period: "2019 — 2020",
    intro:
      "Placeholder — one or two sentences that stand on their own with the row collapsed.",
    description:
      "Placeholder — scope, teams, problems owned, outcomes. Account creation and onboarding sat here.",
    tags: ["Marketplace", "Onboarding", "Growth"],
    tooling: ["Figma", "Add tooling"],
    category: ["Consumer", "Identity & trust"],
    draft: true,
  },
  {
    company: "Hotel Tonight",
    title: "Product Designer",
    period: "2017 — 2019",
    intro:
      "Placeholder — one or two sentences that stand on their own with the row collapsed.",
    description:
      "Placeholder — scope, teams, problems owned, outcomes. Perks and the loyalty work sat here.",
    tags: ["Travel", "Loyalty", "Mobile"],
    tooling: ["Figma", "Add tooling"],
    category: ["Consumer", "Marketplace"],
    draft: true,
  },
  {
    company: "StitchFix",
    title: "Product Designer",
    period: "2015 — 2017",
    intro:
      "Placeholder — one or two sentences that stand on their own with the row collapsed.",
    description:
      "Placeholder — scope, teams, problems owned, outcomes. Internal styling tools sat here.",
    tags: ["Retail", "Internal tooling", "Operations"],
    tooling: ["Sketch", "Add tooling"],
    category: ["E-commerce", "Internal admin"],
    draft: true,
  },
];

/**
 * 177:112231 — each category is a Playfair display tab; selecting one swaps
 * the body copy and its three image boxes. Category names and copy are mine;
 * Figma has four tabs all labelled "Category".
 */
export type InterestCategory = {
  name: string;
  description: string;
  /** Three boxes per category (177:112242, 112244, 112246). */
  imageCount: number;
};

export const interestCategories: InterestCategory[] = [
  {
    name: "Photography",
    description:
      "Placeholder — a short paragraph on what draws you to this, and what you're usually shooting. Replace with real copy.",
    imageCount: 3,
  },
  {
    name: "Brooklyn",
    description:
      "Placeholder — a short paragraph on the neighbourhood and what keeps you there. Replace with real copy.",
    imageCount: 3,
  },
  {
    name: "Cooking",
    description:
      "Placeholder — a short paragraph on what you cook and why it matters to you. Replace with real copy.",
    imageCount: 3,
  },
  {
    name: "Cycling",
    description:
      "Placeholder — a short paragraph on the riding you do and where it takes you. Replace with real copy.",
    imageCount: 3,
  },
];

export const contact = {
  email: "marcfavro@gmail.com",
  phone: "916-202-6702",
  resume:
    "https://drive.google.com/file/d/1eH-USxlLh24SYEIUtEZJGOLgwV_v7qrQ/view?usp=share_link",
  linkedin: "https://linkedin.com/in/marcfavro",
};
