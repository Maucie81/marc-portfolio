import { isAction, type ActionType, type EventType, type ExposureType } from "./events";

/**
 * Browser side of /analytics: pageviews, the handful of actions in
 * events.ts, engaged time per page, scroll milestones per page and what
 * came into view (exposure.ts), each tagged with the visit it belongs to.
 *
 * A visit is a random id in sessionStorage — this tab only, gone when the
 * tab closes, replaced after 30 minutes without a new page. No cookie, and
 * nothing that survives to the next visit, so it groups one visit's path
 * without recognising anyone. If sessionStorage is blocked (some private
 * modes) the visit lives in memory for this page load instead.
 *
 * Nothing is sent from the owner's browsers (excludeAnalytics=true, set by
 * /owner) or automated ones (Lighthouse, Playwright); the server checks the
 * cookie again.
 */

const KEY = "mf-visit";
const IDLE = 30 * 60 * 1000;

type VisitState = {
  id: string;
  /** Last pageview or action, epoch ms. */
  last: number;
  /** Last page recorded, so a reload isn't a second pageview. */
  path: string | null;
  /** Actions and exposures already sent this visit ("type:target"); each
   * counts once. */
  sent: string[];
  /** Deepest scroll milestone already sent, per page, so a reload or a
   * return to the page in this visit never sends one twice. */
  depth?: Record<string, number>;
};

let memory: VisitState | null = null;
// The first pageview of a page load is the one whose document.referrer
// says where the visitor came from; later ones are moves within the site.
let firstOfLoad = true;

function read(): VisitState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    const state = raw ? (JSON.parse(raw) as VisitState) : null;
    if (state && typeof state.id === "string" && Array.isArray(state.sent)) {
      return state;
    }
  } catch {
    /* blocked or corrupt — fall back to this page load's copy */
  }
  return memory;
}

function write(state: VisitState) {
  memory = state;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* memory copy is enough */
  }
}

function newVisit(now: number): VisitState {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const id = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return { id, last: now, path: null, sent: [] };
}

const tracking = () =>
  !/(?:^|;\s*)excludeAnalytics=true(?:;|$)/.test(document.cookie) &&
  !navigator.webdriver;

function send(url: string, body: Record<string, unknown>) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

/** sendBeacon survives the page closing; a plain string body keeps it a
 * simple request everywhere. Falls back to keepalive fetch. */
function beacon(url: string, body: Record<string, unknown>) {
  try {
    if (navigator.sendBeacon?.(url, JSON.stringify(body))) return;
  } catch {
    /* fall through */
  }
  send(url, body);
}

function sendPageview(path: string, sid: string, referrer: string) {
  const query = new URLSearchParams(window.location.search);
  send("/api/visit", {
    path,
    sid,
    referrer,
    utmSource: query.get("utm_source"),
    utmMedium: query.get("utm_medium"),
    utmCampaign: query.get("utm_campaign"),
    touch: navigator.maxTouchPoints > 1,
    timed: true,
    scroll: true,
    // Also records exposures and Proof notes / Partner Portal clicks, so
    // visits without this are "not measured" for those, not zero.
    seen: true,
  });
}

export function trackPageview(path: string) {
  if (!tracking()) return;
  // Time on the page being left goes to the visit it was spent in, before
  // a long gap can start a new one.
  leavePage();
  const now = Date.now();
  const stored = read();
  const state = stored && now - stored.last <= IDLE ? stored : newVisit(now);
  const repeat = state.path === path;
  state.last = now;
  state.path = path;
  write(state);

  const arrival = firstOfLoad;
  firstOfLoad = false;
  enterPage(path, now);
  // A reload or remount of the page already counted in this visit.
  if (repeat) return;

  sendPageview(path, state.id, arrival ? document.referrer : window.location.origin);
}

// ---------- engaged time ----------
//
// Time counts only while the page is on screen (document.visibilityState
// is "visible": not a background tab, not minimised, not a locked phone)
// AND someone has scrolled, clicked, typed or touched within the last
// minute. A page left open and unattended stops counting a minute after the
// last interaction; a hidden one stops at once. Every stretch is capped at
// that last interaction plus a minute, so a sleeping laptop or a throttled
// timer can't add time either.
//
// What's counted builds up here and goes out as a delta: every 30 seconds
// while it's running, and right away when the tab is hidden, the page
// changes or the page is put away (pagehide) — by sendBeacon, which
// browsers deliver even as a tab closes. A delta is cleared once handed
// off, so nothing is sent twice.

const INPUT_IDLE = 60 * 1000;
const CHECKPOINT = 30 * 1000;
/** Under a second stays here to add up rather than going out alone. */
const MIN_SEND = 1000;

