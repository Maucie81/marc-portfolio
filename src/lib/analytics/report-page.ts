import { funnelSteps, sourceSplit, trendChart, viewPath } from "./dashboard";
import {
  bar,
  coverage,
  dayOf,
  duration,
  empty,
  esc,
  fmt,
  isoDay,
  mean,
  median,
  pct,
  plural,
  ranked,
  rangeText,
  share,
  table,
  timeOf,
  depthLabel,
} from "./format";
import { insightsFor } from "./insights";
import {
  INTERNAL_SOURCE,
  LIVE_MS,
  PARTNER_PORTAL_PHONES_HIDDEN,
  QUICK_BOTTOM_MS,
  RANGES,
  SMALL_GROUP,
  type RangeKey,
  type Report,
  type TimeStats,
} from "./metrics";

/**
 * /analytics/report: the same report as the dashboard, laid out to be read
 * on paper — five short sections (summary, acquisition, content, behavior,
 * devices) and a one-page appendix, each starting a new printed page. It
 * reads only what buildReport and insightsFor already worked out, so a
 * range prints exactly what the dashboard shows for it.
 *
 * "Save as PDF" is the browser's own print dialog: no PDF library, nothing
 * added to the build. Chrome and Safari offer the page <title> as the file
 * name, so it's set to marcfavro-analytics-YYYY-MM-DD; the browser still
 * has the last word on the name and on its own headers and footers.
 */

const timeCell = (t: TimeStats) => (t ? `${duration(t.median)} <span class="muted">(${fmt(t.n)})</span>` : "—");

/** Measured visits a newer figure (section reach, hero editions) needs
 * before the report prints it — the insights' bar for any rate. Below it,
 * the older stand-in stays (scroll depth) or the section is left out. */
const MIN_MEASURED = 20;

function sheet(n: number, title: string, report: Report, body: string) {
  return `<section class="sheet">
<p class="running">Portfolio analytics · ${esc(rangeText(report))}</p>
<h2><span class="num-label">${n}</span>${esc(title)}</h2>
${body}
</section>`;
}

function summary(report: Report) {
  const n = report.visits;
  const { items, note } = insightsFor(report);
  const cov = coverage(report);
  const live = report.live.now;
  const tiles: [string, string, string][] = [
    ["Visits", fmt(n), report.legacyPageviews ? `plus ${plural(report.legacyPageviews, "earlier pageview")} outside visits` : ""],
    ["Pageviews", fmt(report.pageviews), ""],
    ["Pages per visit", n ? (report.sessionPageviews / n).toFixed(1) : "—", ""],
    [
      "Median engaged time",
      median(report.engagedPerVisit),
      report.engagedPerVisit ? `per visit · ${mean(report.engagedPerVisit)} average` : "not measured in this period",
    ],
    ["Resume, LinkedIn or contact", pct(report.hiring, n), plural(report.hiring, "visit")],
    ["Opened a case study", pct(report.funnel[1].count, n), plural(report.funnel[1].count, "visit")],
  ];
  const gaps = [
    cov.timed < cov.total ? `Engaged time was measured for ${fmt(cov.timed)} of ${plural(cov.total, "visit")}` : "",
    cov.scrolled < cov.total ? `scroll depth for ${fmt(cov.scrolled)} of ${fmt(cov.total)}` : "",
  ].filter(Boolean);

  return `<section class="sheet first">
<header class="masthead">
<p class="eyebrow">marcfavro.com</p>
<h1>Portfolio analytics</h1>
<p class="range">${esc(rangeText(report))}</p>
<p class="muted small">Generated ${esc(timeOf(report.nowMs))} Eastern${live ? ` · ${plural(live, "visit")} recently active (last ${LIVE_MS / 60000} minutes)` : ""}</p>
</header>
<h2><span class="num-label">1</span>Executive summary</h2>
<div class="kpis">${tiles
    .map(([label, value, sub]) => `<div class="kpi"><span class="muted">${esc(label)}</span><b>${value}</b>${sub ? `<span class="muted small">${esc(sub)}</span>` : ""}</div>`)
    .join("")}</div>
<div class="block">
<h3>Key insights</h3>
${items.length ? `<ol class="insights">${items.map((i) => `<li>${esc(i.text)} <span class="muted small">${esc(i.basis)}</span></li>`).join("")}</ol>` : ""}
${note ? `<p class="muted small">${esc(note)}</p>` : ""}
</div>
<div class="block">
<h3>Visits per ${report.unit}</h3>
${trendChart(report)}
</div>
${gaps.length ? `<p class="muted small coverage">${gaps.join("; ")}. Both started on Oct 7, 2026; earlier visits are left out of time and depth figures rather than counted as zero.</p>` : ""}
</section>`;
}

