import { pageLabel } from "@/lib/page-titles";
import { ACTIONS, SECTIONS, type ActionType, type SectionId } from "./events";
import { countryName, journeyOf, shortLabel, sourceOf, type Session } from "./metrics";
import type { Visit } from "./store";

/**
 * What the Activity view shows, worked out on the server from the range's
 * visits (the same Session list buildReport uses): the geographic overview,
 * and Recent visits filtered, searched, sorted and cut to one page, each
 * with its recorded timeline. Only that page of visits goes to the browser;
 * filtering and sorting always run over every visit in the range.
 *
 * Everything shown is read from what the tracker recorded — pageviews,
 * actions, what came into view, engaged time and scroll depth per page.
 * Nothing is inferred: a visit whose tracker didn't measure something says
 * so rather than showing a zero.
 *
 * All of it is driven by the URL (see parseActivityQuery), so a filtered,
 * sorted page is a link that works without JavaScript; the dashboard's
 * script swaps the panel in place instead of reloading.
 */

// ---------- locations ----------

/** Stands for a level Vercel's lookup didn't give. */
const UNKNOWN = "-";

/** Region codes come as ISO 3166-2 subdivisions without the country
 * ("CA"). Named here for the countries a US portfolio mostly hears from;
 * anywhere else shows its code. */
const REGION_NAMES: Record<string, Record<string, string>> = {
  US: {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
    CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
    KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
    MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
    NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
    NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
    OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
    SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
    WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", PR: "Puerto Rico",
    GU: "Guam", VI: "U.S. Virgin Islands", AS: "American Samoa", MP: "Northern Mariana Islands",
  },
  CA: {
    AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
    NL: "Newfoundland and Labrador", NS: "Nova Scotia", NT: "Northwest Territories", NU: "Nunavut",
    ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec", SK: "Saskatchewan", YT: "Yukon",
  },
  GB: { ENG: "England", SCT: "Scotland", WLS: "Wales", NIR: "Northern Ireland" },
  AU: {
    ACT: "Australian Capital Territory", NSW: "New South Wales", NT: "Northern Territory",
    QLD: "Queensland", SA: "South Australia", TAS: "Tasmania", VIC: "Victoria",
    WA: "Western Australia",
  },
};

type Place = { country: string | null; region: string | null; city: string | null };

export type Level = "country" | "region" | "city";

/** One key per level, each holding its parents: "US", "US|CA",
 * "US|CA|San Francisco", with UNKNOWN for a missing level — so a city is
 * never confused with one of the same name elsewhere. */
export function locationKeys(p: Place) {
  const part = (v: string | null) => (v ? v.replaceAll("|", "/") : UNKNOWN);
  const country = part(p.country);
  const region = `${country}|${part(p.region)}`;
  return { country, region, city: `${region}|${part(p.city)}` };
}

const parts = (key: string) => key.split("|");
export const levelOf = (key: string): Level => (["country", "region", "city"] as const)[Math.min(parts(key).length, 3) - 1];
export const parentOf = (key: string) => key.slice(0, Math.max(0, key.lastIndexOf("|")));
export const isUnknown = (key: string) => parts(key).at(-1) === UNKNOWN;

const countryLabel = (code: string) => (code === UNKNOWN ? "Unknown" : countryName(code));

/** A location's own name: "United States", "California", "San Francisco". */
export function labelOf(key: string) {
  const [country, region, city] = parts(key);
  if (city !== undefined) return city === UNKNOWN ? "Unknown city" : city;
  if (region !== undefined) return region === UNKNOWN ? "Unknown region" : (REGION_NAMES[country]?.[region] ?? region);
  return countryLabel(country);
}

/** With its parents: "San Francisco, California, United States". */
export function fullLabelOf(key: string) {
  const out: string[] = [];
  for (let k = key; k; k = parentOf(k)) out.push(labelOf(k));
  return out.join(", ");
}

/** The Location column, as the table has always shown it. */
export const place = (p: Place) => [p.city, p.region, p.country].filter(Boolean).join(", ") || "Unknown";

// ---------- the query ----------

export const PER_PAGE = [25, 50, 100] as const;
type PerPage = (typeof PER_PAGE)[number];
export type Dir = "asc" | "desc";