let engagedPath: string | null = null;
let pending = 0;
let runningSince: number | null = null;
let lastInput = 0;
let listening = false;
/** Engaged ms on the current page so far (scroll depth waits on it). */
let pageEngaged = 0;

const onScreen = () => document.visibilityState === "visible";

/** Banks the running stretch, ending it at the last interaction plus a
 * minute if that has already passed. */
function settle(now: number) {
  if (runningSince === null) return;
  const end = Math.min(now, lastInput + INPUT_IDLE);
  const added = Math.max(0, end - runningSince);
  pending += added;
  pageEngaged += added;
  runningSince = end < now ? null : now;
}

function pause(now: number) {
  settle(now);
  runningSince = null;
}

function flush() {
  flushDepth();
  const ms = Math.round(pending);
  if (!engagedPath || ms < MIN_SEND) return;
  const state = read();
  if (!state) return;
  pending = 0;
  // Engaged time is activity: it keeps a long read inside one visit — as of
  // the last interaction, not whenever this happens to run (after a laptop
  // wakes, that could be hours later).
  const now = Date.now();
  state.last = runningSince !== null ? now : Math.min(now, lastInput + INPUT_IDLE);
  write(state);
  beacon("/api/engage", { sid: state.id, path: engagedPath, ms });
}

/** Starts counting if the page is on screen. Coming back after 30+ minutes
 * away is a new visit — on the page that was left open, recorded as a
 * pageview with this site as its referrer. */
function begin(now: number) {
  if (!engagedPath || runningSince !== null || !onScreen()) return;
  const state = read();
  if (state && now - state.last > IDLE) {
    flush();
    const fresh = newVisit(now);
    fresh.path = engagedPath;
    write(fresh);
    sendPageview(engagedPath, fresh.id, window.location.origin);
  }
  lastInput = now;
  runningSince = now;
  scheduleDepth();
}

function interacted() {
  const now = Date.now();
  // Closes a stretch that went idle before this, so the gap isn't counted.
  settle(now);
  lastInput = now;
  begin(now);
}

function leavePage() {
  if (!engagedPath) return;
  pause(Date.now());
  flush();
  pending = 0;
}

function enterPage(path: string, now: number) {
  engagedPath = path;
  pageEngaged = 0;
  fitsSince = null;
  listen();
  begin(now);
}

function listen() {
  if (listening) return;
  listening = true;
  const opts = { capture: true, passive: true };
  for (const type of ["pointerdown", "keydown", "wheel", "touchstart", "scroll"]) {
    document.addEventListener(type, interacted, opts);
  }
  // Mouse movement means someone's there, but it fires constantly — a
  // second's resolution is plenty.
  let lastMove = 0;
  document.addEventListener(
    "pointermove",
    () => {
      const now = Date.now();
      if (now - lastMove < 1000) return;
      lastMove = now;
      interacted();
    },
    opts,
  );
  document.addEventListener("visibilitychange", () => {
    if (onScreen()) {
      begin(Date.now());
      scheduleDepth();
    } else {
      pause(Date.now());
      flush();
    }
  });
  window.addEventListener("pagehide", () => {
    pause(Date.now());
    flush();
  });
  // Back from the back/forward cache: the same page, counting again.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) begin(Date.now());
  });
  window.setInterval(() => {
    if (runningSince === null) return;
    settle(Date.now());
    flush();
  }, CHECKPOINT);
  // Depth follows the page's own scroll only — not the reference library's
  // or any other inner scroller — and re-checks when the viewport changes.
  window.addEventListener("scroll", scheduleDepth, { passive: true });
  window.addEventListener("resize", scheduleDepth, { passive: true });
  window.addEventListener("orientationchange", scheduleDepth, { passive: true });
}

// ---------- scroll depth ----------
//
// How much of the page has been on screen: (scroll position + window
// height) ÷ page height, reported as milestones 25, 50, 75 and 90 — 90 is
// "reached the bottom", since footers, sticky bars and mobile browser chrome
// make an exact 100 unreliable. A page that fits on screen without
// scrolling reports 100 instead, so it reads as "fits" rather than a
// scroll. Each milestone goes out once per visit and page, in order, never
// downward; nothing else about scrolling is sent.
//
// Measuring starts once the page has been on screen, with someone there,
// for 2.5s (engaged time on it): images and fonts settle, and a desktop
// case study grows from one screen to its full length when its sideways
// track pins (about a second in), so an earlier reading — or one taken
// while the tab sat in the background — would call it short. For the same
// reason "fits on screen" has to hold for another 5s of on-screen time
// before it's recorded, and is only ever a page's first and only reading:
// once any milestone has gone out for it, it can't be reclassified.

const MILESTONES = [25, 50, 75, 90];
const FITS = 100;
const DEPTH_SETTLE = 2500;
const FITS_CONFIRM = 5000;