function acquisition(report: Report) {
  const n = report.visits;
  const max = report.sources[0]?.visits ?? 0;
  // Real sources first; the internal / new-tab bucket isn't one.
  const rows = [
    ...report.sources.filter((s) => s.name !== INTERNAL_SOURCE),
    ...report.sources.filter((s) => s.name === INTERNAL_SOURCE),
  ]
    .slice(0, 10)
    .map((s) => [
      `${s.name === INTERNAL_SOURCE ? `<span class="muted">${esc(s.name)}</span>` : esc(s.name)}${bar(s.visits, max)}`,
      fmt(s.visits),
      pct(s.visits, n),
      pct(s.caseStudy, s.visits),
      pct(s.hiring, s.visits),
      median(s.engaged),
    ]);
  return sheet(
    2,
    "Acquisition",
    report,
    `${sourceSplit(report)}
<div class="block">
<h3>Traffic sources</h3>
<p class="muted small">Viewed work and Acted: share of each source's visits that opened a case study, or reached resume, LinkedIn or contact. Engaged: median per visit, where measured.</p>
${rows.length ? table(["Source", "Visits", "Share", "Viewed work", "Acted", "Median engaged"], rows, [false, true, true, true, true, true]) : empty()}
${report.sources.length > 10 ? `<p class="muted small">+ ${report.sources.length - 10} more</p>` : ""}
</div>
<div class="cols2">
${ranked("Entry pages", report.entries, n, { limit: 6 })}
${report.utm.campaign.length ? ranked("UTM campaigns", report.utm.campaign, n, { limit: 6 }) : ""}
</div>
<p class="muted small">Where visitors are is under Devices and audience.${report.utm.source.length || report.utm.medium.length ? " UTM source and medium are in the appendix." : ""}</p>`,
  );
}

function content(report: Report) {
  const max = report.caseStudies[0]?.visits ?? 0;
  const perf = report.caseStudies.map((c) => [
    `${esc(c.label)}${bar(c.visits, max)}`,
    fmt(c.visits),
    pct(c.visits, report.visits),
    median(c.engaged),
    share(c.continued, c.visits),
    share(c.hiring, c.visits),
  ]);
  const depth = report.caseStudies
    .filter((c) => c.depth.n > 0)
    .map((c) => {
      const d = c.depth;
      return [
        esc(c.label),
        `${fmt(d.n)}${d.n < c.visits ? ` <span class="muted">of ${fmt(c.visits)}</span>` : ""}`,
        share(d.r50, d.n),
        share(d.r90, d.n),
        d.bottomTimed ? `${fmt(d.bottomQuick)} <span class="muted">of ${fmt(d.bottomTimed)}</span>` : "—",
      ];
    });
  const quick = Math.round(QUICK_BOTTOM_MS / 1000);
  return sheet(
    3,
    "Content performance",
    report,
    `<div class="block">
<h3>Case studies</h3>
<p class="muted small">Reach: share of all visits that opened it. Engaged: median active time on it per visit that opened it. Went on: opened another case study afterwards. Then acted: reached resume, LinkedIn or contact.</p>
${table(["Case study", "Visits", "Reach", "Median engaged", "Went on", "Then acted"], perf, [false, true, true, true, true, true])}
</div>
<div class="block">
<h3>Scroll depth</h3>
<p class="muted small">Of the visits with scroll depth recorded (Measured), the share that scrolled at least halfway and to the bottom. A bottom reached with under ${quick}s of engaged time is most likely a skim or a jump.</p>
${depth.length ? table(["Case study", "Measured", "50%", "Bottom", `Bottom in <${quick}s`], depth, [false, true, true, true, true]) : empty("No case-study scroll data in this period.")}
</div>
${heroes(report)}`,
  );
}