/** `dir` is the direction a first click sorts in. */
export const VISIT_SORTS = {
  started: { label: "Started", dir: "desc", title: "Sort by when the visit started" },
  location: { label: "Location", dir: "asc", title: "Sort by location" },
  device: { label: "Device", dir: "asc", title: "Sort by device" },
  source: { label: "Source", dir: "asc", title: "Sort by traffic source" },
  path: { label: "Path", dir: "desc", title: "Sort by the number of pages and actions" },
  engaged: { label: "Engaged", dir: "desc", title: "Sort by engaged time (visits without it measured stay last)" },
} as const satisfies Record<string, { label: string; dir: Dir; title: string }>;
export type VisitSort = keyof typeof VISIT_SORTS;

export const GEO_SORTS = {
  location: { label: "Location", dir: "asc" },
  visits: { label: "Visits", dir: "desc" },
  share: { label: "Share", dir: "desc" },
  work: { label: "Viewed work", dir: "desc" },
  acted: { label: "Acted", dir: "desc" },
} as const satisfies Record<string, { label: string; dir: Dir }>;
export type GeoSort = keyof typeof GEO_SORTS;

export const QUICK = {
  resume: "Opened resume",
  "case-study": "Viewed a case study",
  "case-studies": "Viewed 2+ case studies",
  engaged: "Engaged 60s+",
} as const;
export type QuickKey = keyof typeof QUICK;

const QUICK_TESTS: Record<QuickKey, (s: Session) => boolean> = {
  resume: (s) => s.did.has("resume"),
  "case-study": (s) => s.caseStudies.size >= 1,
  "case-studies": (s) => s.caseStudies.size >= 2,
  // Only visits whose engaged time was measured: an older visit is
  // unknown, not under a minute.
  engaged: (s) => s.timed && s.engagedMs >= 60_000,
};

/** The Activity type filter: something the visit did. */
export const ACTIVITY: Record<string, { label: string; test: (s: Session) => boolean }> = {
  acted: { label: "Resume, LinkedIn or contact", test: (s) => s.hiring },
  ...Object.fromEntries(
    (Object.keys(ACTIONS) as ActionType[]).map((type) => [type, { label: ACTIONS[type], test: (s: Session) => s.did.has(type) }]),
  ),
  "contact-page": { label: "Contact page viewed", test: (s) => s.views.some((v) => v.path === "/contact") },
};

export const DEVICES: [string, string][] = [
  ["desktop", "Desktop"],
  ["mobile", "Mobile"],
  ["tablet", "Tablet"],
  [UNKNOWN, "Unknown"],
];

export type ActivityQuery = {
  country: string | null;
  region: string | null;
  city: string | null;
  source: string | null;
  device: string | null;
  activity: string | null;
  quick: QuickKey[];
  q: string;
  sort: VisitSort;
  dir: Dir;
  page: number;
  per: PerPage;
  gsort: GeoSort;
  gdir: Dir;
  /** Historical pageviews open, and its page. */
  history: boolean;
  hpage: number;
};

export const DEFAULT_QUERY: ActivityQuery = {
  country: null,
  region: null,
  city: null,
  source: null,
  device: null,
  activity: null,
  quick: [],
  q: "",
  sort: "started",
  dir: "desc",
  page: 1,
  per: 25,
  gsort: "visits",
  gdir: "desc",
  history: false,
  hpage: 1,
};

const COUNTRY_KEY = /^([A-Z]{2}|-)$/;
const REGION_KEY = /^([A-Z]{2}|-)\|[^|]{1,20}$/;
const CITY_KEY = /^([A-Z]{2}|-)\|[^|]{1,20}\|[^|]{1,100}$/;

const isDir = (v: string | null): v is Dir => v === "asc" || v === "desc";

/** Reads the Activity state from a URL, dropping anything malformed. A
 * location level that doesn't sit inside the one above it is dropped (the
 * parent was the one changed), and a level on its own implies its parents,
 * so the three location filters always agree. */
