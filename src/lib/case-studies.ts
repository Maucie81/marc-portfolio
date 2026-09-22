/**
 * Canonical list of every case study, plus each one's own "Want to see
 * more?" pair (see CaseStudyClosing) — set explicitly per direct request,
 * not derived from a shared default: a shared pair used to mean a page
 * could end up listing itself, and Headspace Unified Main Door was never
 * offered from any other case study (only the homepage linked to it).
 */

export type CaseStudyLink = {
  slug: string;
  title: string;
  href: string;
  /** The two "Want to see more?" slugs offered from this page's closing. */
  closing: [string, string];
};

export const caseStudies: CaseStudyLink[] = [
  {
    slug: "yahoo-partner-portal",
    title: "Yahoo Partner Portal",
    href: "/work/yahoo-partner-portal",
    closing: ["airbnb-hotels", "headspace-umd"],
  },
  {
    slug: "airbnb-hotels",
    title: "Airbnb account creation & onboarding",
    href: "/work/airbnb-hotels",
    closing: ["headspace-umd", "yahoo-partner-portal"],
  },
  {
    slug: "headspace-admin-portal",
    title: "Headspace admin portal redesign",
    href: "/work/headspace-admin-portal",
    // Not offered by any other case study's own closing (only Yahoo,
    // Airbnb, and UMD point to each other, per this same table) — reachable
    // from the homepage, otherwise an orphan the way UMD used to be. Set
    // this way per direct request; flagging in case that was incidental.
    closing: ["airbnb-hotels", "yahoo-partner-portal"],
  },
  {
    slug: "headspace-umd",
    title: "Headspace unified main door",
    href: "/work/headspace-umd",
    closing: ["yahoo-partner-portal", "airbnb-hotels"],
  },
  {
    slug: "harrisons-app",
    title: "Harrison's app",
    href: "/work/harrisons-app",
    // A minor personal project, not one of the four main case studies
    // above — none of them link to it back, so it's a one-way pointer to
    // two real case studies rather than something folded into their own
    // rotations.
    closing: ["airbnb-hotels", "yahoo-partner-portal"],
  },
];

/** The two "Want to see more?" links for the case study at `slug` — empty
 * for a slug with no entry (a route outside this list, e.g. a lab page). */
export function closingLinksFor(slug: string): CaseStudyLink[] {
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) return [];
  return cs.closing.map((s) => caseStudies.find((c) => c.slug === s)!);
}
