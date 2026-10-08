import { pageLabel } from "@/lib/page-titles";
import {
  bar,
  depthLabel,
  duration,
  empty,
  esc,
  fmt,
  mean,
  median,
  pct,
  plural,
  ranked,
  share,
  table,
  timeOf,
} from "./format";
import { insightsFor } from "./insights";
import {
  LIVE_MS,
  QUICK_BOTTOM_MS,
  RANGES,
  RECENT_MS,
  SMALL_GROUP,
  sourceOf,
  type RangeKey,
  type Report,
  type TimeStats,
} from "./metrics";

/**
 * HTML for the private /analytics page (see src/app/analytics/[[...view]]/
 * route.ts). Plain server-rendered markup with no app chrome or trackers —
 * an internal utility, deliberately outside the portfolio's design system.
 *
 * Split into views, each answering one question: Overview (the state of the
 * site at a glance), Acquisition, Behavior, Content, Audience, and Activity
 * for the log-style tables. Every view is rendered from the same report in
 * one response, so switching between them is instant and the numbers can't
 * drift; a few lines of script swap the visible panel and the address bar,
 * and without script each tab is an ordinary link to its own URL. Charts
 * only where shape matters (the trend, funnels, relative reach); everything
 * else is a short ranked table.
 */

export const VIEWS = {
  overview: { label: "Overview", question: "How is the portfolio performing overall?" },
  acquisition: {
    label: "Acquisition",
    question: "How are people finding the site, and which sources send the most engaged visitors?",
  },
  behavior: { label: "Behavior", question: "What do people actually do after arriving?" },
  content: { label: "Content", question: "Which content holds attention and leads to deeper exploration?" },
  audience: { label: "Audience", question: "Who is visiting, and how does behavior differ by device?" },
  activity: { label: "Activity", question: "What has happened recently?" },
} as const;

export type ViewKey = keyof typeof VIEWS;

export const isView = (value: string): value is ViewKey => Object.hasOwn(VIEWS, value);

export const viewPath = (view: ViewKey) => (view === "overview" ? "/analytics" : `/analytics/${view}`);

const timeCell = (t: TimeStats) =>
  t ? `${duration(t.median)} <span class="muted">(${fmt(t.n)})</span>` : "—";

// ---------- overview ----------

function kpis(report: Report) {
  const n = report.visits;
  const perVisit = n ? (report.sessionPageviews / n).toFixed(1) : "—";
  const { now, recent } = report.live;
  return `<div class="stats">
<div class="stat"><span class="muted">Recently active</span><b>${now ? '<i class="live" aria-hidden="true"></i>' : ""}${fmt(now)}</b><span class="muted small">last ${LIVE_MS / 60000} min · ${fmt(recent)} in the last ${RECENT_MS / 60000} min</span></div>
<div class="stat"><span class="muted">Visits</span><b>${fmt(n)}</b></div>
<div class="stat"><span class="muted">Pageviews</span><b>${fmt(report.pageviews)}</b></div>
<div class="stat"><span class="muted">Pages per visit</span><b>${perVisit}</b></div>
<div class="stat"><span class="muted">Engaged time per visit</span><b>${median(report.engagedPerVisit)}</b><span class="muted small">${report.engagedPerVisit ? `median · ${mean(report.engagedPerVisit)} average` : "measured from Oct 7, 2026"}</span></div>
<div class="stat"><span class="muted">Resume, LinkedIn or contact</span><b>${pct(report.hiring, n)}</b><span class="muted small">${plural(report.hiring, "visit")}</span></div>
</div>`;
}

function insights(report: Report) {
  const { items, note } = insightsFor(report);
  const list = items.length
    ? `<ul class="insights">${items.map((i) => `<li>${esc(i.text)} <span class="muted small">${esc(i.basis)}</span></li>`).join("")}</ul>`
    : "";
  return `<section>
<h2>Insights</h2>
${list}${note ? `<p class="muted small">${esc(note)}</p>` : ""}
</section>`;
}