export function parseActivityQuery(params: URLSearchParams): ActivityQuery {
  const one = (name: string, max = 100) => {
    const v = params.get(name)?.trim();
    return v && v.length <= max ? v : null;
  };

  let country = one("country");
  if (country && !COUNTRY_KEY.test(country)) country = null;
  let region = one("region");
  if (region && !REGION_KEY.test(region)) region = null;
  let city = one("city", 130);
  if (city && !CITY_KEY.test(city)) city = null;
  if (region && country && parentOf(region) !== country) region = null;
  if (city && region && parentOf(city) !== region) city = null;
  if (city && !region && country && parentOf(parentOf(city)) !== country) city = null;
  if (city) region = parentOf(city);
  if (region) country = parentOf(region);

  const device = one("device");
  const activity = one("activity");
  const quick = (Object.keys(QUICK) as QuickKey[]).filter((k) => params.getAll("quick").includes(k));

  const sortAsked = params.get("sort");
  const sort: VisitSort = sortAsked && Object.hasOwn(VISIT_SORTS, sortAsked) ? (sortAsked as VisitSort) : "started";
  const dir = params.get("dir");
  const gsortAsked = params.get("gsort");
  const gsort: GeoSort = gsortAsked && Object.hasOwn(GEO_SORTS, gsortAsked) ? (gsortAsked as GeoSort) : "visits";
  const gdir = params.get("gdir");
  const per = Number(params.get("per"));
  const pageOf = (name: string) => {
    const n = Number.parseInt(params.get(name) ?? "", 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 100_000) : 1;
  };

  return {
    country,
    region,
    city,
    source: one("source"),
    device: device && DEVICES.some(([value]) => value === device) ? device : null,
    activity: activity && Object.hasOwn(ACTIVITY, activity) ? activity : null,
    quick,
    q: (params.get("q") ?? "").trim().slice(0, 100),
    sort,
    dir: isDir(dir) ? dir : VISIT_SORTS[sort].dir,
    page: pageOf("page"),
    per: (PER_PAGE as readonly number[]).includes(per) ? (per as PerPage) : 25,
    gsort,
    gdir: isDir(gdir) ? gdir : GEO_SORTS[gsort].dir,
    history: params.get("history") === "1",
    hpage: pageOf("hpage"),
  };
}

/** The query as URL parameters, defaults left out so links stay short. */
export function activityParams(q: ActivityQuery) {
  const p = new URLSearchParams();
  if (q.city) p.set("city", q.city);
  else if (q.region) p.set("region", q.region);
  else if (q.country) p.set("country", q.country);
  if (q.source) p.set("source", q.source);
  if (q.device) p.set("device", q.device);
  if (q.activity) p.set("activity", q.activity);
  for (const k of q.quick) p.append("quick", k);
  if (q.q) p.set("q", q.q);
  if (q.sort !== DEFAULT_QUERY.sort) p.set("sort", q.sort);
  if (q.dir !== VISIT_SORTS[q.sort].dir) p.set("dir", q.dir);
  if (q.per !== DEFAULT_QUERY.per) p.set("per", String(q.per));
  if (q.page > 1) p.set("page", String(q.page));
  if (q.gsort !== DEFAULT_QUERY.gsort) p.set("gsort", q.gsort);
  if (q.gdir !== GEO_SORTS[q.gsort].dir) p.set("gdir", q.gdir);
  if (q.history) p.set("history", "1");
  if (q.history && q.hpage > 1) p.set("hpage", String(q.hpage));
  return p;
}

/** The query with a location chosen (or cleared, for null). */
export function withLocation(q: ActivityQuery, key: string | null): ActivityQuery {
  const level = key ? levelOf(key) : null;
  return {
    ...q,
    country: key ? parts(key)[0] : null,
    region: level === "region" ? key : level === "city" ? parentOf(key!) : null,
    city: level === "city" ? key : null,
    page: 1,
  };
}

export const selectedLocation = (q: ActivityQuery) => q.city ?? q.region ?? q.country;

export const hasFilters = (q: ActivityQuery) =>
  Boolean(q.country || q.source || q.device || q.activity || q.quick.length || q.q);

// ---------- matching and sorting ----------

/** What a search can match: the visit's location, and every page it
 * opened by title, short name and path. */
