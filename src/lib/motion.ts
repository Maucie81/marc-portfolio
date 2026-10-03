import type { CSSProperties } from "react";
import { HERO_DEFAULT } from "@/lib/hero-editions";

/**
 * Homepage motion system — the page is typeset into place, not flown in.
 *
 * Art-directed, not uniform: one easing family everywhere, but each band
 * has its own pattern and weight. The masked line is the hero's signature
 * (and the footer CTA's, as a bookend) — slowest, most deliberate. Recent
 * work leads with its image wipes, the library with its frame and sheet;
 * Additional work and Career only fade up a few px.
 *
 * The animation itself is plain CSS (globals.css, "Motion system"): a few
 * reveal classes, each a keyframe that runs once and leaves nothing behind
 * (backwards fill), so the finished page is exactly the static page.
 *
 *   .rv-line   masked line — rises out of a fixed mask under its own
 *              baseline, like a slug dropped into the forme
 *   .rv-wipe   hard image mask (+ .rv-wipe-ltr / -rtl / -btt / -ttb)
 *   .rv-clip   hard mask through an element's existing clip-path polygon
 *              (--rv-clip-from is the collapsed polygon)
 *   .rv-rise   opacity + a small rise (--rv-y, 8px by default)
 *   .rv-fade   opacity only
 *   .rv-drift  a short horizontal settle (--rv-dx) under a wipe
 *
 * When they run is set by the nearest trigger:
 *   data-reveal="load"  plays as soon as the page is ready (the hero)
 *   data-reveal="view"  plays once, the first time it scrolls into view
 *                       (RevealObserver). Triggers that enter together
 *                       inside one data-reveal-group are staggered by the
 *                       group's --rv-stagger, in reading order.
 *
 * Whether anything runs at all is <html data-motion>, set before first
 * paint by MOTION_SCRIPT: absent = everything static (reduced motion, no
 * JS, or arriving via Back/Forward), "hold" = the hero waits for its font
 * and portrait, "play" = go.
 */

/** Durations and staggers (ms) — mirrored by the --motion-* tokens in
 * globals.css. `hero` / `heroStagger` are the hero's type only. */
export const MOTION = {
  fast: 200,
  standard: 420,
  major: 700,
  hero: 800,
  stagger: 60,
  heroStagger: 100,
} as const;

/** The hero's opening, in ms from release — about 1.5s end to end: name,
 * portrait, statement (lines MOTION.heroStagger apart), subline, edition
 * metadata. */
export const HERO_SEQUENCE = {
  eyebrow: 0,
  name: 100,
  portrait: 250,
  portraitDur: 900,
  statement: 400,
  subline: 900,
  sublineDur: 500,
  meta: 1250,
  metaDur: 250,
} as const;

/** Inline vars for one reveal element: its delay (ms) and any overrides. */
export function rv(
  delay = 0,
  { dur, y, dx }: { dur?: number; y?: number; dx?: number } = {},
): CSSProperties {
  const vars: Record<string, string> = { "--rv-d": `${delay}ms` };
  if (dur !== undefined) vars["--rv-dur"] = `${dur}ms`;
  if (y !== undefined) vars["--rv-y"] = `${y}px`;
  if (dx !== undefined) vars["--rv-dx"] = `${dx}px`;
  return vars as CSSProperties;
}

/** Inline vars for a data-reveal-group: the stagger between its triggers. */
export function rvGroup(stagger: number, extra: { y?: number } = {}): CSSProperties {
  const vars: Record<string, string> = { "--rv-stagger": `${stagger}ms` };
  if (extra.y !== undefined) vars["--rv-y"] = `${extra.y}px`;
  return vars as CSSProperties;
}

/** Longest the hero waits for its font and portrait before playing anyway. */
const HOLD_MAX = 700;
/** If the page never hydrates (RevealObserver never marks it live), drop
 * back to the static page rather than leave sections hidden. */
const FAILSAFE = 8000;

/**
 * Runs in <head> before first paint (layout.tsx), after HERO_EDITION_SCRIPT.
 * Turns motion on unless the visitor prefers reduced motion or arrived via
 * Back/Forward, holds the hero until the font and the edition's portrait are
 * ready (so no line is revealed in the fallback face and then re-set), and
 * releases it after HOLD_MAX regardless.
 */
export const MOTION_SCRIPT = `(function(){var d=document.documentElement,M="data-motion";try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="back_forward")return;d.setAttribute(M,"hold");var go=function(){if(d.getAttribute(M)==="hold")d.setAttribute(M,"play")};setTimeout(go,${HOLD_MAX});setTimeout(function(){if(!d.hasAttribute("data-motion-live"))d.removeAttribute(M)},${FAILSAFE});document.addEventListener("DOMContentLoaded",function(){var w=[],f=document.fonts,e=d.getAttribute("data-hero")||"${HERO_DEFAULT}";try{if(f&&f.load)w.push(f.load("700 1em "+getComputedStyle(document.body).fontFamily))}catch(x){}var im=document.querySelectorAll('.hero-edition[data-edition="'+e+'"] .hero-portrait img');for(var i=0;i<im.length;i++)if(im[i].getClientRects().length&&im[i].decode)w.push(im[i].decode());Promise.all(w).then(go,go)})}catch(x){d.removeAttribute(M)}})();`;

/**
 * Client-side route changes (PageTransition): a fresh visit plays, a
 * Back/Forward return shows the page as it was left.
 */
export function setMotionMode(mode: "play" | "off") {
  const d = document.documentElement;
  if (mode === "play" && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    d.setAttribute("data-motion", "play");
  } else {
    d.removeAttribute("data-motion");
  }
}
