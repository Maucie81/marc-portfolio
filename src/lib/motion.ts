import type { CSSProperties } from "react";
import { HERO_DEFAULT } from "@/lib/hero-editions";

/**
 * Homepage motion system — the page is typeset into place, not flown in.
 *
 * Motion carries hierarchy, so it's loud in three places and nearly absent
 * everywhere else:
 *
 *   Hero               expressive  masked lines (the slowest thing here)
 *   Recent work        controlled  each image is uncovered by a slow wipe;
 *                                  its copy barely moves (opacity, 4px)
 *   Additional work    quiet       rows fade up 4px, 110ms apart
 *   Reference library  expressive  title lines rise out of a mask, then the
 *                                  photo sheet glides 36px into its frame
 *   Career             very quiet  roles fade up 3px, 100ms apart
 *   Skills             static-ish  one block fades in
 *   Footer             restrained  the halftone field, then the copy, fade
 *
 * The strong moments run on --motion-ease (a long exponential settle) and
 * the wipe on its own in-out curve; everything quiet runs on
 * --motion-ease-quiet, which starts soft — text becoming visible rather
 * than arriving.
 *
 * The animation itself is plain CSS (globals.css, "Motion system"): a few
 * reveal classes, each a keyframe that runs once and leaves nothing behind
 * (backwards fill), so the finished page is exactly the static page.
 *
 *   .rv-line   masked line — rises out of a fixed mask under its own
 *              baseline, like a slug dropped into the forme
 *   .rv-wipe   hard image mask (+ .rv-wipe-ltr / -rtl)
 *   .rv-clip   hard mask through an element's existing clip-path polygon
 *              (--rv-clip-from is the collapsed polygon)
 *   .rv-rise   opacity + a small rise (--rv-y, 8px by default)
 *   .rv-fade   opacity only
 *   .rv-drift  a short horizontal settle (--rv-dx) under a wipe
 *   .rv-glide  opacity + a horizontal settle (--rv-dx), no mask
 *
 * When they run is set by the nearest trigger:
 *   data-reveal="load"  plays as soon as the page is ready (the hero)
 *   data-reveal="view"  plays once, the first time it scrolls into view
 *                       (RevealObserver). Triggers that enter together
 *                       inside one data-reveal-group are staggered by the
 *                       group's --rv-stagger, in reading order. A quiet
 *                       trigger (data-reveal-quiet) plays as soon as it
 *                       crosses the bottom edge, so it's already settling
 *                       by the time the eye gets there.
 *
 * Whether anything runs at all is <html data-motion>, set before first
 * paint by MOTION_SCRIPT: absent = everything static (reduced motion, no
 * JS, or arriving via Back/Forward), "hold" = the hero waits for its font
 * and portrait — and for the page to be on screen at all — "play" = go.
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

type Ease = "quiet" | "wipe";

/** Inline vars for one reveal element: its delay (ms) and any overrides. */
export function rv(
  delay = 0,
  { dur, y, dx, ease }: { dur?: number; y?: number; dx?: number; ease?: Ease } = {},
): CSSProperties {
  const vars: Record<string, string> = { "--rv-d": `${delay}ms` };
  if (dur !== undefined) vars["--rv-dur"] = `${dur}ms`;
  if (y !== undefined) vars["--rv-y"] = `${y}px`;
  if (dx !== undefined) vars["--rv-dx"] = `${dx}px`;
  if (ease) vars["--rv-ease"] = `var(--motion-ease-${ease})`;
  return vars as CSSProperties;
}

/** Inline vars for a data-reveal-group: the stagger between its triggers,
 * plus any lift or easing its reveals share. */
export function rvGroup(stagger: number, extra: { y?: number; ease?: Ease } = {}): CSSProperties {
  const vars: Record<string, string> = { "--rv-stagger": `${stagger}ms` };
  if (extra.y !== undefined) vars["--rv-y"] = `${extra.y}px`;
  if (extra.ease) vars["--rv-ease"] = `var(--motion-ease-${extra.ease})`;
  return vars as CSSProperties;
}

/** Longest the hero waits for its font and portrait before playing anyway. */
const HOLD_MAX = 700;
/** Once a page that loaded out of sight comes into view, how long the hero
 * holds before playing, so the first visible frames show it waiting. */
const SHOWN_DELAY = 150;
/** If the page never hydrates (RevealObserver never marks it live), drop
 * back to the static page rather than leave sections hidden. */
const FAILSAFE = 8000;

/**
 * Runs in <head> before first paint (layout.tsx), after HERO_EDITION_SCRIPT.
 * Turns motion on unless the visitor prefers reduced motion or arrived via
 * Back/Forward, and holds the hero until the font and the edition's portrait
 * are ready (so no line is revealed in the fallback face and then re-set) —
 * at most HOLD_MAX. If the page is loading out of sight (a background tab,
 * or Safari preloading the address bar's top hit before Return is pressed)
 * it also holds until the page comes into view, so the opening isn't spent
 * where nobody can see it.
 *
 * Every value it gives data-motion is also kept in window.__htmlAttrs (as
 * HERO_EDITION_SCRIPT does for data-hero), so restoreHtmlAttrs can put them
 * back if React has to re-create <html>.
 */
export const MOTION_SCRIPT = `(function(){var d=document.documentElement,M="data-motion",A=window.__htmlAttrs=window.__htmlAttrs||{},S=function(v){A[M]=v;if(v)d.setAttribute(M,v);else d.removeAttribute(M)};try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="back_forward")return;S("hold");var h=0,go=function(){if(A[M]!=="hold")return;if(document.visibilityState==="hidden"){if(!h){h=1;document.addEventListener("visibilitychange",function v(){if(document.visibilityState==="hidden")return;document.removeEventListener("visibilitychange",v);h=0;setTimeout(go,${SHOWN_DELAY})})}return}S("play")};setTimeout(go,${HOLD_MAX});setTimeout(function(){if(!d.hasAttribute("data-motion-live"))S(null)},${FAILSAFE});document.addEventListener("DOMContentLoaded",function(){var w=[],f=document.fonts,e=d.getAttribute("data-hero")||"${HERO_DEFAULT}";try{if(f&&f.load)w.push(f.load("700 1em "+getComputedStyle(document.body).fontFamily))}catch(x){}var im=document.querySelectorAll('.hero-edition[data-edition="'+e+'"] .hero-portrait img');for(var i=0;i<im.length;i++)if(im[i].getClientRects().length&&im[i].decode)w.push(im[i].decode());Promise.all(w).then(go,go)})}catch(x){S(null)}})();`;

declare global {
  interface Window {
    /** What the head scripts last set on <html> (data-hero, data-motion). */
    __htmlAttrs?: Record<string, string | null>;
  }
}

/**
 * Client-side route changes (PageTransition): a fresh visit plays, a
 * Back/Forward return shows the page as it was left.
 */
export function setMotionMode(mode: "play" | "off") {
  const d = document.documentElement;
  const value = mode === "play" && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "play" : null;
  if (value) d.setAttribute("data-motion", value);
  else d.removeAttribute("data-motion");
  (window.__htmlAttrs ??= {})["data-motion"] = value;
}

/**
 * If hydration hits a mismatch, React re-creates the page — <html>
 * included — and the attributes the head scripts set before first paint
 * are gone: the page falls back to static, and to Hero 2. Puts them back
 * from the scripts' own record.
 */
export function restoreHtmlAttrs() {
  const d = document.documentElement;
  for (const [name, value] of Object.entries(window.__htmlAttrs ?? {})) {
    if (value && !d.hasAttribute(name)) d.setAttribute(name, value);
  }
}
