import type { Activity } from "./activity";
import { ACTIVITY_SCRIPT, activityLinkParams, renderActivity } from "./activity-view";
import {
  bar,
  dayOf,
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
} from "./format";
import { insightsFor } from "./insights";
import {
  INTERNAL_SOURCE,
  LIVE_MS,
  QUICK_BOTTOM_MS,
  RANGES,
  PARTNER_PORTAL_PHONES_HIDDEN,
  RECENT_MS,
  SMALL_GROUP,
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
 * (where visits came from, and each visit's own record — activity-view.ts).
 * Every view is rendered from the same report in one response, so switching
 * between them is instant and the numbers can't drift; a few lines of script
 * swap the visible panel and the address bar, and without script each tab
 * is an ordinary link to its own URL. Activity's filters, sort and page
 * travel in its URL too, and only its own content reloads when they change.
 * Charts only where shape matters (the trend, funnels, relative reach);
 * everything else is a short ranked table.
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
  const source = report.sources.find((s) => s.name !== INTERNAL_SOURCE);
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
<p class="muted small">Each step counts only visits that reached the one above, so the last step is visits that viewed 2+ case studies and then acted. The Resume, LinkedIn or contact figure at the top counts any visit that did.</p>
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
    .map((a) => [esc(a.label), fmt(a.visits), pct(a.visits, a.base)]);
  return `<section>
<h2>Key actions</h2>
<p class="muted small">Visits that did each at least once. Everything else is in Behavior.</p>
${table(["Action", "Visits", "Share"], rows, [false, true, true])}
</section>`;
}

// ---------- acquisition ----------

/** Direct, LinkedIn and everything else — the split that says whether
 * outreach or the link itself is doing the work — with the internal /
 * new-tab bucket set apart, since it isn't a way in. */
export function sourceSplit(report: Report) {
  const total = report.visits;
  if (!total) return "";
  const named = (name: string) => report.sources.find((s) => s.name === name)?.visits ?? 0;
  const direct = named("Direct");
  const linkedin = named("LinkedIn");
  const internal = named(INTERNAL_SOURCE);
  const parts: [string, number, string][] = [
    ["Direct", direct, ""],
    ["LinkedIn", linkedin, ""],
    ["Other sites", total - direct - linkedin - internal, ""],
    [INTERNAL_SOURCE, internal, " aside"],
  ];
  return `<div class="stats split">${parts
    .map(
      ([label, n, cls]) =>
        `<div class="stat${cls}"><span class="muted">${esc(label)}</span><b>${pct(n, total)}</b><span class="muted small">${plural(n, "visit")}${cls ? " · not a source" : ""}</span>${bar(n, total)}</div>`,
    )
    .join("")}</div>`;
}

function sources(report: Report) {
  if (!report.sources.length) return `<section><h2>Traffic sources</h2>${empty()}</section>`;
  const max = report.sources[0].visits;
  // Real sources first; the internal / new-tab bucket last and muted.
  const ordered = [
    ...report.sources.filter((s) => s.name !== INTERNAL_SOURCE),
    ...report.sources.filter((s) => s.name === INTERNAL_SOURCE),
  ];
  const rows = ordered.map((s) => {
    const label = s.name === INTERNAL_SOURCE ? `<span class="muted">${esc(s.name)}</span>` : esc(s.name);
    return [
      `${label}${bar(s.visits, max)}`,
      fmt(s.visits),
      pct(s.visits, report.visits),
      pct(s.caseStudy, s.visits),
      pct(s.hiring, s.visits),
      median(s.engaged),
    ];
  });
  return `<section>
<h2>Traffic sources</h2>
<p class="muted small">Where each visit came from: its UTM source if the link had one, otherwise the referring site. Direct means no referrer — typed in, bookmarked, or opened from an app or email that doesn't pass one on. Viewed work: share that opened a case study. Acted: share that went on to resume, LinkedIn or contact. Engaged: median active time per visit, where measured.</p>
${sourceSplit(report)}
${table(["Source", "Visits", "Share", "Viewed work", "Acted", "Median engaged"], rows, [false, true, true, true, true, true], [false, false, true, false, false, true])}
<p class="muted small">${esc(INTERNAL_SOURCE)} isn't a source: it's a visit whose first page was reached from this site itself — a page opened in a new tab from the site, or a tab left idle for 30+ minutes and picked up again (which starts a new visit). How that person first found the site was counted in their earlier visit.</p>
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

function location(report: Report) {
  const n = report.visits;
  return `<section><h2>Location (approximate)</h2><p class="muted small">From IP address lookups by Vercel. Country is dependable; region is usually right; city is often the nearest metro or the internet provider's hub, and VPNs, iCloud Private Relay and company networks can put it somewhere else entirely.</p>
<div class="grid3">
${ranked("Country", report.audience.country, n, { limit: 8 })}
${ranked("Region", report.audience.region, n, { limit: 8 })}
${ranked("City", report.audience.city, n, { limit: 8 })}
</div></section>`;
}

// ---------- behavior ----------

/** "N of M measured" — for figures only the current tracker records. */
const measuredNote = (measured: number, of: number, unit = "visit") =>
  measured < of
    ? ` ${plural(measured, unit)} of ${fmt(of)} measured; the rest predate this tracking and are left out, not counted as zero.`
    : "";

function timeToAct(report: Report) {
  const { toCaseStudy, toHiring, toMeaningful, meaningfulBase, toNextCaseStudy } = report.timing;
  const stat = (label: string, t: TimeStats, none: string, of = "") =>
    `<div class="stat"><span class="muted">${esc(label)}</span><b>${median(t)}</b><span class="muted small">${t ? `median of ${plural(t.n, "visit")}${of} · ${duration(t.mean)} average` : none}</span></div>`;
  return `<section>
<h2>Time to first meaningful action</h2>
<p class="muted small">Clock time between recorded steps, among visits that took the step — not engaged time, and it includes any time the tab sat in the background. Engaged time is stored as a total per page, with no times, so it can't be split at a click. "From the homepage" counts only visits that started there, so landing straight on a project isn't read as an instant decision. Meaningful: a case study, the Contact page, resume, LinkedIn, email, phone, the contact form, Proof notes or the Partner Portal prototype.</p>
<div class="stats">
<div class="stat"><span class="muted">Homepage arrivals that open a case study</span><b>${pct(report.homeToCaseStudy, report.startedOnHome)}</b><span class="muted small">${fmt(report.homeToCaseStudy)} of ${plural(report.startedOnHome, "visit")}</span></div>
${stat("Homepage → first meaningful action", toMeaningful, meaningfulBase ? "no measured homepage visit took one" : "measured from the current tracker on", meaningfulBase ? ` of ${fmt(meaningfulBase)} measured` : "")}
${stat("Homepage → first case study", toCaseStudy, "no homepage visit opened one")}
${stat("First case study → next case study", toNextCaseStudy, "no visit opened a second")}
${stat("Arrival → resume, LinkedIn or contact", toHiring, "no visit took one")}
</div>
</section>`;
}

function sectionReach(report: Report) {
  const x = report.exposure;
  if (!x.home) {
    return `<section><h2>Homepage section reach</h2>${empty("Not measured yet: section reach starts with the current tracker.")}</section>`;
  }
  const rows = x.sections.map((sec) => [
    `${esc(sec.label)}${bar(sec.seen, x.home)}`,
    fmt(sec.seen),
    pct(sec.seen, x.home),
    ...sec.byDevice.map((d) => share(d.seen, d.home)),
  ]);
  const rw = x.recentWork;
  return `<section>
<h2>Homepage section reach</h2>
<p class="muted small">Homepage visits that had each section meaningfully on screen — at least half of it, or half the window for sections taller than that, for half a second in a visible tab — once per visit, of ${plural(x.home, "homepage visit")} measured. This is the direct measure of whether someone reached the work; homepage scroll depth below is supporting.</p>
<div class="stats">
<div class="stat"><span class="muted">Saw Recent work</span><b>${pct(rw.seen, rw.home)}</b><span class="muted small">${fmt(rw.seen)} of ${plural(rw.home, "homepage visit")}</span></div>
<div class="stat"><span class="muted">Recent work seen → case study opened</span><b>${pct(rw.opened, rw.seen)}</b><span class="muted small">${fmt(rw.opened)} of the ${plural(rw.seen, "visit")} that saw it</span></div>
</div>
${table(["Section", "Visits", "Of homepage visits", "Mobile", "Desktop"], rows, [false, true, true, true, true], [false, false, false, true, true])}
<p class="muted small">Mobile and desktop: share of each device's own homepage visits.${x.home < SMALL_GROUP ? ` <b>Small sample — treat differences as directional.</b>` : ""}</p>
</section>`;
}

function cardPerformance(report: Report) {
  const x = report.exposure;
  if (!x.home) {
    return `<section><h2>Recent work card performance</h2>${empty("Not measured yet: card impressions start with the current tracker.")}</section>`;
  }
  const max = Math.max(0, ...x.cards.map((c) => c.impressions));
  const rows = x.cards.map((c) => [
    `${esc(c.label)}${bar(c.impressions, max)}${c.impressions && c.impressions < SMALL_GROUP ? ' <span class="tag">small sample</span>' : ""}`,
    fmt(c.impressions),
    fmt(c.opens),
    `<b>${pct(c.opens, c.impressions)}</b>`,
    ...c.byDevice.map((d) => share(d.opens, d.impressions)),
    median(c.engaged),
  ]);
  return `<section>
<h2>Recent work card performance</h2>
<p class="muted small">Impressions: homepage visits that had the card meaningfully on screen (same rule as sections), once per visit. Opened: of those, visits that went on to open that case study. Open rate is opens ÷ impressions — not ÷ all visits — so a card seen less often isn't penalised for it. Engaged: median time on the case study for the visits that opened it.</p>
${table(
  ["Project", "Impressions", "Opened", "Open rate", "Mobile", "Desktop", "Median engaged"],
  rows,
  [false, true, true, true, true, true, true],
  [false, false, true, false, true, true, true],
)}
</section>`;
}

function partnerPortal(report: Report) {
  const pp = report.partnerPortal;
  if (!pp.measured) {
    return `<section><h2>Partner Portal CTA</h2>${empty("Not measured yet: Partner Portal clicks start with the current tracker.")}</section>`;
  }
  const hiddenOn = dayOf(PARTNER_PORTAL_PHONES_HIDDEN);
  const notAvailable = '<span class="muted">Not available</span>';
  const rows = pp.byDevice.map((d) => {
    // Phones since the CTA was hidden there: no rate, rather than a 0%.
    if (!d.viewers && d.hidden) return [esc(d.label), "—", "—", notAvailable];
    const tags = [
      d.viewers && d.viewers < SMALL_GROUP ? '<span class="tag">small sample</span>' : "",
      d.hidden ? `<span class="tag">${fmt(d.hidden)} couldn't see it</span>` : "",
    ].filter(Boolean);
    return [`${esc(d.label)}${tags.length ? ` ${tags.join(" ")}` : ""}`, fmt(d.viewers), fmt(d.clicked), pct(d.clicked, d.viewers)];
  });
  const from = pp.pages.length
    ? pp.pages.map(([page, n]) => `${esc(page)} (${fmt(n)})`).join(", ")
    : "—";
  const placements = pp.placements.map(([p, n]) => `${esc(p)} (${fmt(n)})`).join(", ");
  return `<section>
<h2>Partner Portal CTA</h2>
<p class="muted small">The Yahoo case study's "Check out the prototype I built with Claude" link, which opens the prototype in a new tab — a high-intent product interaction, counted apart from resume and contact, once per visit however often it's clicked.${measuredNote(pp.measured, report.visits)}</p>
<div class="stats">
<div class="stat"><span class="muted">Visits that clicked</span><b>${fmt(pp.visits)}</b><span class="muted small">${pct(pp.visits, pp.eligible)} of ${plural(pp.eligible, "measured visit")} that could see it</span></div>
<div class="stat"><span class="muted">Yahoo case-study viewers → clicked</span><b>${pct(pp.viewersClicked, pp.viewers)}</b><span class="muted small">${fmt(pp.viewersClicked)} of ${plural(pp.viewers, "measured viewer")} who could see it</span></div>
<div class="stat"><span class="muted">Opening the case study → click</span><b>${median(pp.toClick)}</b><span class="muted small">${pp.toClick ? `clock time, median of ${plural(pp.toClick.n, "click")}` : "no clicks yet"}</span></div>
</div>
${table(["Device", "Viewers", "Clicked", "Rate"], rows, [false, true, true, true])}
<p class="muted small">Viewers: visits that opened the Yahoo case study while CTA clicks were being recorded — earlier Yahoo viewers aren't in the base; rate is clicks ÷ those viewers. Since ${esc(hiddenOn)} the link is hidden on phones (the prototype isn't built for small screens), so phone visits from then on are left out of every rate here and shown as Not available rather than 0%${pp.hiddenViewers ? ` (${plural(pp.hiddenViewers, "phone viewer")} in this period)` : ""}; earlier phone visits saw it and still count, and every recorded click is kept. Window width isn't recorded, so the device stands in for it: a phone held sideways can still see the link (if it clicks, it counts), and a tablet or desktop window narrower than 768px can't, though it's still counted as able to. Clicked from: ${from}${placements ? ` · placement: ${placements}` : ""}. Engaged time before the click isn't shown: it's stored per page as one total, so time before and after the click can't be told apart.</p>
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
<h2>Homepage scroll depth</h2>
<p class="muted small">Supporting measure: how far down the homepage visits scrolled, of the ${d ? plural(d.n, "visit") : "visits"} with scroll depth recorded. Section reach above says which sections were actually on screen.</p>
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
<p class="muted small">The ${plural(multi, "visit")} with more than one step, counting resume, LinkedIn, contact, Proof notes and Partner Portal actions as steps. ${plural(report.singlePage, "visit")} (${pct(report.singlePage, report.visits)}) saw one page only.</p>
${list}
</section>`;
}

