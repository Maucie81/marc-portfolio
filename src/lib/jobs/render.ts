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

function scoreCell(r: Role) {
  const tier = tierOf(r.roleFit);
  return r.roleFit === null
    ? "—"
    : `<b>${r.roleFit}</b> <span class="tier ${tierClass(tier)}">${esc(tier)}</span>`;
}

function materialCell(label: string, status: string) {
  const ready = status === "Draft ready";
  return `<span class="mat ${esc(status.replace(/\s+/g, "-").toLowerCase())}">${esc(status)}</span>${
    ready ? `<span class="review">AWAITING MARC REVIEW</span>` : ""
  }`;
}

function list(items: string[], empty: string) {
  return items.length
    ? `<ul class="items">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
    : `<p class="muted small">${esc(empty)}</p>`;
}

function summary(snapshot: Snapshot) {
  return `<div class="grid3">
<section><h2>Do now</h2>${list(snapshot.doNow, "Nothing needs you right now.")}</section>
<section><h2>Waiting</h2>${list(snapshot.waiting, "Nothing waiting.")}</section>
<section><h2>New / changed</h2>${list(snapshot.newChanged, "No recent changes.")}</section>
</div>`;
}

function filters(snapshot: Snapshot, q: Query) {
  const companies = [...new Set(snapshot.roles.map((r) => r.company))].sort();
  const opt = (value: string, label: string, current: string) =>
    `<option value="${esc(value)}"${value === current ? " selected" : ""}>${esc(label)}</option>`;
  return `<form class="filters" method="get" action="/jobs">
<label>Search<input type="search" name="q" value="${esc(q.q)}" placeholder="company, role, notes"></label>
<label>Status<select name="status">${opt("", "Any", q.status)}${STATUSES.map((s) => opt(s, s, q.status)).join("")}</select></label>
<label>Tier<select name="tier">${opt("", "Any", q.tier)}${(["APPLY NOW", "STRONG PROSPECT", "WATCH"] as const)
    .map((t) => opt(t, t, q.tier))
    .join("")}</select></label>
<label>List<select name="list">${(Object.keys(LISTS) as ListKey[]).map((k) => opt(k, LISTS[k], q.list)).join("")}</select></label>
<label>Company<select name="company">${opt("", "Any", q.company)}${companies.map((c) => opt(c, c, q.company)).join("")}</select></label>
<label>Min Role Fit<input type="number" name="minFit" min="0" max="100" value="${q.minFit || ""}"></label>
<label>Min Interest<input type="number" name="minInterest" min="0" max="10" value="${q.minInterest || ""}"></label>
<label>Sort<select name="sort">${(Object.keys(SORTS) as SortKey[]).map((k) => opt(k, SORTS[k], q.sort)).join("")}</select></label>
<div class="actions"><button type="submit">Apply</button> <a href="/jobs">Reset</a></div>
</form>`;
}

function rolesTable(roles: Role[], q: Query) {
  if (!roles.length) return `<p class="muted">No roles match these filters.</p>`;
  const link = (r: Role) => {
    const params = new URLSearchParams();
    if (q.sort !== "fit") params.set("sort", q.sort);
    params.set("role", r.id);
    return `/jobs?${params.toString()}`;
  };
  const rows = roles
    .map(
      (r) => `<tr>
<td><a href="${esc(link(r))}"><b>${esc(r.company)}</b></a><br><span>${esc(r.role)}</span>${r.exception ? ` <span class="tag">exception</span>` : ""}
<div class="meta">${esc(r.status)} · fit ${dash(r.roleFit)} · interest ${dash(r.interest)}</div></td>
<td class="opt">${esc(r.status)}</td>
<td class="num">${scoreCell(r)}</td>
<td class="num opt">${dash(r.interest)}</td>
<td class="opt">${dash(r.verification)}</td>
<td class="opt nowrap">${dash(firstDate(r.discovered))}</td>
<td class="opt nowrap">${dash(firstDate(r.applied))}</td>
<td class="opt nowrap">${dash(firstDate(r.lastActivity))}</td>
<td>${dash(r.nextAction)}${r.nextActionDate ? `<br><span class="muted small">${esc(r.nextActionDate)}</span>` : ""}</td>
<td class="opt">${materialCell("Resume", r.materials.resume)}</td>
<td class="opt">${materialCell("Cover letter", r.materials.cover)}</td>
<td class="opt">${materialCell("Outreach", r.materials.outreach)}</td>
<td class="opt">${r.url ? `<a href="${esc(r.url)}" rel="noreferrer noopener" target="_blank">Posting</a>` : "—"}</td>
</tr>`,
    )
    .join("");
  return `<div class="scroll"><table>
<thead><tr><th>Role</th><th class="opt">Status</th><th class="num">Role Fit</th><th class="num opt">Interest</th><th class="opt">Verification</th><th class="opt">Discovered</th><th class="opt">Applied</th><th class="opt">Last activity</th><th>Next action</th><th class="opt">Resume</th><th class="opt">Cover letter</th><th class="opt">Outreach</th><th class="opt">Link</th></tr></thead>
<tbody>${rows}</tbody></table></div>`;
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
  return `<section><h2>Watchlist</h2><p class="muted small">Strong-fit companies without a current Marc-relevant role, from aligned-companies.md. Not application targets.</p>
<div class="scroll"><table><thead><tr><th>Company</th><th>Role / status</th><th class="num">Fit</th><th class="opt">Verification</th><th class="opt">Notes</th></tr></thead><tbody>${rows
    .map(
      (w) =>
        `<tr><td><b>${esc(w.company)}</b></td><td>${esc(w.role)}</td><td class="num">${w.score ?? "—"}</td><td class="opt">${esc(w.verification)}</td><td class="opt">${esc(w.notes)}</td></tr>`,
    )
    .join("")}</tbody></table></div></section>`;
}

function passiveList(snapshot: Snapshot, q: Query) {
  if ((q.list !== "all" && q.list !== "passive") || !snapshot.passive.length) return "";
  return `<section><h2>Passive / historical</h2>${list(snapshot.passive, "")}</section>`;
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
  --surface: #ffffff; --raised: #f2f1ee; --line: #e2e1dc; --text: #0b0b0b; --muted: #52514e; --link: #2a78d6;
  --ok: #1f7a3d; --mid: #8a5a00; --low: #6b6a66;
}
@media (prefers-color-scheme: dark) {
  :root { --surface: #1a1a19; --raised: #252523; --line: #353532; --text: #ffffff; --muted: #c3c2b7; --link: #6aa6f0; --ok: #5ccf84; --mid: #e3b552; --low: #9c9b94; }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface); color: var(--text); font: 15px/1.45 system-ui, -apple-system, sans-serif; -webkit-text-size-adjust: 100%; }
main { max-width: 1240px; margin: 0 auto; padding: 24px 16px 48px; }
a { color: var(--link); }
h1 { font-size: 22px; margin: 0; }
h2 { font-size: 17px; margin: 0 0 8px; }
h3 { font-size: 15px; margin: 20px 0 6px; }
header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
section { margin-top: 28px; min-width: 0; }
.muted { color: var(--muted); }
.small { font-size: 13px; }
p { margin: 0 0 8px; }
code { font-size: 13px; overflow-wrap: anywhere; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; background: var(--raised); padding: 12px; border-radius: 6px; font-size: 13px; }
.grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px; margin-top: 20px; }
.grid3 section { margin-top: 0; background: var(--raised); border-radius: 8px; padding: 12px 16px; }
.items { margin: 0; padding-left: 18px; }
.items li { margin-bottom: 6px; }
.filters { display: flex; flex-wrap: wrap; gap: 10px; align-items: end; margin-top: 28px; }
.filters label { display: grid; gap: 3px; font-size: 13px; color: var(--muted); }
.filters .actions { display: flex; gap: 10px; align-items: center; padding-bottom: 6px; }
input, select, button { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; }
input[type=number] { width: 90px; }
input[type=search] { width: 200px; }
button { background: var(--raised); cursor: pointer; padding: 6px 12px; }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { text-align: left; padding: 6px 10px 6px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; color: var(--muted); font-size: 13px; }
td { overflow-wrap: break-word; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.nowrap { white-space: nowrap; }
.meta { display: none; color: var(--muted); font-size: 13px; }
.tier { display: inline-block; font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 999px; border: 1px solid var(--line); }
.tier.apply-now, .tier.strong-prospect { color: var(--ok); border-color: var(--ok); }
.tier.watch { color: var(--mid); border-color: var(--mid); }
.tier.skip, .tier.none { color: var(--low); }
.tag { font-size: 11px; padding: 1px 6px; border-radius: 999px; background: var(--raised); color: var(--muted); font-weight: 400; }
.mat { font-size: 13px; }
.mat.not-started, .mat.not-needed { color: var(--muted); }
.review { display: block; font-size: 11px; font-weight: 700; color: var(--mid); }
.facts { margin: 12px 0 0; display: grid; gap: 8px; }
.facts div { display: grid; grid-template-columns: minmax(130px, 28%) 1fr; gap: 12px; padding-top: 8px; border-top: 1px solid var(--line); }
.facts dt { color: var(--muted); font-size: 13px; }
.facts dd { margin: 0; overflow-wrap: anywhere; }
details { margin: 8px 0; }
summary { cursor: pointer; }
.error { color: #c42b2b; }
form.login { display: grid; gap: 12px; margin-top: 24px; }
input[type=password] { width: 100%; max-width: 320px; padding: 10px 12px; }
footer { margin-top: 40px; font-size: 13px; }
@media (max-width: 700px) {
  .opt { display: none; }
  .meta { display: block; }
  .facts div { grid-template-columns: 1fr; gap: 2px; }
  input[type=search] { width: 100%; }
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
${filters(snapshot, query)}
${showRoles ? `<section><h2>Roles <span class="muted small">${active.length} active</span></h2>${rolesTable(active, query)}</section>` : ""}
${watchTable(snapshot, query)}
${showRoles && closed.length ? `<section><h2>Closed</h2>${rolesTable(closed, query)}</section>` : ""}
${passiveList(snapshot, query)}
<footer class="muted"><p>Prepared materials stay marked AWAITING MARC REVIEW until you review them. Outreach shows "Sent" only if pipeline.md says so.</p></footer>`;
  return page("Job search", body);
}
