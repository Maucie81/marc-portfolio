import type { CSSProperties } from "react";

/**
 * Condensed via the variable font's own `wdth` axis (Google Sans Flex,
 * already self-hosted for the site — see layout.tsx) rather than a second
 * font file. No new font assets for this system.
 */
export const condensedDisplay: CSSProperties = {
  fontFamily: "var(--font-display), system-ui, sans-serif",
  fontWeight: 800,
  fontVariationSettings: '"wdth" 78, "GRAD" 0, "ROND" 0',
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
  lineHeight: 0.92,
};

export const stampLabel: CSSProperties = {
  fontFamily: "var(--font-display), system-ui, sans-serif",
  fontWeight: 700,
  fontVariationSettings: '"wdth" 88, "GRAD" 0, "ROND" 0',
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

/**
 * Body copy in this system deliberately does NOT use the site's DM Sans —
 * a geometric grotesque reads as friendly/product, not press. A workhorse
 * serif is the standard editorial pairing against a heavy display
 * grotesque (masthead type over a serif deck), so body text stays a
 * system serif stack here rather than a webfont.
 */
export const editorialBody: CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", ui-serif, serif',
  fontSize: "1.05rem",
  lineHeight: 1.55,
};

/**
 * One shared column every component's text aligns to. Four different
 * left margins across a page reads as unconsidered — a real spread is
 * gridded even when the ink itself is rough.
 */
export const containerStyle: CSSProperties = {
  maxWidth: 1160,
  marginInline: "auto",
  paddingInline: "1.5rem",
  boxSizing: "border-box",
};
