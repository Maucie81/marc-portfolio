import type { CSSProperties } from "react";
import { HERO_DEFAULT } from "@/lib/hero-editions";

/**
 * Homepage motion system — the page is typeset into place, not flown in.
 * (Case studies reuse it, quieter: see READING below.)
 *
 * The shell is there from the first paint and never moves: paper, the
 * printer's marks and CMYK lockup, nav, logo, the white page. Everything
 * else that's on the opening screen starts hidden and assembles inside it,
 * as one piece: the hero board and the paper of any band on screen settle
 * in together, and 200ms later the hero's type and the rest of the
 * screen's content start together — Recent work's number and title, then
 * its first card, more on a tall screen. What's on that screen is
 * measured, never assumed.
 * Everything below it waits until it's scrolled to.
 *
 * Motion carries hierarchy: the hero is expressive, everything else is
 * calm — noticed only subconsciously. Substantial cards and content blocks
 * all arrive the same way, as one unit: they softly become visible
 * (.rv-soft — opacity with an 8px rise over 850ms, a long soft tail, no
 * mask, no overshoot) rather than slide into place. Text stays quieter
 * still. Only the hero board and the band fills on the opening screen
 * settle further (28px), as part of the hero's opening.
 *
 *   Hero               expressive  the board settles in, then its type
 *                                  sets as masked lines (the slowest thing
 *                                  here) and the portrait opens
 *   Recent work        soft        each card — copy, panel and tags
 *                                  together — softly appears
 *   Additional work    quiet       rows fade up 4px, 110ms apart
 *   Reference library  expressive  title lines rise out of a mask, then the
 *                                  whole library panel softly appears
 *   Career             very quiet  roles fade up 3px, 100ms apart
 *   Skills             static-ish  one block fades in
 *   Footer             restrained  the halftone field, then the copy, fade
 *
 * The hero's type runs on --motion-ease (a long exponential settle), cards
 * and the board on --motion-ease-settle (their fade on its own gentler
 * curve), and everything quiet on --motion-ease-quiet, which starts soft —
 * text becoming visible rather than arriving.
 *
 * The animation itself is plain CSS (globals.css, "Motion system"): a few
 * reveal classes, each a keyframe that runs once and leaves nothing behind
 * (backwards fill), so the finished page is exactly the static page.
 *
 *   .rv-soft    a card or content block: opacity + an 8px lift, 850ms
 *   .rv-settle  the hero board and band fills: opacity + a 28px lift
 *   .rv-line    masked line — rises out of a fixed mask under its own
 *               baseline, like a slug dropped into the forme
 *   .rv-clip    hard mask through an element's existing clip-path polygon
 *               (--rv-clip-from is the collapsed polygon)
 *   .rv-rise    opacity + a small rise (--rv-y, 8px by default)
 *   .rv-fade    opacity only
 *
 * When they run is set by the nearest trigger:
 *   data-reveal="load"  plays as soon as the page is ready (the hero)
 *   data-reveal="view"  plays once (RevealObserver). Triggers on the opening
 *                       screen play with the hero, from
 *                       HERO_SEQUENCE.handoff, one step (OPENING_STAGGER)
 *                       apart top to bottom; the rest play the first time
 *                       they scroll into view.
 *   data-reveal="open"  a band's fill (data-reveal-fill) or its section
 *                       furniture (rail, number, title): plays with the
 *                       opening screen if it's on it, and is otherwise
 *                       simply static — it never animates on scroll.
 *                       Triggers that enter together inside one
 *                       data-reveal-group are staggered by the group's
 *                       --rv-stagger, in reading order. A quiet trigger
 *                       (data-reveal-quiet) plays as soon as it crosses the
 *                       bottom edge, so it's already settling by the time
 *                       the eye gets there.
 *
 * Whether anything runs at all is <html data-motion>, set before first
 * paint by MOTION_SCRIPT: absent = everything static (reduced motion, no
 * JS, or arriving via Back/Forward), "hold" = the hero waits for its font
 * and portrait — and for the page to be on screen at all — "play" = go.
 */