/** Hero editions, compact — only once enough homepage visits have one
 * recorded; otherwise a single line instead of a table of near-empties. */
function heroes(report: Report) {
  const x = report.exposure;
  if (x.heroShown < MIN_MEASURED) {
    return x.heroShown
      ? `<p class="muted small coverage">Hero performance appears once ${MIN_MEASURED} homepage visits have a hero edition recorded (${fmt(x.heroShown)} so far).</p>`
      : "";
  }
  const small = x.heroes.some((h) => h.stats.visits < SMALL_GROUP);
  const rows = x.heroes.map((h) => {
    const g = h.stats;
    return [
      `${esc(h.label)}${h.defaultEdition ? ' <span class="muted">(default)</span>' : ""}${g.visits < SMALL_GROUP ? " *" : ""}`,
      fmt(g.visits),
      share(g.viewedOne, g.visits),
      share(g.viewedTwo, g.visits),
      share(g.hiring, g.visits),
      median(g.engaged),
    ];
  });
  return `<div class="block">
<h3>Hero performance</h3>
<p class="muted small">The homepage hero edition each visit had on screen, of ${plural(x.heroShown, "homepage visit")} with one recorded. Acted: reached resume, LinkedIn or contact. Hero 2 is the rotation's default — shown when the browser hasn't stored the rotation's own flag or can't store anything — so its sample differs from the randomly drawn editions; don't rank it against them. Analytics records only the edition shown.</p>
${table(["Hero", "Shown", "Opened work", "Opened 2+", "Acted", "Median engaged"], rows, [false, true, true, true, true, true])}
${small ? `<p class="muted small">* Under ${SMALL_GROUP} visits — treat differences as directional.</p>` : ""}
</div>`;
}

/** Section visibility once enough homepage visits have it; until then
 * the homepage scroll-depth stand-in, with the sample spelled out. Never
 * both at the same weight. */
function homepageReach(report: Report) {
  const x = report.exposure;
  const homePage = report.pages.find((p) => p.path === "/");
  const homeAll = homePage?.visits ?? 0;
  const scroll = homePage?.depth;
  const sample =
    x.home < homeAll ? `Section visibility measured for ${fmt(x.home)} of ${plural(homeAll, "homepage visit")}.` : "";

  if (x.home >= MIN_MEASURED) {
    const rows = x.sections.map((sec) => [esc(sec.label), fmt(sec.seen), pct(sec.seen, x.home)]);
    const rw = x.recentWork;
    return `<h3>Homepage section reach</h3>
${table(["Section seen", "Visits", "Share"], rows, [false, true, true])}
<dl class="pairs"><div><dt>Recent work seen → case study opened</dt><dd>${pct(rw.opened, rw.seen)} <span class="muted">(${fmt(rw.opened)} of ${fmt(rw.seen)})</span></dd></div></dl>
<p class="muted small">Of ${plural(x.home, "measured homepage visit")}${x.home < homeAll ? ` (${fmt(homeAll)} in all)` : ""}; seen = half on screen for 0.5s.${
      scroll?.n ? ` Scroll depth for reference: ${pct(scroll.r50, scroll.n)} halfway, ${pct(scroll.r90, scroll.n)} bottom.` : ""
    }</p>`;
  }

  const proxy = scroll?.n
    ? table(
        ["Homepage scrolled", "Visits", "Share"],
        (
          [
            ["25%", scroll.r25],
            ["50%", scroll.r50],
            ["75%", scroll.r75],
            ["Bottom", scroll.r90],
          ] as const
        ).map(([label, count]) => [`${label}${bar(count, scroll.n)}`, fmt(count), pct(count, scroll.n)]),
        [false, true, true],
      )
    : empty("No homepage scroll data in this period.");
  return `<h3>Homepage scroll depth</h3>
${proxy}
<p class="muted small">${scroll?.n ? `Of ${plural(scroll.n, "homepage visit")} with scroll depth recorded. ` : ""}${
    x.home
      ? `${sample || `Section visibility measured for ${plural(x.home, "homepage visit")}.`} It replaces this once ${MIN_MEASURED} homepage visits are measured.`
      : "Section visibility isn't measured for any homepage visit in this range yet."
  }</p>`;
}

