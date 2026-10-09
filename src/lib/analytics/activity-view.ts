import { pageLabel } from "@/lib/page-titles";
import {
  DEFAULT_QUERY,
  DEVICES,
  GEO_SORTS,
  PER_PAGE,
  QUICK,
  VISIT_SORTS,
  activityParams,
  fullLabelOf,
  hasFilters,
  isUnknown,
  labelOf,
  parentOf,
  withLocation,
  type Activity,
  type ActivityQuery,
  type Dir,
  type GeoNode,
  type GeoSort,
  type Level,
  type Option,
  type QuickKey,
  type Step,
  type VisitRow,
  type VisitSort,
} from "./activity";
import { ACTIONS } from "./events";
import { clockOf, duration, empty, esc, fmt, pct, plural, share, table, timeOf } from "./format";
import type { RangeKey } from "./metrics";

/**
 * HTML for the Activity view (see activity.ts for what it shows and why):
 * the geographic overview (one location table, country → region → city),
 * then Recent visits with its filter bar, table
 * and pager. Rendered whole into the dashboard, and on its own for the
 * dashboard's script, which swaps it in when a filter, sort or page
 * changes (ACTIVITY_SCRIPT). Every control is also a plain link or a GET
 * form, so the view works without JavaScript — just with reloads, and with
 * the location tree and visit timelines all open.
 */

const PATH = "/analytics/activity";
/** Locations shown per level before "Show all". */
const GEO_TOP = 10;

const hrefOf = (range: RangeKey, q: ActivityQuery) => {
  const p = activityParams(q).toString();
  return `${PATH}?range=${range}${p ? `&${p}` : ""}`;
};

/** An id that's the same after the panel is re-rendered, so focus can go
 * back to the control that was used. */
const idOf = (prefix: string, key: string) =>
  `${prefix}-${encodeURIComponent(key).replace(/[^A-Za-z0-9_-]/g, "_")}`;

const flip = (dir: Dir): Dir => (dir === "asc" ? "desc" : "asc");
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const deviceLabel = (device: string | null) =>
  DEVICES.find(([value]) => value === device)?.[1] ?? "—";

/** A column header that sorts by it; the active one carries aria-sort and
 * a small arrow. */
function sortTh(o: { label: string; title: string; active: boolean; dir: Dir; href: string; id: string; cls?: string }) {
  const sorted = o.active ? ` aria-sort="${o.dir === "asc" ? "ascending" : "descending"}"` : "";
  const arrow = o.active ? `<span class="arrow" aria-hidden="true">${o.dir === "asc" ? "↑" : "↓"}</span>` : "";
  return `<th${o.cls ? ` class="${o.cls}"` : ""}${sorted}><a class="sort" data-nav id="${o.id}" href="${esc(o.href)}" title="${esc(o.title)}">${esc(o.label)}${arrow}</a></th>`;
}

// ---------- geographic overview ----------

const CHILDREN: Record<Level, string> = { country: "states and regions", region: "cities", city: "" };
const GROUP: Record<Level, string> = { country: "countries", region: "states and regions", city: "cities" };

/** Shown once a location is picked: where in the hierarchy it is, each
 * level a link, and a way to clear it. */
function geoSelection(a: Activity, range: RangeKey) {
  const q = a.query;
  const { selected } = a.geo;
  if (!selected) return "";
  const trail: string[] = [];
  for (let k: string = selected; k; k = parentOf(k)) trail.unshift(k);
  const crumbs = [
    `<a data-nav id="c-all" href="${esc(hrefOf(range, withLocation(q, null)))}">All locations</a>`,
    ...trail.map((k) =>
      k === selected
        ? `<span aria-current="location">${esc(labelOf(k))}</span>`
        : `<a data-nav id="${idOf("c", k)}" href="${esc(hrefOf(range, withLocation(q, k)))}">${esc(labelOf(k))}</a>`,
    ),
  ].join('<span class="sep" aria-hidden="true">›</span>');
  return `<nav class="crumbs small" aria-label="Location filter">${crumbs}<a class="clear" data-nav id="c-clear" href="${esc(hrefOf(range, withLocation(q, null)))}">Clear location</a></nav>`;
}