/** Durations and staggers (ms) — mirrored by the --motion-* tokens in
 * globals.css. `hero` / `heroStagger` are the hero's type only; `settle`
 * is every card's entrance. */
export const MOTION = {
  fast: 200,
  standard: 420,
  major: 700,
  hero: 800,
  settle: 750,
  soft: 850,
  stagger: 60,
  heroStagger: 100,
} as const;

/** The hero's opening, in ms from release — about 1.7s end to end: the
 * board settles in, and while it lands the name, portrait, statement (lines
 * MOTION.heroStagger apart), subline and edition metadata follow.
 * `handoff` is when the rest of the opening screen's content starts:
 * with the hero's own type, so the page assembles as one rather than in
 * turn. */
export const HERO_SEQUENCE = {
  board: 0,
  eyebrow: 200,
  name: 300,
  portrait: 450,
  portraitDur: 900,
  statement: 600,
  subline: 1100,
  sublineDur: 500,
  meta: 1450,
  metaDur: 250,
  handoff: 200,
} as const;

/** Section furniture (rail, number, title) on the opening screen: a quiet
 * 4px fade-up, like the copy. */
export const FURNITURE = { dur: 500, y: 4, ease: "quiet" } as const;

type Ease = "quiet";

/** Inline vars for one reveal element: its delay (ms) and any overrides. */
export function rv(
  delay = 0,
  { dur, y, lift, ease }: { dur?: number; y?: number; lift?: number; ease?: Ease } = {},
): CSSProperties {
  const vars: Record<string, string> = { "--rv-d": `${delay}ms` };
  if (dur !== undefined) vars["--rv-dur"] = `${dur}ms`;
  if (y !== undefined) vars["--rv-y"] = `${y}px`;
  if (lift !== undefined) vars["--rv-lift"] = `${lift}px`;
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

/**
 * Case-study motion — the same reveals, quieter. The homepage is the
 * showpiece; a case study is for reading, so content softly becomes
 * visible and nothing performs. One entrance does most of the work, the
 * cards' soft reveal (.rv-soft: opacity + an 8px lift, 850ms, a long soft
 * tail, no overshoot), and text stays quieter than the blocks around it:
 *
 *   cover    strongest   the company line fades, the title rises out of
 *                        its mask (on phones, where it wraps, it rises
 *                        6px), then the subtitle, the metadata and the
 *                        scroll hint — about a second end to end
 *   heading  quiet       a chapter's number, title and eyebrow rise 6px
 *                        together, 650ms
 *   visual   soft        recordings, screenshots, artwork, panels: the
 *                        soft reveal, each composition as one unit
 *   callout  soft        stats, pull quotes, illustrated steps: the same
 *   body     quiet       a section's copy as one group: 5px, 600ms
 *   meta     very quiet  captions: opacity only
 *
 * Triggers (data-reveal="view") sit on a section's parts — its heading,
 * its copy, its media, each quote — never on single paragraphs, and play
 * once, the first time they cross 20% in from the edge content arrives
 * from: the right on the sideways track, the bottom on phones. Parts that
 * cross together step READING.stagger apart in reading order (each
 * section's columns are a data-reveal-group), so a heading leads its copy
 * and a recording leads its caption; a part that arrives on its own just
 * plays. Whatever is on screen at load plays with the cover. Phones keep
 * the timing and travel 70% as far (--rv-travel on .cs-track).
 *
 * A reveal class goes on the element that moves, and that element must not
 * hold anything lifted above the paper grain (product media, coral type):
 * while it animates it's its own stacking context, so a lifted child would
 * sit under the grain until the end, then snap crisp. So a heading's
 * number, title and eyebrow each carry the reveal, not their wrapper, and
 * media carries it on its own box.
 *
 * Conceptual artwork gets "visual" for now. Custom storytelling for it can
 * key off its trigger's data-revealed="play" later without touching this.
 */
export const READING = {
  stagger: 120,
  /** The cover's sequence, in ms from its trigger playing. */
  cover: { label: 0, title: 80, copy: 250, meta: 400, hint: 550 },
} as const;

type RevealSpec = {
  cls: "rv-soft" | "rv-rise" | "rv-fade" | "rv-line";
  delay?: number;
  opts?: Parameters<typeof rv>[1];
};

const READING_ROLES = {
  heading: { cls: "rv-rise", opts: { y: 6, dur: 650, ease: "quiet" } },
  visual: { cls: "rv-soft" },
  callout: { cls: "rv-soft" },
  body: { cls: "rv-rise", opts: { y: 5, dur: 600, ease: "quiet" } },
  meta: { cls: "rv-fade", opts: { dur: 500, ease: "quiet" } },
  coverLabel: { cls: "rv-fade", delay: READING.cover.label, opts: { dur: 500, ease: "quiet" } },
  /** The title on the sideways track: one line, risen out of its mask. */
  coverTitle: { cls: "rv-line", delay: READING.cover.title },
  /** The title on phones, where it can wrap: risen as a block. */
  coverTitleStacked: { cls: "rv-rise", delay: READING.cover.title, opts: { y: 6, dur: 650, ease: "quiet" } },
  coverCopy: { cls: "rv-rise", delay: READING.cover.copy, opts: { y: 5, dur: 600, ease: "quiet" } },
  coverMeta: { cls: "rv-fade", delay: READING.cover.meta, opts: { dur: 600, ease: "quiet" } },
  coverHint: { cls: "rv-fade", delay: READING.cover.hint, opts: { dur: 500, ease: "quiet" } },
} satisfies Record<string, RevealSpec>;

export type ReadingRole = keyof typeof READING_ROLES;

/** Class + inline vars for one case-study element in `role`. */
export function reading(role: ReadingRole, delay = 0): { className: string; style: CSSProperties } {
  const spec: RevealSpec = READING_ROLES[role];
  return { className: spec.cls, style: rv((spec.delay ?? 0) + delay, spec.opts) };
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
 * (or, on phones, the phone hero's) are ready (so no line is revealed in the fallback face and then re-set) —
 * at most HOLD_MAX. If the page is loading out of sight (a background tab,
 * or Safari preloading the address bar's top hit before Return is pressed)
 * it also holds until the page comes into view, so the opening isn't spent
 * where nobody can see it.
 *
 * Every value it gives data-motion is also kept in window.__htmlAttrs (as
 * HERO_EDITION_SCRIPT does for data-hero), so restoreHtmlAttrs can put them
 * back if React has to re-create <html>.
 */
export const MOTION_SCRIPT = `(function(){var d=document.documentElement,M="data-motion",A=window.__htmlAttrs=window.__htmlAttrs||{},S=function(v){A[M]=v;if(v)d.setAttribute(M,v);else d.removeAttribute(M)};try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="back_forward")return;S("hold");var h=0,go=function(){if(A[M]!=="hold")return;if(document.visibilityState==="hidden"){if(!h){h=1;document.addEventListener("visibilitychange",function v(){if(document.visibilityState==="hidden")return;document.removeEventListener("visibilitychange",v);h=0;setTimeout(go,${SHOWN_DELAY})})}return}S("play")};setTimeout(go,${HOLD_MAX});setTimeout(function(){if(!d.hasAttribute("data-motion-live"))S(null)},${FAILSAFE});document.addEventListener("DOMContentLoaded",function(){var w=[],f=document.fonts,e=d.getAttribute("data-hero")||"${HERO_DEFAULT}";try{if(f&&f.load)w.push(f.load("700 1em "+getComputedStyle(document.body).fontFamily))}catch(x){}var im=document.querySelectorAll('.hero-edition[data-edition="'+e+'"] .hero-portrait img,.hero-m-portrait img');for(var i=0;i<im.length;i++)if(im[i].getClientRects().length&&im[i].decode)w.push(im[i].decode());Promise.all(w).then(go,go)})}catch(x){S(null)}})();`;

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