function behavior(report: Report) {
  const { toCaseStudy, toHiring, toMeaningful, meaningfulBase, toNextCaseStudy } = report.timing;
  const n = report.visits;
  // Actions nobody took go in one line rather than a column of zeros;
  // ones this period's tracker couldn't record say so rather than "0".
  const taken = report.actions.filter((a) => a.visits > 0 || (a.seenOnly && !a.base));
  const untaken = report.actions.filter((a) => !taken.includes(a));
  const actionRows = taken.map((a) =>
    a.seenOnly && !a.base
      ? [esc(a.label), "—", '<span class="muted">Not measured</span>']
      : [
          `${esc(a.label)}${a.seenOnly && a.base < n ? ` <span class="muted small">of ${fmt(a.base)} measured${a.phonesExcluded ? " that could see it" : ""}</span>` : ""}`,
          fmt(a.visits),
          pct(a.visits, a.base),
        ],
  );
  const pp = report.partnerPortal;
  const partner = pp.measured
    ? `<p class="muted small">Partner Portal CTA (high-intent product interaction): ${plural(pp.visits, "visit")} clicked${
        pp.viewers ? ` — ${pct(pp.viewersClicked, pp.viewers)} of measured Yahoo viewers who could see it (${fmt(pp.viewersClicked)} of ${fmt(pp.viewers)}; earlier viewers excluded)` : ""
      }${pp.hiddenViewers ? `; ${plural(pp.hiddenViewers, "phone viewer")} since it was hidden on phones (${esc(dayOf(PARTNER_PORTAL_PHONES_HIDDEN))}) left out, not counted as 0%` : ""}.</p>`
    : "";
  const paths = report.journeys.slice(0, 5);
  return sheet(
    4,
    "Behavior",
    report,
    `<div class="cols2">
<div>
<div class="block">
<h3>Hiring funnel</h3>
${funnelSteps(report)}
</div>
<div class="block">
${homepageReach(report)}
</div>
</div>
<div>
<div class="block">
<h3>Time to first meaningful action</h3>
<dl class="pairs">
<div><dt>Homepage arrivals that open a case study</dt><dd>${pct(report.homeToCaseStudy, report.startedOnHome)} <span class="muted">(${fmt(report.homeToCaseStudy)} of ${fmt(report.startedOnHome)})</span></dd></div>
<div><dt>Homepage → first meaningful action</dt><dd>${meaningfulBase ? timeCell(toMeaningful) : '<span class="muted">Not measured</span>'}</dd></div>
<div><dt>Homepage → first case study</dt><dd>${timeCell(toCaseStudy)}</dd></div>
<div><dt>First case study → next</dt><dd>${timeCell(toNextCaseStudy)}</dd></div>
<div><dt>Arrival → resume, LinkedIn or contact</dt><dd>${timeCell(toHiring)}</dd></div>
</dl>
<p class="muted small">Median clock time among visits that took the step, visits behind each in brackets — clock time, not engaged time.</p>
</div>
<div class="block">
<h3>Actions</h3>
${table(["Action", "Visits", "Share"], actionRows, [false, true, true])}
${untaken.length ? `<p class="muted small">None in this period: ${untaken.map((a) => `${esc(a.label)}${a.seenOnly && a.base < n ? ` (of ${fmt(a.base)} measured${a.phonesExcluded ? " that could see it" : ""})` : ""}`).join(", ")}.</p>` : ""}
${partner}
</div>
</div>
</div>
<div class="block">
<h3>Common paths</h3>
${paths.length ? `<ol class="paths">${paths.map(([path, count]) => `<li><span>${esc(path)}</span><b>${fmt(count)}</b></li>`).join("")}</ol>` : empty("No visit has gone past one page yet.")}
<p class="muted small">${plural(report.singlePage, "visit")} (${pct(report.singlePage, report.visits)}) saw one page only.</p>
</div>`,
  );
}

