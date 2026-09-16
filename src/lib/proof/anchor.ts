/**
 * Pins are anchored to an element, not to page coordinates, so they survive
 * the page reflowing at another window width. An anchor is a CSS selector
 * built from the nearest ancestor with a stable id, plus an nth-of-type
 * path down to the element the visitor clicked.
 */

/** Anything carrying this attribute is our own UI — never anchor to it. */
export const PROOF_UI_ATTR = "data-proof-ui";

const ID_OK = /^[A-Za-z][\w-]*$/;
const MAX_DEPTH = 14;

function segment(el: Element): string {
  const tag = el.tagName.toLowerCase();
  let n = 1;
  let sib = el.previousElementSibling;
  while (sib) {
    if (sib.tagName === el.tagName) n += 1;
    sib = sib.previousElementSibling;
  }
  return `${tag}:nth-of-type(${n})`;
}

/** Climb from the raw hit target to something worth anchoring to: past
 * inline text runs and SVG internals, so a note on a word attaches to its
 * paragraph rather than a <span> that may not exist at another width. */
export function anchorTarget(hit: Element): Element {
  let el: Element = hit;
  while (el !== document.body) {
    const svgRoot = (el as SVGElement).ownerSVGElement;
    if (svgRoot) {
      el = svgRoot;
      continue;
    }
    const display = getComputedStyle(el).display;
    if (display === "inline" || display === "contents") {
      el = el.parentElement ?? document.body;
      continue;
    }
    break;
  }
  return el;
}

export function buildAnchor(target: Element): string {
  const parts: string[] = [];
  let el: Element | null = target;
  let depth = 0;
  while (el && el !== document.body && depth < MAX_DEPTH) {
    const id = el.id;
    if (id && ID_OK.test(id) && document.querySelectorAll(`#${id}`).length === 1) {
      parts.unshift(`#${id}`);
      break;
    }
    parts.unshift(segment(el));
    el = el.parentElement;
    depth += 1;
  }
  if (parts.length === 0) return "body";
  if (!parts[0].startsWith("#")) parts.unshift("body");
  const selector = parts.join(" > ");
  try {
    if (document.querySelector(selector) === target) return selector;
  } catch {
    /* fall through */
  }
  return "body";
}

export function resolveAnchor(anchor: string): Element | null {
  try {
    return document.querySelector(anchor);
  } catch {
    return null;
  }
}

/** True when the element (or an ancestor) is position:fixed — its rect is
 * already viewport-relative, so the pin must be too. */
export function isFixed(el: Element): boolean {
  let cur: Element | null = el;
  while (cur && cur !== document.body) {
    if (getComputedStyle(cur).position === "fixed") return true;
    cur = cur.parentElement;
  }
  return false;
}

export type PinPlacement = {
  /** Page (absolute) coordinates, or viewport coordinates when `fixed`. */
  left: number;
  top: number;
  fixed: boolean;
  /** Anchor element wasn't found; placed via the page-level fallback. */
  orphan: boolean;
};

export function placePin(pin: {
  anchor: string;
  ax: number;
  ay: number;
  px: number;
  py: number;
}): PinPlacement {
  const el = resolveAnchor(pin.anchor);
  if (!el) {
    return {
      left: pin.px * document.documentElement.clientWidth,
      top: pin.py,
      fixed: false,
      orphan: true,
    };
  }
  const rect = el.getBoundingClientRect();
  const fixed = isFixed(el);
  return {
    left: rect.left + pin.ax * rect.width + (fixed ? 0 : window.scrollX),
    top: rect.top + pin.ay * rect.height + (fixed ? 0 : window.scrollY),
    fixed,
    orphan: false,
  };
}

/** Everything the server needs to store about a click at viewport (x, y). */
export function describeClick(x: number, y: number) {
  const hit =
    document
      .elementsFromPoint(x, y)
      .find((el) => !el.closest(`[${PROOF_UI_ATTR}]`)) ?? document.body;
  const target = anchorTarget(hit);
  const rect = target.getBoundingClientRect();
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return {
    anchor: buildAnchor(target),
    ax: rect.width ? clamp((x - rect.left) / rect.width) : 0,
    ay: rect.height ? clamp((y - rect.top) / rect.height) : 0,
    px: clamp(x / document.documentElement.clientWidth),
    py: Math.round(y + window.scrollY),
  };
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