function geoTable(a: Activity, range: RangeKey) {
  const q = a.query;
  const { roots, selected } = a.geo;

  // Open on arrival: the selection's parents, and any "Show all" it would
  // otherwise be cut from — so the selected row is always in view.
  const open = new Set<string>();
  for (let k = selected ? parentOf(selected) : ""; k; k = parentOf(k)) open.add(k);
  const showAll = new Set<string>();
  const inPath = (key: string) => selected !== null && (selected === key || selected.startsWith(`${key}|`));

  const rows: string[] = [];
  const walk = (nodes: GeoNode[], parent: string, depth: number, visible: boolean) => {
    nodes.forEach((n, rank) => {
      if (rank >= GEO_TOP && inPath(n.key)) showAll.add(parent);
    });
    nodes.forEach((n, rank) => {
      const shown = visible && (rank < GEO_TOP || showAll.has(parent));
      rows.push(geoRow(a, range, n, parent, rank, depth, shown, open.has(n.key)));
      if (n.children.length) walk(n.children, n.key, depth + 1, shown && open.has(n.key));
    });
    if (nodes.length > GEO_TOP) {
      const all = showAll.has(parent);
      const more = `Show all ${fmt(nodes.length)} ${GROUP[nodes[0].level]}`;
      const less = `Show top ${GEO_TOP}`;
      rows.push(
        `<tr class="geo-more lvl-${depth}${visible ? "" : " c"}" data-parent="${esc(parent)}" data-more="${esc(more)}" data-less="${esc(less)}"${all ? " data-all" : ""}><td colspan="5"><span class="loc-cell"><span class="disclose-pad" aria-hidden="true"></span><button type="button" class="link-btn" id="${idOf("m", parent || "all")}" aria-expanded="${all}">${esc(all ? less : more)}</button></span></td></tr>`,
      );
    }
  };
  walk(roots, "", 0, true);

  const cols: [GeoSort, string][] = [
    ["location", ""],
    ["visits", "num"],
    ["share", "num opt"],
    ["work", "num"],
    ["acted", "num"],
  ];
  const head = cols
    .map(([key, cls]) =>
      sortTh({
        label: GEO_SORTS[key].label,
        title: `Sort by ${GEO_SORTS[key].label.toLowerCase()}`,
        active: q.gsort === key,
        dir: q.gdir,
        href: hrefOf(range, { ...q, gsort: key, gdir: q.gsort === key ? flip(q.gdir) : GEO_SORTS[key].dir }),
        id: `gs-${key}`,
        cls,
      }),
    )
    .join("");

  return `<div class="scroll"><table class="geo-table"><thead><tr>${head}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function geoRow(
  a: Activity,
  range: RangeKey,
  n: GeoNode,
  parent: string,
  rank: number,
  depth: number,
  shown: boolean,
  open: boolean,
) {
  const on = n.key === a.geo.selected;
  const toggle = n.children.length
    ? `<button type="button" class="disclose" id="${idOf("d", n.key)}" aria-expanded="${open}" aria-label="${esc(`${cap(CHILDREN[n.level])} in ${n.label}`)}"><span class="chev" aria-hidden="true"></span></button>`
    : `<span class="disclose-pad" aria-hidden="true"></span>`;
  const target = on ? parentOf(n.key) || null : n.key;
  const tip = on ? `Clear ${n.label}` : `Show only visits from ${fullLabelOf(n.key)}`;
  const link = `<a class="loc${isUnknown(n.key) ? " muted" : ""}" data-nav id="${idOf("g", n.key)}" href="${esc(hrefOf(range, withLocation(a.query, target)))}" title="${esc(tip)}"${on ? ' aria-current="true"' : ""}>${esc(n.label)}</a>`;
  return `<tr class="geo-row lvl-${depth}${on ? " sel" : ""}${shown ? "" : " c"}" data-key="${esc(n.key)}" data-parent="${esc(parent)}" data-rank="${rank}"><td><span class="loc-cell">${toggle}${link}</span></td><td class="num">${fmt(n.visits)}</td><td class="num opt">${pct(n.visits, a.total)}</td><td class="num">${share(n.work, n.visits)}</td><td class="num">${share(n.acted, n.visits)}</td></tr>`;
}

function geoSection(a: Activity, range: RangeKey) {
  const head = `<h2>Geographic overview</h2>
<p class="muted small">Every visit in this period, by where it started. Select a location to filter Recent visits to it; the filters below don't change this table. Share: of all visits in the period. Viewed work: opened a case study. Acted: reached resume, LinkedIn or contact. <span class="approx">Locations are approximate, from Vercel's IP lookup: country is dependable, region usually right, and city often the nearest metro or the internet provider's hub.</span></p>`;
  if (!a.total) return `<section class="geo">${head}${empty("No visits in this period yet.")}</section>`;
  return `<section class="geo">${head}${geoSelection(a, range)}${geoTable(a, range)}</section>`;
}

