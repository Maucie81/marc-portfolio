import { isAction, type ActionType } from "./events";

/**
 * Browser side of /analytics: pageviews, the handful of actions in
 * events.ts, and engaged time per page, each tagged with the visit it
 * belongs to.
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
  /** Actions already sent this visit ("type:target"); each counts once. */
  sent: string[];
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

const onScreen = () => document.visibilityState === "visible";

/** Banks the running stretch, ending it at the last interaction plus a
 * minute if that has already passed. */
function settle(now: number) {
  if (runningSince === null) return;
  const end = Math.min(now, lastInput + INPUT_IDLE);
  pending += Math.max(0, end - runningSince);
  runningSince = end < now ? null : now;
}

function pause(now: number) {
  settle(now);
  runningSince = null;
}

function flush() {
  const ms = Math.round(pending);
  if (!engagedPath || ms < MIN_SEND) return;
  const state = read();
  if (!state) return;
  pending = 0;
  // Engaged time is activity: it keeps a long read inside one visit.
  state.last = Date.now();
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
}

/** Counts once per visit per type and target. Never starts a new visit for
 * an idle one: the action happened on a page that visit loaded. */
export function trackAction(type: ActionType, target: string | null = null) {
  if (!tracking()) return;
  const state = read() ?? newVisit(Date.now());
  const key = `${type}:${target ?? ""}`;
  if (state.sent.includes(key)) return;
  state.sent = [...state.sent, key].slice(-50);
  state.last = Date.now();
  write(state);
  send("/api/event", { type, target, sid: state.id, path: window.location.pathname });
}

/** Which action, if any, a click on `el` is. Elements whose meaning isn't
 * in their address carry `data-track="<action>"` — the copy-email button
 * (CopyEmail), reference-library photos (ReferenceLibrary), the "Want to see
 * more?" links (CaseStudyClosing) and Additional work links (AdditionalWork);
 * a tagged link's path is its target. Everything else is read from the
 * link's address alone, never from classes, labels or position. */
export function actionFor(el: Element): [ActionType, string | null] | null {
  const tagged = el.closest<HTMLElement>("[data-track]");
  const type = tagged?.dataset.track;
  if (tagged && isAction(type)) {
    return [type, tagged instanceof HTMLAnchorElement ? new URL(tagged.href).pathname : null];
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