/** Visits per bucket as columns; shared with the printed report. */
export function trendChart(report: Report) {
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
  return `<div class="trend">
<div class="trend-max muted small">${fmt(max)}</div>
<div class="cols" role="img" aria-label="Visits per ${report.unit}">${cols}</div>
<div class="trend-axis muted small"><span>${esc(first)}</span><span>${esc(last)}</span></div>
</div>`;
}

function trend(report: Report) {
  return `<section>
<h2>Traffic trend</h2>
<p class="muted small">Visits per ${report.unit}. Hover or tap a bar for pageviews.</p>
${trendChart(report)}
</section>`;
}

/** The hiring funnel as bars; shared with the printed report. */
export function funnelSteps(report: Report) {
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
  return total
    ? `<ol class="funnel">${steps}</ol>${total < 30 ? `<p class="muted small">Small sample: each visit moves these percentages a lot.</p>` : ""}`
    : empty("No visits in this period yet.");
}

function funnel(report: Report) {
  const source = report.sources.find((s) => s.name !== "Returning or new tab");
  const journey = report.journeys[0];
  const facts: [string, string][] = [
    ["Top traffic source", source ? `${esc(source.name)} <span class="muted">(${plural(source.visits, "visit")})</span>` : "—"],
    [
      "Most common path",
      !journey
        ? "—"
        : journey[1] === 1 && report.journeys.length > 1
          ? `<span class="muted">No path has repeated yet</span>`
          : `${esc(journey[0])} <span class="muted">(${plural(journey[1], "visit")})</span>`,
    ],
    ["Reached a way to get in touch", `${fmt(report.contact)} <span class="muted">(email, phone or the form)</span>`],
  ];
  return `<section>
<h2>Hiring funnel</h2>
${funnelSteps(report)}
<dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>
</section>`;
}

function topCaseStudies(report: Report) {
  const max = report.caseStudies[0]?.visits ?? 0;
  const rows = report.caseStudies.map((c) => [
    `${esc(c.label)}${bar(c.visits, max)}`,
    fmt(c.visits),
    pct(c.visits, report.visits),
    median(c.engaged),
  ]);
  return `<section>
<h2>Top case studies</h2>
<p class="muted small">Reach: share of all visits that opened it. Engaged: median active time per visit that opened it. More in Content.</p>
${table(["Case study", "Visits", "Reach", "Median engaged"], rows, [false, true, true, true])}
</section>`;
}

function topSources(report: Report) {
  if (!report.sources.length) return `<section><h2>Top traffic sources</h2>${empty()}</section>`;
  const max = report.sources[0].visits;
  const rows = report.sources
    .slice(0, 5)
    .map((s) => [`${esc(s.name)}${bar(s.visits, max)}`, fmt(s.visits), pct(s.caseStudy, s.visits), pct(s.hiring, s.visits)]);
  return `<section>
<h2>Top traffic sources</h2>
<p class="muted small">Viewed work and Acted: share of that source's visits. More in Acquisition.</p>
${table(["Source", "Visits", "Viewed work", "Acted"], rows, [false, true, true, true])}
</section>`;
}

function keyActions(report: Report) {
  const rows = report.actions
    .filter((a) => a.hiring || a.label === "Contact page viewed")
    .map((a) => [esc(a.label), fmt(a.visits), pct(a.visits, report.visits)]);
  return `<section>
<h2>Key actions</h2>
<p class="muted small">Visits that did each at least once. Everything else is in Behavior.</p>
${table(["Action", "Visits", "Share"], rows, [false, true, true])}
</section>`;
}

// ---------- acquisition ----------

/** Direct, LinkedIn, everything else, and tabs coming back — the split
 * that says whether outreach or the link itself is doing the work. */