function haystack(s: Session) {
  const keys = locationKeys(s.first);
  const text: (string | null)[] = [s.first.city, s.first.region, s.first.country];
  if (s.first.region) text.push(labelOf(keys.region));
  if (s.first.country) text.push(countryName(s.first.country));
  for (const path of new Set(s.views.map((v) => v.path))) text.push(path, pageLabel(path), shortLabel(path));
  return text.filter(Boolean).join("\n").toLowerCase();
}

function matcher(q: ActivityQuery) {
  const terms = q.q.toLowerCase().split(/\s+/).filter(Boolean);
  const location = selectedLocation(q);
  const level = location ? levelOf(location) : null;
  return (s: Session) => {
    if (location && locationKeys(s.first)[level!] !== location) return false;
    if (q.source && s.source !== q.source) return false;
    if (q.device && (s.first.device ?? UNKNOWN) !== q.device) return false;
    if (q.activity && !ACTIVITY[q.activity].test(s)) return false;
    if (q.quick.some((k) => !QUICK_TESTS[k](s))) return false;
    if (terms.length) {
      const text = haystack(s);
      if (!terms.every((t) => text.includes(t))) return false;
    }
    return true;
  };
}

/** Missing values (no location, no device, engaged time not measured) stay
 * last whichever way a column sorts; ties fall back to newest first. */
function compareVisits(q: ActivityQuery): (a: Session, b: Session) => number {
  const sign = q.dir === "asc" ? 1 : -1;
  const newest = (a: Session, b: Session) => b.start - a.start;
  const by =
    <T>(get: (s: Session) => T | null, cmp: (x: T, y: T) => number) =>
    (a: Session, b: Session) => {
      const x = get(a);
      const y = get(b);
      if (x === null || y === null) return x === y ? newest(a, b) : x === null ? 1 : -1;
      return sign * cmp(x, y) || newest(a, b);
    };
  const text = (x: string, y: string) => x.localeCompare(y);
  const num = (x: number, y: number) => x - y;
  switch (q.sort) {
    case "started":
      return (a, b) => sign * (a.start - b.start);
    case "location":
      return by((s) => (s.first.country || s.first.region || s.first.city ? place(s.first) : null), text);
    case "device":
      return by((s) => s.first.device ?? null, text);
    case "source":
      return by((s) => s.source, text);
    case "path":
      return by((s) => s.views.length + s.actions.length, num);
    case "engaged":
      return by((s) => (s.timed ? s.engagedMs : null), num);
  }
}

// ---------- geographic overview ----------

export type GeoNode = {
  key: string;
  level: Level;
  label: string;
  visits: number;
  /** Opened at least one case study. */
  work: number;
  /** Reached resume, LinkedIn or contact. */
  acted: number;
  children: GeoNode[];
};

/** Country → region → city, counted by where each visit started. A level
 * Vercel didn't give ends the branch there ("Unknown region" has no cities
 * under it). */
function geoTree(sessions: Session[]) {
  const nodes = new Map<string, GeoNode>();
  const roots: GeoNode[] = [];
  for (const s of sessions) {
    const keys = locationKeys(s.first);
    let parent: GeoNode | null = null;
    for (const key of [keys.country, keys.region, keys.city]) {
      let node = nodes.get(key);
      if (!node) {
        node = { key, level: levelOf(key), label: labelOf(key), visits: 0, work: 0, acted: 0, children: [] };
        nodes.set(key, node);
        (parent ? parent.children : roots).push(node);
      }
      node.visits++;
      if (s.caseStudies.size > 0) node.work++;
      if (s.hiring) node.acted++;
      if (isUnknown(key)) break;
      parent = node;
    }
  }
  return { roots, nodes };
}

/** Unknown locations always sort last. */
function geoCompare(sort: GeoSort, dir: Dir) {
  const sign = dir === "asc" ? 1 : -1;
  const rate = (part: number, n: number) => (n ? part / n : 0);
  const value: Record<Exclude<GeoSort, "location">, (n: GeoNode) => number> = {
    visits: (n) => n.visits,
    share: (n) => n.visits,
    work: (n) => rate(n.work, n.visits),
    acted: (n) => rate(n.acted, n.visits),
  };
  return (a: GeoNode, b: GeoNode) => {
    const ua = isUnknown(a.key);
    if (ua !== isUnknown(b.key)) return ua ? 1 : -1;
    const primary = sort === "location" ? a.label.localeCompare(b.label) : value[sort](a) - value[sort](b);
    return sign * primary || b.visits - a.visits || a.label.localeCompare(b.label);
  };
}

