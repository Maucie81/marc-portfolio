/**
 * Homepage content.
 *
 * Yahoo Partner Portal copy is sourced from the YPP narrative draft and is
 * accurate. Everything else marked `draft: true` is scaffolding written to the
 * right shape and length — replace with real copy before this goes public.
 */

export type ProjectMeta = { label: string; value: string };

export type Project = {
  company: string;
  title: string;
  description: string;
  href: string | null;
  image: { src: string; alt: string; width: number; height: number } | null;
  imageLabel: string;
  meta: ProjectMeta[];
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
    meta: [
      { label: "Role", value: "Principal Product Designer" },
      { label: "Timeline", value: "2024–2026" },
      { label: "Platform", value: "Web" },
      { label: "Industry", value: "Media / Publishing" },
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
    meta: [
      { label: "Role", value: "Experience Designer" },
      { label: "Timeline", value: "2019–2020" },
      { label: "Platform", value: "Web" },
      { label: "Industry", value: "Hospitality / Travel" },
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
    meta: [
      { label: "Role", value: "Senior Product Designer" },
      { label: "Timeline", value: "2022" },
      { label: "Platform", value: "Web" },
      { label: "Industry", value: "Health & Wellness" },
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
    period: "2023 — 2026",
    intro:
      "Sole design lead on Partner Portal redesign serving 8,700+ media partners — including enterprise publishers like Gannett, Business Insider, and Penske.",
    description:
      "Owned the scoping argument that cut a full self-service platform down to a focused analytics dashboard, and conducted a two-phase UXR program with eleven publishers that directly reshaped roadmap priorities. Shipped differentiated capabilities competitors lacked: code-level feed diagnostics and discovery source overlays that let publishers pinpoint why content underperformed. Outcomes: satisfaction lifted from 22% to \"clean, intuitive, and massive improvement\"; support tickets reduced by ~70%; –42% CTR gap closed through research-backed design.",
    tags: [
      "B2B platform",
      "Publisher tooling",
      "Data visualization",
      "Research",
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
    title: "Senior Product Designer",
    period: "2022 — 2023",
    intro:
      "Built retention and adoption into enterprise wellness products for Fortune 500 partners by translating partner and user research into scalable design solutions.",
    description:
      "Led UXR across 17 stakeholder interviews and a 147-respondent Admin survey that reshaped the product roadmap, and consolidated the design system across web and mobile to ensure consistency as the platform scaled. Outcomes: 15% increase in enterprise partner adoption; 8–12% retention lift in pilot rollouts; 25% reduction in support tickets through clearer onboarding and role-based access.",
    tags: [
      "B2B platform",
      "Enterprise",
      "Design systems",
      "Retention",
      "Research",
    ],
    tooling: ["Figma", "Add tooling"],
    category: ["Consumer", "Internal admin"],
  },
  {
    company: "Airbnb",
    title: "Experience Designer",
    period: "2019 — 2020",
    intro:
      "Led design for hotel partner onboarding as Airbnb expanded into professional hospitality — redesigning a six-step, manual sales-assisted process into fully self-service.",
    description:
      "Audited legacy systems and reused existing Airbnb infrastructure rather than building new; conducted three rounds of user testing with boutique properties and 200+ room chains across NYC, LA, Vegas, and Mexico City. Launched Q1 2020. Outcomes: 30–40% reduction in setup time; ~25% fewer errors; ~15-point CSAT improvement from hotel partners during testing. Project was subsequently deprioritized post-COVID.",
    tags: ["Onboarding", "Self-service", "Partnerships"],
    tooling: ["Figma", "Add tooling"],
    category: ["Consumer", "Identity & trust"],
  },
  {
    company: "Hotel Tonight",
    title: "Product Designer",
    period: "2017 — 2019",
    intro:
      "Sole product designer owning web and mobile design systems during a critical brand evolution.",
    description:
      "Led the iOS app redesign to reflect updated brand values, conducted user research to surface booking flow friction, and worked cross-functionally with Product and Engineering to deliver cohesive features. This role established my foundation in design systems thinking and cross-functional advocacy at scale across platforms.",
    tags: ["Design systems", "Mobile", "Booking flows", "iOS", "Brand alignment"],
    tooling: ["Figma", "Add tooling"],
    category: ["Consumer", "Marketplace"],
  },
  {
    company: "Stitch Fix",
    title: "UX Designer",
    period: "2015 — 2017",
    intro:
      "Led referral program redesign that drove a 52% increase in referred customers.",
    description:
      "Designed a \"Reason Codes\" system for Customer Care to systematically track subscription adjustments and cancellations, surfacing retention patterns that informed product strategy. Delivered production-ready designs across web and mobile, ensuring consistent brand experience across both customer and referrer journeys.",
    tags: ["Growth", "Referral mechanics", "Retention tooling"],
    tooling: ["Sketch", "Add tooling"],
    category: ["E-commerce", "Internal admin"],
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
