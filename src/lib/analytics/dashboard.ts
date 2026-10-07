import { pageLabel } from "@/lib/page-titles";
import {
  QUICK_BOTTOM_MS,
  RANGES,
  SMALL_GROUP,
  TIME_ZONE,
  sourceOf,
  type RangeKey,
  type Report,
  type Row,
  type TimeStats,
} from "./metrics";

/**
 * HTML for the private /analytics page (see src/app/analytics/route.ts).
 * Plain server-rendered markup with no app chrome, scripts or trackers —
 * an internal utility, deliberately outside the portfolio's design system.
 * Every stored value is escaped: paths, referrers and UTM tags arrive from
 * browsers, so they're treated as untrusted text.
 *
 * Order follows the questions it answers: how much traffic, is it turning
 * into resume / LinkedIn / contact, which work, from where — then the
 * detail. Charts only where shape matters (the trend, the funnel, relative
 * project reach); everything else is a short ranked table.
 */

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const fmt = (n: number) => n.toLocaleString("en-US");

const pct = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : "—";

const plural = (n: number, word: string) => `${fmt(n)} ${word}${n === 1 ? "" : "s"}`;

/** 42s · 1m 18s · 4m 03s · 1h 05m */
function duration(ms: number) {
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${String(secs % 60).padStart(2, "0")}s`;
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

const median = (t: TimeStats) => (t ? duration(t.median) : "—");
const mean = (t: TimeStats) => (t ? duration(t.mean) : "—");

function bar(part: number, whole: number) {
  const width = whole ? Math.max(part ? 1.5 : 0, (part / whole) * 100) : 0;
  return `<span class="track"><span class="fill" style="width:${width.toFixed(1)}%"></span></span>`;
}

const empty = (text = "Nothing in this period yet.") => `<p class="muted">${esc(text)}</p>`;

/** `optional` columns drop out on phone widths, where they'd squeeze the
 * labels instead. */
function table(head: string[], rows: string[][], numeric: boolean[], optional: boolean[] = []) {
  const cls = (i: number) => {
    const names = [numeric[i] && "num", optional[i] && "opt"].filter(Boolean).join(" ");
    return names ? ` class="${names}"` : "";
  };
  const th = head.map((h, i) => `<th${cls(i)}>${esc(h)}</th>`).join("");
  const body = rows
    .map((cells) => `<tr>${cells.map((c, i) => `<td${cls(i)}>${c}</td>`).join("")}</tr>`)
    .join("");
  return `<div class="scroll"><table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** "Thing → visits, share" with a bar under each label, top `limit` rows. */
function ranked(title: string, rows: Row[], total: number, opts: { limit?: number; note?: string } = {}) {
  const { limit = 10, note } = opts;
  const max = rows[0]?.[1] ?? 0;
  const body = rows.length
    ? table(
        ["", "Visits", "Share"],
        rows
          .slice(0, limit)
          .map(([label, n]) => [`${esc(label)}${bar(n, max)}`, fmt(n), pct(n, total)]),
        [false, true, true],
      ) + (rows.length > limit ? `<p class="muted small">+ ${rows.length - limit} more</p>` : "")
    : empty();
  return `<section><h3>${esc(title)}</h3>${note ? `<p class="muted small">${note}</p>` : ""}${body}</section>`;
}

function trend(report: Report) {
  const buckets = report.trend;
  const max = Math.max(1, ...buckets.map((b) => b.visits));
  const cols = buckets
    .map((b) => {
      const tip = `${b.label}: ${plural(b.visits, "visit")} · ${plural(b.pageviews, "pageview")}`;
      const h = b.visits ? Math.max(3, (b.visits / max) * 100) : 0;
      return `<div class="col" title="${esc(tip)}" aria-label="${esc(tip)}">${h ? `<span style="height:${h.toFixed(1)}%"></span>` : ""}</div>`;
    })
    .join("");
  const first = buckets[0]?.label ?? "";
  const last = buckets.at(-1)?.label ?? "";
  const per = { hour: "hour", day: "day", week: "week", month: "month" }[report.unit];
  return `<section>
<h2>Traffic trend</h2>
<p class="muted small">Visits per ${per}. Hover or tap a bar for pageviews.</p>
<div class="trend">
<div class="trend-max muted small">${fmt(max)}</div>
<div class="cols" role="img" aria-label="Visits per ${per}">${cols}</div>
<div class="trend-axis muted small"><span>${esc(first)}</span><span>${esc(last)}</span></div>
</div>
</section>`;
}

function funnel(report: Report) {
  const total = report.visits;
  const steps = report.funnel
    .map((step, i) => {
      const prev = report.funnel[i - 1]?.count;
      const meta =
        i === 0
          ? `${pct(report.startedOnHome, total)} started on the homepage`
          : `${pct(step.count, total)} of visits${prev !== undefined ? ` · ${pct(step.count, prev)} of the step before` : ""}`;
      return `<li><div class="f-row"><span>${esc(step.label)}</span><b>${fmt(step.count)}</b></div>${bar(step.count, total)}<div class="muted small">${meta}</div></li>`;
    })
    .join("");

  const top = report.caseStudies[0];
  const source = report.sources.find((s) => s.name !== "Returning or new tab");
  const journey = report.journeys[0];
  const facts: [string, string][] = [
    ["Most viewed case study", top?.visits ? `${esc(top.label)} <span class="muted">(${plural(top.visits, "visit")})</span>` : "—"],
    ["Top traffic source", source ? `${esc(source.name)} <span class="muted">(${plural(source.visits, "visit")})</span>` : "—"],
    [
      "Most common path",
      !journey
        ? "—"
        : journey[1] === 1 && report.journeys.length > 1
          ? `<span class="muted">No path has repeated yet</span>`
          : `${esc(journey[0])} <span class="muted">(${plural(journey[1], "visit")})</span>`,
    ],
    ["Viewed 2+ case studies", `${fmt(report.viewedTwo)} <span class="muted">(${pct(report.viewedTwo, total)} of visits)</span>`],
    ["Reached resume, LinkedIn or contact", `${fmt(report.hiring)} <span class="muted">(${pct(report.hiring, total)})</span>`],
    ["Reached a way to get in touch", `${fmt(report.contact)} <span class="muted">(email, phone or the form)</span>`],
  ];

  return `<section>
<h2>Hiring funnel</h2>
${total ? `<ol class="funnel">${steps}</ol>` : empty("No visits in this period yet.")}
${total && total < 30 ? `<p class="muted small">Small sample: each visit moves these percentages a lot.</p>` : ""}
<dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>
</section>`;
}

function caseStudies(report: Report) {
  const max = report.caseStudies[0]?.visits ?? 0;
  const rows = report.caseStudies.map((c) => [
    `${esc(c.label)}${bar(c.visits, max)}`,
    fmt(c.visits),
    pct(c.visits, report.visits),
    fmt(c.views),
    fmt(c.landed),
    c.visits ? `${fmt(c.hiring)} <span class="muted">(${pct(c.hiring, c.visits)})</span>` : "—",
    median(c.engaged),
    mean(c.engaged),
  ]);
  return `<section>
<h2>Top case studies</h2>
<p class="muted small">Reach: share of all visits that opened it. Landed: visits that started there. Then acted: its viewers who went on to resume, LinkedIn or contact. Engaged: active time on the case study per visit that opened it — the median is the typical visit, the average is pulled up by a few long reads.</p>
${table(["Case study", "Visits", "Reach", "Pageviews", "Landed", "Then acted", "Median engaged", "Avg. engaged"], rows, [false, true, true, true, true, true, true, true], [false, false, false, true, true, true, false, true])}
</section>`;
}

/** A deepest milestone in words. */
const depthLabel = (m: number | null) =>
  m === null ? "—" : m === 100 ? "Fits on screen" : m >= 90 ? "Bottom" : m === 0 ? "Under 25%" : `${m}%`;

function caseStudyDepth(report: Report) {
  const rows = report.caseStudies
    .filter((c) => c.depth.n > 0)
    .map((c) => {
      const d = c.depth;
      return [
        `${esc(c.label)}${bar(d.r90, d.n)}`,
        fmt(d.n),
        median(c.engaged),
        share(d.r25, d.n),
        share(d.r50, d.n),
        share(d.r75, d.n),
        `<b>${pct(d.r90, d.n)}</b> <span class="muted">(${fmt(d.r90)})</span>`,
        d.bottomTimed ? `${fmt(d.bottomQuick)} <span class="muted">of ${fmt(d.bottomTimed)}</span>` : "—",
      ];
    });
  const quick = Math.round(QUICK_BOTTOM_MS / 1000);
  return `<section>
<h2>How far into each case study</h2>
<p class="muted small">Share of visits that opened the case study and scrolled at least that far; the bar is the bottom (90%). Scrolling far isn't the same as reading it, so read it with engaged time: a visit that reached the bottom with under ${quick}s of engaged time on the page most likely skimmed or jumped. Recorded from Oct 7, 2026; earlier visits are left out.</p>
${rows.length ? table(["Case study", "Visits", "Median engaged", "25%", "50%", "75%", "Bottom", `Bottom in <${quick}s`], rows, [false, true, true, true, true, true, true, true], [false, false, false, true, false, true, false, true]) : empty("No case-study scroll data in this period yet.")}
</section>`;
}

function sources(report: Report) {
  if (!report.sources.length) return `<section><h2>Traffic sources</h2>${empty()}</section>`;
  const max = report.sources[0].visits;
  const rows = report.sources.map((s) => [
    `${esc(s.name)}${bar(s.visits, max)}`,
    fmt(s.visits),
    pct(s.visits, report.visits),
    pct(s.caseStudy, s.visits),
    pct(s.hiring, s.visits),
  ]);
  return `<section>
<h2>Traffic sources</h2>
<p class="muted small">Where each visit came from: its UTM source if the link had one, otherwise the referring site. Direct means no referrer — typed in, bookmarked, or opened from an app or email that doesn't pass one on. Viewed work: share that opened a case study. Acted: share that went on to resume, LinkedIn or contact.</p>
${table(["Source", "Visits", "Share", "Viewed work", "Acted"], rows, [false, true, true, true, true], [false, false, true, false, false])}
</section>`;
}

function journeys(report: Report) {
  const multi = report.journeys.reduce((sum, [, n]) => sum + n, 0);
  const rows = report.journeys.slice(0, 10);
  const list = rows.length
    ? `<ol class="paths">${rows.map(([path, n]) => `<li><span>${esc(path)}</span><b>${fmt(n)}</b></li>`).join("")}</ol>`
    : empty("No visit has gone past one page yet.");
  return `<section>
<h3>Common paths</h3>
<p class="muted small">The ${plural(multi, "visit")} with more than one step, counting resume, LinkedIn and contact actions as steps. ${plural(report.singlePage, "visit")} (${pct(report.singlePage, report.visits)}) saw one page only.</p>
${list}
</section>`;
}

function actions(report: Report) {
  const row = (a: Report["actions"][number]) => [esc(a.label), fmt(a.visits), pct(a.visits, report.visits)];
  const hiring = report.actions.filter((a) => a.hiring).map(row);
  const other = report.actions.filter((a) => !a.hiring).map(row);
  return `<section>
<h3>Actions</h3>
<p class="muted small">Visits that did each at least once.</p>
${table(["Resume, LinkedIn, contact", "Visits", "Share"], hiring, [false, true, true])}
${table(["Exploring", "Visits", "Share"], other, [false, true, true])}
</section>`;
}

function pages(report: Report) {
  const max = report.pages[0]?.views ?? 0;
  const rows = report.pages
    .slice(0, 15)
    .map((p) => [
      `${esc(p.label)}${bar(p.views, max)}`,
      fmt(p.visits),
      fmt(p.views),
      median(p.engaged),
      mean(p.engaged),
      p.engaged ? duration(p.engaged.total) : "—",
      depthLabel(p.depth.typical),
      p.depth.n ? pct(p.depth.r50, p.depth.n) : "—",
      p.depth.n ? pct(p.depth.r90, p.depth.n) : "—",
    ]);
  return `<section>
<h2>Pages</h2>
<p class="muted small">Engaged time per visit that opened the page, from visits where it was measured. Typical deepest: how far the middle visit scrolled ("Fits on screen" when the page needs no scrolling); 50%+ and Bottom: share that scrolled at least that far.</p>
${rows.length ? table(["Page", "Visits", "Pageviews", "Median engaged", "Avg. engaged", "Total engaged", "Typical deepest", "50%+", "Bottom"], rows, [false, true, true, true, true, true, true, true, true], [false, false, true, false, true, true, false, false, false]) : empty()}
</section>`;
}

/** "40% (4)": the share and the count it's out of, so small groups read
 * as small. */
const share = (part: number, whole: number) =>
  whole ? `${pct(part, whole)} <span class="muted">(${fmt(part)})</span>` : "—";

function devices(report: Report) {
  const d = report.devices;
  const groups = d.groups;
  const [mobile, desktop] = groups;
  const small = groups.filter((g) => g.visits < SMALL_GROUP).map((g) => g.label.toLowerCase());

  // The answer first, in a sentence: how far each device gets.
  const line = (g: (typeof groups)[number]) =>
    g.visits
      ? `<b>${esc(g.label)}</b>: ${pct(g.viewedOne, g.visits)} of visits opened a case study, ${pct(g.viewedTwo, g.visits)} opened two or more, and ${pct(g.hiring, g.visits)} reached resume, LinkedIn or contact.`
      : `<b>${esc(g.label)}</b>: no visits in this period.`;
  const headline = `<p>${line(mobile)}<br>${line(desktop)}</p>`;

  const head = ["", ...groups.map((g) => g.label)];
  const num = [false, ...groups.map(() => true)];
  const caseStudyCell = (g: (typeof groups)[number]) =>
    !g.topCaseStudy
      ? "—"
      : g.topCaseStudyTies > 1 && g.topCaseStudy.visits === 1
        ? `<span class="muted">No clear leader</span>`
        : `${esc(g.topCaseStudy.label)} <span class="muted">(${fmt(g.topCaseStudy.visits)})</span>`;
  const journeyCell = (g: (typeof groups)[number]) =>
    !g.topJourney
      ? "—"
      : g.topJourney.ties > 1 && g.topJourney.visits === 1
        ? `<span class="muted">No path has repeated yet</span>`
        : `${esc(g.topJourney.path)} <span class="muted">(${fmt(g.topJourney.visits)})</span>`;
  const rows: string[][] = [
    ["Visits", ...groups.map((g) => share(g.visits, d.total))],
    ["Pageviews", ...groups.map((g) => fmt(g.pageviews))],
    ["Pages per visit", ...groups.map((g) => (g.visits ? (g.pageviews / g.visits).toFixed(1) : "—"))],
    ["Median engaged / visit", ...groups.map((g) => `<b>${median(g.engaged)}</b>`)],
    ["Average engaged / visit", ...groups.map((g) => mean(g.engaged))],
    ["Viewed a case study", ...groups.map((g) => share(g.viewedOne, g.visits))],
    ["Viewed 2+ case studies", ...groups.map((g) => share(g.viewedTwo, g.visits))],
    ["Resume, LinkedIn or contact", ...groups.map((g) => share(g.hiring, g.visits))],
    ["A way to get in touch", ...groups.map((g) => share(g.contact, g.visits))],
    ["Case-study opens scrolled to 50%", ...groups.map((g) => share(g.caseStudy50, g.caseStudyOpens))],
    ["Case-study opens scrolled to the bottom", ...groups.map((g) => share(g.caseStudy90, g.caseStudyOpens))],
    ["Most viewed case study", ...groups.map(caseStudyCell)],
    ["Most common path", ...groups.map(journeyCell)],
  ];
  const compare = `<div class="scroll"><table class="compare"><thead><tr>${head
    .map((h, i) => `<th${num[i] ? ' class="num"' : ""}>${esc(h)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map(
      ([label, ...cells], r) =>
        `<tr><td>${esc(label)}</td>${cells
          // The last two rows are names, not numbers.
          .map((c) => `<td${r < rows.length - 2 ? ' class="num"' : ""}>${c}</td>`)
          .join("")}</tr>`,
    )
    .join("")}</tbody></table></div>`;

  const funnels = `<div class="funnels">${groups
    .map((g) => {
      const steps = g.funnel
        .map((count, i) => {
          const prev = g.funnel[i - 1];
          const meta =
            i === 0
              ? "all visits"
              : `${pct(count, g.visits)} of visits · ${pct(count, prev)} of the step before`;
          return `<li><div class="f-row"><span>${esc(report.funnel[i].label)}</span><b>${fmt(count)}</b></div>${bar(count, g.visits)}<div class="muted small">${meta}</div></li>`;
        })
        .join("");
      return `<div><h3>${esc(g.label)}</h3>${g.visits ? `<ol class="funnel">${steps}</ol>` : empty("No visits in this period.")}</div>`;
    })
    .join("")}</div>`;

  const csRows = d.caseStudies
    .map(
      (c) =>
        `<tr class="cs-name"><td colspan="5">${esc(c.label)}</td></tr>${c.byDevice
          .map(
            (x) =>
              `<tr><td class="muted">${esc(x.label)}</td><td class="num">${fmt(x.visits)}</td><td class="num">${x.visits ? median(x.engaged) : "—"}</td><td class="num">${share(x.continued, x.visits)}</td><td class="num">${share(x.acted, x.visits)}</td></tr>`,
          )
          .join("")}`,
    )
    .join("");
  const byCaseStudy = csRows
    ? `<div class="scroll"><table class="by-cs"><thead><tr><th></th><th class="num">Visits</th><th class="num">Median engaged</th><th class="num">Went on to another</th><th class="num">Then acted</th></tr></thead><tbody>${csRows}</tbody></table></div>`
    : empty("No case-study views in this period.");

  const others = [
    d.tablet.visits && !d.tablet.shown
      ? `${plural(d.tablet.visits, "tablet visit")} ${d.tablet.visits === 1 ? "is" : "are"} left out of the comparison until there are 10 to compare`
      : "",
    d.unknown ? `${plural(d.unknown, "visit")} with no device recorded ${d.unknown === 1 ? "is" : "are"} left out` : "",
  ].filter(Boolean);
  const reconcile = `${groups.map((g) => `${g.label} ${fmt(g.visits)}`).join(" + ")}${
    d.tablet.visits && !d.tablet.shown ? ` + tablet ${fmt(d.tablet.visits)}` : ""
  }${d.unknown ? ` + unknown ${fmt(d.unknown)}` : ""} = ${plural(d.total, "visit")}.`;

  return `<section>
<h2>Device behavior</h2>
<p class="muted small">Each visit counts under the device it started on. Same funnel steps as above, with each device's own visits as the base.${small.length ? ` <b>Small sample (${small.join(" and ")} under ${SMALL_GROUP} visits) — treat percentages as directional.</b>` : ""}</p>
${headline}
${funnels}
<h3>Side by side</h3>
${compare}
<h3>Case studies by device</h3>
<p class="muted small">Went on to another: opened a different case study afterwards in the same visit. Then acted: reached resume, LinkedIn or contact during the visit.</p>
${byCaseStudy}
<p class="muted small">${reconcile}${others.length ? ` ${others.join("; ")}.` : ""}</p>
</section>`;
}

function utm(report: Report) {
  const { source, medium, campaign } = report.utm;
  if (!source.length && !medium.length && !campaign.length) {
    return `<section><h2>UTM campaigns</h2><p class="muted">No tagged links in this period. To see a specific post or message here, share links like <code>marcfavro.com/?utm_source=linkedin&amp;utm_medium=post&amp;utm_campaign=job-search</code>.</p></section>`;
  }
  return `<section><h2>UTM campaigns</h2><div class="grid3">
${ranked("Campaign", campaign, report.visits)}
${ranked("Source", source, report.visits)}
${ranked("Medium", medium, report.visits)}
</div></section>`;
}

function timeOf(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function recent(report: Report) {
  const rows = report.recent.map((v) => [
    esc(timeOf(v.ts)),
    esc(v.city ?? "Unknown"),
    esc(v.region ?? "—"),
    esc(pageLabel(v.path)),
    esc(sourceOf(v)),
    esc(v.country ?? "—"),
    esc(v.device ?? "—"),
  ]);
  return `<section>
<h2>Recent pageviews</h2>
${rows.length ? `<div class="recent">${table(["Time", "City", "Region", "Page", "Source", "Country", "Device"], rows, [])}</div>${report.pageviews > 50 ? `<p class="muted small">Latest 50 of ${fmt(report.pageviews)}.</p>` : ""}` : empty()}
</section>`;
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
  --track: #e8e7e2;
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
    --track: #2e2e2b;
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
  --track: #2e2e2b;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface); color: var(--text); font: 15px/1.45 system-ui, -apple-system, sans-serif; -webkit-text-size-adjust: 100%; }
main { max-width: 1040px; margin: 0 auto; padding: 24px 16px 48px; }
h1 { font-size: 22px; margin: 0; }
h2 { font-size: 17px; margin: 0 0 6px; }
h3 { font-size: 15px; margin: 0 0 6px; }
header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
section { margin-top: 36px; min-width: 0; }
.muted { color: var(--muted); }
.small { font-size: 13px; }
p { margin: 0 0 8px; }
code { font-size: 13px; overflow-wrap: anywhere; }
nav { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
nav a { padding: 6px 12px; border: 1px solid var(--line); border-radius: 999px; color: var(--text); text-decoration: none; }
nav a[aria-current] { background: var(--text); color: var(--surface); border-color: var(--text); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 24px; }
.stat { background: var(--raised); border-radius: 8px; padding: 12px 16px; }
.stat b { display: block; font-size: 28px; line-height: 1.2; font-variant-numeric: tabular-nums; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr)); column-gap: 40px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); column-gap: 32px; }
.grid3 section, .grid2 .sub section { margin-top: 12px; }
.divider { margin-top: 56px; padding-top: 16px; border-top: 1px solid var(--line); }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
th, td { text-align: left; padding: 6px 10px 6px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; color: var(--muted); font-size: 13px; }
td { overflow-wrap: break-word; }
td:first-child { min-width: 8em; }
@media (max-width: 560px) { .opt { display: none; } }
.recent td { white-space: nowrap; overflow-wrap: normal; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.track { display: block; height: 6px; margin-top: 5px; background: var(--track); border-radius: 0 3px 3px 0; overflow: hidden; }
.fill { display: block; height: 100%; background: var(--series); border-radius: 0 3px 3px 0; }
.trend { display: grid; grid-template-columns: auto 1fr; grid-template-rows: 160px auto; column-gap: 8px; margin-top: 8px; }
.trend-max { grid-row: 1; align-self: start; line-height: 1; }
.cols { grid-row: 1; grid-column: 2; display: flex; align-items: flex-end; gap: 2px; border-bottom: 1px solid var(--muted); border-top: 1px dashed var(--line); }
.col { flex: 1 1 0; min-width: 0; height: 100%; display: flex; align-items: flex-end; }
.col:hover { background: var(--raised); }
.col span { display: block; width: 100%; background: var(--series); border-radius: 3px 3px 0 0; }
.trend-axis { grid-column: 2; display: flex; justify-content: space-between; padding-top: 4px; }
.funnel { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 14px; }
.funnel .track { height: 10px; border-radius: 0 4px 4px 0; }
.funnel .fill { border-radius: 0 4px 4px 0; }
.f-row { display: flex; justify-content: space-between; gap: 12px; }
.f-row b { font-variant-numeric: tabular-nums; }
.facts { margin: 20px 0 0; display: grid; gap: 8px; }
.facts div { display: grid; grid-template-columns: minmax(130px, 40%) 1fr; gap: 12px; padding-top: 8px; border-top: 1px solid var(--line); }
.facts dt { color: var(--muted); font-size: 13px; }
.facts dd { margin: 0; overflow-wrap: anywhere; }
.paths { list-style: none; margin: 0; padding: 0; }
.funnels { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); column-gap: 40px; margin: 16px 0 24px; }
.funnels h3 { margin-bottom: 0; }
.compare td:not(:first-child), .compare th:not(:first-child) { min-width: 7em; }
.by-cs .cs-name td { padding-top: 14px; font-weight: 600; border-bottom: none; }
.by-cs td:first-child { min-width: 5em; padding-left: 12px; }
.by-cs .cs-name td:first-child { padding-left: 0; }
.paths li { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--line); }
.paths b { font-variant-numeric: tabular-nums; }
button, input { font: inherit; }
button { padding: 6px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--raised); color: var(--text); cursor: pointer; }
input[type=password] { width: 100%; max-width: 320px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--text); }
form.login { display: grid; gap: 12px; margin-top: 24px; }
.error { color: #c42b2b; }
footer { margin-top: 48px; font-size: 13px; }
footer p { max-width: 720px; }
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

export function renderDashboard(opts: { report: Report; allTime: number; signOut: boolean }) {
  const { report, allTime, signOut } = opts;
  const n = report.visits;

  const nav = (Object.keys(RANGES) as RangeKey[])
    .map(
      (key) =>
        `<a href="/analytics?range=${key}"${key === report.range ? ' aria-current="page"' : ""}>${RANGES[key].label}</a>`,
    )
    .join("");

  const perVisit = n ? (report.sessionPageviews / n).toFixed(1) : "—";

  const body = `
<header>
<div><h1>Analytics</h1><p class="muted small">${fmt(allTime)} pageviews recorded all time · times are Eastern</p></div>
${signOut ? `<form method="post" action="/analytics"><input type="hidden" name="logout" value="1"><button type="submit">Sign out</button></form>` : ""}
</header>
<nav aria-label="Date range">${nav}</nav>

<div class="stats">
<div class="stat"><span class="muted">Visits</span><b>${fmt(n)}</b></div>
<div class="stat"><span class="muted">Pageviews</span><b>${fmt(report.pageviews)}</b></div>
<div class="stat"><span class="muted">Pages per visit</span><b>${perVisit}</b></div>
<div class="stat"><span class="muted">Engaged time per visit</span><b>${median(report.engagedPerVisit)}</b><span class="muted small">${report.engagedPerVisit ? `median · ${mean(report.engagedPerVisit)} average` : "measured from Oct 7, 2026"}</span></div>
<div class="stat"><span class="muted">Resume, LinkedIn or contact</span><b>${fmt(report.hiring)}</b><span class="muted small">${pct(report.hiring, n)} of visits</span></div>
</div>

${trend(report)}

<div class="grid2">
${funnel(report)}
${caseStudies(report)}
</div>

${caseStudyDepth(report)}

${sources(report)}

${devices(report)}

<h2 class="divider">Details</h2>
${pages(report)}
<div class="grid2">
${journeys(report)}
${ranked("Entry pages", report.entries, n, { note: "The first page of each visit." })}
</div>
<div class="grid2">
${actions(report)}
</div>

${utm(report)}

<section><h2>Audience</h2><p class="muted small">Per visit. Browser and OS were first recorded on Oct 7.</p>
<div class="grid3">
${ranked("Country", report.audience.country, n, { limit: 8 })}
${ranked("Device", report.audience.device, n)}
${ranked("Browser", report.audience.browser, n, { limit: 8 })}
${ranked("Operating system", report.audience.os, n, { limit: 8 })}
</div></section>

<section><h2>Location (approximate)</h2><p class="muted small">From IP address lookups by Vercel. Country is dependable; region is usually right; city is often the nearest metro or the internet provider's hub, and VPNs, iCloud Private Relay and company networks can put it somewhere else entirely.</p>
<div class="grid2">
${ranked("Region", report.audience.region, n, { limit: 10 })}
${ranked("City", report.audience.city, n, { limit: 10 })}
</div></section>

${recent(report)}

<footer class="muted">
<p>A visit is one browser tab's pageviews until it closes or sits idle for 30 minutes, grouped by a random id kept only in that tab — no cookie, nothing that carries over to the next visit. So unique visitors aren't counted; Vercel Web Analytics has its own visitor count.</p>
${report.legacyPageviews ? `<p>${plural(report.legacyPageviews, "pageview")} in this period came before visits were tracked (Oct 7). ${report.legacyPageviews === 1 ? "It counts" : "They count"} as pageviews but not toward visits, the funnel, paths or audience.</p>` : ""}
<p>Engaged time counts only while the page is on screen in the active tab and someone has scrolled, clicked, typed or touched within the last minute — a background tab, a minimised window or a page left unattended doesn't add to it. It's measured from Oct 7, 2026 onward; earlier visits have no time recorded and are left out of every time figure rather than counted as zero.${report.untimedVisits ? ` ${plural(report.untimedVisits, "visit")} in this period ${report.untimedVisits === 1 ? "predates" : "predate"} it.` : ""}</p>
<p>Scroll depth is how much of a page has been on screen, recorded at 25, 50, 75 and 90% (the bottom) once per visit and page — never mouse movement or anything finer. It's recorded from Oct 7, 2026 onward; earlier visits have none and are left out of depth figures.${report.unscrolledVisits ? ` ${plural(report.unscrolledVisits, "visit")} in this period ${report.unscrolledVisits === 1 ? "predates" : "predate"} it.` : ""}</p>
<p>Your own browsers are excluded via /owner. Bots that announce themselves are skipped.</p>
</footer>`;

  return page("Analytics", body);
}
