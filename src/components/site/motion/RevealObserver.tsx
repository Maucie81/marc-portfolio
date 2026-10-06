"use client";

import { useEffect } from "react";
import { HERO_SEQUENCE, restoreHtmlAttrs } from "@/lib/motion";

/** A trigger enters once its top clears the bottom 12% of the screen... */
const ROOT_MARGIN = "0px 0px -12% 0px";
/** ...a quiet one (data-reveal-quiet) as soon as it's barely on screen, so
 * its fade is mostly done before the eye reaches it. */
const QUIET_MARGIN = "0px 0px -2% 0px";
/** Its images start loading a screen before that. */
const PRIME_MARGIN = "0px 0px 100% 0px";
/** On the opening screen, each step — a section's furniture, a card, a
 * data-reveal-group — follows the one above it by this much. */
const OPENING_STAGGER = 120;
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
 * hero's desktop and stacked trees swapping at 768px — can't replay them.
 *
 * Moving an element in the DOM cancels its CSS animations and starts them
 * again from the first frame — and GSAP's pin does exactly that to the
 * case-study track, when it wraps it in its spacer and on every refresh
 * (load, resize). So a reveal cancelled mid-play isn't retired: whatever
 * restarted is put back on the original clock and carries on from where
 * it was, before the next frame paints. */
function retire(el: Element, start: CSSNumberish | null = null): Promise<void> {
  const running = el.getAnimations({ subtree: true });
  let clock = start;
  if (clock === null) running[0]?.ready.then((a) => (clock = a.startTime), () => {});
  return Promise.all(running.map((a) => a.finished)).then(
    () => el.setAttribute("data-revealed", "done"),
    () => {
      const restarted = el.getAnimations({ subtree: true });
      if (clock !== null) for (const a of restarted) a.startTime = clock;
      return retire(el, clock);
    },
  );
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

/** Starts `el`'s animations on the hero board's clock, so opening-screen
 * content let go a frame or two after the board still runs in step with
 * the hero. (Everything holds until the hero is released, so usually they
 * start together anyway — this covers a page that hydrates after the
 * release.) */
function inStepWithBoard(el: Element, hero: Element | null) {
  const board = [...(hero?.querySelectorAll(".rv-settle") ?? [])].find((b) => b.getClientRects().length);
  const lead = board?.getAnimations()[0];
  if (!lead) return;
  for (const a of el.getAnimations()) {
    a.ready.then(() => {
      if (lead.startTime !== null && a.playState === "running") a.startTime = lead.startTime;
    });
  }
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
    // Recordings too (case studies): one that's loading shows its first
    // frame before its card settles, rather than settling in blank.
    el.querySelectorAll("video").forEach((video) => {
      if (!video.getAttribute("src") || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
      const r = video.getBoundingClientRect();
      if (r.width && r.bottom > top && r.top < bottom)
        pending.push(new Promise((resolve) => video.addEventListener("loadeddata", resolve, { once: true })));
    });
  }
  if (!pending.length) return Promise.resolve();
  return Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, IMAGE_WAIT))]);
}

/**
 * Plays each data-reveal trigger once (see src/lib/motion.ts).
 *
 * The opening screen: every trigger that's on screen once the page first
 * lays out (after any #hash jump) — even just its top edge — plays as one
 * piece with the hero, on the hero board's clock. Band fills settle in with
 * the board itself; their content starts at HERO_SEQUENCE.handoff, with
 * the hero's own type, and steps down the screen OPENING_STAGGER at a time
 * (--rv-open): a section's furniture (rail, number, title) is one step,
 * each card after it another, a whole data-reveal-group one more. Anything
 * already scrolled past is shown as is; fills and section furniture below
 * the screen are simply static.
 *
 * After that, each "view" trigger plays the first time it scrolls into view
 * — straight away, whatever the hero is doing. Quiet triggers enter earlier
 * than the rest (QUIET_MARGIN).
 *
 * Triggers playing together inside one data-reveal-group get consecutive
 * --rv-i, which the CSS turns into the group's stagger. Any trigger waits
 * (briefly) for the images it's about to show.
 *
 * `margin` moves the line a trigger has to cross (the homepage's 12% up
 * from the bottom by default). A page that scrolls sideways while
 * `sideways.query` matches — the case-study track — uses `sideways.margin`
 * then instead, and the line moves over when the page flips between the
 * two.
 */
