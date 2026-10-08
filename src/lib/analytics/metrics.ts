import { HERO_DEFAULT } from "@/lib/hero-editions";
import { additionalWork, projects } from "@/lib/home";
import { pageLabel } from "@/lib/page-titles";
import {
  ACTIONS,
  CONTACT_ACTIONS,
  HIRING_ACTIONS,
  PRODUCT_ACTIONS,
  SECTIONS,
  isAction,
  type ActionType,
  type ExposureType,
  type SectionId,
} from "./events";
import type { ActionEvent, Depth, Engaged, Visit } from "./store";

/**
 * Everything /analytics shows, worked out from the stored pageviews and
 * actions. Nothing here is stored — it's all recomputed per request, so a
 * change to a definition (what counts as a source, a journey step, the
 * funnel) applies to past data too.
 *
 * The unit for most numbers is a visit: the pageviews and actions sharing
 * one session id (see client.ts). Pageviews recorded before visits existed
 * (no sid) still count as pageviews and in "Pageviews by page", but can't
 * be placed in a visit, so they're left out of everything visit-based.
 *
 * Engaged time is only known for visits whose tracker measured it (pageviews
 * marked `timed`, from Oct 7, 2026); earlier visits are left out of every
 * time figure rather than counted as zero. The same goes for what came into
 * view (hero edition, homepage sections, Recent work cards) and for Proof
 * notes and Partner Portal clicks: only visits whose tracker records them
 * (pageviews marked `seen`) are in those figures, so a visit from before
 * they existed is "not measured", never "didn't happen".
 */

export const TIME_ZONE = "America/New_York"; // Marc's — "Today" and the trend buckets
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
/** Matches the tracker's idle timeout, so a visit that began just before a
 * range starts is still read whole (and then left out, as it began earlier). */
const LOOKBACK = 30 * 60 * 1000;

export const RANGES = {
  today: { label: "Today", days: null },
  "7d": { label: "7 days", days: 7 },
  "30d": { label: "30 days", days: 30 },
  "90d": { label: "90 days", days: 90 },
  all: { label: "All time", days: null },
} as const;

export type RangeKey = keyof typeof RANGES;

export const isRange = (value: string | null): value is RangeKey =>
  value !== null && Object.hasOwn(RANGES, value);

// ---------- time ----------

const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function partsOf(ms: number) {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormat.formatToParts(ms)) p[type] = value;
  return {
    y: +p.year,
    m: +p.month,
    d: +p.day,
    h: +p.hour,
    min: +p.minute,
    s: +p.second,
    // 0 = Monday
    dow: WEEKDAYS.indexOf(p.weekday),
  };
}

/** TIME_ZONE's offset from UTC at `ms`. */
function offsetAt(ms: number) {
  const p = partsOf(ms);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - (ms - (ms % 1000));
}

/** Midnight in TIME_ZONE of the day containing `ms`. Offset taken twice so
 * a daylight-saving change earlier that day can't shift it an hour. */
function startOfDay(ms: number) {
  const p = partsOf(ms);
  const wall = Date.UTC(p.y, p.m - 1, p.d);
  return wall - offsetAt(wall - offsetAt(ms));
}

/** Where the range begins; 0 for All time. Ranges are whole local days —
 * "7 days" is today and the six before it — so the trend has exactly that
 * many bars. Noon is the anchor for stepping back, well clear of DST. */
export function rangeStart(range: RangeKey, nowMs: number) {
  const today = startOfDay(nowMs);
  if (range === "today") return today;
  const days = RANGES[range].days;
  return days === null ? 0 : startOfDay(today + 12 * HOUR - (days - 1) * DAY);
}

/** What the store should be read from to see whole visits. */
export const fetchFrom = (startMs: number) => Math.max(0, startMs - LOOKBACK);

type Unit = "hour" | "day" | "week" | "month";

