import { STATUSES, tierOf, type Role, type Snapshot, type Tier } from "./types";

/**
 * HTML for the private /jobs page (see src/app/jobs/route.ts). Plain
 * server-rendered markup: no site chrome, scripts or trackers, filters and
 * sorting are a GET form, the role detail is `?role=<id>`. Utilitarian on
 * purpose. Every value comes from markdown files, so all of it is escaped.
 */

const esc = (value: string | number | null | undefined) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const dash = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "—" : esc(value);

const SORTS = {
  fit: "Highest Role Fit",
  interest: "Highest Interest",
  discovered: "Recently discovered",
  activity: "Recently active",
  due: "Next action due soonest",
} as const;
type SortKey = keyof typeof SORTS;

const LISTS = { all: "All", active: "Active", watchlist: "Watchlist", passive: "Passive / historical" } as const;
type ListKey = keyof typeof LISTS;

export type Query = {
  role: string;
  sort: SortKey;
  status: string;
  tier: string;
  list: ListKey;
  company: string;
  minFit: number;
  minInterest: number;
  q: string;
};

export function parseQuery(params: URLSearchParams): Query {
  const sort = params.get("sort") as SortKey;
  const list = params.get("list") as ListKey;
  const num = (key: string) => {
    const n = Number(params.get(key));
    return Number.isFinite(n) && n > 0 ? Math.min(100, n) : 0;
  };
  return {
    role: params.get("role") ?? "",
    sort: sort in SORTS ? sort : "fit",
    status: params.get("status") ?? "",
    tier: params.get("tier") ?? "",
    list: list in LISTS ? list : "all",
    company: params.get("company") ?? "",
    minFit: num("minFit"),
    minInterest: num("minInterest"),
    q: (params.get("q") ?? "").slice(0, 80),
  };
}

const firstDate = (s: string | null) => s?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;

const byDateDesc = (get: (r: Role) => string | null) => (a: Role, b: Role) => {
  const x = get(a);
  const y = get(b);
  if (x === y) return 0;
  if (!x) return 1;
  if (!y) return -1;
  return x < y ? 1 : -1;
};

function sortRoles(roles: Role[], sort: SortKey) {
  const copy = [...roles];
  switch (sort) {
    case "fit":
      return copy.sort((a, b) => (b.roleFit ?? -1) - (a.roleFit ?? -1));
    case "interest":
      return copy.sort((a, b) => (b.interest ?? -1) - (a.interest ?? -1));
    case "discovered":
      return copy.sort(byDateDesc((r) => firstDate(r.discovered)));
    case "activity":
      return copy.sort(byDateDesc((r) => firstDate(r.lastActivity)));
    case "due":
      return copy.sort((a, b) => {
        const x = firstDate(a.nextActionDate);
        const y = firstDate(b.nextActionDate);
        if (x === y) return 0;
        if (!x) return 1;
        if (!y) return -1;
        return x < y ? -1 : 1;
      });
  }
}

function filterRoles(roles: Role[], q: Query) {
  const needle = q.q.trim().toLowerCase();
  return roles.filter((r) => {
    if (q.list === "watchlist" || q.list === "passive") return false;
    if (q.status && r.status !== q.status) return false;
    if (q.tier && tierOf(r.roleFit) !== q.tier) return false;
    if (q.company && r.company !== q.company) return false;
    if (q.minFit && (r.roleFit ?? 0) < q.minFit) return false;
    if (q.minInterest && (r.interest ?? 0) < q.minInterest) return false;
    if (needle && !`${r.company} ${r.role} ${r.notes ?? ""}`.toLowerCase().includes(needle)) return false;
    return true;
  });
}

const tierClass = (t: Tier | null) => (t ? t.toLowerCase().replace(" ", "-") : "none");

/** Role Fit number and its tier label as one unit. */
function scoreCell(r: Role) {
  const tier = tierOf(r.roleFit);
  return r.roleFit === null
    ? `<span class="fit none"><b>—</b></span>`
    : `<span class="fit ${tierClass(tier)}"><b>${r.roleFit}</b><i>${esc(tier)}</i></span>`;
}