function audience(report: Report) {
  const d = report.devices;
  const groups = d.groups;
  const small = groups.filter((g) => g.visits < SMALL_GROUP).map((g) => g.label.toLowerCase());
  const rows: [string, (g: (typeof groups)[number]) => string][] = [
    ["Visits", (g) => share(g.visits, d.total)],
    ["Pages per visit", (g) => (g.visits ? (g.pageviews / g.visits).toFixed(1) : "—")],
    ["Median engaged / visit", (g) => median(g.engaged)],
    ["Opened a case study", (g) => share(g.viewedOne, g.visits)],
    ["Opened 2+ case studies", (g) => share(g.viewedTwo, g.visits)],
    ["Resume, LinkedIn or contact", (g) => share(g.hiring, g.visits)],
    ["Case-study opens scrolled to 50%", (g) => share(g.caseStudy50, g.caseStudyOpens)],
    ["Case-study opens scrolled to the bottom", (g) => share(g.caseStudy90, g.caseStudyOpens)],
    ["Time to first case study", (g) => timeCell(g.toCaseStudy)],
    ["Time to resume, LinkedIn or contact", (g) => timeCell(g.toHiring)],
  ];
  const compare = table(
    ["", ...groups.map((g) => g.label)],
    rows.map(([label, cell]) => [esc(label), ...groups.map(cell)]),
    [false, ...groups.map(() => true)],
  );
  const n = report.visits;
  return sheet(
    5,
    "Devices and audience",
    report,
    `<div class="block">
<h3>Mobile vs desktop</h3>
<p class="muted small">Each visit counts under the device it started on; times are median clock time from arrival, with visits behind each in brackets.${small.length ? ` <b>Small sample (${small.join(" and ")} under ${SMALL_GROUP} visits) — directional only.</b>` : ""}${d.tablet.visits && !d.tablet.shown ? ` ${plural(d.tablet.visits, "tablet visit")} not compared until there are 10.` : ""}</p>
${compare}
</div>
<div class="cols3">
${ranked("Country", report.audience.country, n, { limit: 5 })}
${ranked("Region", report.audience.region, n, { limit: 5 })}
${ranked("City", report.audience.city, n, { limit: 5 })}
</div>
<dl class="pairs software">
<div><dt>Browser</dt><dd>${oneLine(report.audience.browser, n)}</dd></div>
<div><dt>Operating system</dt><dd>${oneLine(report.audience.os, n)}</dd></div>
</dl>
<p class="muted small">Location is approximate, from Vercel's IP lookup: country is dependable, region usually right, city often the nearest metro. Browser and OS were first recorded on Oct 7, 2026.</p>`,
  );
}

/** "Chrome 41% · Safari 30% · Firefox 18% · +2 more" — a ranked list as
 * one line, where a table would cost the page a row. */
function oneLine(rows: [string, number][], total: number, limit = 4) {
  if (!rows.length) return "—";
  const shown = rows.slice(0, limit).map(([label, count]) => `${esc(label)} ${pct(count, total)}`);
  return shown.join(" · ") + (rows.length > limit ? ` · <span class="muted">+${rows.length - limit} more</span>` : "");
}

function appendix(report: Report) {
  const max = report.pages[0]?.views ?? 0;
  const rows = report.pages
    .slice(0, 15)
    .map((p) => [
      `${esc(p.label)}${bar(p.views, max)}`,
      fmt(p.visits),
      fmt(p.views),
      median(p.engaged),
      depthLabel(p.depth.typical),
      p.depth.n ? pct(p.depth.r90, p.depth.n) : "—",
    ]);
  if (!rows.length) return "";
  const n = report.visits;
  const { source, medium } = report.utm;
  return sheet(
    6,
    "Appendix",
    report,
    `<div class="block">
<h3>Pages</h3>
${table(["Page", "Visits", "Pageviews", "Median engaged", "Typical deepest", "Bottom"], rows, [false, true, true, true, true, true])}
${report.pages.length > 15 ? `<p class="muted small">Top 15 of ${fmt(report.pages.length)} pages.</p>` : ""}
</div>
${source.length || medium.length ? `<div class="cols2">
${ranked("UTM source", source, n, { limit: 5 })}
${ranked("UTM medium", medium, n, { limit: 5 })}
</div>` : ""}
<div class="notes muted small">
<p>A visit is one browser tab's pageviews until it closes or sits idle for 30 minutes. Unique visitors aren't counted. The site owner's browsers and self-identified bots are excluded.</p>
<p>Engaged time counts only while the page is on screen in the active tab with recent scrolling, clicking, typing or touch. Scroll depth is recorded at 25, 50, 75 and 90% (the bottom). Both started on Oct 7, 2026.</p>
<p>Homepage section reach, hero editions, Proof notes and the Partner Portal CTA are recorded only by the tracker released on Oct 7, 2026; earlier visits are left out of those figures (shown as measured counts or "Not measured"), never counted as zero.</p>
<p>Insights are chosen by fixed rules: a rate needs 20 visits behind it; a comparison needs 10 or more visits per side, a 10-point gap, and a significance test that supports it.</p>
</div>`,
  );
}