const utcLabel = (ms: number, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(ms);

function bucketOf(ms: number, unit: Unit): { key: string; label: string } {
  const p = partsOf(ms);
  const date = Date.UTC(p.y, p.m - 1, p.d);
  switch (unit) {
    case "hour": {
      const h12 = p.h % 12 || 12;
      return { key: `${date}-${p.h}`, label: `${h12} ${p.h < 12 ? "AM" : "PM"}` };
    }
    case "day":
      return {
        key: `${date}`,
        label: utcLabel(date, { weekday: "short", month: "short", day: "numeric" }),
      };
    case "week": {
      const monday = date - p.dow * DAY;
      return {
        key: `${monday}`,
        label: `Week of ${utcLabel(monday, { month: "short", day: "numeric" })}`,
      };
    }
    case "month":
      return {
        key: `${p.y}-${p.m}`,
        label: utcLabel(date, { month: "short", year: "numeric" }),
      };
  }
}

// ---------- labels and sources ----------

/** Shorter names for the journey strip, where five full titles in a row
 * stop being scannable. Everything else uses pageLabel's full titles. */
const SHORT_LABELS: Record<string, string> = {
  "/work/yahoo-partner-portal": "Yahoo Partner Portal",
  "/work/airbnb-hotels": "Airbnb onboarding",
  "/work/headspace-admin-portal": "Headspace admin portal",
  "/work/headspace-umd": "Headspace UMD",
};
export const shortLabel = (path: string) => SHORT_LABELS[path] ?? pageLabel(path);

const isCaseStudy = (path: string) => path.startsWith("/work/");

/** The case studies the public can open — the homepage's own lists. */
const PUBLIC_CASE_STUDIES = [
  ...projects.map((p) => p.href),
  ...additionalWork.filter((p) => !p.comingSoon).map((p) => p.href),
].filter((href): href is string => Boolean(href && isCaseStudy(href)));

/** The "source" of a visit whose first page was reached from this site
 * itself: a page opened in a new tab from the site, or a tab left idle 30+
 * minutes and picked up again (client.ts starts a new visit, with the site
 * as its referrer). Not how anyone found the site — a referrer state, kept
 * apart from real sources in the dashboard. */
export const INTERNAL_SOURCE = "Internal / new tab";

// Hosts that mean "came from another page on this site".
const SITE_HOST = /(^|\.)marcfavro\.com$|^localhost$|^127\.0\.0\.1$|\.vercel\.app$/;

// Friendly names for the referrers a portfolio actually gets. Anything else
// shows as its bare host.
const SOURCE_NAMES: [RegExp, string][] = [
  [/(^|\.)linkedin\.com$|^lnkd\.in$|^com\.linkedin\.android$/, "LinkedIn"],
  [/^mail\.google\.com$|^com\.google\.android\.gm$/, "Gmail"],
  [/(^|\.)google\.[a-z.]+$|^com\.google\.android/, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/^t\.co$|(^|\.)(x|twitter)\.com$/, "X"],
  [/(^|\.)facebook\.com$|^fb\.me$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)dribbble\.com$/, "Dribbble"],
  [/(^|\.)behance\.net$/, "Behance"],
  [/(^|\.)slack\.com$/, "Slack"],
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
];

export const isInternal = (v: Visit) =>
  v.referrer !== null && SITE_HOST.test(v.referrer);

/** UTM source wins, then the referrer, else Direct. A UTM source that
 * spells a known name ("linkedin") joins that referrer's row. */
