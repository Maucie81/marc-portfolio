/**
 * Homepage hero editions — Figma component set 254:273243 (Portfolio-
 * Playground, AwPcHO3ssXvBttxqrLdxlR), variants "hero 1" … "Hero 6".
 *
 * Every edition is the same content on the same 1376 × 566 board (the 1440
 * desktop frame minus the 32px rails); only the composition changes. All
 * coordinates are Figma px on that board, read off each variant's layers:
 *
 * - Text positions are the layer's top edge with Figma's cap-height trim, so
 *   `y` is where the first line's capitals start (HomepageHero applies the
 *   matching CSS offset — see .hero-line in globals.css).
 * - Portrait `matrix` is the image layer's transform relative to the board
 *   (CSS matrix() order, translation split out as x/y); `clip` is its mask
 *   layer as a polygon. The layer also carries a 25% drop shadow in Figma,
 *   but nothing of it survives the mask in Figma's own render, so it isn't
 *   drawn here — a CSS shadow showed as a halo (alpha) or hard edges (box).
 * - `cluster` is the part of the board the stacked (< 1024px) layout keeps:
 *   eyebrow, name, divider and portrait. The statement, subline and edition
 *   metadata reflow as text below it there.
 */

export const HERO_EYEBROW = "Hello & welcome";
export const HERO_NAME = ["I’m", "Marc", "Favro"];
export const HERO_STATEMENT = [
  "I’m a Principal",
  "Product Designer,",
  "based in Brooklyn,",
  "New York.",
];
const SUBLINE_A = [
  "I turn complex problems into products that",
  "businesses run on and users love.",
];
const SUBLINE_B = [
  "I turn complex problems into products",
  "that businesses run on and users love.",
];

export type HeroText = {
  /** Lines of copy, each placed on the board. */
  lines: { text: string; x: number; y: number; anchor?: "left" | "right" }[];
  size: number;
  /** Line height in px; omitted = Figma "auto" (the font's own 1.26). */
  lineHeight?: number;
  color: string;
  weight: 600 | 700;
  /** em. −2% on the SemiBold roles (Figma's own); the Bold display lines
   * default to −0.8% in HomepageHero — see the note there. */
  tracking?: number;
  blend?: "multiply";
  z: number;
};

export type HeroEdition = {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  /** "ED.03 / 06" — which of the six editions this is. */
  label: string;
  /** The inks on the board, for the "PLATE:" line. */
  plate: string;
  /** Registration tolerance for the "REG." line — 00 for one ink, looser
   * the more the inks overprint. */
  reg: string;
  background: string;
  texture?: { x: number; y: number; w: number; h: number; blend: "multiply" | "color-burn" };
  /** Hero 4 only: the oversized statement is masked to
   * this rect (Figma "Mask group" 254:273443). */
  clip?: { x: number; y: number; w: number; h: number };
  eyebrow: HeroText;
  name: HeroText;
  statement: HeroText;
  subline: HeroText;
  meta: { color: string; z: number };
  portrait: {
    w: number;
    h: number;
    matrix: [number, number, number, number];
    x: number;
    y: number;
    clip: [number, number][];
    blend?: "multiply";
    z: number;
  };
  rules: { x: number; y: number; w: number; h: number; color: string; rotate?: number; z: number }[];
  cluster: { x: number; y: number; w: number; h: number };
  /** Stacked layout's statement color (the desktop statement's own). */
  mobileStatementColor: string;
  /** Stacked-layout (<768px) tweaks, in board px: a shorter divider (its
   * new height), the eyebrow + name and the portrait moved vertically so
   * both center on the divider, and a shorter cluster cut so the statement
   * sits closer. */
  stack?: {
    ruleH?: number;
    nameShift?: number;
    portraitShift?: number;
    clusterH?: number;
    /** The statement's alignment (default left). */
    statementAlign?: "center";
  };
};

const rect = (x: number, y: number, w: number, h: number): [number, number][] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

const block = (
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  anchor: "left" | "right" = "left",
) => lines.map((text, i) => ({ text, x, y: y + i * lineHeight, anchor }));

const INK = "#433835";
const CORAL = "#ff5841";
const META_GREY = "#8b837e";
const META_PINK = "#ffcece";