function actions(report: Report) {
  const row = (a: Report["actions"][number]) => [
    `${esc(a.label)}${a.base < report.visits ? ` <span class="muted small">of ${plural(a.base, "measured visit")}${a.phonesExcluded ? " that could see it" : ""}</span>` : ""}`,
    fmt(a.visits),
    pct(a.visits, a.base),
  ];
  const hiring = report.actions.filter((a) => a.hiring).map(row);
  const product = report.actions.filter((a) => a.product).map(row);
  const other = report.actions.filter((a) => !a.hiring && !a.product).map(row);
  return `<section>
<h2>Actions</h2>
<p class="muted small">Visits that did each at least once; repeats in a visit count once. Share is of all visits, except where an action is only recorded by the current tracker — then it's of the visits that tracker recorded.</p>
${table(["Resume, LinkedIn, contact", "Visits", "Share"], hiring, [false, true, true])}
${table(["High-intent product interaction", "Visits", "Share"], product, [false, true, true])}
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

function heroPerformance(report: Report) {
  const x = report.exposure;
  if (!x.heroShown) {
    return `<section><h2>Hero performance</h2>${empty(x.home ? "No hero edition recorded in this period yet." : "Not measured yet: hero editions are recorded from the current tracker on.")}</section>`;
  }
  const small = x.heroes.some((h) => h.stats.visits < SMALL_GROUP);
  const rows = x.heroes.map((h) => {
    const g = h.stats;
    return [
      `${esc(h.label)}${h.defaultEdition ? ' <span class="tag">default</span>' : ""}${g.visits < SMALL_GROUP ? ' <span class="tag">small sample</span>' : ""}`,
      fmt(g.visits),
      pct(g.visits, x.heroShown),
      share(g.viewedOne, g.visits),
      share(g.viewedTwo, g.visits),
      median(g.engaged),
      share(g.hiring, g.visits),
      share(g.caseStudy90, g.caseStudyOpens),
      h.firstCaseStudy ? `${esc(h.firstCaseStudy[0])} <span class="muted">(${fmt(h.firstCaseStudy[1])})</span>` : "—",
    ];
  });
  return `<section>
<h2>Hero performance</h2>
<p class="muted small">The homepage hero edition each visit had on screen (recorded once per visit, by edition, when at least half of it was in view for half a second) and what those visits went on to do. Shown and Share are out of the ${plural(x.heroShown, "homepage visit")} with a hero recorded${x.heroShown < x.home ? `, of ${fmt(x.home)} measured — the rest jumped or scrolled past it first` : ""}. Opened work: opened a case study. Engaged: median per visit. Acted: reached resume, LinkedIn or contact. Bottom: case-study opens, by those visits, scrolled to the end. Hero 2 is the rotation's default: a tab gets it for its whole session when the browser hasn't yet stored the rotation's own "seen" flag (set on its first page load of the site — so usually a browser's first session here, a private window, or after site data is cleared) or can't store anything. Other sessions draw any of the six at random, Hero 2 included. So Hero 2 carries all of those default sessions and isn't a like-for-like sample. This describes the rotation; analytics never reads that flag. Nothing here ranks the editions.</p>
${table(
  ["Hero", "Shown", "Share", "Opened work", "Opened 2+", "Engaged", "Acted", "Bottom", "Most common first case study"],
  rows,
  [false, true, true, true, true, true, true, true, false],
  [false, false, true, false, true, true, false, true, true],
)}
${small ? `<p class="muted small"><b>Small sample — treat differences as directional.</b> Editions under ${SMALL_GROUP} visits are marked.</p>` : ""}
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
    ["Saw Recent work (of homepage visits)", ...groups.map((g) => share(g.recentWork.seen, g.recentWork.home))],
    ["Saw Recent work → opened a case study", ...groups.map((g) => share(g.recentWork.opened, g.recentWork.seen))],
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
<p class="muted small">Times are clock time from arrival, with the number of visits behind each in brackets. Recent work rows count only homepage visits from the current tracker.</p>
${compare}
<h3>Case studies by device</h3>
<p class="muted small">Went on: opened a different case study afterwards in the same visit. Then acted: reached resume, LinkedIn or contact during the visit.</p>
${byCaseStudy}
<p class="muted small">${reconcile}${others.length ? ` ${others.join("; ")}.` : ""}</p>
</section>`;
}

// ---------- page ----------

function panels(report: Report, activity: string): Record<ViewKey, string> {
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
</div>
${utm(report)}`,

    behavior: `
${timeToAct(report)}
${sectionReach(report)}
${cardPerformance(report)}
${actions(report)}
${partnerPortal(report)}
<div class="grid2">
${journeys(report)}
${homeReach(report)}
</div>`,

    content: `
${caseStudies(report)}
${caseStudyDepth(report)}
${heroPerformance(report)}
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
${activity}
<div id="activity-status" class="sr-only" aria-live="polite"></div>`,
  };
}