export function sourceOf(v: Visit): string {
  if (v.utmSource) {
    const tag = v.utmSource.toLowerCase();
    return SOURCE_NAMES.find(([, name]) => name.toLowerCase() === tag)?.[1] ?? v.utmSource;
  }
  if (!v.referrer) return "Direct";
  if (isInternal(v)) return "Internal";
  const named = SOURCE_NAMES.find(([pattern]) => pattern.test(v.referrer!));
  return named ? named[1] : v.referrer.replace(/^www\./, "");
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
export function countryName(code: string | null | undefined): string {
  if (!code) return "Unknown";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

// ---------- visits ----------

type Action = ActionEvent & { type: ActionType };

export type Session = {
  start: number;
  views: Visit[];
  actions: Action[];
  /** What came into view (hero, sections, cards), in order. */
  exposures: ActionEvent[];
  /** Recorded by a tracker that records exposures, Proof notes and Partner
   * Portal clicks (pageviews marked `seen`). */
  seenTracked: boolean;
  first: Visit;
  source: string;
  caseStudies: Set<string>;
  did: Set<ActionType>;
  hiring: boolean;
  contact: boolean;
  /** Engaged time was measured for this visit (a zero is a real zero). */
  timed: boolean;
  /** Engaged ms per page. */
  engaged: Map<string, number>;
  engagedMs: number;
  /** Scroll depth was recorded for this visit (from Oct 7, 2026). */
  scrollTracked: boolean;
  /** Deepest milestone per page: 25/50/75/90, 100 = fit on screen. */
  depth: Map<string, number>;
};

function sessionize(
  visits: Visit[],
  events: ActionEvent[],
  engaged: Engaged[],
  depth: Depth[],
  startMs: number,
) {
  const bySid = new Map<string, { views: Visit[]; actions: Action[]; exposures: ActionEvent[] }>();
  for (const v of visits) {
    if (!v.sid) continue;
    const s = bySid.get(v.sid) ?? { views: [], actions: [], exposures: [] };
    s.views.push(v);
    bySid.set(v.sid, s);
  }
  for (const e of events) {
    const s = bySid.get(e.sid);
    if (!s) continue;
    if (isAction(e.type)) s.actions.push(e as Action);
    else s.exposures.push(e);
  }
  const engagedBySid = new Map<string, Map<string, number>>();
  for (const { sid, path, ms } of engaged) {
    const pages = engagedBySid.get(sid) ?? new Map<string, number>();
    pages.set(path, (pages.get(path) ?? 0) + ms);
    engagedBySid.set(sid, pages);
  }
  const depthBySid = new Map<string, Map<string, number>>();
  for (const { sid, path, milestone } of depth) {
    const pages = depthBySid.get(sid) ?? new Map<string, number>();
    pages.set(path, Math.max(pages.get(path) ?? 0, milestone));
    depthBySid.set(sid, pages);
  }

  const sessions: Session[] = [];
  for (const [sid, { views, actions, exposures }] of bySid) {
    const start = Date.parse(views[0].ts);
    if (start < startMs) continue;
    const did = new Set(actions.map((a) => a.type));
    const timed = views.some((v) => v.timed);
    const pages = timed ? (engagedBySid.get(sid) ?? new Map<string, number>()) : new Map<string, number>();
    sessions.push({
      start,
      views,
      actions,
      exposures,
      seenTracked: views.some((v) => v.seen),
      first: views[0],
      source: isInternal(views[0]) ? INTERNAL_SOURCE : sourceOf(views[0]),
      caseStudies: new Set(views.map((v) => v.path).filter(isCaseStudy)),
      did,
      hiring: HIRING_ACTIONS.some((t) => did.has(t)),
      contact: CONTACT_ACTIONS.some((t) => did.has(t)),
      timed,
      engaged: pages,
      engagedMs: [...pages.values()].reduce((sum, ms) => sum + ms, 0),
      scrollTracked: views.some((v) => v.scroll),
      depth: depthBySid.get(sid) ?? new Map<string, number>(),
    });
  }
  return sessions.sort((a, b) => a.start - b.start);
}

const JOURNEY_STEPS = 6;
const JOURNEY_ACTION_LABELS: Partial<Record<ActionType, string>> = {
  resume: "Resume",
  linkedin: "LinkedIn",
  email: "Email",
  phone: "Phone",
  contact_form: "Contact form sent",
  proof_notes: "Proof notes",
  partner_portal: "Partner Portal prototype",
};

/** Pages in order, with resume / LinkedIn / contact, Proof notes and
 * Partner Portal actions as steps of their own; repeats in a row collapse,
 * long paths end in "…". */
function journeyOf(s: Session): string[] {
  const steps = [
    ...s.views.map((v) => ({ t: Date.parse(v.ts), label: shortLabel(v.path) })),
    ...s.actions
      .filter((a) => JOURNEY_ACTION_LABELS[a.type])
      .map((a) => ({ t: Date.parse(a.ts), label: JOURNEY_ACTION_LABELS[a.type]! })),
  ]
    .sort((a, b) => a.t - b.t)
    .map((step) => step.label)
    .filter((label, i, all) => label !== all[i - 1]);
  return steps.length > JOURNEY_STEPS
    ? [...steps.slice(0, JOURNEY_STEPS), "…"]
    : steps;
}

// ---------- scroll depth ----------

/** Reaching the bottom of a case study in less engaged time than this
 * reads as a skim or a jump rather than a pass through it. */
export const QUICK_BOTTOM_MS = 30 * 1000;

/** How far the visits that opened `path` got, among visits whose tracker
 * recorded depth. A page that fit on screen (100) counts as every
 * milestone reached. */
function scrollDepth(sessions: Session[], path: string) {
  const viewers = sessions.filter((s) => s.scrollTracked && s.views.some((v) => v.path === path));
  const deepest = viewers.map((s) => s.depth.get(path) ?? 0).sort((a, b) => a - b);
  const at = (m: number) => deepest.filter((d) => d >= m).length;
  const bottom = viewers.filter((s) => (s.depth.get(path) ?? 0) >= 90);
  return {
    n: viewers.length,
    r25: at(25),
    r50: at(50),
    r75: at(75),
    r90: at(90),
    fits: deepest.filter((d) => d === 100).length,
    // Middle visit's deepest milestone (the lower middle for an even count,
    // so it's always a milestone someone actually reached).
    typical: deepest.length ? deepest[(deepest.length - 1) >> 1] : null,
    bottomTimed: bottom.filter((s) => s.timed).length,
    bottomQuick: bottom.filter((s) => s.timed && (s.engaged.get(path) ?? 0) < QUICK_BOTTOM_MS).length,
  };
}

// ---------- time to act ----------

/** Wall-clock time from a homepage arrival to the first case study that
 * visit opened; null for visits that started elsewhere or never opened one,
 * so landing straight on a case study can't read as an instant decision. */
function toFirstCaseStudy(s: Session): number | null {
  if (s.first.path !== "/") return null;
  const view = s.views.find((v) => isCaseStudy(v.path));
  return view ? Date.parse(view.ts) - s.start : null;
}

/** Wall-clock time from arrival to the visit's first resume, LinkedIn or
 * contact action; null if it took none. */
function toFirstHiring(s: Session): number | null {
  const times = s.actions
    .filter((a) => HIRING_ACTIONS.includes(a.type))
    .map((a) => Date.parse(a.ts));
  return times.length ? Math.max(0, Math.min(...times) - s.start) : null;
}

/** Steps that count as acting on the portfolio: opening a case study,
 * reaching Contact (the page), and these. */
const MEANINGFUL_ACTIONS: ActionType[] = [...HIRING_ACTIONS, "proof_notes", "partner_portal"];

/** Wall-clock time from a homepage arrival to the visit's first meaningful
 * step — a case study, the Contact page, resume, LinkedIn, email, phone,
 * the contact form, Proof notes or the Partner Portal prototype. Only for
 * visits whose tracker records Proof notes and Partner Portal clicks, so
 * an older visit can't look slower for want of them. */
function toFirstMeaningful(s: Session): number | null {
  if (s.first.path !== "/" || !s.seenTracked) return null;
  const times = [
    ...s.views.filter((v) => isCaseStudy(v.path) || v.path === "/contact").map((v) => Date.parse(v.ts)),
    ...s.actions.filter((a) => MEANINGFUL_ACTIONS.includes(a.type)).map((a) => Date.parse(a.ts)),
  ].filter((t) => t >= s.start);
  return times.length ? Math.min(...times) - s.start : null;
}

/** Wall-clock time from the first case study a visit opened to the next
 * different one; null if it opened only one. Engaged time can't be split
 * this way — it's stored per page as a running total, with no time — so
 * this includes any time the tab spent in the background. */
function toNextCaseStudy(s: Session): number | null {
  const i = s.views.findIndex((v) => isCaseStudy(v.path));
  if (i < 0) return null;
  const next = s.views.slice(i + 1).find((v) => isCaseStudy(v.path) && v.path !== s.views[i].path);
  return next ? Date.parse(next.ts) - Date.parse(s.views[i].ts) : null;
}

const known = (values: (number | null)[]) => values.filter((v): v is number => v !== null);

/** Actions only the newer tracker (pageviews marked `seen`) records. */
const SEEN_ACTIONS: ActionType[] = ["proof_notes", "partner_portal"];

// ---------- what came into view ----------

/** An exposure and the pageview it led to can reach the server out of
 * order (the click that records a card also navigates), so "after" allows
 * this much slack. */
const ORDER_SLACK = 5000;

const isHome = (v: Visit) => v.path === "/";

/** When the visit first had this in view, or null. */
function seenAt(s: Session, type: ExposureType, target: string): number | null {
  const e = s.exposures.find((x) => x.type === type && x.target === target);
  return e ? Date.parse(e.ts) : null;
}

/** Opened `path` (or, without one, any case study) at or after `t`. */
function openedAfter(s: Session, t: number, path?: string) {
  return s.views.some(
    (v) => (path ? v.path === path : isCaseStudy(v.path)) && Date.parse(v.ts) >= t - ORDER_SLACK,
  );
}

/** Homepage visits whose tracker records what came into view — the base
 * for hero, section and card figures. */
const exposureEligible = (s: Session) => s.seenTracked && s.views.some(isHome);

/** Saw Recent work, and how many of those went on to open a case study. */
function recentWorkReach(group: Session[]) {
  const home = group.filter(exposureEligible);
  const saw = home.flatMap((s) => {
    const t = seenAt(s, "section", "recent-work");
    return t === null ? [] : [{ s, t }];
  });
  return { home: home.length, seen: saw.length, opened: saw.filter(({ s, t }) => openedAfter(s, t)).length };
}

const DEVICES = [
  ["Mobile", "mobile"],
  ["Desktop", "desktop"],
] as const;

// ---------- live ----------

export const LIVE_MS = 5 * 60 * 1000;
export const RECENT_MS = 30 * 60 * 1000;

/** Visits with a pageview or action at or after `sinceMs`, from every record
 * read rather than just the range's visits, so a visit that began before
 * the range still counts. Someone reading one long page without clicking
 * sends neither — engaged-time checkpoints are stored as running totals
 * with no time attached — so this is "recently active", not "reading now". */
function activeSince(visits: Visit[], events: ActionEvent[], sinceMs: number) {
  const sids = new Set<string>();
  for (const v of visits) if (v.sid && Date.parse(v.ts) >= sinceMs) sids.add(v.sid);
  // Actions only: something coming into view isn't an action.
  for (const e of events) if (isAction(e.type) && Date.parse(e.ts) >= sinceMs) sids.add(e.sid);
  return sids.size;
}

// ---------- the report ----------

export type Row = [label: string, count: number];

/** Median, mean and total of a set of durations; null when there are none. */
export type TimeStats = { n: number; median: number; mean: number; total: number } | null;

function timeStats(values: number[]): TimeStats {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const total = sorted.reduce((sum, ms) => sum + ms, 0);
  return { n: sorted.length, median, mean: total / sorted.length, total };
}

function tally<T>(items: T[], keyOf: (item: T) => string | null): Row[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    if (key === null) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function buildReport(opts: {
  visits: Visit[];
  events: ActionEvent[];
  engaged: Engaged[];
  depth: Depth[];
  range: RangeKey;
  nowMs: number;
}) {
  const { range, nowMs } = opts;
  const startMs = rangeStart(range, nowMs);
  const pageviews = opts.visits.filter((v) => Date.parse(v.ts) >= startMs);
  const sessions = sessionize(opts.visits, opts.events, opts.engaged, opts.depth, startMs);
  const n = sessions.length;
  const count = (test: (s: Session) => boolean) => sessions.filter(test).length;
  const timed = sessions.filter((s) => s.timed);
  /** Engaged time on `path` across the measured visits that opened it. */
  const engagedOn = (path: string) =>
    timeStats(
      timed
        .filter((s) => s.views.some((v) => v.path === path))
        .map((s) => s.engaged.get(path) ?? 0),
    );
  const depthOn = (path: string) => scrollDepth(sessions, path);

  // Trend: visits by when they began, pageviews by when they happened.
  const trendStart =
    range === "all"
      ? Math.min(nowMs, ...pageviews.slice(0, 1).map((v) => Date.parse(v.ts)))
      : startMs;
  const span = nowMs - trendStart;
  const unit: Unit =
    range === "today"
      ? "hour"
      : range === "90d" || (range === "all" && span > 31 * DAY)
        ? span > 730 * DAY
          ? "month"
          : "week"
        : "day";
  const trend = new Map<string, { label: string; visits: number; pageviews: number }>();
  for (let t = trendStart; t <= nowMs + HOUR; t += HOUR) {
    const { key, label } = bucketOf(Math.min(t, nowMs), unit);
    if (!trend.has(key)) trend.set(key, { label, visits: 0, pageviews: 0 });
  }
  for (const s of sessions) {
    const bucket = trend.get(bucketOf(s.start, unit).key);
    if (bucket) bucket.visits++;
  }
  for (const v of pageviews) {
    const bucket = trend.get(bucketOf(Date.parse(v.ts), unit).key);
    if (bucket) bucket.pageviews++;
  }

  // Case studies: every public one (even at zero, so a quiet project
  // shows), plus any other /work page someone reached.
  const caseStudyPaths = new Set([
    ...PUBLIC_CASE_STUDIES,
    ...pageviews.map((v) => v.path).filter(isCaseStudy),
  ]);
  const caseStudies = [...caseStudyPaths]
    .map((path) => {
      const viewers = sessions.filter((s) => s.caseStudies.has(path));
      return {
        path,
        label: pageLabel(path),
        visits: viewers.length,
        views: pageviews.filter((v) => v.path === path).length,
        landed: count((s) => s.first.path === path),
        continued: viewers.filter((s) => continuedAfter(s, path)).length,
        hiring: viewers.filter((s) => s.hiring).length,
        engaged: engagedOn(path),
        depth: depthOn(path),
      };
    })
    .sort((a, b) => b.visits - a.visits || b.views - a.views || a.label.localeCompare(b.label));

  const pagePaths = [...new Set(pageviews.map((v) => v.path))];
  const pages = pagePaths
    .map((path) => ({
      path,
      label: pageLabel(path),
      views: pageviews.filter((v) => v.path === path).length,
      visits: count((s) => s.views.some((v) => v.path === path)),
      engaged: engagedOn(path),
      depth: depthOn(path),
    }))
    .sort((a, b) => b.views - a.views || a.label.localeCompare(b.label));

  const sources = tally(sessions, (s) => s.source).map(([name, visits]) => {
    const from = sessions.filter((s) => s.source === name);
    return {
      name,
      visits,
      caseStudy: from.filter((s) => s.caseStudies.size > 0).length,
      hiring: from.filter((s) => s.hiring).length,
      engaged: timeStats(from.filter((s) => s.timed).map((s) => s.engagedMs)),
    };
  });

  const journeys = tally(
    sessions.map(journeyOf).filter((steps) => steps.length > 1),
    (steps) => steps.join(" → "),
  );

  const viewedOne = count((s) => s.caseStudies.size >= 1);
  const viewedTwo = count((s) => s.caseStudies.size >= 2);
  const seenVisits = count((s) => s.seenTracked);

  return {
    range,
    startMs,
    nowMs,
    firstPageviewMs: pageviews.length ? Date.parse(pageviews[0].ts) : null,
    unit,
    pageviews: pageviews.length,
    legacyPageviews: pageviews.filter((v) => !v.sid).length,
    visits: n,
    sessionPageviews: sessions.reduce((sum, s) => sum + s.views.length, 0),
    trend: [...trend.values()],
    funnel: [
      { label: "Visits", count: n },
      { label: "Viewed a case study", count: viewedOne },
      { label: "Viewed 2+ case studies", count: viewedTwo },
      {
        // Only visits that reached the step above — not the same as the
        // overall "Resume, LinkedIn or contact" count, which is any visit.
        label: "Viewed 2+, then opened resume, LinkedIn or contact",
        count: count((s) => s.caseStudies.size >= 2 && s.hiring),
      },
    ],
    startedOnHome: count((s) => s.first.path === "/"),
    homeToCaseStudy: count((s) => s.first.path === "/" && s.caseStudies.size > 0),
    hiring: count((s) => s.hiring),
    contact: count((s) => s.contact),
    viewedTwo,
    singlePage: count((s) => s.views.length === 1),
    engagedPerVisit: timeStats(timed.map((s) => s.engagedMs)),
    untimedVisits: n - timed.length,
    unscrolledVisits: count((s) => !s.scrollTracked),
    caseStudies,
    pages,
    entries: tally(sessions, (s) => pageLabel(s.first.path)),
    sources,
    utm: {
      source: tally(sessions, (s) => s.first.utmSource),
      medium: tally(sessions, (s) => s.first.utmMedium),
      campaign: tally(sessions, (s) => s.first.utmCampaign),
    },
    journeys,
    // `base` is what a share is out of: every visit, or — for actions only
    // the newer tracker records — the visits it recorded.
    actions: [
      ...(Object.keys(ACTIONS) as ActionType[]).map((type) => ({
        type: type as ActionType | null,
        label: ACTIONS[type] as string,
        visits: count((s) => s.did.has(type)),
        base: SEEN_ACTIONS.includes(type) ? seenVisits : n,
        hiring: HIRING_ACTIONS.includes(type),
        product: PRODUCT_ACTIONS.includes(type),
      })),
      {
        type: null,
        label: "Contact page viewed",
        visits: count((s) => s.views.some((v) => v.path === "/contact")),
        base: n,
        hiring: false,
        product: false,
      },
    ],
    seenVisits,
    audience: {
      country: tally(sessions, (s) => countryName(s.first.country)),
      device: tally(sessions, (s) =>
        s.first.device ? s.first.device[0].toUpperCase() + s.first.device.slice(1) : "Unknown",
      ),
      browser: tally(sessions, (s) => s.first.browser ?? "Unknown"),
      os: tally(sessions, (s) => s.first.os ?? "Unknown"),
      region: tally(sessions, (s) =>
        s.first.region ? `${s.first.region}, ${countryName(s.first.country)}` : "Unknown",
      ),
      city: tally(sessions, (s) =>
        s.first.city
          ? [s.first.city, s.first.region, s.first.country].filter(Boolean).join(", ")
          : "Unknown",
      ),
    },
    recent: pageviews.slice(-50).reverse(),
    recentVisits: sessions
      .slice(-25)
      .reverse()
      .map((s) => ({
        start: s.start,
        first: s.first,
        source: s.source,
        journey: journeyOf(s),
        engagedMs: s.timed ? s.engagedMs : null,
        hiring: s.hiring,
      })),
    recentActions: opts.events
      .filter((e): e is Action => isAction(e.type) && Date.parse(e.ts) >= startMs)
      .slice(-30)
      .reverse()
      .map((e) => ({ ts: e.ts, label: ACTIONS[e.type] ?? e.type, path: e.path, target: e.target })),
    timing: {
      toCaseStudy: timeStats(known(sessions.map(toFirstCaseStudy))),
      toHiring: timeStats(known(sessions.map(toFirstHiring))),
      toMeaningful: timeStats(known(sessions.map(toFirstMeaningful))),
      // Of the measured homepage arrivals, how many took no meaningful step.
      meaningfulBase: count((s) => s.first.path === "/" && s.seenTracked),
      toNextCaseStudy: timeStats(known(sessions.map(toNextCaseStudy))),
    },
    exposure: exposureReport(sessions),
    partnerPortal: partnerPortal(sessions),
    live: {
      now: activeSince(opts.visits, opts.events, nowMs - LIVE_MS),
      recent: activeSince(opts.visits, opts.events, nowMs - RECENT_MS),
    },
    devices: deviceComparison(sessions, caseStudies.map((c) => c.path)),
  };
}

export type Report = ReturnType<typeof buildReport>;

// ---------- device behavior ----------

/** Below this, a device group's percentages are directional at best. */
export const SMALL_GROUP = 10;
/** Tablets get their own column only once there are this many. */
const TABLET_MIN = 10;

/** The most common multi-step path, and how many paths share that count. */
function topJourney(group: Session[]) {
  const rows = tally(
    group.map(journeyOf).filter((steps) => steps.length > 1),
    (steps) => steps.join(" → "),
  );
  if (!rows.length) return null;
  return { path: rows[0][0], visits: rows[0][1], ties: rows.filter(([, n]) => n === rows[0][1]).length };
}

/** Opened `path`, then a different case study later in the same visit. */
function continuedAfter(s: Session, path: string) {
  const first = s.views.findIndex((v) => v.path === path);
  return first >= 0 && s.views.slice(first + 1).some((v) => isCaseStudy(v.path) && v.path !== path);
}

/** The behavior numbers compared side by side, for any slice of visits:
 * a device, a hero edition. */
function groupStats(label: string, group: Session[]) {
  const count = (test: (s: Session) => boolean) => group.filter(test).length;
  const viewedOne = count((s) => s.caseStudies.size >= 1);
  const viewedTwo = count((s) => s.caseStudies.size >= 2);
  const caseStudy = [...new Set(group.flatMap((s) => [...s.caseStudies]))]
    .map((path) => ({ label: pageLabel(path), visits: count((s) => s.caseStudies.has(path)) }))
    .sort((a, b) => b.visits - a.visits || a.label.localeCompare(b.label));
  // Every case study a depth-tracked visit opened, and how far it got.
  const opens = group
    .filter((s) => s.scrollTracked)
    .flatMap((s) => [...s.caseStudies].map((path) => s.depth.get(path) ?? 0));
  return {
    label,
    visits: group.length,
    caseStudyOpens: opens.length,
    caseStudy50: opens.filter((d) => d >= 50).length,
    caseStudy90: opens.filter((d) => d >= 90).length,
    // From the visits themselves, so it reconciles with Visits; the overview
    // card also counts pageviews from before visits were tracked.
    pageviews: group.reduce((sum, s) => sum + s.views.length, 0),
    engaged: timeStats(group.filter((s) => s.timed).map((s) => s.engagedMs)),
    viewedOne,
    viewedTwo,
    hiring: count((s) => s.hiring),
    contact: count((s) => s.contact),
    // Same steps and definitions as the main hiring funnel.
    funnel: [group.length, viewedOne, viewedTwo, count((s) => s.caseStudies.size >= 2 && s.hiring)],
    toCaseStudy: timeStats(known(group.map(toFirstCaseStudy))),
    toHiring: timeStats(known(group.map(toFirstHiring))),
    recentWork: recentWorkReach(group),
    topCaseStudy: caseStudy[0] ?? null,
    topCaseStudyTies: caseStudy.filter((c) => c.visits === caseStudy[0]?.visits).length,
    topJourney: topJourney(group),
  };
}

/** Mobile against desktop, by the device each visit started on. Tablets
 * join as a third column once there are TABLET_MIN of them; until then
 * they're counted in the note, not the comparison. */
function deviceComparison(sessions: Session[], caseStudyPaths: string[]) {
  const on = (device: string | null) => sessions.filter((s) => (s.first.device ?? null) === device);
  const tablet = on("tablet");
  const members: [string, Session[]][] = [
    ["Mobile", on("mobile")],
    ["Desktop", on("desktop")],
    ...(tablet.length >= TABLET_MIN ? [["Tablet", tablet] as [string, Session[]]] : []),
  ];

  const caseStudies = caseStudyPaths
    .map((path) => ({
      label: pageLabel(path),
      byDevice: members.map(([label, group]) => {
        const viewers = group.filter((s) => s.caseStudies.has(path));
        return {
          label,
          visits: viewers.length,
          engaged: timeStats(viewers.filter((s) => s.timed).map((s) => s.engaged.get(path) ?? 0)),
          continued: viewers.filter((s) => continuedAfter(s, path)).length,
          acted: viewers.filter((s) => s.hiring).length,
        };
      }),
    }))
    .filter((c) => c.byDevice.some((d) => d.visits > 0));

  return {
    groups: members.map(([label, group]) => groupStats(label, group)),
    tablet: { visits: tablet.length, shown: tablet.length >= TABLET_MIN },
    unknown: on(null).length,
    total: sessions.length,
    caseStudies,
  };
}

// ---------- hero, sections, cards ----------

const onDevice = (group: Session[], device: string) => group.filter((s) => s.first.device === device);

/** Hero editions, homepage section reach and Recent work cards, each over
 * the homepage visits whose tracker records them (exposureEligible). */
function exposureReport(sessions: Session[]) {
  const home = sessions.filter(exposureEligible);

  // The edition each visit had on screen (the first, if a ?hero= QA link
  // changed it mid-visit).
  const withHero = home.flatMap((s) => {
    const hero = s.exposures.find((e) => e.type === "hero")?.target;
    return hero ? [{ s, hero }] : [];
  });
  const heroes = [...new Set(withHero.map((h) => h.hero))]
    .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)))
    .map((id) => {
      const group = withHero.filter((h) => h.hero === id).map((h) => h.s);
      const first = tally(group, (s) => {
        const view = s.views.find((v) => isCaseStudy(v.path));
        return view ? shortLabel(view.path) : null;
      });
      return {
        id,
        label: `Hero ${id.slice(5)}`,
        firstVisitEdition: Number(id.slice(5)) === HERO_DEFAULT,
        stats: groupStats(id, group),
        firstCaseStudy: first[0] && (first.length === 1 || first[0][1] > first[1][1]) ? first[0] : null,
      };
    });

  const sections = (Object.keys(SECTIONS) as SectionId[]).map((id) => {
    const saw = home.filter((s) => seenAt(s, "section", id) !== null);
    return {
      id,
      label: SECTIONS[id] as string,
      seen: saw.length,
      byDevice: DEVICES.map(([label, device]) => ({
        label,
        home: onDevice(home, device).length,
        seen: onDevice(saw, device).length,
      })),
    };
  });

  const cards = projects
    .filter((p) => p.href?.startsWith("/work/"))
    .map((p) => {
      const path = p.href!;
      const slug = path.slice(6);
      const seen = home.flatMap((s) => {
        const t = seenAt(s, "card", slug);
        return t === null ? [] : [{ s, t }];
      });
      const opened = seen.filter(({ s, t }) => openedAfter(s, t, path)).map(({ s }) => s);
      return {
        slug,
        label: shortLabel(path),
        impressions: seen.length,
        opens: opened.length,
        byDevice: DEVICES.map(([label, device]) => ({
          label,
          impressions: seen.filter(({ s }) => s.first.device === device).length,
          opens: onDevice(opened, device).length,
        })),
        engaged: timeStats(opened.filter((s) => s.timed).map((s) => s.engaged.get(path) ?? 0)),
      };
    });

  return {
    home: home.length,
    heroShown: withHero.length,
    heroes,
    sections,
    recentWork: recentWorkReach(sessions),
    cards,
  };
}