export default function RevealObserver({
  margin = ROOT_MARGIN,
  sideways,
}: {
  margin?: string;
  sideways?: { query: string; margin: string };
}) {
  const sidewaysQuery = sideways?.query;
  const sidewaysMargin = sideways?.margin;

  useEffect(() => {
    const root = document.documentElement;
    restoreHtmlAttrs();
    root.setAttribute("data-motion-live", "");
    if (!root.hasAttribute("data-motion")) return;

    // The opening screen plays with the hero, and nothing starts until the
    // hero is released (the CSS holds every reveal until then) — a page
    // that loaded out of sight doesn't play its first sections unseen.
    const released = whenReleased(root);
    const hero = document.querySelector('[data-reveal="load"]:not([data-revealed])');
    if (hero) released.then(() => retire(hero));

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

    /** Plays `entering` once `after` settles, in reading order. */
    const play = (entering: Element[], after: Promise<unknown>, opening = false) => {
      entering.sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      entering.forEach(primeImages);
      Promise.all([after, imagesReady(entering)]).then(() => {
        const counts = new Map<Element, number>();
        let at = 0;
        let prev: Element | null = null;
        for (const el of entering) {
          const style = (el as HTMLElement).style;
          const group = el.closest("[data-reveal-group]");
          const i = group ? (counts.get(group) ?? 0) : 0;
          if (group) counts.set(group, i + 1);
          style.setProperty("--rv-i", String(i));
          if (opening && !el.hasAttribute("data-reveal-fill")) {
            // A step is a whole group, or a section's run of furniture;
            // anything else is a step of its own.
            const furniture = el.getAttribute("data-reveal") === "open";
            const scope = group ?? (furniture ? el.closest("section, footer") : el);
            if (prev && scope !== prev) at += OPENING_STAGGER;
            prev = scope;
            style.setProperty("--rv-open", `${(hero ? HERO_SEQUENCE.handoff : 0) + at}ms`);
          }
          el.setAttribute("data-revealed", "play");
          if (opening) inStepWithBoard(el, hero);
          released.then(() => retire(el));
        }
      });
    };

    /** Already scrolled past: above the screen, or off its left edge. */
    const past = (e: IntersectionObserverEntry) =>
      e.boundingClientRect.bottom <= (e.rootBounds?.top ?? 0) ||
      e.boundingClientRect.right <= (e.rootBounds?.left ?? 0);

    // Triggers waiting to scroll into view.
    const waiting = new Set<Element>();
    const onEnter: IntersectionObserverCallback = (entries, io) => {
      const entering: Element[] = [];
      for (const e of entries) {
        if (e.isIntersecting) {
          entering.push(e.target);
        } else if (past(e)) {
          e.target.setAttribute("data-revealed", "done");
        } else continue;
        io.unobserve(e.target);
        waiting.delete(e.target);
      }
      if (entering.length) play(entering, Promise.resolve());
    };

    let io: IntersectionObserver | null = null;
    let quiet: IntersectionObserver | null = null;
    const wait = (el: Element) => {
      waiting.add(el);
      (el.hasAttribute("data-reveal-quiet") ? quiet : io)?.observe(el);
    };
    // (Re)builds the scroll observers for the way the page scrolls now.
    const sidewaysMq = sidewaysQuery ? matchMedia(sidewaysQuery) : null;
    const watch = () => {
      io?.disconnect();
      quiet?.disconnect();
      const across = sidewaysMq?.matches && sidewaysMargin;
      io = new IntersectionObserver(onEnter, { rootMargin: across || margin });
      quiet = new IntersectionObserver(onEnter, { rootMargin: across || QUIET_MARGIN });
      waiting.forEach(wait);
    };
    watch();
    sidewaysMq?.addEventListener("change", watch);

    // Sorts every trigger once, on its first report against the whole
    // screen: on it → the opening screen; past it (or furniture below
    // it) → done; any other still to come → the scroll observers.
    const first = new IntersectionObserver((entries) => {
      const opening: Element[] = [];
      for (const e of entries) {
        const el = e.target;
        first.unobserve(el);
        if (e.isIntersecting) opening.push(el);
        else if (past(e) || el.getAttribute("data-reveal") === "open") el.setAttribute("data-revealed", "done");
        else wait(el);
      }
      // Let go at once: while the hero holds, the CSS holds these too, so
      // they and the board start on the same frame.
      if (opening.length) play(opening, Promise.resolve(), true);
    });

    const triggers = ':is([data-reveal="view"], [data-reveal="open"]):not([data-revealed])';
    document.querySelectorAll(triggers).forEach((el) => {
      prime.observe(el);
      first.observe(el);
    });
    return () => {
      first.disconnect();
      prime.disconnect();
      io?.disconnect();
      quiet?.disconnect();
      sidewaysMq?.removeEventListener("change", watch);
    };
  }, [margin, sidewaysQuery, sidewaysMargin]);

  return null;
}