export function sourceSplit(report: Report) {
  const total = report.visits;
  if (!total) return "";
  const named = (name: string) => report.sources.find((s) => s.name === name)?.visits ?? 0;
  const direct = named("Direct");
  const linkedin = named("LinkedIn");
  const back = named("Returning or new tab");
  const parts: [string, number][] = [
    ["Direct", direct],
    ["LinkedIn", linkedin],
    ["Other sites", total - direct - linkedin - back],
    ["Returning or new tab", back],
  ];
  return `<div class="stats split">${parts
    .map(([label, n]) => `<div class="stat"><span class="muted">${esc(label)}</span><b>${pct(n, total)}</b><span class="muted small">${plural(n, "visit")}</span>${bar(n, total)}</div>`)
    .join("")}</div>`;
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
    median(s.engaged),
  ]);
  return `<section>
<h2>Traffic sources</h2>
<p class="muted small">Where each visit came from: its UTM source if the link had one, otherwise the referring site. Direct means no referrer — typed in, bookmarked, or opened from an app or email that doesn't pass one on. Viewed work: share that opened a case study. Acted: share that went on to resume, LinkedIn or contact. Engaged: median active time per visit, where measured.</p>
${sourceSplit(report)}
${table(["Source", "Visits", "Share", "Viewed work", "Acted", "Median engaged"], rows, [false, true, true, true, true, true], [false, false, true, false, false, true])}
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

/** Acquisition leaves country out, having shown it beside entry pages. */
function location(report: Report, withCountry = true) {
  const n = report.visits;
  return `<section><h2>${withCountry ? "Location" : "Region and city"} (approximate)</h2><p class="muted small">From IP address lookups by Vercel. Country is dependable; region is usually right; city is often the nearest metro or the internet provider's hub, and VPNs, iCloud Private Relay and company networks can put it somewhere else entirely.</p>
<div class="${withCountry ? "grid3" : "grid2"}">
${withCountry ? ranked("Country", report.audience.country, n, { limit: 8 }) : ""}
${ranked("Region", report.audience.region, n, { limit: 8 })}
${ranked("City", report.audience.city, n, { limit: 8 })}
</div></section>`;
}

// ---------- behavior ----------

function timeToAct(report: Report) {
  const { toCaseStudy, toHiring } = report.timing;
  const stat = (label: string, t: TimeStats, none: string) =>
    `<div class="stat"><span class="muted">${esc(label)}</span><b>${median(t)}</b><span class="muted small">${t ? `median of ${plural(t.n, "visit")} · ${duration(t.mean)} average` : none}</span></div>`;
  return `<section>
<h2>Time to first meaningful action</h2>
<p class="muted small">Clock time from arriving to the first step, among visits that took it — not engaged time. First case study counts only visits that started on the homepage, so landing straight on a project isn't read as an instant decision.</p>
<div class="stats">
<div class="stat"><span class="muted">Homepage arrivals that open a case study</span><b>${pct(report.homeToCaseStudy, report.startedOnHome)}</b><span class="muted small">${fmt(report.homeToCaseStudy)} of ${plural(report.startedOnHome, "visit")}</span></div>
${stat("Homepage → first case study", toCaseStudy, "no homepage visit opened one")}
${stat("Arrival → resume, LinkedIn or contact", toHiring, "no visit took one")}
</div>
</section>`;
}

function homeReach(report: Report) {
  const d = report.pages.find((p) => p.path === "/")?.depth;
  const body = d?.n
    ? `<ol class="funnel">${(
        [
          ["Scrolled 25%", d.r25],
          ["Scrolled 50%", d.r50],
          ["Scrolled 75%", d.r75],
          ["Reached the bottom", d.r90],
        ] as const
      )
        .map(([label, count]) => `<li><div class="f-row"><span>${label}</span><b>${pct(count, d.n)}</b></div>${bar(count, d.n)}<div class="muted small">${plural(count, "visit")}</div></li>`)
        .join("")}</ol>`
    : empty("No homepage scroll data in this period yet.");
  return `<section>
<h2>Homepage reach</h2>
<p class="muted small">How far down the homepage visits scrolled, of the ${d ? plural(d.n, "visit") : "visits"} with scroll depth recorded. Sections aren't tracked one by one, so this is the closest measure of how many get to Recent work and below.</p>
${body}
</section>`;
}

function journeys(report: Report) {
  const multi = report.journeys.reduce((sum, [, n]) => sum + n, 0);
  const rows = report.journeys.slice(0, 10);
  const list = rows.length
    ? `<ol class="paths">${rows.map(([path, n]) => `<li><span>${esc(path)}</span><b>${fmt(n)}</b></li>`).join("")}</ol>`
    : empty("No visit has gone past one page yet.");
  return `<section>
