import { trackExposure, visitId } from "./client";
import type { ExposureType } from "./events";

/**
 * What a visit actually had on screen, for /analytics: the homepage hero
 * edition, the homepage sections that carry `data-track-section`, and the
 * Recent work cards that carry `data-track-card` (the hero's section
 * carries `data-track-hero`; its edition is read from <html data-hero>,
 * set before first paint by hero-editions.ts). Each is recorded once per
 * visit, through the same event endpoint and per-visit dedupe as actions.
 *
 * "On screen" means meaningfully, not a sliver: at least half of the
 * element visible — or, for anything taller than the window (most
 * sections on a phone), at least half the window filled by it — with at
 * least half its width in view, continuously for half a second, while the
 * tab is visible. Scrolling past quickly, an edge peeking in, or a
 * background tab doesn't count; scrolling away and back doesn't count
 * twice. A click inside a card or section counts it at once, since it was
 * plainly seen, and a card seen counts its section too — a visit that saw a
 * Recent work card reached Recent work, even before the (much taller)
 * section fills half the window.
 *
 * Nothing about position or scrolling is sent — only "this was seen".
 * IntersectionObserver says which elements are near the window; geometry
 * is only checked for those, on scroll and on a timer for the dwell.
 */

const SELECTOR = "[data-track-hero], [data-track-section], [data-track-card]";
/** Share of the element (or of the window, for taller ones) in view. */
const MIN_SHARE = 0.5;
const DWELL = 500;

function exposureOf(el: Element): [ExposureType, string] | null {
  if (!(el instanceof HTMLElement)) return null;
  if (el.dataset.trackSection) return ["section", el.dataset.trackSection];
  if (el.dataset.trackCard) return ["card", el.dataset.trackCard];
  if ("trackHero" in el.dataset) {
    const edition = document.documentElement.getAttribute("data-hero");
    return edition ? ["hero", `hero-${edition}`] : null;
  }
  return null;
}

function inView(el: Element) {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (r.width <= 0 || r.height <= 0 || !vw || !vh) return false;
  const w = Math.min(r.right, vw) - Math.max(r.left, 0);
  const h = Math.min(r.bottom, vh) - Math.max(r.top, 0);
  if (w <= 0 || h <= 0) return false;
  return w / Math.min(r.width, vw) >= MIN_SHARE && h / Math.min(r.height, vh) >= MIN_SHARE;
}

/** Records exposures for `el`'s own card, section and hero right away. */
export function exposeOnClick(el: Element) {
  for (const hit of [
    el.closest("[data-track-card]"),
    el.closest("[data-track-section]"),
    el.closest("[data-track-hero]"),
  ]) {
    const exposure = hit && exposureOf(hit);
    if (exposure) trackExposure(...exposure);
  }
}

/** Watches the page for tracked elements for as long as it's mounted;
 * returns the cleanup. */
export function watchExposures(): () => void {
  /** When each nearby element came fully into view (null = not now), and
   * which visit it was last recorded for. */
  const state = new Map<Element, { since: number | null; recordedFor: string | null }>();
  const near = new Set<Element>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;
  let scanTimer: ReturnType<typeof setTimeout> | undefined;

  function check() {
    clearTimeout(timer);
    const now = performance.now();
    const visible = document.visibilityState === "visible";
    const current = visitId();
    let wait = Infinity;
    for (const el of near) {
      const s = state.get(el);
      if (!s || (current && s.recordedFor === current)) continue;
      if (!visible || !inView(el)) {
        s.since = null;
        continue;
      }
      s.since ??= now;
      const left = s.since + DWELL - now;
      if (left > 0) {
        wait = Math.min(wait, left);
        continue;
      }
      const exposure = exposureOf(el);
      if (!exposure) continue;
      s.recordedFor = trackExposure(...exposure);
      if (exposure[0] === "card") {
        const section = el.parentElement?.closest("[data-track-section]");
        const parent = section && exposureOf(section);
        if (parent) trackExposure(...parent);
      }
    }
    if (wait < Infinity) timer = setTimeout(check, wait + 20);
  }

  function schedule() {
    if (frame || !near.size) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      check();
    });
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) near.add(entry.target);
      else {
        near.delete(entry.target);
        const s = state.get(entry.target);
        if (s) s.since = null;
      }
    }
    schedule();
  });

  // Picks up tracked elements as pages mount (route changes, late
  // content) and lets go of ones that left.
  function scan() {
    for (const el of document.querySelectorAll(SELECTOR)) {
      if (state.has(el)) continue;
      state.set(el, { since: null, recordedFor: null });
      io.observe(el);
    }
    for (const el of state.keys()) {
      if (el.isConnected) continue;
      io.unobserve(el);
      state.delete(el);
      near.delete(el);
    }
  }
  const mo = new MutationObserver(() => {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 100);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  scan();

  const onVisibility = () => (document.visibilityState === "visible" ? schedule() : check());
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    io.disconnect();
    mo.disconnect();
    clearTimeout(timer);
    clearTimeout(scanTimer);
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