/** "VERIFIED OPEN (2026-10-07)" -> a state chip plus the quiet remainder. */
function verificationChip(value: string | null) {
  if (!value) return "";
  const m = /^(VERIFIED OPEN|PROBABLY OPEN|UNVERIFIED|PROBABLY CLOSED|CLOSED|WITHDRAWN|REJECTED)\b\s*(.*)$/i.exec(value);
  if (!m) return `<span class="chip">${esc(value)}</span>`;
  const state = m[1].toUpperCase();
  const cls = state === "VERIFIED OPEN" ? "ok" : state === "PROBABLY OPEN" || state === "UNVERIFIED" ? "mid" : "low";
  const rest = m[2].replace(/^\((.*)\)$/, "$1");
  return `<span class="chip ${cls}">${esc(state)}</span>${rest ? `<span class="quiet">${esc(rest)}</span>` : ""}`;
}

const matClass = (status: string) => esc(status.replace(/\s+/g, "-").toLowerCase());

/** Used in the role detail view. */
function materialCell(label: string, status: string) {
  const ready = status === "Draft ready";
  return `<span class="mat ${matClass(status)}">${esc(status)}</span>${
    ready ? `<span class="review">AWAITING MARC REVIEW</span>` : ""
  }`;
}

/** Compact materials line for a role card: one pill per material, or one quiet line when nothing exists. */
function materialsLine(r: Role) {
  const m = r.materials;
  const parts: [string, string][] = [
    ["Résumé", m.resume],
    ["Cover letter", m.cover],
    ["Outreach", m.outreach],
  ];
  if (parts.every(([, s]) => s === "Not started")) {
    return `<span class="quiet">Materials: not started</span>`;
  }
  const pills = parts
    .map(([label, s]) => `<span class="pill ${matClass(s)}"><span>${esc(label)}</span> ${esc(s)}</span>`)
    .join("");
  const review = parts.some(([, s]) => s === "Draft ready") ? `<span class="review">AWAITING MARC REVIEW</span>` : "";
  return `${pills}${review}`;
}

