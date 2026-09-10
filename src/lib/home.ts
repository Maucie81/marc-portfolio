/**
 * Homepage content.
 *
 * Yahoo Partner Portal copy is sourced from the YPP narrative draft and is
 * accurate. Everything else marked `draft: true` is scaffolding written to the
 * right shape and length — replace with real copy before this goes public.
 */

export type Project = {
  company: string;
  title: string;
  description: string;
  href: string | null;
  image:
    | {
        src: string;
        alt: string;
        /** Intrinsic pixel dimensions of the exported asset — the device
         * bezel (border + corner radius) is baked into these pixels, not
         * drawn in CSS, so every card uses identical markup regardless of
         * each mockup's own aspect ratio in Figma. */
        width: number;
        height: number;
      }
    | null;
  imageLabel: string;
  skills: string[];
  draft?: boolean;
};

export const projects: Project[] = [
  {
    company: "Yahoo",
    title: "Partner Portal",
    description:
      'Yahoo\'s partner portal had stagnated in "Keep Lights On" mode, leaving 8,700+ media partners without the tools to understand how their content was performing on Yahoo. This project set out to change that.',
    href: "/work/yahoo-partner-portal",
    image: {
      src: "/yahoo/thumbnail.webp",
      alt: "Screenshot of the Yahoo Partner Portal analytics overview dashboard, with the device bezel baked into the image",
      width: 1530,
      height: 876,
    },
    imageLabel: "",
    skills: [
      "Publisher Tooling",
      "Data Visualization",
      "UX Research",
      "Partner Ecosystems",
      "AI Prototyping",
    ],
  },
  {
    company: "Headspace",
    title: "Admin Portal Redesign",
    description:
      "Headspace's B2B Admin Portal had become antiquated. When a merger with Ginger introduced a second internal platform, the gap between what Admins needed and what existed became impossible to ignore.",
    href: "/work/headspace-admin-portal",
    image: {
      src: "/headspace/thumbnail.webp",
      alt: "Screenshot of the Headspace enrollment eligibility screen from the Unified Main Door admin portal, with the device bezel baked into the image",
      width: 1548,
      height: 882,
    },
    imageLabel: "",
    skills: [
      "B2B Platform",
      "Design Systems",
      "Retention",
      "UX Research",
      "Roadmap Prioritization",
    ],
  },
  {
    company: "Airbnb",
    title: "Account Creation & Onboarding",
    description:
      "Airbnb's acquisition of HotelTonight brought a new class of partner onto the platform: professional hospitality businesses with onboarding needs that the existing host flow wasn't built for.",
    href: "/work/airbnb-hotels",
    image: {
      src: "/airbnb/thumbnail.webp",
      alt: "Figma mockup of the Airbnb hotel partner account creation and onboarding flow, showing the welcome screen with a Get started button",
      width: 1545,
      height: 882,
    },
    imageLabel: "",
    skills: [
      "Onboarding Design",
      "Design Systems",
      "User Research/Testing",
      "B2B Partnerships",
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
    company: "Yahoo",
    title: "Data Viz & Design System",
    description:
      "The charting and data visualization system built for the Partner Portal, along with the design system it runs on — built on a shared CMS foundation used across the platform.",
    href: "/work/yahoo-partner-portal",
  },
  {
    company: "Headspace",
    title: "Unified Main Door",
    description:
      "The cross-functional initiative that gave Headspace and Ginger's separately-built products one shared front door — eligibility and enrollment unified into a single flow for the first time.",
    href: "/work/headspace-health-umd",
  },
  {
    company: "Personal",
    title: "Harrison's App",
    description:
      "A post-op medication tracker I built for my dog using AI-assisted development. Because the timing logic was genuinely hard to get right by hand.",
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
  draft?: boolean;
};

/** Tooling/Skills panel pinned beside the Experience list (177:112200) — a
 * fixed curated set, not derived from the roles below. */
export const experienceTooling = [
  "Cursor",
  "Figma",
  "GitHub",
  "Vercel",
  "Dscout",
  "ECharts",
];

export const experienceSkills = [
  "Design-to-Code Prototyping",
  "User Research",
  "Systems Design",
  "Data Visualization",
  "Design Systems",
  "Onboarding Design",
  "Roadmap Prioritization",
];

export const roles: Role[] = [
  {
    company: "Yahoo",
    title: "Principal Product Designer, Platform",
    period: "2024 — 2026",
    intro:
      "Conceived and led the YPP Design-to-Engineering Pilot, a formal AI-assisted prototyping program that embedded design directly into the production codebase using Cursor and Claude. Built 13 production-adjacent dashboard pages with real components, defined a four-tier AI maturity model for the org, and established a collaboration framework between design and engineering that had never existed before.",
    description:
      "Sole design lead on the Partner Portal serving 8,700+ media partners including Gannett, Business Insider, and Penske. Ran two phases of publisher UXR that directly reshaped the roadmap, made the scoping call to focus a sprawling self-service platform into a targeted analytics product, and shipped capabilities competitors hadn't built: feed diagnostics and discovery source breakdowns that let publishers understand exactly why content underperformed.",
    tags: [
      "B2B platform",
      "Publisher tooling",
      "Data visualization",
      "Research",
    ],
  },
  {
    company: "Headspace",
    title: "Senior Product Designer",
    period: "2022 — 2023",
    intro:
      "Designed enterprise wellness products for Fortune 500 partners, balancing what employers needed to administer the benefit with what employees actually needed to use it.",
    description:
      "Led a 17-interview stakeholder study and a 147-respondent Admin survey that both fed directly into the roadmap. Partner adoption up 15%, retention up 10%, support requests down 25%.",
    tags: [
      "B2B platform",
      "Enterprise",
      "Design systems",
      "Retention",
      "Research",
    ],
  },
  {
    company: "Airbnb",
    title: "Experience Designer",
    period: "2019 — 2020",
    intro:
      "Led design for hotel partner onboarding as Airbnb expanded into professional hospitality after the HotelTonight acquisition.",
    description:
      "Three rounds of usability testing with properties from boutique hotels to 200+ room chains. Launched Q1 2020. Onboarding time down 30–40%, setup errors down ~25%, partner CSAT up ~15 points.",
    tags: ["Onboarding", "Self-service", "Partnerships"],
  },
  {
    company: "Hotel Tonight",
    title: "Product Designer",
    period: "2017 — 2019",
    intro:
      "Sole designer across web and mobile during a brand evolution that repositioned HotelTonight from a discount last-minute booking app toward a more premium experience.",
    description:
      "Led the iOS app redesign, conducted user research to surface booking flow friction, and maintained the design system across both platforms. This is where most of my consumer product instincts were built: tight feedback loops, opinionated visual design, and designing for someone making a fast personal decision rather than an administrative one.",
    tags: ["Design systems", "Mobile", "Booking flows", "iOS", "Brand alignment"],
  },
  {
    company: "Stitch Fix",
    title: "UX Designer",
    period: "2015 — 2017",
    intro:
      "Redesigned the referral program, driving a 52% increase in referred customers.",
    description:
      "Built a Reason Codes system for Customer Care that systematically tracked why customers paused or cancelled subscriptions, turning anecdotal support data into retention signal the product team could act on. Delivered across web and mobile with consistent brand execution throughout.",
    tags: ["Growth", "Referral mechanics", "Retention tooling"],
  },
];

export const contact = {
  email: "marcfavro@gmail.com",
  phone: "916-202-6702",
  resume:
    "https://drive.google.com/file/d/1eH-USxlLh24SYEIUtEZJGOLgwV_v7qrQ/view?usp=share_link",
  linkedin: "https://linkedin.com/in/marcfavro",
};