<h2>Common paths</h2>
<p class="muted small">The ${plural(multi, "visit")} with more than one step, counting resume, LinkedIn and contact actions as steps. ${plural(report.singlePage, "visit")} (${pct(report.singlePage, report.visits)}) saw one page only.</p>
${list}
</section>`;
}

function actions(report: Report) {
  const row = (a: Report["actions"][number]) => [esc(a.label), fmt(a.visits), pct(a.visits, report.visits)];
  const hiring = report.actions.filter((a) => a.hiring).map(row);
  const other = report.actions.filter((a) => !a.hiring).map(row);
  return `<section>
<h2>Actions</h2>
<p class="muted small">Visits that did each at least once.</p>
${table(["Resume, LinkedIn, contact", "Visits", "Share"], hiring, [false, true, true])}
${table(["Exploring", "Visits", "Share"], other, [false, true, true])}
</section>`;
}

// ---------- content ----------

function caseStudies(report: Report) {
  const max = report.caseStudies[0]?.visits ?? 0;
  const rows = report.caseStudies.map((c) => [
    `${esc(c.label)}${bar(c.visits, max)}`,
    fmt(c.visits),
    pct(c.visits, report.visits),
    median(c.engaged),
    mean(c.engaged),
    share(c.continued, c.visits),
    share(c.hiring, c.visits),
    fmt(c.landed),
    fmt(c.views),
  ]);
  return `<section>
<h2>Case-study performance</h2>
<p class="muted small">Reach: share of all visits that opened it. Engaged: active time on the case study per visit that opened it — the median is the typical visit, the average is pulled up by a few long reads. Went on: opened a different case study afterwards in the same visit. Then acted: went on to resume, LinkedIn or contact. Landed: visits that started there.</p>
${table(
  ["Case study", "Visits", "Reach", "Median engaged", "Avg. engaged", "Went on", "Then acted", "Landed", "Pageviews"],
  rows,
  [false, true, true, true, true, true, true, true, true],
  [false, false, true, false, true, true, false, true, true],
)}
</section>`;
}

function caseStudyDepth(report: Report) {
  const rows = report.caseStudies
    .filter((c) => c.depth.n > 0)
    .map((c) => {
      const d = c.depth;
      return [
        `${esc(c.label)}${bar(d.r90, d.n)}`,
        `${fmt(d.n)}${d.n < c.visits ? ` <span class="muted opt">of ${fmt(c.visits)}</span>` : ""}`,
        share(d.r25, d.n),
        share(d.r50, d.n),
        share(d.r75, d.n),
        `<b>${pct(d.r90, d.n)}</b> <span class="muted">(${fmt(d.r90)})</span>`,
        d.bottomTimed ? `${fmt(d.bottomQuick)} <span class="muted">of ${fmt(d.bottomTimed)}</span>` : "—",
      ];
    });
  const quick = Math.round(QUICK_BOTTOM_MS / 1000);
  return `<section>
