/**
 * The page's paper-grain sheet — the exact 500×500 Figma noise laid on top of
 * the page content with soft-light, so every element reads as printed onto the
 * same sheet. Absolute + full document height (see .noise-overlay in
 * globals.css) so it scrolls WITH the page rather than floating over it, and
 * sits below the fixed chrome so the nav/rails stay crisp. The horizontal
 * case-study carousel carries its own grain (.cs-track::after) since it slides
 * independently of page scroll.
 */
export default function NoiseOverlay() {
  return <div aria-hidden className="noise-overlay" />;
}
