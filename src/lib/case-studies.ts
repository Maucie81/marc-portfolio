/**
 * Canonical list of every case study (full and micro). The closing "Want to
 * see more?" cross-links (see CaseStudyClosing) always show exactly the two
 * entries flagged `closingLink`, in list order, on every page — including
 * their own — matching Figma 387:66552. Everything else (Yahoo Partner
 * Portal, the two micro case studies) never appears there.
 *
 * `closingLabel` is the link text used in that list when it differs from
 * the case study's page `title` (Figma's copy for Airbnb Hotels there reads
 * "Airbnb Account Creation & Onboarding", describing the project scope
 * rather than the page's own H1).
 */

export type CaseStudyLink = {
  slug: string;
  title: string;
  href: string;
  /** Eligible to appear in the closing "Want to see more?" list. */
  closingLink?: boolean;
  /** Link text for the closing list, if different from `title`. */
  closingLabel?: string;
};

export const caseStudies: CaseStudyLink[] = [
  {
    slug: "yahoo-partner-portal",
    title: "Yahoo Partner Portal",
    href: "/work/yahoo-partner-portal",
  },
  {
    slug: "airbnb-hotels",
    title: "Airbnb Hotels",
    href: "/work/airbnb-hotels",
    closingLink: true,
    closingLabel: "Airbnb Account Creation & Onboarding",
  },
  {
    slug: "headspace-admin-portal",
    title: "Headspace Admin Portal Redesign",
    href: "/work/headspace-admin-portal",
    closingLink: true,
  },
  {
    slug: "headspace-health-umd",
    title: "Headspace — Unified Enrollment",
    href: "/work/headspace-health-umd",
  },
  {
    slug: "ht-perks",
    title: "HotelTonight Perks",
    href: "/case-studies/ht-perks",
  },
];