function sortTree(nodes: GeoNode[], cmp: (a: GeoNode, b: GeoNode) => number) {
  nodes.sort(cmp);
  for (const n of nodes) sortTree(n.children, cmp);
}

// ---------- filter options ----------

export type Option = { value: string; label: string };

const alpha = (a: Option, b: Option) =>
  Number(a.value.endsWith(UNKNOWN)) - Number(b.value.endsWith(UNKNOWN)) || a.label.localeCompare(b.label);

/** Choices from every visit in the range, not the filtered ones, so picking
 * one filter never hides the others' options. Each location list narrows
 * to the level picked above it. The current choice is always offered, even
 * when this range has none of it. */
function filterOptions(sessions: Session[], q: ActivityQuery, roots: GeoNode[], nodes: Map<string, GeoNode>) {
  const keep = (options: Option[], value: string | null, label: (v: string) => string) =>
    value && !options.some((o) => o.value === value) ? [...options, { value, label: label(value) }] : options;

  const regionNodes = q.country ? (nodes.get(q.country)?.children ?? []) : roots.flatMap((c) => c.children);
  const cityNodes = q.region
    ? (nodes.get(q.region)?.children ?? [])
    : regionNodes.flatMap((r) => r.children);
  const cityLabel = (key: string) =>
    q.region ? labelOf(key) : q.country ? `${labelOf(key)}, ${labelOf(parentOf(key))}` : fullLabelOf(key);

  const sources = new Map<string, number>();
  for (const s of sessions) sources.set(s.source, (sources.get(s.source) ?? 0) + 1);
  const devices = new Set<string>(sessions.map((s) => s.first.device ?? UNKNOWN));

  return {
    countries: keep(roots.map((n) => ({ value: n.key, label: n.label })).sort(alpha), q.country, labelOf),
    regions: keep(
      regionNodes.map((n) => ({ value: n.key, label: q.country ? n.label : fullLabelOf(n.key) })).sort(alpha),
      q.region,
      q.country ? labelOf : fullLabelOf,
    ),
    cities: keep(cityNodes.map((n) => ({ value: n.key, label: cityLabel(n.key) })).sort(alpha), q.city, cityLabel),
    sources: keep(
      [...sources].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name]) => ({ value: name, label: name })),
      q.source,
      (v) => v,
    ),
    devices: DEVICES.filter(([value]) => devices.has(value) || value === q.device).map(([value, label]) => ({ value, label })),
    activities: Object.entries(ACTIVITY)
      .filter(([key, { test }]) => key === q.activity || sessions.some(test))
      .map(([value, { label }]) => ({ value, label })),
  };
}

// ---------- one visit ----------

export type Step =
  | {
      kind: "page";
      t: number;
      path: string;
      landed: boolean;
      /** Pageviews of this path in the visit. */
      views: number;
      /** A later view of a path already shown: its engaged time and depth
       * are the page's totals, shown at the first view. */
      repeat: boolean;
      engagedMs: number | null;
      depth: number | null;
    }
  | { kind: "action"; t: number; type: ActionType; detail: string | null; path: string; elsewhere: boolean }
  | { kind: "seen"; t: number; items: string[] };

/** A recorded target, readable: a page title for a path, else as stored. */
function detailOf(target: string | null) {
  if (!target) return null;
  return target.startsWith("/") ? pageLabel(target) : target;
}

function seenLabel(type: string, target: string | null) {
  if (!target) return type;
  if (type === "hero") return `Hero ${target.slice(5)}`;
  if (type === "section") return SECTIONS[target as SectionId] ?? target;
  return `${shortLabel(`/work/${target}`)} card`;
}

/** Every pageview, action and exposure the visit recorded, in the order
 * recorded. Things that came into view back to back share one line. */
