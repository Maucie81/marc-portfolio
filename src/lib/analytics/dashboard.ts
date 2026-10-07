import type { Visit } from "./store";

/**
 * HTML for the private /analytics page (see src/app/analytics/route.ts).
 * Plain server-rendered markup with no app chrome, scripts or trackers —
 * an internal utility, deliberately outside the portfolio's design system.
 * Every stored value is escaped: paths, referrers and UTM tags arrive from
 * browsers, so they're treated as untrusted text.
 */

// Marc's timezone: buckets and timestamps read as local time.
const TIME_ZONE = "America/New_York";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const RANGES = {
  "24h": { label: "Last 24 hours", ms: DAY },
  "7d": { label: "Last 7 days", ms: 7 * DAY },
  "30d": { label: "Last 30 days", ms: 30 * DAY },
  all: { label: "All time", ms: null },
} as const;

export type RangeKey = keyof typeof RANGES;

export const isRange = (value: string | null): value is RangeKey =>
  value !== null && Object.hasOwn(RANGES, value);

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

const isInternal = (v: Visit) => v.referrer !== null && SITE_HOST.test(v.referrer);

/** UTM source wins, then the referrer, else Direct. A UTM source that
 * spells a known name ("linkedin") joins that referrer's row. */
function sourceOf(v: Visit): string {
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
function countryName(code: string | null): string {
  if (!code) return "Unknown";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const fmt = (n: number) => n.toLocaleString("en-US");

function tally(visits: Visit[], keyOf: (v: Visit) => string) {
  const counts = new Map<string, number>();
  for (const v of visits) {
    const key = keyOf(v);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Visit counts per hour (24h), day (≤ ~2 months) or month, oldest first,
 * empty buckets included so gaps show. Labels are formatted in TIME_ZONE,
 * so they double as the bucket keys. */
function overTime(visits: Visit[], startMs: number, nowMs: number) {
  const span = nowMs - startMs;
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    ...(span <= DAY + HOUR
      ? { month: "short", day: "numeric", hour: "numeric" }
      : span <= 62 * DAY
        ? { weekday: "short", month: "short", day: "numeric" }
        : { month: "short", year: "numeric" }),
  });
  const labels: string[] = [];
  // Step an hour at a time so DST changes can't skip or repeat a bucket.
  for (let t = startMs; t <= nowMs + HOUR; t += HOUR) {
    const label = format.format(Math.min(t, nowMs));
    if (labels.at(-1) !== label) labels.push(label);
  }
  const counts = new Map(labels.map((label) => [label, 0]));
  for (const v of visits) {
    const label = format.format(Date.parse(v.ts));
    if (counts.has(label)) counts.set(label, counts.get(label)! + 1);
  }
  return [...counts];
}

function timeOf(iso: string, nowMs: number) {
  const date = new Date(iso);
  const sameYear =
    new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric" }).format(date) ===
    new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric" }).format(nowMs);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const SHOW = 20;

/** A two-column "thing → visits" table, top SHOW rows. */
function ranked(title: string, rows: [string, number][], total: number, note = "") {
  if (rows.length === 0) {
    return `<section><h2>${esc(title)}</h2><p class="muted">No visits in this period.</p></section>`;
  }
  const body = rows
    .slice(0, SHOW)
    .map(
      ([label, n]) =>
        `<tr><td>${esc(label)}</td><td class="num">${fmt(n)}</td><td class="num muted">${Math.round((n / total) * 100)}%</td></tr>`,
    )
    .join("");
  const more =
    rows.length > SHOW ? `<p class="muted">+ ${rows.length - SHOW} more</p>` : "";
  return `<section><h2>${esc(title)}</h2>${note ? `<p class="muted">${note}</p>` : ""}<div class="scroll"><table><thead><tr><th></th><th class="num">Visits</th><th class="num">Share</th></tr></thead><tbody>${body}</tbody></table></div>${more}</section>`;
}

function chart(buckets: [string, number][]) {
  const max = Math.max(1, ...buckets.map(([, n]) => n));
  const rows = buckets
    .map(([label, n]) => {
      const width = n ? Math.max(0.5, (n / max) * 100) : 0;
      return `<li title="${esc(label)}: ${fmt(n)} visit${n === 1 ? "" : "s"}"><span class="when">${esc(label)}</span><span class="track">${width ? `<span class="bar" style="width:${width.toFixed(2)}%"></span>` : ""}</span><span class="num">${fmt(n)}</span></li>`;
    })
    .join("");
  return `<ol class="chart">${rows}</ol>`;
}

const STYLE = `
:root {
  color-scheme: light;
  --surface: #fcfcfb;
  --raised: #f2f1ee;
  --line: #e2e1dc;
  --text: #0b0b0b;
  --muted: #52514e;
  --series: #2a78d6;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --surface: #1a1a19;
    --raised: #252523;
    --line: #353532;
    --text: #ffffff;
    --muted: #c3c2b7;
    --series: #3987e5;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --surface: #1a1a19;
  --raised: #252523;
  --line: #353532;
  --text: #ffffff;
  --muted: #c3c2b7;
  --series: #3987e5;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface); color: var(--text); font: 15px/1.45 system-ui, -apple-system, sans-serif; -webkit-text-size-adjust: 100%; }
main { max-width: 960px; margin: 0 auto; padding: 24px 16px 48px; }
h1 { font-size: 22px; margin: 0; }
h2 { font-size: 15px; margin: 0 0 8px; }
header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
section { margin-top: 32px; }
.muted { color: var(--muted); }
p { margin: 0 0 8px; }
nav { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
nav a { padding: 6px 12px; border: 1px solid var(--line); border-radius: 999px; color: var(--text); text-decoration: none; }
nav a[aria-current] { background: var(--text); color: var(--surface); border-color: var(--text); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 24px; }
.stat { background: var(--raised); border-radius: 8px; padding: 12px 16px; }
.stat b { display: block; font-size: 28px; font-variant-numeric: tabular-nums; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); column-gap: 32px; }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 6px 8px 6px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; color: var(--muted); }
td { overflow-wrap: anywhere; }
.recent td { white-space: nowrap; overflow-wrap: normal; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.chart { list-style: none; margin: 0; padding: 0; }
.chart li { display: grid; grid-template-columns: minmax(96px, 9em) 1fr 3.5em; align-items: center; gap: 8px; min-height: 22px; }
.when { color: var(--muted); font-size: 13px; white-space: nowrap; }
.track { height: 10px; }
.bar { display: block; height: 10px; min-width: 2px; background: var(--series); border-radius: 0 4px 4px 0; }
button, input { font: inherit; }
button { padding: 6px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--raised); color: var(--text); cursor: pointer; }
input[type=password] { width: 100%; max-width: 320px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--text); }
form.login { display: grid; gap: 12px; margin-top: 24px; }
.error { color: #c42b2b; }
footer { margin-top: 40px; font-size: 13px; }
`;

function page(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<style>${STYLE}</style>
</head>
<body><main>${body}</main></body>
</html>`;
}

export function renderMessage(text: string) {
  return page("Analytics", `<h1>Analytics</h1><p class="muted" style="margin-top:12px">${esc(text)}</p>`);
}

export function renderLogin(error = "") {
  return page(
    "Analytics · Sign in",
    `<h1>Analytics</h1>
<form class="login" method="post" action="/analytics">
<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
${error ? `<p class="error">${esc(error)}</p>` : ""}
<div><button type="submit">Sign in</button></div>
</form>`,
  );
}

export function renderDashboard(opts: {
  visits: Visit[];
  allTime: number;
  range: RangeKey;
  nowMs: number;
  signOut: boolean;
}) {
  const { visits, allTime, range, nowMs, signOut } = opts;
  const n = visits.length;
  const rangeMs = RANGES[range].ms;
  const startMs =
    rangeMs !== null ? nowMs - rangeMs : n ? Date.parse(visits[0].ts) : nowMs;

  const arrivals = visits.filter((v) => !isInternal(v));
  const campaigns = tally(
    visits.filter((v) => v.utmCampaign),
    (v) =>
      `${v.utmCampaign} (${v.utmSource ?? "no source"} / ${v.utmMedium ?? "no medium"})`,
  );

  const nav = (Object.keys(RANGES) as RangeKey[])
    .map(
      (key) =>
        `<a href="/analytics?range=${key}"${key === range ? ' aria-current="page"' : ""}>${RANGES[key].label}</a>`,
    )
    .join("");

  const recent = visits
    .slice(-50)
    .reverse()
    .map(
      (v) =>
        `<tr><td>${esc(timeOf(v.ts, nowMs))}</td><td>${esc(v.city ?? "Unknown")}</td><td>${esc(v.region ?? "—")}</td><td>${esc(v.path)}</td><td>${esc(sourceOf(v))}</td><td>${esc(v.country ?? "—")}</td><td>${esc(v.device ?? "—")}</td></tr>`,
    )
    .join("");

  const body = `
<header>
<h1>Analytics</h1>
${signOut ? `<form method="post" action="/analytics"><input type="hidden" name="logout" value="1"><button type="submit">Sign out</button></form>` : ""}
</header>
<nav aria-label="Date range">${nav}</nav>
<div class="stats">
<div class="stat"><span class="muted">${esc(RANGES[range].label)}</span><b>${fmt(n)}</b></div>
<div class="stat"><span class="muted">Arrivals from outside</span><b>${fmt(arrivals.length)}</b></div>
<div class="stat"><span class="muted">All-time visits</span><b>${fmt(allTime)}</b></div>
</div>

<section>
<h2>Visits over time</h2>
${n ? chart(overTime(visits, startMs, nowMs)) : `<p class="muted">No visits in this period.</p>`}
</section>

<div class="grid">
${ranked("Most-viewed pages", tally(visits, (v) => v.path), n)}
${ranked("Traffic sources", tally(arrivals, sourceOf), arrivals.length, "Arrivals only — clicks between pages on the site aren't counted here.")}
${campaigns.length ? ranked("UTM campaigns", campaigns, n) : ""}
${ranked("Cities", tally(visits, (v) => (v.city ? [v.city, v.region, v.country].filter(Boolean).join(", ") : "Unknown")), n)}
${ranked("Regions", tally(visits, (v) => (v.region ? `${v.region}, ${countryName(v.country)}` : "Unknown")), n)}
${ranked("Countries", tally(visits, (v) => countryName(v.country)), n)}
${ranked("Devices", tally(visits, (v) => v.device ?? "Unknown"), n)}
</div>

<section>
<h2>Recent visits</h2>
${
  recent
    ? `<div class="scroll"><table class="recent"><thead><tr><th>Time</th><th>City</th><th>Region</th><th>Page</th><th>Source</th><th>Country</th><th>Device</th></tr></thead><tbody>${recent}</tbody></table></div>${n > 50 ? `<p class="muted">Latest 50 of ${fmt(n)}.</p>` : ""}`
    : `<p class="muted">No visits in this period.</p>`
}
</section>

<footer class="muted">Times are Eastern. Location is approximate — looked up from the visitor's IP by Vercel, never stored with it. Your own browsers are excluded via /owner.</footer>`;

  return page("Analytics", body);
}