// ---------- recent visits ----------

function select(id: string, name: string, label: string, all: string, options: Option[], value: string | null) {
  const opts = options
    .map((o) => `<option value="${esc(o.value)}"${o.value === value ? " selected" : ""}>${esc(o.label)}</option>`)
    .join("");
  return `<div class="field"><label class="sr-only" for="${id}">${esc(label)}</label><select id="${id}" name="${name}"${value ? ' class="set"' : ""}><option value="">${esc(all)}</option>${opts}</select></div>`;
}

/** Filters cleared; sorting, page size, the location table's sort and
 * Historical pageviews kept. */
const cleared = (q: ActivityQuery): ActivityQuery => ({
  ...DEFAULT_QUERY,
  sort: q.sort,
  dir: q.dir,
  per: q.per,
  gsort: q.gsort,
  gdir: q.gdir,
  history: q.history,
  hpage: q.hpage,
});

function filterForm(a: Activity, range: RangeKey) {
  const q = a.query;
  const o = a.options;
  // What a submitted form keeps that isn't one of its fields.
  const kept = [["range", range], ...activityParams(cleared(q))]
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
    .join("");
  const chips = (Object.keys(QUICK) as QuickKey[])
    .map((k) => {
      const on = q.quick.includes(k);
      const tip = k === "engaged" ? ' title="Only visits whose engaged time was measured"' : "";
      return `<label class="chip${on ? " on" : ""}"${tip}><input type="checkbox" name="quick" value="${k}" id="f-quick-${k}"${on ? " checked" : ""}>${esc(QUICK[k])}</label>`;
    })
    .join("");
  return `<form class="filters" id="activity-filters" method="get" action="${PATH}" role="search" aria-label="Filter visits">
${kept}
<div class="filter-grid">
<div class="field search"><label class="sr-only" for="f-q">Search by location or page</label><input type="search" id="f-q" name="q" value="${esc(q.q)}" placeholder="Search location or page" autocomplete="off" spellcheck="false"${q.q ? ' class="set"' : ""}></div>
${select("f-country", "country", "Country", "All countries", o.countries, q.country)}
${select("f-region", "region", "State or region", "All states and regions", o.regions, q.region)}
${select("f-city", "city", "City", "All cities", o.cities, q.city)}
${select("f-source", "source", "Traffic source", "All sources", o.sources, q.source)}
${select("f-device", "device", "Device", "All devices", o.devices, q.device)}
${select("f-activity", "activity", "Activity type", "All activity", o.activities, q.activity)}
</div>
<div class="quick">
<span class="muted small" id="quick-label">Quick filters</span>
<div class="chips" role="group" aria-labelledby="quick-label">${chips}</div>
<button type="submit" class="no-js">Apply</button>
${hasFilters(q) ? `<a class="reset" data-nav id="f-reset" href="${esc(hrefOf(range, cleared(q)))}">Reset filters</a>` : ""}
</div>
</form>`;
}

const depthText = (m: number) =>
  m === 100 ? "fits on screen" : m >= 90 ? "reached the bottom" : m === 0 ? "scrolled under 25%" : `scrolled to ${m}%`;