export const HERO_EDITIONS: HeroEdition[] = [
  // ---------- hero 1 · 254:273242 — paper, halftone, ink ----------
  {
    id: 1,
    label: "ED.01 / 06",
    plate: "BLACK",
    reg: "00",
    background: "#f8f4eb",
    texture: { x: 24, y: 24, w: 1328, h: 518, blend: "multiply" },
    statement: { lines: block(HERO_STATEMENT, 513, 148, 68.848), size: 86.736, lineHeight: 68.848, color: INK, weight: 700, z: 2 },
    subline: { lines: block(SUBLINE_A, 518, 450, 27.55), size: 21.863, color: INK, weight: 600, tracking: -0.02, z: 2 },
    eyebrow: { lines: [{ text: HERO_EYEBROW, x: 90, y: 104.6 }], size: 21.863, color: INK, weight: 600, tracking: -0.02, z: 5 },
    name: { lines: block(HERO_NAME, 90, 150, 68.848), size: 86.736, lineHeight: 68.848, color: INK, weight: 700, z: 5 },
    portrait: {
      w: 357.356, h: 349.747, matrix: [0.9659, -0.259, 0.259, 0.9659], x: 208.4268, y: 147.0679,
      clip: rect(207.67, 61.24, 265.99, 424.59), z: 3,
    },
    rules: [{ x: 473, y: 55, w: 10, h: 456, color: "#fff", z: 4 }],
    meta: { color: META_GREY, z: 6 },
    cluster: { x: 66, y: 40, w: 441, h: 486 },
    mobileStatementColor: INK,
  },
  // ---------- Hero 2 · 254:273303 — paper, slashed overprint ----------
  {
    id: 2,
    label: "ED.02 / 06",
    plate: "CORAL / BLACK",
    reg: "02",
    background: "#f8f4eb",
    statement: {
      lines: [
        { text: HERO_STATEMENT[0], x: 448, y: 145.7 },
        { text: HERO_STATEMENT[1], x: 422, y: 231.7 },
        { text: HERO_STATEMENT[2], x: 399, y: 318.7 },
        { text: HERO_STATEMENT[3], x: 373, y: 405.7 },
      ],
      size: 91.333, lineHeight: 86.462, color: "#f84d2d", weight: 700, blend: "multiply", z: 3,
    },
    subline: { lines: block(SUBLINE_B, 833, 426.7, 27.55), size: 21.863, color: INK, weight: 600, tracking: -0.02, z: 3 },
    eyebrow: { lines: [{ text: HERO_EYEBROW, x: 292, y: 95.7 }], size: 22.253, color: INK, weight: 600, tracking: -0.02, z: 4 },
    // Eyebrow + name sit 12px left of the Figma so the slash clears the
    // opening of "Marc"'s c.
    name: {
      lines: [
        { text: HERO_NAME[0], x: 437, y: 145.7, anchor: "right" },
        { text: HERO_NAME[1], x: 417, y: 231.7, anchor: "right" },
        { text: HERO_NAME[2], x: 397, y: 318.7, anchor: "right" },
      ],
      size: 91.333, lineHeight: 86.462, color: INK, weight: 700, z: 4,
    },
    portrait: {
      w: 322.309, h: 315.445, matrix: [-0.9887, -0.1501, -0.1501, 0.9887], x: 617.9644, y: 160.7354,
      clip: [[448.87, 131.67], [608.87, 131.67], [608.87, 451.69], [360.98, 451.69]],
      blend: "multiply", z: 2,
    },
    // The white slash: a 500 × 20 bar turned −74.23°, centered on its
    // Figma bounding box (337, 39.7, 155.1 × 486.6).
    rules: [{ x: 164.55, y: 272.97, w: 500, h: 20, color: "#fff", rotate: -74.23, z: 5 }],
    meta: { color: META_GREY, z: 1 },
    cluster: { x: 127, y: 30, w: 502, h: 506 },
    mobileStatementColor: "#f84d2d",
  },
  // ---------- hero 3 · 254:273366 — flat coral, white ----------
  {
    id: 3,
    label: "ED.03 / 06",
    plate: "CORAL / WHITE",
    reg: "01",
    background: CORAL,
    statement: { lines: block(HERO_STATEMENT, 518, 120.7, 84), size: 87, lineHeight: 84, color: "#fff", weight: 700, z: 2 },
    subline: { lines: block(SUBLINE_A, 523.8, 462.7, 28.04), size: 22.253, color: "#fff", weight: 600, tracking: -0.02, z: 2 },
    eyebrow: { lines: [{ text: HERO_EYEBROW, x: 74.8, y: 82.3 }], size: 22.253, color: "#fff", weight: 600, tracking: -0.02, z: 5 },
    name: { lines: block(HERO_NAME, 74.8, 120.7, 84), size: 87, lineHeight: 84, color: "#fff", weight: 700, z: 5 },
    portrait: {
      w: 357.356, h: 349.747, matrix: [0.9659, -0.259, 0.259, 0.9659], x: 213.209, y: 134.7798,
      clip: rect(212.45, 48.95, 265.99, 424.59), z: 3,
    },
    rules: [{ x: 477.8, y: 30.7, w: 10, h: 494, color: "#fff", z: 4 }],
    meta: { color: META_PINK, z: 6 },
    cluster: { x: 55, y: 20, w: 453, h: 515 },
    mobileStatementColor: "#fff",
    stack: { ruleH: 411, nameShift: 20, portraitShift: -32, clusterH: 424 },
  },
  // ---------- Hero 4 · 254:273423 — oversized statement, coral name ----------
  {
    id: 4,
    label: "ED.04 / 06",
    plate: "BLACK / CORAL",
    reg: "03",
    background: "#f8f4eb",
    // Extended past the Figma mask (1.8, 0.2, 1374 × 554) to the full board,
    // so the statement runs off every edge of the frame.
    clip: { x: 0, y: 0, w: 1376, h: 566 },
    // −1.25% (vs −0.8% on the other Bold lines): at 165px the gap to
    // Figma's tighter display setting is wider — measured line for line.
    statement: { lines: block(HERO_STATEMENT, -7.2, -4.8, 156.012), size: 164.802, lineHeight: 156.012, color: INK, weight: 700, tracking: -0.0125, blend: "multiply", z: 1 },
    subline: { lines: block(SUBLINE_A, 815.8, 483.2, 28.04), size: 22.253, color: CORAL, weight: 600, tracking: -0.02, z: 2 },
    eyebrow: { lines: [{ text: HERO_EYEBROW, x: 187.9, y: 124.2 }], size: 22.253, color: CORAL, weight: 600, tracking: -0.02, z: 3 },
    name: { lines: block(HERO_NAME, 360.8, 163.2, 81, "right"), size: 100, lineHeight: 81, color: CORAL, weight: 700, z: 3 },
    portrait: {
      w: 401.088, h: 392.548, matrix: [-0.9789, -0.2043, -0.2043, 0.9789], x: 634.5967, y: 109.0376,
      clip: rect(384.78, 72.25, 258, 382), z: 4,
    },
    rules: [{ x: 370.8, y: 45.2, w: 14, h: 482, color: CORAL, z: 5 }],
    meta: { color: META_GREY, z: 1 },
    cluster: { x: 69, y: 35, w: 594, h: 502 },
    mobileStatementColor: INK,
    stack: { statementAlign: "center" },
  },
  // ---------- Hero 5 · 254:273459 — ink, color-burn halftone ----------
  {
    id: 5,
    label: "ED.05 / 06",
    plate: "BLACK / CORAL / WHITE",
    reg: "02",
    background: INK,
    texture: { x: 23.78, y: 23.79, w: 1328, h: 511, blend: "color-burn" },
    statement: { lines: block(HERO_STATEMENT, 552.8, 145.8, 71), size: 75, lineHeight: 71, color: CORAL, weight: 700, z: 2 },
    subline: { lines: block(SUBLINE_A, 556.8, 445.8, 28.04), size: 22.253, color: "#fff", weight: 600, tracking: -0.02, z: 2 },
    eyebrow: { lines: [{ text: HERO_EYEBROW, x: 201.8, y: 96.8 }], size: 19, color: CORAL, weight: 600, tracking: -0.02, z: 3 },
    name: { lines: block(HERO_NAME, 345.8, 145.8, 71, "right"), size: 75, lineHeight: 71, color: "#fff", weight: 700, z: 3 },
    portrait: {
      w: 302.291, h: 295.854, matrix: [-0.9659, -0.259, -0.259, 0.9659], x: 595.1406, y: 157.8916,
      clip: rect(370.78, 85.29, 225, 359.16), z: 4,
    },
    rules: [{ x: 359.8, y: 76.8, w: 11, h: 405, color: CORAL, z: 4 }],
    meta: { color: "#b19790", z: 5 },
    cluster: { x: 120, y: 57, w: 496, h: 445 },
    mobileStatementColor: CORAL,
  },
  // ---------- Hero 6 · 254:273498 — coral, multiply halftone ----------
  {
    id: 6,
    label: "ED.06 / 06",
    plate: "CORAL / WHITE / BLACK",
    reg: "02",
    background: CORAL,
    texture: { x: 24.1, y: 27.5, w: 1328, h: 511, blend: "multiply" },
    statement: { lines: block(HERO_STATEMENT, 553.1, 149.5, 71), size: 75, lineHeight: 71, color: "#fff", weight: 700, z: 2 },
    subline: { lines: block(SUBLINE_A, 553.1, 453.5, 28.04), size: 22.253, color: "#fff", weight: 600, tracking: -0.02, z: 2 },
    eyebrow: { lines: [{ text: HERO_EYEBROW, x: 176.1, y: 100.5 }], size: 22.253, color: "#fff", weight: 600, tracking: -0.02, z: 3 },
    name: { lines: block(HERO_NAME, 346.1, 149.5, 71, "right"), size: 75, lineHeight: 71, color: "#fff", weight: 700, z: 3 },
    portrait: {
      w: 302.291, h: 295.854, matrix: [-0.9659, -0.259, -0.259, 0.9659], x: 595.4604, y: 175.1052,
      clip: rect(371.1, 102.5, 225, 359.16), blend: "multiply", z: 4,
    },
    rules: [{ x: 360.1, y: 57.5, w: 11, h: 450, color: "#fff", z: 4 }],
    meta: { color: META_PINK, z: 5 },
    // x starts at "Favro" so the stacked name lines up with the copy below.
    cluster: { x: 139, y: 38, w: 496, h: 489 },
    mobileStatementColor: "#fff",
  },
];

