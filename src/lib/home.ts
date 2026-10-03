/**
 * Homepage content. Copy follows the approved homepage Figma (Portfolio-
 * Playground 215:205616); facts, routes and destinations are the live
 * site's.
 */

export type Project = {
  company: string;
  title: string;
  /** Figma breaks the description at a fixed point on desktop; below lg the
   * lines run together and wrap freely. */
  description: string[];
  href: string | null;
  /** The device mockup, exported from the Figma card (bezel and screen
   * baked in). `box` is where it sits in the 714 × 412 grid panel. */
  mockup: {
    src: string;
    alt: string;
    width: number;
    height: number;
    box: { x: number; y: number; w: number; h: number };
  };
  /** Which side the mockup sits on at desktop — the cards alternate. */
  media: "right" | "left";
  /** Figma tops out the first card's copy against its panel and centers the
   * other two. */
  copyAlign: "start" | "center";
  /** Project-specific production metadata under the panel. */
  skills: string[];
};

export const projects: Project[] = [
  {
    company: "Yahoo",
    title: "Partner portal",
    description: [
      "Helping 8,700+ media partners understand",
      "how their content performs on Yahoo.",
    ],
    href: "/work/yahoo-partner-portal",
    mockup: {
      src: "/yahoo/home-mockup.webp",
      alt: "The Yahoo Partner Portal analytics overview dashboard on a tablet",
      width: 1680,
      height: 1074,
      box: { x: 77, y: 28, w: 559.64, h: 358 },
    },
    media: "right",
    copyAlign: "start",
    skills: [
      "Publisher tooling",
      "Data visualization",
      "User research",
      "AI prototyping",
    ],
  },
  {
    company: "Headspace",
    title: "Admin portal research & proposal",
    description: [
      "Reframing the enterprise admin experience",
      "after Headspace and Ginger merged.",
    ],
    href: "/work/headspace-admin-portal",
    mockup: {
      src: "/headspace/admin-portal/home-mockup.webp",
      alt: "Headspace Admin Portal research on a tablet: the admin journey map, survey stats, Kano priorities by company size and the redesigned portal home",
      width: 1680,
      height: 1076,
      box: { x: 77, y: 28, w: 558.11, h: 357.28 },
    },
    media: "left",
    copyAlign: "center",
    skills: [
      "B2B platform",
      "Design systems",
      "User research",
      "Roadmap prioritization",
    ],
  },
  {
    company: "Airbnb",
    title: "Account creation & onboarding",
    description: [
      "A better way for professional hotel partners",
      "to join Airbnb.",
    ],
    href: "/work/airbnb-hotels",
    mockup: {
      src: "/airbnb/home-mockup.webp",
      alt: "The Airbnb hotel partner signup welcome screen with a Get started button, on a tablet",
      width: 1680,
      height: 1075,
      box: { x: 78, y: 28, w: 557.67, h: 357 },
    },
    media: "right",
    copyAlign: "center",
    skills: [
      "Onboarding design",
      "Design systems",
      "User research",
      "B2B partnerships",
    ],
  },
];

export type SmallProject = {
  company: string;
  title: string;
  /** Desktop line breaks, as in the Figma; free wrapping below lg. */
  description: string[];
  href: string | null;
  /** Not viewable yet: the title reads "— Coming soon" instead of carrying
   * the arrow, and the entry isn't a link. */
  comingSoon?: boolean;
  /** The coming-soon page's breadcrumb for this project, when it differs
   * from "company | title". */
  crumb?: string;
};

export const additionalWorkIntro = [
  "Projects that didn’t warrant",
  "a full case study, but that I had",
  "fun doing.",
];

export const additionalWork: SmallProject[] = [
  {
    company: "Headspace",
    title: "Headspace Admin portal redesign",
    description: [
      "The cross-functional initiative that gave Headspace and Ginger's",
      "separately-built products one shared front door — eligibility",
      "and enrollment unified into a single flow for the first time.",
    ],
    href: "/work/headspace-umd",
  },
  {
    company: "Yahoo",
    title: "Data Viz Integration",
    description: [
      "The charting and data visualization system built for the Partner Portal,",
      "along with the design system it runs on — built on a shared CMS",
      "foundation used across the platform.",
    ],
    href: null,
    comingSoon: true,
  },
  {
    company: "Personal Project",
    title: "It’s time for Harrison’s meds",
    description: [
      "A post-op medication tracker I built for my dog, Harrison, because",
      "I kept forgetting when it was time to give his next dose.",
    ],
    // Real route, gated by src/proxy.ts — public visitors are redirected to
    // /coming-soon, so the homepage marks it coming soon rather than linking
    // there. Drop `comingSoon` once the gate comes off.
    href: "/work/harrisons-app",
    comingSoon: true,
    crumb: "Personal | Harrison's app",
  },
];

export type Role = {
  company: string;
  title: string;
  period: string;
};

export const roles: Role[] = [
  { company: "Yahoo", title: "Principal Product Designer", period: "2023 — Present" },
  { company: "Headspace", title: "Senior Product Designer", period: "2020 — 2023" },
  { company: "Airbnb", title: "Experience Designer", period: "2019 — 2020" },
  { company: "HotelTonight", title: "Senior Product Designer", period: "2017 — 2019" },
  { company: "Stitch Fix", title: "User Experience Designer", period: "2015 — 2017" },
];

/** Skills & Specializations — the desktop/tablet rows (phones flow them as
 * one run). Rebalanced into three fuller lines so no skill sits alone. */
export const skills = [
  ["AI Product Development", "Systems Design", "Platform B2B"],
  ["Visual / UI Design", "Data Visualization", "Product Strategy", "Design Systems"],
  ["Information Architecture", "Accessibility", "User Research"],
];

export const contact = {
  email: "marcfavro@gmail.com",
  phone: "916-202-6702",
  // public/Marc-Favro-Resume.pdf, served at /resume — see next.config.ts.
  // To update, replace that file (keep the name).
  resume: "/resume",
  linkedin: "https://linkedin.com/in/marcfavro",
};