const STYLE = `
:root {
  color-scheme: light;
  --paper: #ffffff;
  --desk: #e9e8e4;
  --ink: #141414;
  --muted: #5a5955;
  --line: #d9d8d3;
  --raised: #f3f2ef;
  --series: #1d5fb4;
  --track: #e4e3de;
}
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; background: var(--desk); color: var(--ink); font: 14px/1.45 system-ui, -apple-system, sans-serif; -webkit-text-size-adjust: 100%; }
.toolbar { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 10px 16px; background: var(--paper); border-bottom: 1px solid var(--line); }
.toolbar nav { display: flex; flex-wrap: wrap; gap: 6px; }
.toolbar a { color: var(--ink); }
.toolbar nav a { padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px; text-decoration: none; font-size: 13px; }
.toolbar nav a[aria-current] { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.toolbar button { margin-left: auto; padding: 7px 14px; border: 0; border-radius: 6px; background: var(--ink); color: var(--paper); font: inherit; font-weight: 600; cursor: pointer; }
.toolbar .tip { flex-basis: 100%; margin: 0; }
.sheets { padding: 24px 16px 48px; }
.sheet { max-width: 8.5in; margin: 0 auto 24px; padding: 0.6in 0.65in; background: var(--paper); box-shadow: 0 1px 3px rgb(0 0 0 / 0.12); }
h1 { font-size: 28px; line-height: 1.15; margin: 4px 0 6px; letter-spacing: -0.01em; }
h2 { font-size: 18px; margin: 0 0 14px; padding-bottom: 8px; border-bottom: 2px solid var(--ink); }
h3 { font-size: 13px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.04em; }
p { margin: 0 0 6px; }
.muted { color: var(--muted); }
.small { font-size: 12px; }
.eyebrow { margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.range { font-size: 16px; font-weight: 600; margin: 0 0 2px; }
.masthead { margin-bottom: 28px; }
.running { margin: 0 0 18px; font-size: 11px; color: var(--muted); letter-spacing: 0.04em; text-transform: uppercase; }
.num-label { display: inline-block; min-width: 1.6em; color: var(--muted); font-variant-numeric: tabular-nums; }
.block { margin-top: 22px; break-inside: avoid; page-break-inside: avoid; }
.kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.kpi { padding: 10px 12px; border: 1px solid var(--line); border-radius: 6px; break-inside: avoid; }
.kpi b { display: block; font-size: 24px; line-height: 1.2; font-variant-numeric: tabular-nums; }
.kpi .small { display: block; }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 0 0 4px; break-inside: avoid; }
.stat { padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; }
.stat b { display: block; font-size: 18px; font-variant-numeric: tabular-nums; }
.stat .small { display: block; }
.stat.aside { border-style: dashed; color: var(--muted); }
.insights { margin: 8px 0 0; padding-left: 1.4em; display: grid; gap: 8px; }
.insights li { padding-left: 4px; }
.insights .muted { display: block; }
.insights + p { margin-top: 10px; }
.cols2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
.cols3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 24px; }
.cols2 > .block, .cols3 > .block { margin-top: 22px; }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 12.5px; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th, td { text-align: left; padding: 5px 8px 5px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; color: var(--muted); font-size: 11.5px; }
td:first-child { min-width: 7em; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.track { display: block; height: 5px; margin-top: 4px; background: var(--track); border-radius: 0 3px 3px 0; overflow: hidden; }
.fill { display: block; height: 100%; background: var(--series); }
.trend { display: grid; grid-template-columns: auto 1fr; grid-template-rows: 110px auto; column-gap: 8px; margin-top: 6px; }
.trend-max { grid-row: 1; align-self: start; line-height: 1; }
.cols { grid-row: 1; grid-column: 2; display: flex; align-items: flex-end; gap: 2px; border-bottom: 1px solid var(--muted); border-top: 1px dashed var(--line); }
.col { flex: 1 1 0; min-width: 0; height: 100%; display: flex; align-items: flex-end; }
.col span { display: block; width: 100%; background: var(--series); border-radius: 2px 2px 0 0; }
.trend-axis { grid-column: 2; display: flex; justify-content: space-between; padding-top: 4px; }
.funnel { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 10px; }
.funnel .track { height: 8px; }
.f-row { display: flex; justify-content: space-between; gap: 12px; }
.f-row b { font-variant-numeric: tabular-nums; }
.pairs { margin: 6px 0 8px; display: grid; gap: 6px; }
.pairs div { display: flex; justify-content: space-between; gap: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--line); }
.pairs dt { color: var(--muted); }
.pairs dd { margin: 0; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
.software { margin-top: 18px; }
.software dd { white-space: normal; }
.paths { list-style: none; margin: 0; padding: 0; font-size: 12.5px; }
.paths li { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px solid var(--line); break-inside: avoid; }
.paths b { font-variant-numeric: tabular-nums; }
.coverage { margin-top: 22px; padding-top: 10px; border-top: 1px solid var(--line); }
.notes { margin-top: 28px; padding-top: 10px; border-top: 1px solid var(--line); }
@media (max-width: 640px) {
  .sheet { padding: 24px 16px; }
  .kpis, .cols3, .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cols2 { grid-template-columns: minmax(0, 1fr); }
}
@page { size: letter; margin: 0.5in 0.55in; }
@media print {
  body { background: var(--paper); font-size: 10.5pt; }
  .toolbar { display: none; }
  .sheets { padding: 0; }
  /* The page-break-* twins are for Safari's print path. */
  .sheet { max-width: none; margin: 0; padding: 0; box-shadow: none; break-before: page; page-break-before: always; }
  .sheet.first { break-before: auto; page-break-before: auto; }
  .scroll { overflow: visible; }
  a { color: inherit; text-decoration: none; }
  h2, h3 { break-after: avoid; page-break-after: avoid; }
}
`;