export const HERO_META_LINES = (e: Pick<HeroEdition, "label" | "plate" | "reg">) => [
  e.label,
  `PLATE: ${e.plate}`,
  `REG. ±${e.reg}`,
];

/**
 * Edition rotation. While false, every visit gets HERO_DEFAULT unless the
 * URL asks for one (?hero=1 … ?hero=6, for QA). When true, a browsing session
 * draws one edition at random and keeps it (sessionStorage) for every later
 * homepage view in that tab — navigating into a case study and back never
 * changes it; a new session may draw another.
 */
export const HERO_ROTATION = true;

/** The edition shown when rotation is off (and the no-script fallback). */
export const HERO_DEFAULT = 2;

const STORAGE_KEY = "mf:hero-edition";

/**
 * Runs in <head> before first paint (see layout.tsx), so the chosen edition
 * is already set as <html data-hero> when the page renders: no flash of a
 * different edition, and nothing for React to reconcile on hydration. All
 * six editions are in the HTML; CSS shows the one this attribute names.
 */
export const HERO_EDITION_SCRIPT = `(function(){var d=document.documentElement,n=${HERO_EDITIONS.length},e;try{var q=parseInt(new URLSearchParams(location.search).get("hero"),10);if(q>=1&&q<=n){e=q}else{${HERO_ROTATION ? `e=parseInt(sessionStorage.getItem("${STORAGE_KEY}"),10);if(!(e>=1&&e<=n)){e=1+Math.floor(Math.random()*n);sessionStorage.setItem("${STORAGE_KEY}",String(e))}` : `e=${HERO_DEFAULT}`}}}catch(x){e=e||${HERO_DEFAULT}}d.setAttribute("data-hero",String(e))})();`;
