/**
 * LOCKED PALETTE — do not add a third ink.
 *
 * Fluorescent Pink + Fluorescent Orange, from the standard Riso ink
 * library (the same two swatches printers reach for on cheap zine runs —
 * see Print Any Two / Ditto Press swatch charts). Both are fluorescent,
 * both sit at near-equal value so neither recedes into a "highlight"
 * role, and together they're a hair too warm/loud to be a designed
 * pairing — closer to a photocopier accident than a brand kit. That's
 * the point: editorial, not decorative.
 *
 * Overprint (multiply of the two, see riso-defs.tsx) lands on a hot,
 * slightly muddy red-brown — a visibly THIRD color neither ink owns,
 * which is the actual mechanism Riso printers exploit and the reason
 * these two were chosen over e.g. Pink + Blue (whose overprint reads as
 * a clean, pleasant purple — too resolved, not "wrong" enough).
 */
export const RISO_PINK = "#FF48B0"; // Riso "Fluorescent Pink"
export const RISO_ORANGE = "#FF6C2F"; // Riso "Fluorescent Orange"

/** Paper: background and lightest value. Never pure white. */
export const RISO_PAPER = "#F5F0E8";

/**
 * A deeper, more visibly tan paper tone for reversed-out ("knockout") type
 * sitting inside a saturated ink field. RISO_PAPER itself, at full
 * saturation next to fluorescent ink, reads as bright white by
 * simultaneous contrast even though the hex is nowhere near it — this
 * exists so a knockout unmistakably reads as unbleached stock, not a
 * white ink that doesn't exist in this system.
 */
export const RISO_PAPER_KNOCKOUT = "#DCCFB6";

/**
 * Neutral dark, used ONLY as the source color for the grain/banding noise
 * filters (RisoGrain, RisoBanding) — never as a visible ink. Those filters
 * darken via mix-blend-mode: multiply, so what they're filled with is
 * immaterial to the final color; it is never printed as a flat swatch.
 */
export const RISO_BLACK = "#1A1613";

/**
 * All VISIBLE TEXT on the page uses this, never RISO_BLACK — a two-ink job
 * has no neutral black to fall back on for body copy. This is a deepened
 * approximation of the two inks doubled up on each other (a "double bump"
 * — the real technique for getting denser, more legible type out of a
 * two-color press when you have no black plate), not a third color: every
 * pixel on this page is still only pink, orange, their overprint, or
 * unprinted paper.
 */
export const RISO_TEXT_INK = "#C41C22";

/**
 * The ONE plate-shift vector for this run, in real CSS pixels — not a
 * per-element style choice. A press shifts the whole sheet once per pass,
 * so every pink thing on the page carries the exact same vector and every
 * orange thing carries the other: the headline ink, the divider fields,
 * the bleed circle, the registration mark. Only genuinely tiny elements
 * (the 20–100px signature mark) rescale it via platePx() below, because
 * applying an un-rescaled 7px shift to a 20px glyph would just break the
 * shape rather than misregister it — everything at HTML/CSS scale uses
 * these two numbers verbatim, no exceptions.
 */
export const RISO_PLATE_ORANGE_PX = { x: -7, y: 5 } as const;
export const RISO_PLATE_PINK_PX = { x: 5, y: -3.5 } as const;
/** A drift is a skewed sheet feed, not just a clean parallel slide — a
 * shared fractional rotation per plate, same reasoning as the translate. */
export const RISO_PLATE_ORANGE_ROTATE = -0.6;
export const RISO_PLATE_PINK_ROTATE = 0.5;

export const riso_plateTransform = (px: { x: number; y: number }, rotateDeg = 0) =>
  `translate(${px.x}px, ${px.y}px) rotate(${rotateDeg}deg)`;

/**
 * Rescales the shared plate vector into an SVG element's own viewBox units
 * so a small mark still reads as "the same physical press shift," just
 * proportionally larger relative to its own small size — the same reason
 * a hairline crack looks huge on a postage stamp and invisible on a poster.
 */
export const riso_platePxToViewBox = (
  px: { x: number; y: number },
  renderedSizePx: number,
  viewBoxSize = 100
) => ({ x: (px.x * viewBoxSize) / renderedSizePx, y: (px.y * viewBoxSize) / renderedSizePx });

/** Shared grain intensity — every component uses this same value so grain
 * reads as one paper stock throughout, not patchy per-section texture. */
export const RISO_GRAIN_OPACITY = 0.13;

/** Ink layers render at <1 opacity everywhere — real Riso soy ink is
 * semi-opaque, so a pure 100%-opacity multiply reads as too clean/digital,
 * and never fully hides the warm paper underneath the way a solid RGB
 * fill does. */
export const RISO_INK_OPACITY = 0.84;