<h2>Scroll depth by case study</h2>
<p class="muted small">Share of visits that opened the case study and scrolled at least that far; the bar is the bottom (90%). Measured: visits with scroll depth recorded, of all that opened it — depth is recorded from Oct 7, 2026, and earlier visits are left out rather than counted as zero. Scrolling far isn't the same as reading, so read it with engaged time: a visit that reached the bottom with under ${quick}s of engaged time on the page most likely skimmed or jumped.</p>
${rows.length ? table(["Case study", "Measured", "25%", "50%", "75%", "Bottom", `Bottom in <${quick}s`], rows, [false, true, true, true, true, true, true], [false, false, true, false, true, false, true]) : empty("No case-study scroll data in this period yet.")}
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
${rows.length ? table(["Page", "Visits", "Pageviews", "Median engaged", "Avg. engaged", "Total engaged", "Typical deepest", "50%+", "Bottom"], rows, [false, true, true, true, true, true, true, true, true], [false, false, true, false, true, true, true, true, false]) : empty()}
</section>`;
}

// ---------- audience ----------

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
    ["Median time to first case study", ...groups.map((g) => timeCell(g.toCaseStudy))],
    ["Median time to resume, LinkedIn or contact", ...groups.map((g) => timeCell(g.toHiring))],
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
              `<tr><td class="muted">${esc(x.label)}</td><td class="num">${fmt(x.visits)}</td><td class="num opt">${x.visits ? median(x.engaged) : "—"}</td><td class="num">${share(x.continued, x.visits)}</td><td class="num">${share(x.acted, x.visits)}</td></tr>`,
          )
          .join("")}`,
    )
    .join("");
  const byCaseStudy = csRows
    ? `<div class="scroll"><table class="by-cs"><thead><tr><th></th><th class="num">Visits</th><th class="num opt">Median engaged</th><th class="num">Went on</th><th class="num">Then acted</th></tr></thead><tbody>${csRows}</tbody></table></div>`
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
<p class="muted small">Each visit counts under the device it started on. Same steps as the hiring funnel on Overview, with each device's own visits as the base.${small.length ? ` <b>Small sample (${small.join(" and ")} under ${SMALL_GROUP} visits) — treat percentages as directional.</b>` : ""}</p>
${headline}
${funnels}
<h3>Side by side</h3>
<p class="muted small">Times are clock time from arrival, with the number of visits behind each in brackets.</p>
${compare}
<h3>Case studies by device</h3>
<p class="muted small">Went on: opened a different case study afterwards in the same visit. Then acted: reached resume, LinkedIn or contact during the visit.</p>
${byCaseStudy}
<p class="muted small">${reconcile}${others.length ? ` ${others.join("; ")}.` : ""}</p>
</section>`;
}

// ---------- activity ----------

const place = (v: { city: string | null; region: string | null; country: string | null }) =>
  [v.city, v.region, v.country].filter(Boolean).join(", ") || "Unknown";

function recentVisits(report: Report) {
  const rows = report.recentVisits.map((s) => [
    esc(timeOf(s.start)),
    `${esc(s.journey.join(" → "))}${s.hiring ? ' <span class="tag">acted</span>' : ""}`,
    esc(s.source),
    esc(place(s.first)),
    esc(s.first.device ?? "—"),
    s.engagedMs === null ? "—" : duration(s.engagedMs),
  ]);
  return `<section>
<h2>Recent visits</h2>
<p class="muted small">Newest first, with each visit's path (resume, LinkedIn and contact count as steps). Acted: reached one of them.</p>
${rows.length ? table(["Started", "Path", "Source", "Location", "Device", "Engaged"], rows, [false, false, false, false, false, true], [false, false, false, true, true, true]) : empty()}
${report.visits > rows.length ? `<p class="muted small">Latest ${rows.length} of ${fmt(report.visits)}.</p>` : ""}
</section>`;
}

function recentActions(report: Report) {
  const rows = report.recentActions.map((a) => [
    esc(timeOf(a.ts)),
    esc(a.label),
    esc(pageLabel(a.path)),
    a.target ? esc(a.target) : "—",
  ]);
  return `<section>
<h2>Recent actions</h2>
${rows.length ? table(["Time", "Action", "On page", "Detail"], rows, [], [false, false, false, true]) : empty("No actions in this period yet.")}
</section>`;
}

function recentPageviews(report: Report) {
  const rows = report.recent.map((v) => [
    esc(timeOf(v.ts)),
    esc(pageLabel(v.path)),
    esc(sourceOf(v)),
    esc(v.city ?? "Unknown"),
    esc(v.region ?? "—"),
    esc(v.country ?? "—"),
    esc(v.device ?? "—"),
  ]);
  return `<section>