function footer(report: Report) {
  return `<footer class="muted">
<p>A visit is one browser tab's pageviews until it closes or sits idle for 30 minutes, grouped by a random id kept only in that tab — no cookie, nothing that carries over to the next visit. So unique visitors aren't counted; Vercel Web Analytics has its own visitor count.</p>
${report.legacyPageviews ? `<p>${plural(report.legacyPageviews, "pageview")} in this period came before visits were tracked (Oct 7). ${report.legacyPageviews === 1 ? "It counts" : "They count"} as pageviews but not toward visits, the funnel, paths or audience.</p>` : ""}
<p>Engaged time counts only while the page is on screen in the active tab and someone has scrolled, clicked, typed or touched within the last minute — a background tab, a minimised window or a page left unattended doesn't add to it. It's measured from Oct 7, 2026 onward; earlier visits have no time recorded and are left out of every time figure rather than counted as zero.${report.untimedVisits ? ` ${plural(report.untimedVisits, "visit")} in this period ${report.untimedVisits === 1 ? "predates" : "predate"} it.` : ""}</p>
<p>Scroll depth is how much of a page has been on screen, recorded at 25, 50, 75 and 90% (the bottom) once per visit and page — never mouse movement or anything finer. It's recorded from Oct 7, 2026 onward; earlier visits have none and are left out of depth figures.${report.unscrolledVisits ? ` ${plural(report.unscrolledVisits, "visit")} in this period ${report.unscrolledVisits === 1 ? "predates" : "predate"} it.` : ""}</p>
<p>Seen: the homepage hero edition, homepage sections and Recent work cards count once per visit, when at least half of the element (or half the window, for anything taller) has been on screen for half a second in a visible tab — nothing about scrolling or position is kept. Proof notes opened is the notes panel opening; Partner Portal CTA is a click on the prototype link in the Yahoo case study. These four are recorded only by the current tracker: earlier visits are left out of them (shown as "measured" counts), never counted as zero.</p>
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
.stat.aside { background: transparent; border: 1px dashed var(--line); }
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
/* Log tables: compact columns hug their content, the path takes the rest. */
.fit { white-space: nowrap; width: 1%; }
.grow { min-width: 12em; }
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
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
/* Activity. With script, collapsed rows (.c) start hidden and the script
   takes over; without it, everything stays open and the form submits. */
.js .c, .js .no-js { display: none; }
html:not(.js) .disclose, html:not(.js) .geo-more, html:not(.js) .chev { display: none; }
#activity[aria-busy="true"] section { opacity: .55; }
th a.sort { color: inherit; text-decoration: none; white-space: nowrap; }
th a.sort:hover { color: var(--text); text-decoration: underline; }
th[aria-sort] { color: var(--text); }
.arrow { margin-left: 3px; font-size: 11px; }
.chev { display: inline-block; width: 0; height: 0; border-left: 5px solid currentColor; border-top: 4px solid transparent; border-bottom: 4px solid transparent; }
[aria-expanded="true"] > .chev { transform: rotate(90deg); }
.crumbs { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 6px; margin: 14px 0 4px; padding: 8px 12px; border-radius: 8px; background: var(--raised); }
.crumbs a { color: var(--muted); }
.crumbs [aria-current] { font-weight: 600; }
.crumbs .sep { color: var(--muted); }
.crumbs .clear { margin-left: auto; }
.approx { display: block; margin-top: 4px; }
.geo .scroll { margin-top: 12px; }
.geo-table td:first-child { min-width: 12em; }
.loc-cell { display: flex; align-items: flex-start; gap: 4px; }
.lvl-1 .loc-cell { padding-left: 20px; }
.lvl-2 .loc-cell { padding-left: 40px; }
a.loc { color: inherit; text-decoration: none; }
a.loc:hover { text-decoration: underline; }
.geo-row.sel td { background: var(--raised); }
.geo-row.sel a.loc { font-weight: 600; }
.disclose { flex: none; width: 18px; height: 21px; padding: 0; border: 0; border-radius: 4px; background: none; color: var(--muted); line-height: 1; }
.disclose:hover { color: var(--text); background: var(--raised); }
.disclose-pad { flex: none; width: 18px; }
.link-btn { padding: 0; border: 0; background: none; color: var(--muted); font-size: 13px; text-decoration: underline; text-underline-offset: 2px; }
.link-btn:hover { color: var(--text); }
.filters { display: grid; gap: 10px; margin: 16px 0 12px; }
.filter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.filter-grid .search { grid-column: span 2; }
@media (max-width: 400px) { .filter-grid .search { grid-column: 1 / -1; } }
.filters select, .filters input[type=search] { display: block; width: 100%; min-width: 0; padding: 5px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--text); font: inherit; font-size: 13px; }
.filters select.set, .filters input.set { border-color: var(--text); }
.quick { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { position: relative; display: inline-flex; align-items: center; padding: 3px 10px; border: 1px solid var(--line); border-radius: 999px; font-size: 13px; cursor: pointer; user-select: none; }
.chip:hover { border-color: var(--muted); }
.chip input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }
.chip:focus-within { outline: 2px solid var(--series); outline-offset: 2px; }
.chip.on, .chip:has(input:checked) { background: var(--text); color: var(--surface); border-color: var(--text); }
.quick .reset { margin-left: auto; color: var(--muted); font-size: 13px; }
.results { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; }
.results p { margin: 0 0 6px; }
#v-count:focus { outline: none; }
.visits, .history { scroll-margin-top: 56px; }
.history-line { margin-top: 16px; }
.history-line a, .visits p a { color: var(--text); text-underline-offset: 2px; }
.visits-table th:first-child, .visits-table td:first-child { padding-left: 8px; }
.visits-table tr.visit { cursor: pointer; }
.visits-table tr.visit:hover td, .visits-table tr.visit.open td { background: var(--raised); }
.visits-table tr.visit.open td { border-bottom-color: transparent; }
.visit-toggle { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; white-space: nowrap; cursor: pointer; }
.visit-toggle .chev { color: var(--muted); }
.visits-table tr.tl td { padding: 2px 8px 14px; background: var(--raised); }
.tl-meta { margin: 0 0 6px; }
.phone-only { display: none; }
.timeline { list-style: none; margin: 0; padding: 0; font-size: 13px; }
.step { display: grid; grid-template-columns: 6.5em 4em minmax(0, 1fr) auto; gap: 2px 12px; padding: 5px 0; border-top: 1px solid var(--line); }
.step .t, .step .k, .step .e { color: var(--muted); }
.step .t { font-variant-numeric: tabular-nums; white-space: nowrap; }
.step .e { text-align: right; }
.step.action b { font-weight: 600; }
.step.seen .w { color: var(--muted); }
.pager { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; margin-top: 4px; font-size: 13px; }
.pages, .per { display: flex; align-items: center; gap: 10px; }
.per { gap: 6px; }
.pager .btn { padding: 4px 10px; }
.pager .off { color: var(--muted); cursor: default; opacity: .6; }
.pill { padding: 2px 9px; border: 1px solid var(--line); border-radius: 999px; color: var(--text); text-decoration: none; }
.pill[aria-current] { background: var(--text); color: var(--surface); border-color: var(--text); }
/* Phones: low-priority columns drop out rather than squeezing the rest. */
@media (max-width: 560px) {
  .opt { display: none; }
  td:first-child { min-width: 6.5em; }
  .grow { min-width: 0; }
  .compare td:not(:first-child), .compare th:not(:first-child) { min-width: 4.5em; }
  .phone-only { display: inline; }
  .geo-table td:first-child { min-width: 8em; }
  .geo-table .num .muted { display: none; }
  .lvl-1 .loc-cell { padding-left: 12px; }
  .lvl-2 .loc-cell { padding-left: 24px; }
  .step { grid-template-columns: auto minmax(0, 1fr); }
  .step .w, .step .e { grid-column: 1 / -1; }
  .step .e { text-align: left; }
  .step .e:empty { display: none; }
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
<script>document.documentElement.classList.add("js")</script>
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
 * and the title in step; a modified click (new tab) is left to the browser.
 * Every tab opens at the top of the page. Activity's filters, sort and page
 * (the #activity element's data-qs) ride along in its links. */
const TAB_SCRIPT = `<script>
(() => {
  const tabs = document.querySelector(".tabs");
  const range = tabs.dataset.range;
  const titles = JSON.parse(tabs.dataset.titles);
  const pathOf = (v) => v === "overview" ? "/analytics" : "/analytics/" + v;
  const viewOf = (path) => path.replace(/\\/+$/, "").split("/")[2] || "overview";
  function activityQs(page) {
    const el = document.getElementById("activity");
    const params = new URLSearchParams(el ? el.dataset.qs : "");
    if (!page) params.delete("page");
    const qs = params.toString();
    return qs ? "&" + qs : "";
  }
  const urlOf = (v, r, page) => pathOf(v) + "?range=" + r + (v === "activity" ? activityQs(page) : "");
  let current = viewOf(location.pathname);
  function syncLinks() {
    // A new range starts Activity back on page 1.
    for (const a of document.querySelectorAll(".ranges a")) a.href = urlOf(current, a.dataset.range, false);
    const activity = tabs.querySelector('a[data-view="activity"]');
    if (activity) activity.href = urlOf("activity", range, true);
  }
  function show(view) {
    const panel = document.getElementById("view-" + view);
    if (!panel) return false;
    current = view;
    for (const p of document.querySelectorAll(".panel")) p.hidden = p !== panel;
    for (const a of tabs.querySelectorAll("a")) {
      if (a.dataset.view === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
    syncLinks();
    document.title = titles[view];
    const tab = tabs.querySelector("[aria-current]");
    tabs.scrollLeft = tab.offsetLeft - (tabs.clientWidth - tab.offsetWidth) / 2;
    return true;
  }
  tabs.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (!show(a.dataset.view)) return;
    history.pushState(null, "", urlOf(a.dataset.view, range, true));
    window.scrollTo(0, 0);
  });
  addEventListener("popstate", () => show(viewOf(location.pathname)));
  document.addEventListener("activity:change", syncLinks);
  show(current);
})();
</script>`;

export function renderDashboard(opts: {
  report: Report;
  allTime: number;
  signOut: boolean;
  view: ViewKey;
  activity: Activity;
}) {
  const { report, allTime, signOut, view, activity } = opts;
  const range = report.range;
  const views = Object.keys(VIEWS) as ViewKey[];
  // Activity's own state, carried in its tab link and (while it's showing)
  // the range links.
  const own = (key: ViewKey, page: boolean) => (key === "activity" ? esc(activityLinkParams(activity.query, page)) : "");

  const tabs = views
    .map(
      (key) =>
        `<a href="${viewPath(key)}?range=${range}${own(key, true)}" data-view="${key}"${key === view ? ' aria-current="page"' : ""}>${VIEWS[key].label}</a>`,
    )
    .join("");
  const titles = esc(JSON.stringify(Object.fromEntries(views.map((key) => [key, titleOf(key)]))));

  const ranges = (Object.keys(RANGES) as RangeKey[])
    .map(
      (key) =>
        `<a href="${viewPath(view)}?range=${key}${own(view, false)}" data-range="${key}"${key === range ? ' aria-current="page"' : ""}>${RANGES[key].label}</a>`,
    )
    .join("");

  const content = panels(report, renderActivity(activity, range));
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

  return page(titleOf(view), body, TAB_SCRIPT + ACTIVITY_SCRIPT);
}