function list(items: string[], empty: string) {
  return items.length
    ? `<ul class="items">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
    : `<p class="empty">${esc(empty)}</p>`;
}

function summary(snapshot: Snapshot) {
  const count = (n: number) => (n ? `<span class="count">${n}</span>` : "");
  return `<div class="top">
<section class="card now"><h2>Do now ${count(snapshot.doNow.length)}</h2>${list(snapshot.doNow, "Nothing needs you right now.")}</section>
<section class="card"><h2>Waiting ${count(snapshot.waiting.length)}</h2>${list(snapshot.waiting, "Nothing waiting.")}</section>
<section class="card"><h2>New / changed ${count(snapshot.newChanged.length)}</h2>${list(snapshot.newChanged, "No recent changes.")}</section>
</div>`;
}

function filters(snapshot: Snapshot, q: Query) {
  const companies = [...new Set(snapshot.roles.map((r) => r.company))].sort();
  const opt = (value: string, label: string, current: string) =>
    `<option value="${esc(value)}"${value === current ? " selected" : ""}>${esc(label)}</option>`;
  return `<form class="filters" method="get" action="/jobs">
<label class="grow">Search<input type="search" name="q" value="${esc(q.q)}" placeholder="company, role, notes"></label>
<label>Status<select name="status">${opt("", "Any", q.status)}${STATUSES.map((s) => opt(s, s, q.status)).join("")}</select></label>
<label>Tier<select name="tier">${opt("", "Any", q.tier)}${(["APPLY NOW", "STRONG PROSPECT", "WATCH"] as const)
    .map((t) => opt(t, t, q.tier))
    .join("")}</select></label>
<label>List<select name="list">${(Object.keys(LISTS) as ListKey[]).map((k) => opt(k, LISTS[k], q.list)).join("")}</select></label>
<label>Company<select name="company">${opt("", "Any", q.company)}${companies.map((c) => opt(c, c, q.company)).join("")}</select></label>
<label>Min Role Fit<input type="number" name="minFit" min="0" max="100" value="${q.minFit || ""}"></label>
<label>Min Interest<input type="number" name="minInterest" min="0" max="10" value="${q.minInterest || ""}"></label>
<label>Sort<select name="sort">${(Object.keys(SORTS) as SortKey[]).map((k) => opt(k, SORTS[k], q.sort)).join("")}</select></label>
<div class="actions"><button type="submit">Apply</button><a href="/jobs">Reset</a></div>
</form>`;
}

const roleLink = (r: Role, q: Query) => {
  const params = new URLSearchParams();
  if (q.sort !== "fit") params.set("sort", q.sort);
  params.set("role", r.id);
  return `/jobs?${params.toString()}`;
};

/** Active roles: one card per role, the primary content of the page. */
function roleCards(roles: Role[], q: Query) {
  if (!roles.length) return `<p class="empty">No roles match these filters.</p>`;
  const date = (label: string, value: string | null) => {
    const d = firstDate(value);
    return d ? `<span>${label} ${esc(d)}</span>` : "";
  };
  return `<div class="roles">${roles
    .map(
      (r) => `<article class="role">
<div class="who">
<a class="company" href="${esc(roleLink(r, q))}">${esc(r.company)}</a>
<div class="title">${esc(r.role)}</div>
<div class="chips"><span class="chip status">${esc(r.status)}</span>${verificationChip(r.verification)}${
        r.exception ? `<span class="tag">exception</span>` : ""
      }</div>
</div>
<div class="score">${scoreCell(r)}<div class="interest">Interest <b>${dash(r.interest)}</b>${r.interest === null ? "" : "/10"}</div></div>
<div class="next"><div class="label">Next</div><div class="action">${dash(r.nextAction)}</div>${
        r.nextActionDate ? `<div class="due">${esc(r.nextActionDate)}</div>` : ""
      }</div>
<div class="foot"><div class="mats">${materialsLine(r)}</div><div class="dates">${date("Discovered", r.discovered)}${date(
        "Applied",
        r.applied,
      )}${date("Last activity", r.lastActivity)}${
        r.url ? `<a href="${esc(r.url)}" rel="noreferrer noopener" target="_blank">Posting ↗</a>` : ""
      }</div></div>
</article>`,
    )
    .join("")}</div>`;
}

/** Closed roles: archived, collapsed by default. */
function closedList(roles: Role[], q: Query) {
  if (!roles.length) return "";
  return `<details class="archive"><summary>Closed <span class="count">${roles.length}</span></summary><ul class="compact">${roles
    .map(
      (r) =>
        `<li><a href="${esc(roleLink(r, q))}">${esc(r.company)}</a>${r.role ? ` — ${esc(r.role)}` : ""} <span class="quiet">${dash(r.verification)}</span></li>`,
    )
    .join("")}</ul></details>`;
}

function watchTable(snapshot: Snapshot, q: Query) {
  if (q.list !== "all" && q.list !== "watchlist") return "";
  const needle = q.q.trim().toLowerCase();
  const rows = snapshot.watchlist.filter((w) => {
    if (q.company && w.company !== q.company) return false;
    if (q.minFit && (w.score ?? 0) < q.minFit) return false;
    if (q.tier && tierOf(w.score) !== q.tier) return false;
    if (q.status || q.minInterest) return false; // those fields only exist on pipeline roles
    return !needle || `${w.company} ${w.role} ${w.notes}`.toLowerCase().includes(needle);
  });
  if (!rows.length) return "";
  return `<section class="secondary"><h2>Watchlist <span class="count">${rows.length}</span></h2><p class="quiet">Strong-fit companies without a current Marc-relevant role, from aligned-companies.md. Not application targets.</p>
<div class="scroll"><table><thead><tr><th>Company</th><th>Role / status</th><th class="num">Fit</th><th class="opt">Verification</th><th class="opt">Notes</th></tr></thead><tbody>${rows
    .map(
      (w) =>
        `<tr><td class="co">${esc(w.company)}</td><td>${esc(w.role)}</td><td class="num">${w.score ?? "—"}</td><td class="opt">${esc(w.verification)}</td><td class="opt">${esc(w.notes)}</td></tr>`,
    )
    .join("")}</tbody></table></div></section>`;
}

function passiveList(snapshot: Snapshot, q: Query) {
  if ((q.list !== "all" && q.list !== "passive") || !snapshot.passive.length) return "";
  return `<details class="archive"${q.list === "passive" ? " open" : ""}><summary>Passive / historical <span class="count">${snapshot.passive.length}</span></summary><ul class="compact">${snapshot.passive
    .map((i) => `<li>${esc(i)}</li>`)
    .join("")}</ul></details>`;
}

function detail(snapshot: Snapshot, id: string, q: Query) {
  const r = snapshot.roles.find((x) => x.id === id);
  if (!r) return `<section><p class="muted">That role isn't in the current snapshot. <a href="/jobs">Back to list</a></p></section>`;
  const back = `/jobs${q.sort !== "fit" ? `?sort=${q.sort}` : ""}`;
  const row = (label: string, value: string | null) =>
    `<div><dt>${esc(label)}</dt><dd>${value === null || value === "" ? "—" : esc(value)}</dd></div>`;
  const files = r.files
    .map((f) =>
      f.exists
        ? `<details><summary><code>${esc(f.name)}</code> exists</summary><pre>${esc(f.content ?? "")}</pre></details>`
        : `<p class="muted small"><code>${esc(f.name)}</code>: does not exist yet</p>`,
    )
    .join("");
  return `<section class="detail">
<p class="small"><a href="${esc(back)}">← All roles</a></p>
<h2>${esc(r.company)} — ${esc(r.role)}${r.exception ? ` <span class="tag">confirmed-interest exception</span>` : ""}</h2>
<dl class="facts">
${row("Status", r.status)}
${row("Role Fit Score", r.roleFit === null ? null : `${r.roleFit} (${tierOf(r.roleFit)})`)}
${row("Interest Alignment Score", r.interest === null ? null : `${r.interest} / 10`)}
${row("Verification", r.verification)}
<div><dt>Role URL</dt><dd>${r.url ? `<a href="${esc(r.url)}" rel="noreferrer noopener" target="_blank">${esc(r.url)}</a>` : "—"}</dd></div>
${row("Req ID", r.req)}
${row("Compensation", r.compensation)}
${row("Location / work model", r.location)}
${row("Why it fits", r.whyItFits)}
${row("Biggest concerns", r.concerns)}
${row("Recommended case study", r.caseStudy)}
${row("Date discovered", r.discovered)}
${row("Date applied", r.applied)}
${row("Last activity", r.lastActivity)}
${row("Next action", r.nextAction)}
${row("Next-action date", r.nextActionDate)}
${row("Notes", r.notes)}
${row("Materials folder", r.materialsPath)}
<div><dt>Resume</dt><dd>${materialCell("Resume", r.materials.resume)}</dd></div>
<div><dt>Cover letter</dt><dd>${materialCell("Cover letter", r.materials.cover)}</dd></div>
<div><dt>Outreach</dt><dd>${materialCell("Outreach", r.materials.outreach)}</dd></div>
</dl>
<h3>Materials</h3>
${files}
</section>`;
}