<h2>Recent pageviews</h2>
${rows.length ? `<div class="recent">${table(["Time", "Page", "Source", "City", "Region", "Country", "Device"], rows, [], [false, false, false, false, true, true, true])}</div>${report.pageviews > 50 ? `<p class="muted small">Latest 50 of ${fmt(report.pageviews)}.</p>` : ""}` : empty()}
</section>`;
}

// ---------- page ----------

function panels(report: Report): Record<ViewKey, string> {
  const n = report.visits;
  return {
    overview: `
${kpis(report)}
${insights(report)}
<div class="grid2">
${funnel(report)}
${topCaseStudies(report)}
</div>
${trend(report)}
<div class="grid2">
${topSources(report)}
${keyActions(report)}
</div>`,

    acquisition: `
${sources(report)}
<div class="grid2">
${ranked("Entry pages", report.entries, n, { note: "The first page of each visit.", heading: 2 })}
${ranked("Top countries", report.audience.country, n, { limit: 8, heading: 2 })}
</div>
${utm(report)}
${location(report, false)}`,

    behavior: `
${timeToAct(report)}
<div class="grid2">
${journeys(report)}
${homeReach(report)}
</div>
${actions(report)}`,

    content: `
${caseStudies(report)}
${caseStudyDepth(report)}
${pages(report)}`,

    audience: `
<section><h2>Devices and software</h2><p class="muted small">Per visit, by the device it started on. Browser and OS were first recorded on Oct 7, 2026.</p>
<div class="grid3">
${ranked("Device", report.audience.device, n)}
${ranked("Browser", report.audience.browser, n, { limit: 8 })}
${ranked("Operating system", report.audience.os, n, { limit: 8 })}
</div></section>
${devices(report)}
${location(report)}`,

    activity: `
${recentVisits(report)}
${recentActions(report)}
${recentPageviews(report)}`,
  };
}

function footer(report: Report) {
  return `<footer class="muted">
