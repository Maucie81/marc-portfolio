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

/** Routes PersistentHeader wraps in the perimeter frame (PerimeterFrame.tsx)
 * — the homepage set plus every case study. The frame's left rail carries
 * the CMYK proof-notes trigger, so ProofNotes only renders its floating
 * trigger on routes outside this set (ht-perks, lab pages). */
export function hasPerimeterFrame(path: string): boolean {
  return path in OTHER_TITLES || path in CASE_STUDY_TITLES;
}