const STYLE = `
:root {
  color-scheme: light dark;
  --surface: #ffffff; --raised: #f5f4f1; --line: #e2e1dc; --text: #111110; --muted: #5c5b57; --link: #1f63b8;
  --ok: #17663a; --ok-bg: #e6f3ea; --mid: #7a4f00; --mid-bg: #fbefd3; --low: #5c5b57; --low-bg: #ecebe7; --accent: #111110;
}
@media (prefers-color-scheme: dark) {
  :root { --surface: #171716; --raised: #212120; --line: #343431; --text: #f4f3ef; --muted: #a9a8a0; --link: #7fb2f2;
    --ok: #74d99a; --ok-bg: #173323; --mid: #ecc56a; --mid-bg: #3a2e12; --low: #a9a8a0; --low-bg: #2b2b29; --accent: #f4f3ef; }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface); color: var(--text); font: 16px/1.5 system-ui, -apple-system, sans-serif; -webkit-text-size-adjust: 100%; }
main { max-width: 1280px; margin: 0 auto; padding: 28px 24px 64px; }
a { color: var(--link); }
h1 { font-size: 22px; margin: 0 0 2px; }
h2 { font-size: 18px; margin: 0 0 12px; display: flex; align-items: baseline; gap: 8px; }
h3 { font-size: 15px; margin: 20px 0 6px; }
header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
section { margin-top: 36px; min-width: 0; }
.muted { color: var(--muted); }
.small { font-size: 13px; }
.quiet { color: var(--muted); font-size: 13px; }
.empty { color: var(--muted); margin: 0; }
p { margin: 0 0 8px; }
code { font-size: 13px; overflow-wrap: anywhere; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; background: var(--raised); padding: 12px; border-radius: 6px; font-size: 13px; }
.count { font-size: 12px; font-weight: 600; color: var(--muted); background: var(--low-bg); border-radius: 999px; padding: 1px 8px; }

/* top: do now / waiting / new */
.top { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr); gap: 16px; margin-top: 24px; }
.card { margin-top: 0; border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; }
.card h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin-bottom: 10px; }
.card.now { border-color: var(--accent); border-left-width: 5px; background: var(--raised); }
.card.now h2 { color: var(--text); }
.items { list-style: none; margin: 0; padding: 0; font-size: 14px; }
.items li { padding: 9px 0; border-top: 1px solid var(--line); overflow-wrap: break-word; }
.items li:first-child { border-top: 0; padding-top: 0; }
.items li:last-child { padding-bottom: 0; }
.card.now .items { font-size: 16px; line-height: 1.5; font-weight: 500; }

/* filter bar */
.filters { display: flex; flex-wrap: wrap; gap: 8px 10px; align-items: end; margin-top: 14px; padding: 10px 12px; background: var(--raised); border-radius: 8px; }
.filters label { display: grid; gap: 2px; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
.filters .grow { flex: 1 1 180px; }
.filters .actions { display: flex; gap: 12px; align-items: center; font-size: 14px; }
input, select, button { font: inherit; font-size: 14px; color: var(--text); background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 5px 8px; text-transform: none; letter-spacing: 0; }
input[type=number] { width: 76px; }
input[type=search] { width: 100%; }
select { max-width: 170px; }
button { background: var(--surface); cursor: pointer; padding: 5px 14px; font-weight: 600; }

/* active roles */
.roles { display: grid; gap: 14px; margin-top: 16px; }
.role { display: grid; grid-template-columns: minmax(0, 5fr) 150px minmax(0, 6fr); gap: 16px 28px; align-items: start; border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; }
.company { font-size: 19px; font-weight: 700; color: var(--text); text-decoration: none; }
.company:hover { text-decoration: underline; }
.title { font-size: 15px; margin-top: 2px; overflow-wrap: break-word; }
.chips { display: flex; flex-wrap: wrap; gap: 6px 8px; align-items: center; margin-top: 10px; }
.chip { display: inline-block; font-size: 12px; font-weight: 600; letter-spacing: .02em; padding: 3px 9px; border-radius: 999px; background: var(--low-bg); color: var(--low); white-space: nowrap; }
.chip.status { background: transparent; border: 1px solid var(--muted); color: var(--text); padding: 2px 9px; }
.chip.ok { background: var(--ok-bg); color: var(--ok); }
.chip.mid { background: var(--mid-bg); color: var(--mid); }
.tag { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: var(--low-bg); color: var(--muted); font-weight: 400; }
.fit { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.fit b { font-size: 30px; line-height: 1; font-variant-numeric: tabular-nums; }
.fit i { font-style: normal; font-size: 11px; font-weight: 700; letter-spacing: .05em; padding: 3px 8px; border-radius: 4px; background: var(--low-bg); color: var(--low); white-space: nowrap; }
.fit.apply-now i, .fit.strong-prospect i { background: var(--ok-bg); color: var(--ok); }
.fit.apply-now i { outline: 2px solid var(--ok); }
.fit.watch i { background: var(--mid-bg); color: var(--mid); }
.interest { margin-top: 8px; font-size: 13px; color: var(--muted); }
.interest b { color: var(--text); }
.next .label, .facts dt { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.next .action { font-size: 16px; font-weight: 600; line-height: 1.4; margin-top: 2px; overflow-wrap: break-word; }
.next .due { font-size: 13px; color: var(--muted); margin-top: 4px; }
.foot { grid-column: 1 / -1; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 20px; align-items: center; padding-top: 12px; border-top: 1px solid var(--line); }
.mats { display: flex; flex-wrap: wrap; gap: 6px 8px; align-items: center; }
.pill { font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 6px; background: var(--low-bg); color: var(--low); }
.pill span { font-weight: 400; }
.pill.draft-ready { background: var(--mid-bg); color: var(--mid); }
.pill.reviewed, .pill.sent { background: var(--ok-bg); color: var(--ok); }
.dates { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 13px; color: var(--muted); }
.mat { font-size: 14px; }
.mat.not-started, .mat.not-needed { color: var(--muted); }
.review { font-size: 11px; font-weight: 700; letter-spacing: .04em; color: var(--mid); margin-left: 4px; }

/* watchlist: secondary */
.secondary h2 { font-size: 15px; color: var(--muted); margin-bottom: 4px; }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; color: var(--muted); }
th, td { text-align: left; padding: 7px 16px 7px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
td { overflow-wrap: break-word; }
td.co { color: var(--text); font-weight: 600; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* archive: closed + passive */
.archive { margin-top: 16px; border-top: 1px solid var(--line); padding-top: 12px; color: var(--muted); font-size: 13px; }
.archive summary { cursor: pointer; font-size: 14px; font-weight: 600; }
.archive a { color: inherit; }
.compact { margin: 8px 0 0; padding-left: 18px; line-height: 1.45; }
.compact li { margin-bottom: 4px; overflow-wrap: break-word; }

/* role detail */
.detail { border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; }
.facts { margin: 12px 0 0; display: grid; gap: 8px; }
.facts div { display: grid; grid-template-columns: minmax(150px, 24%) 1fr; gap: 12px; padding-top: 8px; border-top: 1px solid var(--line); }
.facts dt { padding-top: 3px; }
.facts dd { margin: 0; overflow-wrap: anywhere; }
details { margin: 8px 0; }
summary { cursor: pointer; }
.error { color: #c42b2b; }
form.login { display: grid; gap: 12px; margin-top: 24px; }
input[type=password] { width: 100%; max-width: 320px; padding: 10px 12px; font-size: 16px; }
footer { margin-top: 48px; font-size: 13px; }

@media (max-width: 900px) {
  .top { grid-template-columns: 1fr; }
  .role { grid-template-columns: minmax(0, 1fr) auto; gap: 14px 16px; }
  .next { grid-column: 1 / -1; }
}
@media (max-width: 700px) {
  main { padding: 20px 16px 48px; }
  .opt { display: none; }
  .role { padding: 16px; }
  .fit { align-items: flex-end; }
  .score { text-align: right; }
  .fit b { font-size: 26px; }
  .filters label { flex: 1 1 130px; }
  .filters select, input[type=number] { width: 100%; max-width: none; }
  .facts div { grid-template-columns: 1fr; gap: 2px; }
}
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
  return page("Job search", `<h1>Job search</h1><p class="muted" style="margin-top:12px">${esc(text)}</p>`);
}

export function renderLogin(error = "") {
  return page(
    "Job search · Sign in",
    `<h1>Job search</h1>