<p>A visit is one browser tab's pageviews until it closes or sits idle for 30 minutes, grouped by a random id kept only in that tab — no cookie, nothing that carries over to the next visit. So unique visitors aren't counted; Vercel Web Analytics has its own visitor count.</p>
${report.legacyPageviews ? `<p>${plural(report.legacyPageviews, "pageview")} in this period came before visits were tracked (Oct 7). ${report.legacyPageviews === 1 ? "It counts" : "They count"} as pageviews but not toward visits, the funnel, paths or audience.</p>` : ""}
<p>Engaged time counts only while the page is on screen in the active tab and someone has scrolled, clicked, typed or touched within the last minute — a background tab, a minimised window or a page left unattended doesn't add to it. It's measured from Oct 7, 2026 onward; earlier visits have no time recorded and are left out of every time figure rather than counted as zero.${report.untimedVisits ? ` ${plural(report.untimedVisits, "visit")} in this period ${report.untimedVisits === 1 ? "predates" : "predate"} it.` : ""}</p>
<p>Scroll depth is how much of a page has been on screen, recorded at 25, 50, 75 and 90% (the bottom) once per visit and page — never mouse movement or anything finer. It's recorded from Oct 7, 2026 onward; earlier visits have none and are left out of depth figures.${report.unscrolledVisits ? ` ${plural(report.unscrolledVisits, "visit")} in this period ${report.unscrolledVisits === 1 ? "predates" : "predate"} it.` : ""}</p>
<p>Recently active: visits with a pageview or action in the last ${LIVE_MS / 60000} minutes, whatever the range. It isn't a live count of people reading: engaged time is stored as a running total with no time attached, so someone reading one long page without clicking doesn't show here.</p>
<p>Insights are picked by fixed rules, not a model: a rate needs at least 20 visits behind it, and a comparison needs 10 or more visits on each side, a gap of 10 points or more, and a significance test that supports it.</p>
<p>Your own browsers are excluded via /owner. Bots that announce themselves are skipped.</p>
</footer>`;
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
  --live: #1f8f4e;
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
    --live: #3fbf73;
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
  --live: #3fbf73;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface); color: var(--text); font: 15px/1.45 system-ui, -apple-system, sans-serif; -webkit-text-size-adjust: 100%; }
main { max-width: 1040px; margin: 0 auto; padding: 24px 16px 48px; }
h1 { font-size: 22px; margin: 0; }
h2 { font-size: 17px; margin: 0 0 6px; }
h3 { font-size: 15px; margin: 0 0 6px; }
header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
.controls { display: flex; flex-wrap: wrap; gap: 8px; }
.controls form { margin: 0; }
section { margin-top: 36px; min-width: 0; }
.muted { color: var(--muted); }
.small { font-size: 13px; }
p { margin: 0 0 8px; }
code { font-size: 13px; overflow-wrap: anywhere; }
.tabs { position: sticky; top: 0; z-index: 2; display: flex; gap: 22px; margin-top: 20px; overflow-x: auto; scrollbar-width: none; background: var(--surface); border-bottom: 1px solid var(--line); }
.tabs::-webkit-scrollbar { display: none; }
.tabs a { flex: none; padding: 12px 0 10px; color: var(--muted); text-decoration: none; border-bottom: 2px solid transparent; margin-bottom: -1px; }
@media (max-width: 640px) { .tabs { margin: 16px -16px 0; padding: 0 16px; } }
.tabs a:hover { color: var(--text); }
.tabs a[aria-current] { color: var(--text); font-weight: 600; border-bottom-color: var(--text); }
.ranges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.ranges a { padding: 6px 12px; border: 1px solid var(--line); border-radius: 999px; color: var(--text); text-decoration: none; }
.ranges a[aria-current] { background: var(--text); color: var(--surface); border-color: var(--text); }
.question { margin: 20px 0 0; }
.panel[hidden] { display: none; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 20px; }
.stat { background: var(--raised); border-radius: 8px; padding: 12px 16px; min-width: 0; }
.stat b { display: block; font-size: 28px; line-height: 1.2; font-variant-numeric: tabular-nums; }
.stat .muted.small { display: block; }
.split { margin: 16px 0 20px; }
.split .stat b { font-size: 22px; }
.live { display: inline-block; width: 10px; height: 10px; margin: 0 8px 4px 0; border-radius: 50%; background: var(--live); vertical-align: middle; }
.insights { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 8px; }
.insights li { padding: 10px 14px; border-left: 3px solid var(--series); background: var(--raised); border-radius: 0 8px 8px 0; }
.insights .muted { display: block; margin-top: 2px; }
.insights + p { margin-top: 10px; }
.tag { display: inline-block; padding: 0 6px; border-radius: 4px; background: var(--raised); color: var(--muted); font-size: 12px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr)); column-gap: 40px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); column-gap: 32px; }
.grid3 .block, section > .grid2 .block { margin-top: 12px; }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
th, td { text-align: left; padding: 6px 10px 6px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; color: var(--muted); font-size: 13px; }
td { overflow-wrap: break-word; }
td:first-child { min-width: 8em; }
th:last-child, td:last-child { padding-right: 0; }
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
button, .btn { display: inline-block; padding: 6px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--raised); color: var(--text); cursor: pointer; text-decoration: none; line-height: inherit; }
.btn.primary { background: var(--text); color: var(--surface); border-color: var(--text); }
input[type=password] { width: 100%; max-width: 320px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--text); }
form.login { display: grid; gap: 12px; margin-top: 24px; }
.error { color: #c42b2b; }
footer { margin-top: 48px; font-size: 13px; }
footer p { max-width: 720px; }
/* Phones: low-priority columns drop out rather than squeezing the rest. */
@media (max-width: 560px) {
  .opt { display: none; }
  td:first-child { min-width: 6.5em; }
  .recent td { white-space: normal; }
  .compare td:not(:first-child), .compare th:not(:first-child) { min-width: 4.5em; }
}
@media print {
  .controls, .tabs, .ranges { display: none; }
}
`;