let depthQueue: number[] = [];
/** On-page engaged ms when the page was first seen fitting on screen. */
let fitsSince: number | null = null;
let depthQueuePath: string | null = null;
let depthTimer: ReturnType<typeof setTimeout> | undefined;
let depthScheduled = false;

function scheduleDepth() {
  if (depthScheduled) return;
  depthScheduled = true;
  window.setTimeout(() => {
    depthScheduled = false;
    measureDepth();
  }, 200);
}

function measureDepth() {
  if (!engagedPath || !onScreen()) return;
  const now = Date.now();
  const onPage = pageEngaged + (runningSince === null ? 0 : now - runningSince);
  if (onPage < DEPTH_SETTLE) {
    // Not settled yet: look again once it could be (begin() restarts this
    // if time stops accruing in between).
    if (runningSince !== null) window.setTimeout(measureDepth, DEPTH_SETTLE - onPage + 50);
    return;
  }
  const height = document.documentElement.scrollHeight;
  const view = window.innerHeight;
  if (!height || !view) return;
  const state = read();
  if (!state) return;

  const sent = state.depth?.[engagedPath] ?? 0;
  const fits = height <= view + 2;
  if (fits) {
    if (sent > 0) return;
    fitsSince ??= onPage;
    const wait = FITS_CONFIRM - (onPage - fitsSince);
    if (wait > 0) {
      if (runningSince !== null) window.setTimeout(measureDepth, wait + 50);
      return;
    }
  } else {
    fitsSince = null;
  }
  const seen = ((window.scrollY + view) / height) * 100;
  const reached = fits ? FITS : (MILESTONES.filter((m) => seen >= m).pop() ?? 0);
  if (reached <= sent) return;

  state.depth = { ...state.depth, [engagedPath]: reached };
  write(state);
  if (depthQueuePath !== engagedPath) flushDepth();
  depthQueuePath = engagedPath;
  depthQueue.push(...(reached === FITS ? [FITS] : MILESTONES.filter((m) => m > sent && m <= reached)));
  // A fast scroll crosses several milestones; they go out together.
  clearTimeout(depthTimer);
  depthTimer = setTimeout(flushDepth, 1000);
}

function flushDepth() {
  clearTimeout(depthTimer);
  if (!depthQueue.length || !depthQueuePath) return;
  const state = read();
  if (state) beacon("/api/depth", { sid: state.id, path: depthQueuePath, reached: depthQueue });
  depthQueue = [];
}

/** Counts once per visit per type and target, and returns the visit it's
 * recorded under (null when not tracking). Never starts a new visit for an
 * idle one: the event happened on a page that visit loaded. */
function record(type: EventType, target: string | null): string | null {
  if (!tracking()) return null;
  const state = read() ?? newVisit(Date.now());
  const key = `${type}:${target ?? ""}`;
  if (state.sent.includes(key)) return state.id;
  state.sent = [...state.sent, key].slice(-50);
  state.last = Date.now();
  write(state);
  send("/api/event", { type, target, sid: state.id, path: window.location.pathname });
  return state.id;
}

export function trackAction(type: ActionType, target: string | null = null) {
  record(type, target);
}

/** Something meaningfully on screen (see exposure.ts). */
export const trackExposure = (type: ExposureType, target: string) => record(type, target);

/** The current visit's id, if one has started. */
export const visitId = () => read()?.id ?? null;

/** Which action, if any, a click on `el` is. Elements whose meaning isn't
 * in their address carry `data-track="<action>"` — the copy-email button
 * (CopyEmail), reference-library photos (ReferenceLibrary), the "Want to see
 * more?" links (CaseStudyClosing), Additional work links (AdditionalWork)
 * and the Partner Portal prototype link (a case-study closing CTA); its
 * target is its `data-track-placement` if it has one, else a tagged link's
 * path. Everything else is read from the link's address alone, never from
 * classes, labels or position. */
export function actionFor(el: Element): [ActionType, string | null] | null {
  const tagged = el.closest<HTMLElement>("[data-track]");
  const type = tagged?.dataset.track;
  if (tagged && isAction(type)) {
    return [
      type,
      tagged.dataset.trackPlacement ??
        (tagged instanceof HTMLAnchorElement ? new URL(tagged.href).pathname : null),
    ];
  }

  const link = el.closest<HTMLAnchorElement>("a[href]");
  if (!link) return null;
  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) return ["email", null];
  if (href.startsWith("tel:")) return ["phone", null];

  let url: URL;
  try {
    url = new URL(link.href);
  } catch {
    return null;
  }
  if (/(^|\.)linkedin\.com$/.test(url.hostname)) return ["linkedin", null];
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === "/resume" || url.pathname === "/Marc-Favro-Resume.pdf") {
    return ["resume", null];
  }
  return null;
}