/** Opens the print dialog once when the dashboard's Download PDF sent us
 * here (?print=1), dropping the flag first so a reload doesn't print again. */
const PRINT_SCRIPT = `<script>
(() => {
  const url = new URL(location.href);
  if (!url.searchParams.has("print")) return;
  url.searchParams.delete("print");
  history.replaceState(null, "", url);
  addEventListener("load", () => setTimeout(() => print(), 300));
})();
</script>`;

export function renderReportPage(report: Report) {
  const range = report.range;
  const ranges = (Object.keys(RANGES) as RangeKey[])
    .map(
      (key) =>
        `<a href="/analytics/report?range=${key}"${key === range ? ' aria-current="page"' : ""}>${RANGES[key].label}</a>`,
    )
    .join("");
  const title = `marcfavro-analytics-${isoDay(report.nowMs)}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<style>${STYLE}</style>
</head>
<body>
<div class="toolbar">
<a href="${viewPath("overview")}?range=${range}">← Dashboard</a>
<nav aria-label="Date range">${ranges}</nav>
<button type="button" onclick="print()">Save as PDF</button>
<p class="tip muted small">Choose “Save as PDF” as the destination in the print dialog. Turning off “Headers and footers” leaves cleaner pages.</p>
</div>
<main class="sheets">
${summary(report)}
${acquisition(report)}
${content(report)}
${behavior(report)}
${audience(report)}
${appendix(report)}
</main>
${PRINT_SCRIPT}
</body>
</html>`;
}