function page(title: string, body: string, script = "") {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<style>${STYLE}</style>
</head>
<body><main>${body}</main>${script}</body>
</html>`;
}

export function renderMessage(text: string) {
  return page("Analytics", `<h1>Analytics</h1><p class="muted" style="margin-top:12px">${esc(text)}</p>`);
}

/** Posts back to the page it's shown on, so signing in lands there. */
export function renderLogin(error = "") {
  return page(
    "Analytics · Sign in",
    `<h1>Analytics</h1>
<form class="login" method="post">
<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
${error ? `<p class="error">${esc(error)}</p>` : ""}
<div><button type="submit">Sign in</button></div>
</form>`,
  );
}

const titleOf = (view: ViewKey) => (view === "overview" ? "Analytics" : `Analytics · ${VIEWS[view].label}`);

/** Swaps panels without a reload and keeps the address bar, the range links
 * and the title in step; a modified click (new tab) is left to the browser. */
const TAB_SCRIPT = `<script>
(() => {
  const tabs = document.querySelector(".tabs");
  const range = tabs.dataset.range;
  const titles = JSON.parse(tabs.dataset.titles);
  const pathOf = (v) => v === "overview" ? "/analytics" : "/analytics/" + v;
  const viewOf = (path) => path.replace(/\\/+$/, "").split("/")[2] || "overview";
  function show(view) {
    const panel = document.getElementById("view-" + view);
    if (!panel) return false;
    for (const p of document.querySelectorAll(".panel")) p.hidden = p !== panel;
    for (const a of tabs.querySelectorAll("a")) {
      if (a.dataset.view === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
    for (const a of document.querySelectorAll(".ranges a")) a.href = pathOf(view) + "?range=" + a.dataset.range;
    document.title = titles[view];
    const current = tabs.querySelector("[aria-current]");
    tabs.scrollLeft = current.offsetLeft - (tabs.clientWidth - current.offsetWidth) / 2;
    return true;
  }
  tabs.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (!show(a.dataset.view)) return;
    history.pushState(null, "", pathOf(a.dataset.view) + "?range=" + range);
    // Back to the top of the panel if the sticky tabs were carried past it.
    const top = tabs.offsetTop;
    if (window.scrollY > top) window.scrollTo(0, top);
  });
  addEventListener("popstate", () => show(viewOf(location.pathname)));
  show(viewOf(location.pathname));
})();
</script>`;

export function renderDashboard(opts: { report: Report; allTime: number; signOut: boolean; view: ViewKey }) {
  const { report, allTime, signOut, view } = opts;
  const range = report.range;
  const views = Object.keys(VIEWS) as ViewKey[];

  const tabs = views
    .map(
      (key) =>
        `<a href="${viewPath(key)}?range=${range}" data-view="${key}"${key === view ? ' aria-current="page"' : ""}>${VIEWS[key].label}</a>`,
    )
    .join("");
  const titles = esc(JSON.stringify(Object.fromEntries(views.map((key) => [key, titleOf(key)]))));

  const ranges = (Object.keys(RANGES) as RangeKey[])
    .map(
      (key) =>
        `<a href="${viewPath(view)}?range=${key}" data-range="${key}"${key === range ? ' aria-current="page"' : ""}>${RANGES[key].label}</a>`,
    )
    .join("");

  const content = panels(report);
  const body = `
<header>
<div><h1>Analytics</h1><p class="muted small">${fmt(allTime)} pageviews recorded all time · times are Eastern</p></div>
<div class="controls">
<a class="btn primary" href="/analytics/report?range=${range}&amp;print=1" target="_blank" rel="noopener">Download PDF</a>
${signOut ? `<form method="post" action="/analytics"><input type="hidden" name="logout" value="1"><button type="submit">Sign out</button></form>` : ""}
</div>
</header>
<nav class="tabs" aria-label="Analytics views" data-range="${range}" data-titles="${titles}">${tabs}</nav>
<nav class="ranges" aria-label="Date range">${ranges}</nav>
${views
  .map(
    (key) =>
      `<div class="panel" id="view-${key}" data-view="${key}"${key === view ? "" : " hidden"}>
<p class="question muted">${esc(VIEWS[key].question)}</p>
${content[key]}
</div>`,
  )
  .join("\n")}
${footer(report)}`;

  return page(titleOf(view), body, TAB_SCRIPT);
}