// ---------- Partner Portal CTA ----------

const PARTNER_PORTAL = "/work/yahoo-partner-portal";

/** The Yahoo case study's prototype link: who clicked, from where, and how
 * often its viewers did — over visits whose tracker records the click. */
function partnerPortal(sessions: Session[]) {
  const measured = sessions.filter((s) => s.seenTracked);
  const clicks = measured.flatMap((s) => {
    const click = s.actions.find((a) => a.type === "partner_portal");
    return click ? [{ s, click }] : [];
  });
  const viewers = measured.filter((s) => s.caseStudies.has(PARTNER_PORTAL));
  const clicked = (s: Session) => s.did.has("partner_portal");
  return {
    measured: measured.length,
    visits: clicks.length,
    pages: tally(clicks, ({ click }) => pageLabel(click.path)),
    placements: tally(clicks, ({ click }) => click.target ?? "unknown"),
    viewers: viewers.length,
    viewersClicked: viewers.filter(clicked).length,
    byDevice: DEVICES.map(([label, device]) => {
      const group = onDevice(viewers, device);
      return { label, viewers: group.length, clicked: group.filter(clicked).length };
    }),
    // Clock time from first opening the case study to the click. Engaged
    // time before the click can't be told apart from time after it (it's
    // a per-page total), so it isn't offered.
    toClick: timeStats(
      known(
        clicks.map(({ s, click }) => {
          const open = s.views.find((v) => v.path === PARTNER_PORTAL);
          return open ? Math.max(0, Date.parse(click.ts) - Date.parse(open.ts)) : null;
        }),
      ),
    ),
  };
}