function stepItem(step: Step, r: VisitRow) {
  const t = `<span class="t">${esc(clockOf(step.t))}</span>`;
  if (step.kind === "page") {
    const facts: string[] = [];
    if (step.repeat) {
      if (r.engagedMs !== null || r.scrollTracked) facts.push("counted with its first view");
    } else {
      if (step.engagedMs !== null) {
        facts.push(`${duration(step.engagedMs)} engaged${step.views > 1 ? ` across ${step.views} views` : ""}`);
      }
      if (step.depth !== null) facts.push(depthText(step.depth));
    }
    return `<li class="step page">${t}<span class="k">${step.landed ? "Landed" : "Page"}</span><span class="w">${esc(pageLabel(step.path))}</span><span class="e">${esc(cap(facts.join(" · ")))}</span></li>`;
  }
  if (step.kind === "action") {
    const detail = step.detail ? ` <span class="muted">${esc(step.detail)}</span>` : "";
    const where = step.elsewhere ? ` <span class="muted">on ${esc(pageLabel(step.path))}</span>` : "";
    return `<li class="step action">${t}<span class="k">Action</span><span class="w"><b>${esc(ACTIONS[step.type])}</b>${detail}${where}</span><span class="e"></span></li>`;
  }
  return `<li class="step seen">${t}<span class="k">In view</span><span class="w">${esc(step.items.join(" · "))}</span><span class="e"></span></li>`;
}

/** Everything one visit recorded, in order. */
function timeline(r: VisitRow) {
  const software = [r.browser, r.os].filter(Boolean).join(" on ");
  const meta = [
    `<span class="phone-only">${esc(r.place)} · ${esc(deviceLabel(r.device))} · ${esc(r.source)} · </span>`,
    [
      software,
      r.referrer ? `referrer ${r.referrer}` : "",
      ...r.utm.map(([k, v]) => `${k} ${v}`),
      `${plural(r.pageviews, "pageview")}, ${plural(r.actions, "action")}`,
      r.engagedMs === null ? "engaged time not measured" : `${duration(r.engagedMs)} engaged in all`,
      r.scrollTracked ? "" : "scroll depth not recorded",
    ]
      .filter(Boolean)
      .map((text, i) => esc(i === 0 ? cap(text) : text))
      .join(" · "),
  ].join("");
  return `<p class="tl-meta muted small">${meta}</p><ol class="timeline">${r.steps.map((s) => stepItem(s, r)).join("")}</ol>`;
}

