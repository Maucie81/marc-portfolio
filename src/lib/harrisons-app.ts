/**
 * Harrison's app — case-study content.
 *
 * Gated behind the private-preview proxy (src/proxy.ts) exactly like
 * Airbnb: the public (and search engines) are redirected to /coming-soon,
 * but the real route stays live in the codebase so it can be built out in
 * place, and the preview-key cookie unlocks it for direct editing/review.
 *
 * Nothing is written yet — home.ts's own description is the only real
 * copy that exists, reused verbatim as the intro rather than inventing new
 * narrative. Everything else is [PLACEHOLDER] until there's real content
 * to replace it with, same convention as the YPP/Airbnb/Headspace case
 * studies.
 */

export const meta = {
  title: "Harrison's app",
  subtitle:
    "A post-op medication tracker I built for my dog using AI-assisted development. Because the timing logic was genuinely hard to get right by hand.",
  company: "Personal",
  years: "2026",
};

export const context = [
  "A post-op medication tracker I built for my dog using AI-assisted development. Because the timing logic was genuinely hard to get right by hand.",
  "[PLACEHOLDER — full write-up not started yet]",
];

export const sidebar = {
  groups: [
    {
      label: "Role",
      items: ["Solo designer & developer"],
    },
  ],
  highlights: ["[PLACEHOLDER — case study not yet written]"],
};
