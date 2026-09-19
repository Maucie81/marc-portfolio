import { additionalWork, projects } from "@/lib/home";

/** Human names for routes — shared by PersistentHeader's case-study top
 * bar and the proof-notes panel (which groups a visitor's notes by page). */
export const CASE_STUDY_TITLES: Record<string, string> = {
  "/work/yahoo-partner-portal": "Yahoo Partner Portal",
  "/work/airbnb-hotels": "Airbnb Hotels",
  "/work/headspace-admin-portal": "Headspace Admin Portal Redesign",
  "/work/headspace-health-umd": "Headspace Unified Main Door",
};

const OTHER_TITLES: Record<string, string> = {
  "/": "Home",
  "/contact": "Contact",
  "/coming-soon": "Coming soon",
};

export function pageLabel(path: string): string {
  return CASE_STUDY_TITLES[path] ?? OTHER_TITLES[path] ?? path;
}

/** /coming-soon serves every not-yet-written project: the additionalWork
 * links in home.ts (`?p=<slug>`), plus any main project whose case study
 * is gated behind the private-preview proxy (src/proxy.ts) — there `?p=`
 * is the /work/<slug> the public was redirected from. Returns the
 * "Company | Title" breadcrumb and which homepage section Back should
 * land on, so PersistentHeader's top bar and the page's own <title> never
 * disagree; undefined for an unknown slug. */
export function comingSoonProject(
  p?: string | null,
): { title: string; backHref: string } | undefined {
  if (!p) return undefined;
  const small = additionalWork.find(
    (item) => item.href === `/coming-soon?p=${p}`,
  );
  if (small) {
    return {
      title: `${small.company} | ${small.title}`,
      backHref: "/#additional-work",
    };
  }
  const main = projects.find((item) => item.href === `/work/${p}`);
  if (main) {
    return { title: `${main.company} | ${main.title}`, backHref: "/#work" };
  }
  return undefined;
}

export function comingSoonTitle(p?: string | null): string | undefined {
  return comingSoonProject(p)?.title;
}

/** Routes PersistentHeader wraps in the perimeter frame (PerimeterFrame.tsx)
 * — the homepage set plus every case study. The frame's left rail carries
 * the CMYK proof-notes trigger, so ProofNotes only renders its floating
 * trigger on routes outside this set (ht-perks, lab pages). */
export function hasPerimeterFrame(path: string): boolean {
  return path in OTHER_TITLES || path in CASE_STUDY_TITLES;
}
