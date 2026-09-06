/**
 * Same four hex values as comix-theme.css's @theme block, duplicated here
 * for contexts that need a literal string (SVG fill/stroke attributes,
 * feFlood, Framer Motion animated values) rather than a Tailwind class.
 * Keep the two in sync by hand — there are only four values.
 */
export const COMIX_INK = "#241D11";
export const COMIX_PAPER = "#EEECE0";
export const COMIX_RUST = "#CE532E";
export const COMIX_INDIGO = "#4D3F86";

/** The one plate-shift vector for this system — every ink-heavy panel
 * border and registration mark carries the same offset, so a "second
 * pass, slightly off" reads as one press run, not per-element noise. */
export const PLATE_SHIFT_PX = { x: 3, y: -2 } as const;
export const PLATE_SHIFT_ROTATE = -0.4;