<form class="login" method="post" action="/jobs">
<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
${error ? `<p class="error">${esc(error)}</p>` : ""}
<div><button type="submit">Sign in</button></div>
</form>`,
  );
}

export function renderJobs(opts: { snapshot: Snapshot | null; query: Query; signOut: boolean }) {
  const { snapshot, query, signOut } = opts;
  if (!snapshot) {
    return page(
      "Job search",
      `<h1>Job search</h1><p class="muted" style="margin-top:12px">No snapshot yet. Run <code>npm run jobs:sync</code> on your Mac to publish pipeline.md, weekly-actions.md and aligned-companies.md here.</p>`,
    );
  }
  const visible = sortRoles(filterRoles(snapshot.roles, query), query.sort);
  const active = visible.filter((r) => r.list === "active");
  const closed = visible.filter((r) => r.list === "closed");
  const showRoles = query.list === "all" || query.list === "active";

  const generated = new Date(snapshot.generatedAt);
  const when = Number.isNaN(generated.getTime())
    ? snapshot.generatedAt
    : generated.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });

  const body = `
<header>
<div><h1>Job search</h1><p class="muted small">Snapshot from ${esc(when)} ET · source of truth is pipeline.md · informational only, nothing here sends or submits anything</p></div>
${signOut ? `<form method="post" action="/jobs"><input type="hidden" name="logout" value="1"><button type="submit">Sign out</button></form>` : ""}
</header>
${summary(snapshot)}
${query.role ? detail(snapshot, query.role, query) : ""}
${showRoles ? `<section><h2>Active roles <span class="count">${active.length}</span></h2>${filters(snapshot, query)}${roleCards(active, query)}</section>` : filters(snapshot, query)}
${watchTable(snapshot, query)}
${showRoles ? closedList(closed, query) : ""}
${passiveList(snapshot, query)}
<footer class="muted"><p>Prepared materials stay marked AWAITING MARC REVIEW until you review them. Outreach shows "Sent" only if pipeline.md says so.</p></footer>`;
  return page("Job search", body);
}
