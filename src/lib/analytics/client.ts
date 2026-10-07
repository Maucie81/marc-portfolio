import type { ActionType } from "./events";

/**
 * Browser side of /analytics: pageviews and the handful of actions in
 * events.ts, each tagged with the visit it belongs to.
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

export function trackPageview(path: string) {
  if (!tracking()) return;
  const now = Date.now();
  const stored = read();
  const state = stored && now - stored.last <= IDLE ? stored : newVisit(now);
  const repeat = state.path === path;
  state.last = now;
  state.path = path;
  write(state);

  const arrival = firstOfLoad;
  firstOfLoad = false;
  // A reload or remount of the page already counted in this visit.
  if (repeat) return;

  const query = new URLSearchParams(window.location.search);
  send("/api/visit", {
    path,
    sid: state.id,
    referrer: arrival ? document.referrer : window.location.origin,
    utmSource: query.get("utm_source"),
    utmMedium: query.get("utm_medium"),
    utmCampaign: query.get("utm_campaign"),
    touch: navigator.maxTouchPoints > 1,
  });
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

/** Which action, if any, a click on `el` is — read from what the element
 * already is (its link, or the existing reference-library and copy-email
 * buttons), so the site's components don't carry tracking code. */
export function actionFor(el: Element): [ActionType, string | null] | null {
  if (el.closest("button.lib-open")) return ["library", null];
  if (el.closest('button[aria-label^="Copy email address"]')) return ["email", null];

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
  // "Want to see more?" at the end of every case study.
  if (link.closest(".cs-closing-block") && url.pathname.startsWith("/work/")) {
    return ["project_nav", url.pathname];
  }
  if (link.closest("#additional-work")) return ["additional_work", url.pathname];
  return null;
}