function timelineOf(s: Session): Step[] {
  const views = new Map<string, number>();
  for (const v of s.views) views.set(v.path, (views.get(v.path) ?? 0) + 1);
  const shown = new Set<string>();

  const raw: Step[] = [
    ...s.views.map((v, i): Step => {
      const repeat = shown.has(v.path);
      shown.add(v.path);
      return {
        kind: "page",
        t: Date.parse(v.ts),
        path: v.path,
        landed: i === 0,
        views: views.get(v.path)!,
        repeat,
        engagedMs: !repeat && s.timed ? (s.engaged.get(v.path) ?? 0) : null,
        depth: !repeat && s.scrollTracked ? (s.depth.get(v.path) ?? 0) : null,
      };
    }),
    ...s.actions.map((a): Step => ({
      kind: "action",
      t: Date.parse(a.ts),
      type: a.type,
      detail: detailOf(a.target),
      path: a.path,
      elsewhere: false,
    })),
    ...s.exposures.map((e): Step => ({ kind: "seen", t: Date.parse(e.ts), items: [seenLabel(e.type, e.target)] })),
  ].sort((a, b) => a.t - b.t);

  const steps: Step[] = [];
  let page: string | null = null;
  for (const step of raw) {
    const last = steps.at(-1);
    if (step.kind === "seen" && last?.kind === "seen") {
      last.items.push(...step.items);
      continue;
    }
    if (step.kind === "page") page = step.path;
    if (step.kind === "action") step.elsewhere = page !== null && step.path !== page;
    steps.push(step);
  }
  return steps;
}

function visitRow(s: Session) {
  const v = s.first;
  return {
    start: s.start,
    place: place(v),
    device: v.device,
    source: s.source,
    journey: journeyOf(s),
    hiring: s.hiring,
    engagedMs: s.timed ? s.engagedMs : null,
    scrollTracked: s.scrollTracked,
    browser: v.browser ?? null,
    os: v.os ?? null,
    referrer: v.referrer,
    utm: (
      [
        ["utm_source", v.utmSource],
        ["utm_medium", v.utmMedium],
        ["utm_campaign", v.utmCampaign],
      ] as const
    ).filter(([, value]) => value),
    pageviews: s.views.length,
    actions: s.actions.length,
    steps: timelineOf(s),
  };
}

export type VisitRow = ReturnType<typeof visitRow>;

// ---------- historical pageviews ----------

/** Rows per page of Historical pageviews. */
const HISTORY_PER = 25;

/** Pageviews with no visit attached, newest first, as recorded: each row
 * one pageview, never grouped or stitched into visits. Only the page
 * that's open is shaped for display. */
function history(legacy: Visit[], query: ActivityQuery) {
  const total = legacy.length;
  const pages = Math.max(1, Math.ceil(total / HISTORY_PER));
  const page = Math.min(query.hpage, pages);
  const newest = query.history ? [...legacy].reverse().slice((page - 1) * HISTORY_PER, page * HISTORY_PER) : [];
  return {
    total,
    page,
    pages,
    rows: newest.map((v) => ({
      ts: Date.parse(v.ts),
      place: place(v),
      device: v.device,
      source: sourceOf(v),
      path: v.path,
    })),
  };
}

// ---------- the view ----------

export function buildActivity(sessions: Session[], query: ActivityQuery, legacy: Visit[]) {
  const total = sessions.length;
  const { roots, nodes } = geoTree(sessions);
  sortTree(roots, geoCompare(query.gsort, query.gdir));

  const matching = sessions.filter(matcher(query)).sort(compareVisits(query));
  const pages = Math.max(1, Math.ceil(matching.length / query.per));
  const page = Math.min(query.page, pages);
  const first = (page - 1) * query.per;
  const selected = selectedLocation(query);

  const past = history(legacy, query);

  return {
    query: { ...query, page, hpage: past.page },
    total,
    matching: matching.length,
    page,
    pages,
    from: matching.length ? first + 1 : 0,
    to: Math.min(first + query.per, matching.length),
    rows: matching.slice(first, first + query.per).map(visitRow),
    geo: { roots, selected },
    options: filterOptions(sessions, query, roots, nodes),
    history: past,
  };
}

export type Activity = ReturnType<typeof buildActivity>;