function visitsTable(a: Activity, range: RangeKey) {
  const q = a.query;
  const cols: [VisitSort, string][] = [
    ["started", "fit"],
    ["location", "opt"],
    ["device", "opt fit"],
    ["source", "opt fit"],
    ["path", "grow"],
    ["engaged", "num fit"],
  ];
  const head = cols
    .map(([key, cls]) =>
      sortTh({
        label: VISIT_SORTS[key].label,
        title: VISIT_SORTS[key].title,
        active: q.sort === key,
        dir: q.dir,
        href: hrefOf(range, { ...q, sort: key, dir: q.sort === key ? flip(q.dir) : VISIT_SORTS[key].dir, page: 1 }),
        id: `vs-${key}`,
        cls,
      }),
    )
    .join("");
  const body = a.rows
    .map((r, i) => {
      const id = `tl-${i}`;
      const engaged = r.engagedMs === null ? '<span title="Not measured">—</span>' : duration(r.engagedMs);
      return `<tr class="visit"><td class="fit"><button type="button" class="visit-toggle" aria-expanded="false" aria-controls="${id}"><span class="chev" aria-hidden="true"></span>${esc(timeOf(r.start))}</button></td><td class="opt">${esc(r.place)}</td><td class="opt fit">${esc(deviceLabel(r.device))}</td><td class="opt fit">${esc(r.source)}</td><td class="grow">${esc(r.journey.join(" → "))}${r.hiring ? ' <span class="tag">acted</span>' : ""}</td><td class="num fit">${engaged}</td></tr>
<tr class="tl c" id="${id}"><td colspan="6">${timeline(r)}</td></tr>`;
    })
    .join("");
  return `<div class="scroll"><table class="visits-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function pager(a: Activity, range: RangeKey) {
  const q = a.query;
  const step = (page: number, label: string, rel: string) =>
    page >= 1 && page <= a.pages
      ? `<a class="btn" data-nav data-scroll id="pg-${rel}" rel="${rel}" href="${esc(hrefOf(range, { ...q, page }))}">${label}</a>`
      : `<span class="btn off" aria-disabled="true">${label}</span>`;
  const per = PER_PAGE.map((n) =>
    n === q.per
      ? `<span class="pill" aria-current="true">${n}</span>`
      : `<a class="pill" data-nav id="pg-per-${n}" href="${esc(hrefOf(range, { ...q, per: n, page: 1 }))}" aria-label="${n} rows per page">${n}</a>`,
  ).join("");
  return `<nav class="pager" aria-label="Recent visits pages">
<div class="pages">${step(a.page - 1, "‹ Previous", "prev")}<span>Page ${fmt(a.page)} of ${fmt(a.pages)}</span>${step(a.page + 1, "Next ›", "next")}</div>
<div class="per"><span class="muted">Rows per page</span>${per}</div>
</nav>`;
}

function visitsSection(a: Activity, range: RangeKey) {
  const q = a.query;
  const filtered = hasFilters(q);
  const count = filtered
    ? `<b>${fmt(a.matching)}</b> of ${plural(a.total, "visit")} match`
    : `<b>${plural(a.total, "visit")}</b> in this period`;
  const results = `<div class="results small"><p id="v-count" tabindex="-1">${count}</p>${a.matching ? `<p class="muted">Showing ${fmt(a.from)}–${fmt(a.to)}</p>` : ""}</div>`;
  const body = a.rows.length
    ? `${visitsTable(a, range)}${pager(a, range)}`
    : filtered
      ? `<p class="muted">No visits match these filters. <a data-nav href="${esc(hrefOf(range, cleared(q)))}">Reset filters</a></p>`
      : empty("No visits in this period yet.");
  return `<section class="visits" id="recent-visits">
<h2>Recent visits</h2>
<p class="muted small">Newest first unless sorted by another column. Path: the pages in order, with resume, LinkedIn, contact, Proof notes and Partner Portal as steps of their own. Acted: reached resume, LinkedIn or contact. Select a visit to see every pageview and action it recorded, in order.</p>
${filterForm(a, range)}
${results}
${body}
</section>`;
}

// ---------- historical pageviews ----------

/** A one-line way in at the foot of Recent visits, and — only when asked
 * for — the pageviews that have no visit, in their own section and plainly
 * labelled as pageviews, so they're never read as visits. */
function historySection(a: Activity, range: RangeKey) {
  const h = a.history;
  if (!h.total) return "";
  const q = a.query;
  const toggle = hrefOf(range, { ...q, history: !q.history, hpage: 1 });
  const line = `<p class="muted small history-line">${plural(h.total, "pageview")} in this period ${h.total === 1 ? "has" : "have"} no visit attached — recorded before visits were tracked on Oct 7, 2026. <a data-nav id="h-toggle" href="${esc(toggle)}">${q.history ? "Hide" : "Show"} historical pageviews</a></p>`;
  if (!q.history) return line;

  const rows = h.rows.map((r) => [
    esc(timeOf(r.ts)),
    esc(r.place),
    esc(deviceLabel(r.device)),
    esc(r.source),
    esc(pageLabel(r.path)),
  ]);
  const step = (page: number, label: string, rel: string) =>
    page >= 1 && page <= h.pages
      ? `<a class="btn" data-nav data-scroll="historical" id="h-${rel}" rel="${rel}" href="${esc(hrefOf(range, { ...q, hpage: page }))}">${label}</a>`
      : `<span class="btn off" aria-disabled="true">${label}</span>`;
  const pager =
    h.pages > 1
      ? `<nav class="pager" aria-label="Historical pageviews pages"><div class="pages">${step(h.page - 1, "‹ Previous", "prev")}<span>Page ${fmt(h.page)} of ${fmt(h.pages)}</span>${step(h.page + 1, "Next ›", "next")}</div></nav>`
      : "";
  return `${line}
<section class="history" id="historical">
<h2>Historical pageviews</h2>
<p class="muted small">Newest first. Each row is one pageview exactly as it was recorded — not a visit. These came before pageviews were grouped into visits, so they aren't in the location table, the filters, Recent visits or any visit count, and nothing is pieced together from them. Engaged time and scroll depth weren't measured yet.</p>
${table(["Time", "Location", "Device", "Source", "Page"], rows, [], [false, true, true, false, false], ["fit", "", "fit", "fit", "grow"])}
${pager}
</section>`;
}

/** The Activity panel's content; also the whole response when the
 * dashboard's script asks for it on its own (?fragment=1). */
export function renderActivity(a: Activity, range: RangeKey) {
  const status = `${hasFilters(a.query) ? plural(a.matching, "matching visit") : plural(a.total, "visit")}${a.matching ? `, page ${fmt(a.page)} of ${fmt(a.pages)}` : ""}.`;
  return `<div id="activity" data-qs="${esc(activityParams(a.query).toString())}" data-status="${esc(status)}">
${geoSection(a, range)}
${visitsSection(a, range)}
${historySection(a, range)}
</div>`;
}

/** Activity's own parameters for the range and tab links, without the
 * page when `page` is false (a new range starts at page 1). */
export function activityLinkParams(q: ActivityQuery, page: boolean) {
  const p = activityParams(q);
  if (!page) p.delete("page");
  const s = p.toString();
  return s ? `&${s}` : "";
}

/** The location tree, visit timelines and live filtering. Delegated from
 * the panel, which outlives the swapped content; filter changes reload the
 * Activity content from the server (?fragment=1), keeping the address bar
 * in step with replaceState so a reload or a shared link shows the same.
 * Anything unexpected — a signed-out session, a network error — falls
 * back to loading the page normally. */
export const ACTIVITY_SCRIPT = `<script>
(() => {
  const panel = document.getElementById("view-activity");
  const status = document.getElementById("activity-status");
  let root = document.getElementById("activity");
  if (!panel || !root) return;
  const TOP = ${GEO_TOP};
  const expanded = new Set();
  const showAll = new Set();
  let ctrl = null;
  let typing = 0;
  let busy = 0;

  function geoApply() {
    const visible = new Map([["", true]]);
    for (const tr of root.querySelectorAll(".geo-table tbody tr")) {
      const p = tr.dataset.parent;
      const open = visible.get(p) === true && (p === "" || expanded.has(p));
      if (tr.classList.contains("geo-more")) {
        const all = showAll.has(p);
        const b = tr.querySelector("button");
        b.textContent = all ? tr.dataset.less : tr.dataset.more;
        b.setAttribute("aria-expanded", String(all));
        tr.hidden = !open;
      } else {
        const show = open && (Number(tr.dataset.rank) < TOP || showAll.has(p));
        visible.set(tr.dataset.key, show);
        tr.hidden = !show;
        const d = tr.querySelector(".disclose");
        if (d) d.setAttribute("aria-expanded", String(expanded.has(tr.dataset.key)));
      }
      tr.classList.remove("c");
    }
  }

  function init() {
    for (const d of root.querySelectorAll('.geo-table .disclose[aria-expanded="true"]')) expanded.add(d.closest("tr").dataset.key);
    for (const m of root.querySelectorAll(".geo-table tr.geo-more[data-all]")) showAll.add(m.dataset.parent);
    geoApply();
    for (const tr of root.querySelectorAll("tr.tl")) {
      tr.hidden = true;
      tr.classList.remove("c");
    }
  }

  function toggleVisit(button) {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    button.closest("tr").classList.toggle("open", open);
    document.getElementById(button.getAttribute("aria-controls")).hidden = !open;
  }

  function swap(html) {
    const t = document.createElement("template");
    t.innerHTML = html;
    const next = t.content.getElementById("activity");
    if (!next) throw new Error("No Activity content in the response");
    const active = document.activeElement;
    const focusId = active && root.contains(active) ? active.id : "";
    const search = root.querySelector("#f-q");
    const typed = search ? search.value : null;
    const caret = search && active === search ? [search.selectionStart, search.selectionEnd] : null;
    root.replaceWith(next);
    root = next;
    init();
    const fresh = root.querySelector("#f-q");
    if (fresh && typed !== null) fresh.value = typed;
    if (focusId) {
      const el = document.getElementById(focusId) || document.getElementById("v-count");
      if (el) el.focus({ preventScroll: true });
      if (caret && el === fresh) fresh.setSelectionRange(caret[0], caret[1]);
    }
    if (status) status.textContent = root.dataset.status || "";
  }

  async function load(href, scroll) {
    const url = new URL(href, location.href);
    url.searchParams.delete("fragment");
    const part = new URL(url);
    part.searchParams.set("fragment", "1");
    if (ctrl) ctrl.abort();
    const c = (ctrl = new AbortController());
    clearTimeout(busy);
    busy = setTimeout(() => root.setAttribute("aria-busy", "true"), 150);
    try {
      const res = await fetch(part, { signal: c.signal, headers: { Accept: "text/html" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const html = await res.text();
      if (c !== ctrl) return;
      swap(html);
      // The server's reading of the query, so the address is always the
      // short, canonical form of what's shown.
      const qs = root.dataset.qs;
      history.replaceState(history.state, "", url.pathname + "?range=" + url.searchParams.get("range") + (qs ? "&" + qs : ""));
      document.dispatchEvent(new CustomEvent("activity:change"));
      if (scroll) {
        const top = document.getElementById(scroll);
        if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView();
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
      location.assign(url.href);
    } finally {
      if (c === ctrl) {
        clearTimeout(busy);
        root.removeAttribute("aria-busy");
        ctrl = null;
      }
    }
  }

  function formUrl(form) {
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(form)) {
      if (typeof v === "string" && v.trim() !== "") params.append(k, v.trim());
    }
    return form.action.split("?")[0] + "?" + params;
  }

  panel.addEventListener("click", (e) => {
    const target = e.target;
    const nav = target.closest("a[data-nav]");
    if (nav) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      load(nav.href, nav.hasAttribute("data-scroll") ? nav.dataset.scroll || "recent-visits" : null);
      return;
    }
    const disclose = target.closest(".geo-table .disclose");
    if (disclose) {
      const key = disclose.closest("tr").dataset.key;
      if (!expanded.delete(key)) expanded.add(key);
      geoApply();
      return;
    }
    const more = target.closest(".geo-more button");
    if (more) {
      const p = more.closest("tr").dataset.parent;
      if (!showAll.delete(p)) showAll.add(p);
      geoApply();
      return;
    }
    const toggle = target.closest(".visit-toggle");
    if (toggle) {
      toggleVisit(toggle);
      return;
    }
    // Anywhere else on a visit's row opens it too, unless text was being selected.
    const row = target.closest("tr.visit");
    if (row && !target.closest("a, button, input, select") && !String(getSelection())) {
      toggleVisit(row.querySelector(".visit-toggle"));
    }
  });

  panel.addEventListener("change", (e) => {
    const el = e.target;
    const form = el.form;
    if (!form || form.id !== "activity-filters" || el.name === "q") return;
    // A new country or region clears the narrower choices under it.
    if (el.name === "country") form.elements.region.value = form.elements.city.value = "";
    if (el.name === "region") form.elements.city.value = "";
    if (el.type === "checkbox") el.closest(".chip").classList.toggle("on", el.checked);
    clearTimeout(typing);
    load(formUrl(form));
  });

  panel.addEventListener("input", (e) => {
    if (e.target.id !== "f-q") return;
    if (ctrl) ctrl.abort();
    clearTimeout(typing);
    typing = setTimeout(() => load(formUrl(e.target.form)), 250);
  });

  panel.addEventListener("submit", (e) => {
    if (e.target.id !== "activity-filters") return;
    e.preventDefault();
    clearTimeout(typing);
    load(formUrl(e.target));
  });

  init();
})();
</script>`;

