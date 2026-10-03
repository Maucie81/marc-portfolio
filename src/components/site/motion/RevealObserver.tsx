"use client";

import { useEffect } from "react";
import { restoreHtmlAttrs } from "@/lib/motion";

/** A trigger enters once its top clears the bottom 12% of the screen... */
const ROOT_MARGIN = "0px 0px -12% 0px";
/** ...a quiet one (data-reveal-quiet) as soon as it's barely on screen, so
 * its fade is mostly done before the eye reaches it. */
const QUIET_MARGIN = "0px 0px -2% 0px";
/** Its images start loading a screen before that. */
const PRIME_MARGIN = "0px 0px 100% 0px";
/** Longest an in-view section waits for the hero to finish first. */
const HERO_WAIT = 2200;
/** Longest a reveal waits for the images it's about to uncover. */
const IMAGE_WAIT = 700;

/** Settles once <html data-motion> leaves "hold" — MOTION_SCRIPT holds the
 * hero for its font and portrait, and for as long as the page is out of
 * sight. */
function whenReleased(root: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const mo = new MutationObserver(() => check());
    const check = () => {
      if (root.getAttribute("data-motion") === "hold") return;
      mo.disconnect();
      resolve();
    };
    mo.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
    check();
  });
}

/** Once every animation under `el` has run, retire them (data-revealed=
 * "done" sets `animation: none`), so a later display change — e.g. the
 * hero's desktop and stacked trees swapping at 768px — can't replay them. */
function retire(el: Element): Promise<void> {
  const done = () => el.setAttribute("data-revealed", "done");
  return Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)).then(done, done);
}

/** The lazy images a trigger will uncover, loaded now: while a wipe's
 * clip-path hides them the browser counts them as off screen and won't
 * fetch them itself. Only the ones inside the trigger's own box — the
 * library's visible tiles, not its whole sheet. */
function primeImages(el: Element) {
  const box = el.getBoundingClientRect();
  el.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    const r = img.getBoundingClientRect();
    if (r.width && r.bottom > box.top && r.top < box.bottom) img.loading = "eager";
  });
}

/** Settles once the not-yet-loaded images inside `els` that are on screen
 * have decoded (or after IMAGE_WAIT) — so a wipe never opens on an empty
 * frame after a fast jump outran the gallery's lazy loading. */
function imagesReady(els: Element[]): Promise<unknown> {
  const pending: Promise<unknown>[] = [];
  for (const el of els) {
    const box = el.getBoundingClientRect();
    const top = Math.max(0, box.top);
    const bottom = Math.min(innerHeight, box.bottom);
    el.querySelectorAll("img").forEach((img) => {
      if (img.complete) return;
      const r = img.getBoundingClientRect();
      if (r.width && r.bottom > top && r.top < bottom) pending.push(img.decode().catch(() => {}));
    });
  }
  if (!pending.length) return Promise.resolve();
  return Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, IMAGE_WAIT))]);
}

/**
 * Plays each data-reveal="view" trigger once, the first time it scrolls into
 * view (see src/lib/motion.ts). Triggers entering together inside one
 * data-reveal-group get consecutive --rv-i, which the CSS turns into the
 * group's stagger; a trigger entering alone starts at once. Anything already
 * scrolled past (a #hash jump) is shown as is, not animated.
 *
 * Sections in view on load wait for the hero's opening to finish, so the
 * page prints top to bottom rather than all at once; any section waits
 * (briefly) for the images it's about to uncover. Quiet triggers enter
 * earlier than the rest (QUIET_MARGIN).
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    restoreHtmlAttrs();
    root.setAttribute("data-motion-live", "");
    if (!root.hasAttribute("data-motion")) return;

    // Sections wait for the hero's opening, and the wait only starts once
    // it's released — a page that loaded out of sight doesn't play its first
    // sections unseen.
    const hero = document.querySelector('[data-reveal="load"]:not([data-revealed])');
    const heroDone = whenReleased(root).then(() =>
      hero ? Promise.race([retire(hero), new Promise((r) => setTimeout(r, HERO_WAIT))]) : undefined,
    );

    const prime = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          primeImages(e.target);
          prime.unobserve(e.target);
        }
      },
      { rootMargin: PRIME_MARGIN },
    );

    const onEnter: IntersectionObserverCallback = (entries, io) => {
      const entering: Element[] = [];
      for (const e of entries) {
        if (e.isIntersecting) {
          entering.push(e.target);
          io.unobserve(e.target);
        } else if (e.boundingClientRect.bottom <= (e.rootBounds?.top ?? 0)) {
          e.target.setAttribute("data-revealed", "done");
          io.unobserve(e.target);
        }
      }
      if (!entering.length) return;
      entering.sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      entering.forEach(primeImages);
      Promise.all([heroDone, imagesReady(entering)]).then(() => {
        const counts = new Map<Element, number>();
        for (const el of entering) {
          const group = el.closest("[data-reveal-group]");
          const i = group ? (counts.get(group) ?? 0) : 0;
          if (group) counts.set(group, i + 1);
          (el as HTMLElement).style.setProperty("--rv-i", String(i));
          el.setAttribute("data-revealed", "play");
          retire(el);
        }
      });
    };
    const io = new IntersectionObserver(onEnter, { rootMargin: ROOT_MARGIN });
    const quiet = new IntersectionObserver(onEnter, { rootMargin: QUIET_MARGIN });

    document.querySelectorAll('[data-reveal="view"]:not([data-revealed])').forEach((el) => {
      prime.observe(el);
      (el.hasAttribute("data-reveal-quiet") ? quiet : io).observe(el);
    });
    return () => {
      prime.disconnect();
      io.disconnect();
      quiet.disconnect();
    };
  }, []);

  return null;
}
