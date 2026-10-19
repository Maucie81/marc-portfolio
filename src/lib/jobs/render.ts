import { cleanTitle, todayET } from "./merge";
import {
  DECISIONS,
  OUTREACH,
  SOURCES,
  STATUSES,
  statusLabel,
  tierOf,
  type Decision,
  type ManualField,
  type Role,
  type OutreachKey,
  type Snapshot,
  type SourceKey,
} from "./types";

/**
 * HTML for the private /jobs page (see src/app/jobs/route.ts). Server-rendered, no
 * site chrome or trackers. Built around three questions: what came my way, what do I
 * think of it, what's my next step. The search's research is kept, one level down.
 *
 * Views: Opportunities (default), ?role=<id> detail, ?view=archive, ?view=search,
 * ?view=add. Every write is a plain POST form; one small inline script only closes
 * open interest menus. Every value is escaped.
 */

const esc = (value: string | number | null | undefined) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const VIEWS = ["list", "archive", "search", "add"] as const;
type View = (typeof VIEWS)[number];

export type Query = {
  view: View;
  role: string;
  q: string;
  notice: string;
  undo: string;
  prev: string;
  restored: string;
};

export function parseQuery(params: URLSearchParams): Query {
  const view = params.get("view") as View;
  return {
    view: VIEWS.includes(view) ? view : "list",
    role: params.get("role") ?? "",
    q: (params.get("q") ?? "").slice(0, 80),
    notice: params.get("notice") ?? "",
    undo: params.get("undo") ?? "",
    prev: params.get("prev") ?? "",
    restored: params.get("restored") ?? "",
  };
}

export type EditContext = { csrf: string; editable: boolean };

/* ---------- small helpers ---------- */

const firstDate = (s: string | null | undefined) => s?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;

function dayLabel(date: string, today: string) {
  if (date === today) return "Today";
  const d = new Date(`${date}T12:00:00Z`);
  const t = new Date(`${today}T12:00:00Z`);
  const diff = Math.round((d.getTime() - t.getTime()) / 86_400_000);
  if (diff === 1) return "Tomorrow";
  const opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" };
  if (d.getUTCFullYear() !== t.getUTCFullYear()) opts.year = "numeric";
  return d.toLocaleDateString("en-US", opts);
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

const SOURCE_SHORT: Record<SourceKey, string> = {
  automated: "Search",
  recruiter: "Recruiter",
  interest: "Personal interest",
  network: "Personal network",
};

const decisionOf = (r: Role): Decision => r.decision ?? "undecided";
const archived = (r: Role) => decisionOf(r) === "not" || r.list === "closed";
const title = (r: Role) => cleanTitle(r.role);

const hidden = (fields: Record<string, string | number>) =>
  Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
    .join("");

const roleHref = (r: Role) => `/jobs?${new URLSearchParams({ role: r.id }).toString()}`;

function matchesSearch(r: Role, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [r.company, r.role, r.notes, r.fitNote, r.recruiter, r.nextAction, r.researchNotes, r.location]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

/* ---------- interest control ---------- */

const DECISION_HINT: Record<Decision, string> = {
  interested: "Keep it and pursue it",
  undecided: "Still thinking about it",
  not: "Move to Archive · you can restore it",
};

/** One compact pill. Choosing an option submits right away. */
function interest(r: Role, ctx: EditContext, back: "list" | "detail" | "archive") {
  const d = decisionOf(r);
  const pill = `<span class="dot"></span>${esc(DECISIONS[d])}`;
  if (!ctx.editable || !r.edit) return `<span class="interest is-${d}"><span class="pill">${pill}</span></span>`;
  const options = (Object.keys(DECISIONS) as Decision[])
    .map(
      (k) =>
        `<button type="submit" name="decision" value="${k}" class="is-${k}${k === d ? " cur" : ""}"><span class="dot"></span><span>${esc(DECISIONS[k])}<small>${esc(DECISION_HINT[k])}</small></span></button>`,
    )
    .join("");
  return `<details class="interest is-${d}"><summary class="pill" aria-label="Interest: ${esc(DECISIONS[d])}">${pill}</summary><form method="post" action="/jobs" class="menu">${hidden({
    action: "decide",
    kind: r.edit.kind,
    id: r.edit.id,
    rev: r.edit.rev,
    back,
    csrf: ctx.csrf,
  })}${options}</form></details>`;
}

/* ---------- opportunities list ---------- */

function sortOpen(roles: Role[]) {
  const rank = (r: Role) => (decisionOf(r) === "interested" ? 0 : 1);
  const stepRank = (r: Role) => (r.ownNext && r.nextAction ? (firstDate(r.nextActionDate) ? 0 : 1) : 2);
  return [...roles].sort((a, b) => {
    const byDecision = rank(a) - rank(b);
    if (byDecision) return byDecision;
    const byStep = stepRank(a) - stepRank(b);
    if (byStep) return byStep;
    const da = a.ownNext ? firstDate(a.nextActionDate) : null;
    const db = b.ownNext ? firstDate(b.nextActionDate) : null;
    if (da && db && da !== db) return da < db ? -1 : 1;
    const byFit = (b.roleFit ?? -1) - (a.roleFit ?? -1);
    if (byFit) return byFit;
    return a.company.localeCompare(b.company);
  });
}

function nextStep(r: Role, today: string) {
  if (!r.nextAction) return `<div class="step none">No next step yet</div>`;
  const date = firstDate(r.nextActionDate);
  if (!r.ownNext) {
    return `<div class="step suggested"><span class="txt">${esc(r.nextAction)}</span><span class="tag">Suggested by the search</span></div>`;
  }
  const late = date && date < today;
  return `<div class="step">${esc(r.nextAction)}${
    date ? `<span class="when${late ? " late" : date === today ? " today" : ""}">${late ? "Overdue · " : ""}${esc(dayLabel(date, today))}</span>` : ""
  }</div>`;
}

function row(r: Role, ctx: EditContext, today: string, back: "list" | "archive", meta?: string) {
  const role = title(r);
  return `<div class="row" id="r-${esc(r.id)}">
<a class="who" href="${esc(roleHref(r))}"><span class="co">${esc(r.company)}</span>${role ? `<span class="role">${esc(role)}</span>` : ""}<span class="src">${esc(
    meta ?? SOURCE_SHORT[r.source ?? "automated"],
  )}</span></a>
${back === "list" ? nextStep(r, today) : `<div class="step"></div>`}
<div class="pick">${back === "list" || decisionOf(r) === "not" ? interest(r, ctx, back) : ""}</div>
</div>`;
}

function followUps(open: Role[], today: string) {
  const own = open.filter((r) => r.ownNext && r.nextAction);
  if (!own.length) return null;
  const dated = own
    .filter((r) => firstDate(r.nextActionDate))
    .sort((a, b) => (firstDate(a.nextActionDate)! < firstDate(b.nextActionDate)! ? -1 : 1));
  const undated = own.filter((r) => !firstDate(r.nextActionDate));
  const groups: { label: string; cls: string; items: Role[] }[] = [];
  for (const r of dated) {
    const d = firstDate(r.nextActionDate)!;
    const label = d < today ? "Overdue" : dayLabel(d, today);
    const cls = d < today ? "late" : d === today ? "today" : "";
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(r);
    else groups.push({ label, cls, items: [r] });
  }
  if (undated.length) groups.push({ label: "No date", cls: "", items: undated });
  const list = groups
    .map(
      (g) =>
        `<li class="day ${g.cls}">${esc(g.label)}</li>${g.items
          .map((r) => `<li class="item ${g.cls}"><a href="${esc(roleHref(r))}"><b>${esc(r.company)}</b><span>${esc(r.nextAction)}</span></a></li>`)
          .join("")}`,
    )
    .join("");
  const first = dated[0] ?? undated[0];
  const firstLabel = firstDate(first.nextActionDate) ? `${firstDate(first.nextActionDate)! < today ? "Overdue" : dayLabel(firstDate(first.nextActionDate)!, today)}: ` : "";
  return {
    count: own.length,
    aside: `<aside><h3 class="label">Follow-ups</h3><ul class="fu">${list}</ul><p class="aside-note">Only next steps you've set. The search's suggestions stay on each opportunity.</p></aside>`,
    mini: `<details class="fu-mini"><summary><span class="label">Follow-ups ${own.length}</span><span class="t">${esc(firstLabel)}<b>${esc(first.company)}</b>, ${esc(
      first.nextAction,
    )}</span></summary><ul class="fu">${list}</ul></details>`,
  };
}

function searchBox(q: Query, placeholder: string) {
  return `<form class="search" method="get" action="/jobs">${q.view !== "list" ? hidden({ view: q.view }) : ""}<input type="search" name="q" value="${esc(q.q)}" placeholder="${esc(placeholder)}" aria-label="Search"></form>${
    q.q ? `<p class="searching">Showing matches for “${esc(q.q)}” · <a href="/jobs${q.view !== "list" ? `?view=${q.view}` : ""}">Clear</a></p>` : ""
  }`;
}

/** The just-archived opportunity, shown where its row was, with Undo. */
function undoRow(r: Role, prev: Decision, ctx: EditContext) {
  return `<div class="row gone" id="r-${esc(r.id)}"><div class="who"><span class="co">${esc(r.company)}</span><span class="src">Moved to Archive</span></div><div class="step"></div><div class="pick">${
    ctx.editable && r.edit
      ? `<form method="post" action="/jobs" class="undo">${hidden({ action: "decide", kind: r.edit.kind, id: r.edit.id, rev: r.edit.rev, decision: prev, back: "list", csrf: ctx.csrf })}<button type="submit" class="btn quiet">Undo</button></form>`
      : ""
  }</div></div>`;
}

function listView(snapshot: Snapshot, roles: Role[], q: Query, ctx: EditContext) {
  const today = todayET();
  const open = roles.filter((r) => !archived(r));
  // Just archived from this list: keep a placeholder in its old spot so Undo is right there.
  const gone = q.notice === "archived" ? roles.find((r) => r.id === q.undo && decisionOf(r) === "not" && r.list !== "closed") : undefined;
  const prev: Decision = q.prev in DECISIONS && q.prev !== "not" ? (q.prev as Decision) : "undecided";
  const pool = gone ? [...open, { ...gone, decision: prev }] : open;
  const shown = sortOpen(pool.filter((r) => r.id === gone?.id || matchesSearch(r, q.q)));
  const yes = shown.filter((r) => decisionOf(r) === "interested");
  const maybe = shown.filter((r) => decisionOf(r) !== "interested");
  const fu = followUps(open, today);
  const group = (label: string, items: Role[]) =>
    items.length
      ? `<section class="group"><h3 class="label">${label} <span class="n">${items.filter((r) => r.id !== gone?.id).length}</span></h3>${items
          .map((r) => (r.id === gone?.id ? undoRow(gone, prev, ctx) : row(r, ctx, today, "list")))
          .join("")}</section>`
      : "";
  const generated = new Date(snapshot.generatedAt);
  const last = Number.isNaN(generated.getTime())
    ? ""
    : ` · last search ${generated.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" })}`;
  const interestedCount = open.filter((r) => decisionOf(r) === "interested").length;
  return `<div class="page list">
<main>
<div class="head"><h2>Opportunities</h2><p>${open.length} open${interestedCount ? ` · ${interestedCount} interested` : ""}${esc(last)}</p></div>
${fu?.mini ?? ""}
${searchBox(q, "Search companies, roles, notes")}
${shown.length ? `${group("Interested", yes)}${group("Undecided", maybe)}` : `<p class="empty">${q.q ? "Nothing matches." : "No open opportunities. Add one, or check the Archive."}</p>`}
<div class="foot"><span>From your Mon/Wed/Fri search, plus what you add here.</span><a href="/jobs?view=archive">Archive</a><a href="/jobs?view=search">Search activity</a></div>
</main>
${fu?.aside ?? `<aside><h3 class="label">Follow-ups</h3><p class="aside-note">Next steps you set with a date show up here.</p></aside>`}
</div>`;
}

/* ---------- archive ---------- */

function archiveView(roles: Role[], q: Query, ctx: EditContext) {
  const today = todayET();
  const all = roles.filter((r) => archived(r) && matchesSearch(r, q.q));
  const passed = all
    .filter((r) => decisionOf(r) === "not")
    .sort((a, b) => (lastDecisionAt(b) ?? "").localeCompare(lastDecisionAt(a) ?? ""));
  const closed = all.filter((r) => decisionOf(r) !== "not");
  const passedMeta = (r: Role) => {
    const at = lastDecisionAt(r);
    return `${SOURCE_SHORT[r.source ?? "automated"]}${at ? ` · passed ${shortDate(at)}` : ""}`;
  };
  const closedMeta = (r: Role) =>
    r.edit?.kind === "manual" || r.overridden?.includes("status") || !r.verification
      ? statusLabel(r.status)
      : r.verification.replace(/\s*\(.*$/, "").toLowerCase().replace(/^./, (c) => c.toUpperCase());
  const restored = q.notice === "restored" ? roles.find((r) => r.id === q.restored) : null;
  return `<div class="page narrow">
<div class="head"><h2>Archive</h2><p>Nothing here is deleted. Notes and history stay with each opportunity.</p></div>
${searchBox(q, "Search the archive")}
${restored ? `<div class="toast"><span><b>${esc(restored.company)}</b> is back in <a href="/jobs#r-${esc(restored.id)}">Opportunities</a>.</span></div>` : ""}
<section class="group"><h3 class="label">You passed <span class="n">${passed.length}</span></h3>${
    passed.length ? passed.map((r) => row(r, ctx, today, "archive", passedMeta(r))).join("") : `<p class="empty">Opportunities you mark Not interested land here.</p>`
  }</section>
<section class="group"><h3 class="label">Closed <span class="n">${closed.length}</span></h3><p class="group-note">Closed by the employer, withdrawn, or no longer posted.</p>${
    closed.length ? closed.map((r) => row(r, ctx, today, "archive", closedMeta(r))).join("") : `<p class="empty">Nothing closed.</p>`
  }</section>
</div>`;
}

const lastDecisionAt = (r: Role) => r.decisions?.[r.decisions.length - 1]?.at ?? null;

/* ---------- search activity ---------- */

function bullets(items: string[], empty: string) {
  return items.length ? `<ul class="plain">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p class="empty">${esc(empty)}</p>`;
}

function searchView(snapshot: Snapshot) {
  const generated = new Date(snapshot.generatedAt);
  const when = Number.isNaN(generated.getTime())
    ? snapshot.generatedAt
    : generated.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });
  const watch = snapshot.watchlist.length
    ? `<div class="scroll"><table><thead><tr><th>Company</th><th>Role / status</th><th class="num">Fit</th><th>Notes</th></tr></thead><tbody>${snapshot.watchlist
        .map(
          (w) =>
            `<tr><td class="co">${esc(w.company)}</td><td>${esc(w.role)}</td><td class="num">${w.score ?? "—"}</td><td>${esc(w.notes)}${
              w.verification ? ` <span class="faint">(${esc(w.verification)})</span>` : ""
            }</td></tr>`,
        )
        .join("")}</tbody></table></div>`
    : `<p class="empty">No watchlist companies.</p>`;
  return `<div class="page narrow">
<div class="head"><h2>Search activity</h2><p>What the Mon/Wed/Fri search reported. Last run ${esc(when)} ET. Nothing here sends anything.</p></div>
<details class="sect" open><summary><b>Do now</b><span>${snapshot.doNow.length}</span></summary>${bullets(snapshot.doNow, "Nothing.")}</details>
<details class="sect"><summary><b>Waiting</b><span>${snapshot.waiting.length}</span></summary>${bullets(snapshot.waiting, "Nothing waiting.")}</details>
<details class="sect"><summary><b>New / changed</b><span>${snapshot.newChanged.length}</span></summary>${bullets(snapshot.newChanged, "No recent changes.")}</details>
<details class="sect"><summary><b>Watchlist</b><span>${snapshot.watchlist.length}</span></summary><p class="group-note">Strong-fit companies without a current role, from aligned-companies.md.</p>${watch}</details>
<details class="sect"><summary><b>Passive / historical</b><span>${snapshot.passive.length}</span></summary>${bullets(snapshot.passive, "None.")}</details>
</div>`;
}

/* ---------- add ---------- */

const opt = (value: string, label: string, current: string) =>
  `<option value="${esc(value)}"${value === current ? " selected" : ""}>${esc(label)}</option>`;

function addView(ctx: EditContext) {
  if (!ctx.editable) return `<div class="page narrow"><p class="empty">Adding needs a signed-in session.</p></div>`;
  const sources = (["recruiter", "network", "interest"] as SourceKey[]).map((k) => opt(k, SOURCES[k], "recruiter")).join("");
  return `<div class="page narrow">
<a class="back" href="/jobs">← Opportunities</a>
<div class="head"><h2>Add an opportunity</h2><p>Only the company is required. Add the rest whenever you know it.</p></div>
<form class="sheet" method="post" action="/jobs">${hidden({ action: "add", csrf: ctx.csrf })}
<div class="two"><label>Company<input name="company" required maxlength="120" autofocus></label><label><span>Role <em>if known</em></span><input name="role" maxlength="160"></label></div>
<div class="two"><label>My interest<select name="decision">${(Object.keys(DECISIONS) as Decision[]).map((k) => opt(k, DECISIONS[k], "undecided")).join("")}</select></label><label>How it came up<select name="source">${sources}</select></label></div>
<label>My notes<textarea name="notes" rows="6" maxlength="4000" placeholder="What they said, what interests you, what you're unsure about"></textarea></label>
<div class="next"><label>Next step<input name="nextAction" maxlength="300" placeholder="e.g. Reply to the recruiter"></label><label>Date<input name="nextActionDate" type="date"></label></div>
<details class="extra"><summary>More details</summary>
<div class="two"><label>Recruiter / contact<input name="recruiter" maxlength="200"></label><label>Outreach source<select name="outreach">${outreachOptions(null)}</select></label></div>
<div class="two"><label>Conversation link<input name="outreachUrl" inputmode="url" maxlength="1000" placeholder="Email or LinkedIn thread, https://"></label><label>Job posting link<input name="url" inputmode="url" maxlength="500" placeholder="https://"></label></div>
<div class="two"><label>Compensation<input name="compensation" maxlength="160"></label><label>Location / work arrangement<input name="location" maxlength="160"></label></div>
</details>
<div class="actions"><button class="btn" type="submit">Add</button><a href="/jobs">Cancel</a></div>
</form>
</div>`;
}

/* ---------- detail ---------- */

const FIELD_LABELS: Record<ManualField, string> = {
  decision: "Interest",
  source: "How it came up",
  status: "Application status",
  url: "Job posting",
  location: "Location",
  compensation: "Compensation",
  recruiter: "Recruiter / contact",
  roleFit: "Role Fit",
  interest: "Interest estimate",
  notes: "Notes",
  nextAction: "Next step",
  nextActionDate: "Next-step date",
  outreach: "Outreach source",
  outreachUrl: "Conversation link",
  fitNote: "Role Fit assessment",
};

const shownValue = (k: ManualField, value: unknown) =>
  value === null || value === undefined || value === ""
    ? "empty"
    : k === "source"
      ? SOURCES[value as SourceKey] ?? String(value)
      : k === "status"
        ? statusLabel(String(value))
        : String(value);

function editedByHand(r: Role, ctx: EditContext) {
  const conflicts = new Map((r.conflicts ?? []).map((c) => [c.field, c.auto]));
  const rows = (r.overridden ?? [])
    .filter((k) => r.autoValues && k in r.autoValues && k !== "nextAction" && k !== "nextActionDate")
    .map((k) => {
      const revert =
        ctx.editable && r.edit?.kind === "overlay" && !r.orphan && r.overlayFields?.includes(k)
          ? `<form method="post" action="/jobs" class="inline">${hidden({ action: "revert", id: r.edit.id, rev: r.edit.rev, field: k, csrf: ctx.csrf })}<button type="submit" class="link">Use the search's</button></form>`
          : "";
      return `<li${conflicts.has(k) ? ` class="conflict"` : ""}><b>${esc(FIELD_LABELS[k])}</b>: yours is ${esc(shownValue(k, r[k as keyof Role]))}; the search ${
        conflicts.has(k) ? "has since changed it to" : "says"
      } ${esc(shownValue(k, r.autoValues?.[k]))}${revert}</li>`;
    });
  return rows.length ? `<h4>Changed by you</h4><ul class="plain small">${rows.join("")}</ul>` : "";
}

function personalForm(r: Role, ctx: EditContext) {
  const today = todayET();
  const action = r.edit?.kind === "manual" ? "edit-manual" : "edit";
  const own = r.ownNext ? r.nextAction : null;
  const suggestion = !r.ownNext && r.nextAction ? r.nextAction : null;
  const autoNext = r.autoValues?.nextAction ?? null;
  const date = r.ownNext ? firstDate(r.nextActionDate) : null;
  const disabled = ctx.editable && r.edit ? "" : " disabled";
  return `<form class="mine" method="post" action="/jobs">${
    r.edit ? hidden({ action, id: r.edit.id, rev: r.edit.rev, csrf: ctx.csrf }) : ""
  }
<div class="block"><span class="label">My notes <em>Thoughts, calls, questions</em></span>
<label class="fit-note"><span class="fit-head">${fitLine(r)}</span><textarea class="note small" name="fitNote" rows="3" maxlength="1500" placeholder="How it lines up: level, ownership, product, NYC hybrid, comp. Note what's unknown."${disabled}>${esc(r.fitNote)}</textarea></label>
<label class="fit-note"><span class="fit-head">Notes</span><textarea class="note" name="notes" rows="8" maxlength="4000" placeholder="What you think, what was discussed, what you still want to know"${disabled}>${esc(r.notes)}</textarea></label></div>
<div class="block"><span class="label">Next step</span>
<div class="next"><input name="nextAction" maxlength="300" value="${esc(own)}" placeholder="${esc(suggestion ? "What will you do next?" : "e.g. Ask the recruiter about NYC hybrid expectations")}" aria-label="Next step"${disabled}><input name="nextActionDate" type="date" value="${esc(date)}" aria-label="Next-step date"${disabled}></div>
${
  suggestion
    ? `<p class="suggest">The search suggests: <i>${esc(suggestion)}</i>${firstDate(r.nextActionDate) ? ` · ${esc(dayLabel(firstDate(r.nextActionDate)!, today))}` : ""}</p>`
    : r.ownNext && typeof autoNext === "string" && autoNext !== own
      ? `<p class="suggest">The search suggested: <i>${esc(autoNext)}</i></p>`
      : ""
}
</div>
${ctx.editable && r.edit ? `<div class="actions"><button class="btn" type="submit">Save</button><span class="faint">Saved separately from the search, which never overwrites it.</span></div>` : ""}
</form>`;
}

function detailsForm(r: Role, ctx: EditContext) {
  const editable = ctx.editable && !!r.edit;
  const action = r.edit?.kind === "manual" ? "edit-manual" : "edit";
  const statuses = (STATUSES as readonly string[]).includes(r.status) ? [...STATUSES] : [r.status, ...STATUSES];
  const autoFit = r.roleFit !== null && !r.manualFit;
  const f = (label: string, input: string, value: string | null) =>
    `<div><dt>${esc(label)}</dt><dd>${editable ? input : value ? esc(value) : `<span class="faint">—</span>`}</dd></div>`;
  const text = (name: string, value: string | null | undefined, max: number, extra = "") =>
    `<input name="${name}" value="${esc(value)}" maxlength="${max}"${extra}>`;
  const manual = r.edit?.kind === "manual";
  const summary = [statusLabel(r.status), r.compensation, r.location].filter(Boolean).join(" · ");
  const open = (r.conflicts?.length ?? 0) > 0 ? " open" : "";
  return `<details class="sect" id="details"${open}><summary><b>Details</b><span>${esc(summary)}</span></summary>
<form method="post" action="/jobs">${r.edit ? hidden({ action, id: r.edit.id, rev: r.edit.rev, csrf: ctx.csrf }) : ""}
<dl class="facts">
${manual ? f("Company", text("company", r.company, 120, " required"), r.company) + f("Role", text("role", r.role, 160), r.role) : ""}
${f("Application status", `<select name="status">${statuses.map((s) => opt(s, statusLabel(s), r.status)).join("")}</select>`, statusLabel(r.status))}
${f("How it came up", `<select name="source">${(Object.keys(SOURCES) as SourceKey[]).map((k) => opt(k, SOURCES[k], r.source ?? "automated")).join("")}</select>`, SOURCES[r.source ?? "automated"])}
${f("Recruiter / contact", text("recruiter", r.recruiter, 200, ` placeholder="Name, email or LinkedIn"`), r.recruiter ?? null)}
${f("Outreach source", `<select name="outreach">${outreachOptions(r.outreach ?? null)}</select>`, r.outreach ? OUTREACH[r.outreach] : null)}
${f("Conversation link", text("outreachUrl", r.outreachUrl, 1000, ` inputmode="url" placeholder="Email or LinkedIn thread, https://"`), r.outreachUrl ?? null)}
${f("Job posting", text("url", r.url, 500, ` inputmode="url" placeholder="https://"`), r.url)}
${f("Compensation", text("compensation", r.compensation, 160), r.compensation)}
${f("Location", text("location", r.location, 160), r.location)}
${autoFit ? "" : f("Role Fit", `<input name="roleFit" type="number" min="0" max="100" value="${esc(r.roleFit)}" class="num" placeholder="0–100">`, r.roleFit === null ? null : String(r.roleFit))}
</dl>
${editable ? `<div class="actions"><button class="btn quiet" type="submit">Save details</button></div>` : ""}
</form>
${editedByHand(r, ctx)}
</details>`;
}

function fromSearch(r: Role) {
  const hasResearch =
    (r.roleFit !== null && !r.manualFit) || r.verification || r.whyItFits || r.concerns || r.caseStudy || r.researchNotes || r.files.length;
  if (!hasResearch) return "";
  const tier = tierOf(r.roleFit);
  const state = r.verification?.match(/^(VERIFIED OPEN|PROBABLY OPEN|UNVERIFIED|PROBABLY CLOSED|CLOSED|WITHDRAWN|REJECTED)/i)?.[1] ?? null;
  const pretty = (s: string) => s.toLowerCase().replace(/^./, (c) => c.toUpperCase());
  const summary = [
    r.roleFit !== null && !r.manualFit ? `Role Fit ${r.roleFit}` : "",
    state ? pretty(state) : "",
    r.researchNotes || r.whyItFits ? "research notes" : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const para = (label: string, value: string | null) => (value ? `<h4>${esc(label)}</h4><p>${esc(value)}</p>` : "");
  const m = r.materials;
  const mats = [
    ["Résumé", m.resume],
    ["Cover letter", m.cover],
    ["Outreach", m.outreach],
  ]
    .map(([l, s]) => `${l}: ${s.toLowerCase()}${s === "Draft ready" ? " (awaiting your review)" : ""}`)
    .join(" · ");
  const files = r.files
    .filter((f) => f.exists)
    .map((f) => `<details class="file"><summary><code>${esc(f.name)}</code></summary><pre>${esc(f.content ?? "")}</pre></details>`)
    .join("");
  return `<details class="sect"><summary><b>From the search</b><span>${esc(summary)}</span></summary>
<div class="research">
<div class="scores">${
    r.roleFit !== null && !r.manualFit ? `<div><b>${r.roleFit}</b>Role Fit${tier ? ` · ${esc(pretty(tier))}` : ""}</div>` : ""
  }${r.interest !== null ? `<div><b>${r.interest}/10</b>Interest estimate</div>` : ""}${state ? `<div><b>${esc(pretty(state).replace(/ open$/, ""))}</b>${esc(r.verification!.replace(/^[A-Z ]+\s*/, "").replace(/^\((.*)\)$/, "$1").slice(0, 80) || "Verification")}</div>` : ""}</div>
${para("Why it fits", r.whyItFits)}${para("Concerns", r.concerns)}${para("Lead with", r.caseStudy)}${para("Research notes", r.researchNotes ?? null)}
${r.exception ? `<p class="faint">Listed under the Cash App / Block confirmed-interest exception.</p>` : ""}
<h4>Materials</h4><p>${esc(mats)}</p>${files}
${r.materialsPath ? `<p class="faint">Folder: <code>${esc(r.materialsPath)}</code></p>` : ""}
</div>
</details>`;
}

function history(r: Role) {
  const items: [string, string][] = [];
  for (const d of r.decisions ?? []) items.push([d.at.slice(0, 10), `Marked ${DECISIONS[d.decision].toLowerCase()}`]);
  const add = (date: string | null | undefined, text: string) => {
    const d = firstDate(date);
    if (d) items.push([d, text]);
  };
  add(r.discovered, r.edit?.kind === "manual" ? "Added by you" : "Found by the search");
  add(r.applied, "Applied");
  add(r.lastActivity, `Last activity${r.lastActivity?.replace(/^\d{4}-\d{2}-\d{2}\s*/, "") ? ` ${r.lastActivity.replace(/^\d{4}-\d{2}-\d{2}\s*/, "")}` : ""}`);
  if (!items.length) return "";
  items.sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0));
  const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return `<details class="sect"><summary><b>History</b><span>${esc(items.length)} ${items.length === 1 ? "entry" : "entries"}</span></summary><ul class="history">${items
    .map(([d, t]) => `<li><time>${esc(fmt(d))}</time><span>${esc(t)}</span></li>`)
    .join("")}</ul></details>`;
}

function possibleDuplicate(r: Role, ctx: EditContext) {
  if (!r.possible?.length || r.edit?.kind !== "manual") return "";
  return `<div class="callout"><p><b>Is this the same as a role the search found?</b> Nothing merges unless you say so.</p><ul class="plain small">${r.possible
    .map(
      (p) =>
        `<li>${esc(p.company)} — ${esc(cleanTitle(p.role))}${
          ctx.editable
            ? (["link", "not-same"] as const)
                .map(
                  (a) =>
                    `<form method="post" action="/jobs" class="inline">${hidden({ action: a, id: r.edit!.id, rev: r.edit!.rev, target: p.id, csrf: ctx.csrf })}<button type="submit" class="link">${
                      a === "link" ? "Same role: merge" : "Not the same"
                    }</button></form>`,
                )
                .join("")
            : ""
        }</li>`,
    )
    .join("")}</ul></div>`;
}

function outreachOptions(current: OutreachKey | null) {
  return `${opt("", "Not set", current ?? "")}${(Object.keys(OUTREACH) as OutreachKey[]).map((k) => opt(k, OUTREACH[k], current ?? "")).join("")}`;
}

/** "Role Fit 82 · Strong prospect" from the one roleFit value (also editable in Details when it's yours). */
function fitLine(r: Role) {
  if (r.roleFit === null) return `Role Fit <span class="faint">Not yet scored</span>`;
  const tier = tierOf(r.roleFit);
  const pretty = tier ? ` · ${tier.toLowerCase().replace(/^./, (c) => c.toUpperCase())}` : "";
  return `Role Fit <b>${r.roleFit}</b>${esc(pretty)}${r.manualFit ? ` <span class="faint">· your score</span>` : ""}`;
}

/** Role Fit and where to reply, right under the title. */
function glance(r: Role) {
  const parts: string[] = [];
  if (r.outreach) parts.push(esc(OUTREACH[r.outreach]));
  else parts.push(`<span class="faint">${r.recruiter || r.edit?.kind === "manual" || (r.source && r.source !== "automated") ? "Not recorded" : "None, found by the search"}</span>`);
  if (r.recruiter) parts.push(esc(r.recruiter));
  if (r.outreachUrl) parts.push(`<a href="${esc(r.outreachUrl)}" rel="noreferrer noopener" target="_blank">Open conversation ↗</a>`);
  return `<dl class="glance"><div><dt>Role Fit</dt><dd>${fitLine(r).replace(/^Role Fit /, "")}</dd></div><div><dt>Outreach</dt><dd>${parts.join(" · ")}</dd></div></dl>`;
}

function detailView(roles: Role[], id: string, ctx: EditContext) {
  const r = roles.find((x) => x.id === id);
  if (!r) return `<div class="page narrow"><a class="back" href="/jobs">← Opportunities</a><p class="empty" style="margin-top:24px">That opportunity isn't here any more.</p></div>`;
  const isArchived = archived(r);
  const role = title(r);
  const meta = [
    r.edit?.kind === "manual" ? SOURCES[r.source ?? "recruiter"] : r.source && r.source !== "automated" ? SOURCES[r.source] : "From the search",
    firstDate(r.discovered) ? `${r.edit?.kind === "manual" ? "added" : "found"} ${shortDate(`${firstDate(r.discovered)}T12:00:00Z`)}` : "",
  ]
    .filter(Boolean)
    .map((s) => esc(s))
    .join(" · ");
  return `<div class="page narrow">
<a class="back" href="${isArchived ? "/jobs?view=archive" : "/jobs"}">← ${isArchived ? "Archive" : "Opportunities"}</a>
<div class="title"><div><h2>${esc(r.company)}</h2>${role ? `<div class="role">${esc(role)}</div>` : ""}${glance(r)}<p class="meta">${meta}${
    r.url ? ` · <a href="${esc(r.url)}" rel="noreferrer noopener" target="_blank">View posting ↗</a>` : ""
  }${isArchived ? ` · <span>${decisionOf(r) === "not" ? "In Archive (you passed)" : `In Archive (${esc(statusLabel(r.status).toLowerCase())})`}</span>` : ""}</p></div>${interest(r, ctx, "detail")}</div>
${r.orphan ? `<div class="callout"><p>This role is no longer in the search's results (renamed or removed in pipeline.md). Everything you entered is kept.</p></div>` : ""}
${r.conflicts?.length ? `<div class="callout"><p>The search has changed something you edited. <a href="#details">Review in Details</a></p></div>` : ""}
${possibleDuplicate(r, ctx)}
${personalForm(r, ctx)}
<div class="more">${detailsForm(r, ctx)}${fromSearch(r)}${history(r)}</div>
</div>`;
}

/* ---------- page ---------- */

const STYLE = `
:root {
  color-scheme: light dark;
  --surface: #ffffff; --raised: #f5f4f1; --line: #e2e1dc; --text: #111110; --muted: #5c5b57; --faint: #8f8e88; --link: #1f63b8;
  --ok: #17663a; --ok-bg: #e6f3ea; --late: #a33b1f;
}
@media (prefers-color-scheme: dark) {
  :root { --surface: #171716; --raised: #212120; --line: #343431; --text: #f4f3ef; --muted: #a9a8a0; --faint: #7a7973; --link: #7fb2f2;
    --ok: #74d99a; --ok-bg: #173323; --late: #f0937a; }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface); color: var(--text); font: 16px/1.5 system-ui, -apple-system, sans-serif; -webkit-text-size-adjust: 100%; }
a { color: inherit; }
p { margin: 0; }
button, input, textarea, select { font: inherit; color: inherit; }
input, textarea, select { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font-size: 15px; width: 100%; }
input:focus, textarea:focus, select:focus { outline: none; border-color: var(--muted); }
input:disabled, textarea:disabled { background: var(--raised); color: var(--muted); }
.label { font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--muted); }
.label em { font-style: normal; text-transform: none; letter-spacing: 0; font-weight: 400; color: var(--faint); font-size: 12px; margin-left: 6px; }
.faint { color: var(--faint); }
.empty { color: var(--muted); font-size: 15px; padding: 18px 0; }
.btn { display: inline-block; border: 1px solid var(--text); background: var(--text); color: var(--surface); border-radius: 999px; padding: 7px 18px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; text-decoration: none; }
.btn.quiet { background: transparent; color: var(--text); border-color: var(--line); }
button.link { border: 0; background: none; padding: 0; color: var(--link); text-decoration: underline; cursor: pointer; font-size: inherit; }
form.inline { display: inline; margin-left: 10px; }
code { font-size: 13px; overflow-wrap: anywhere; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; background: var(--raised); padding: 12px; border-radius: 8px; font-size: 13px; }

/* header */
.top { border-bottom: 1px solid var(--line); }
.bar { max-width: 1120px; margin: 0 auto; padding: 16px 32px; display: flex; align-items: center; gap: 28px; }
.bar h1 { font-size: 17px; margin: 0; font-weight: 700; letter-spacing: -.01em; }
.bar h1 a { text-decoration: none; }
.bar nav { display: flex; gap: 22px; font-size: 14px; }
.bar nav a { text-decoration: none; color: var(--muted); padding: 4px 0; white-space: nowrap; }
.bar nav a.on { color: var(--text); font-weight: 600; box-shadow: inset 0 -2px 0 var(--text); }
.bar nav .n { color: var(--faint); font-weight: 400; margin-left: 3px; }
.bar .grow { flex: 1; }
.bar form { margin: 0; }
.signout { font-size: 13px; color: var(--muted); background: none; border: 0; cursor: pointer; padding: 0; }

/* pages */
.page { max-width: 1120px; margin: 0 auto; padding: 36px 32px 80px; }
.page.list { display: grid; grid-template-columns: minmax(0, 1fr) 270px; gap: 56px; align-items: start; }
.page.narrow { max-width: 760px; }
.head h2 { font-size: 26px; letter-spacing: -.02em; margin: 0; font-weight: 700; }
.head p { margin-top: 4px; color: var(--muted); font-size: 14px; }
.back { font-size: 14px; color: var(--muted); text-decoration: none; display: inline-block; margin-bottom: 22px; }
.back:hover { color: var(--text); }
form.search { margin-top: 22px; }
form.search input { padding: 10px 14px 10px 38px; border-radius: 10px; background: var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238f8e88' stroke-width='2'%3E%3Ccircle cx='7' cy='7' r='5'/%3E%3Cpath d='m11 11 3.5 3.5'/%3E%3C/svg%3E") 14px 50% no-repeat; }
.searching { margin-top: 10px; font-size: 13px; color: var(--muted); }
.notice, .toast { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; font-size: 14px; color: var(--muted); }
.toast b { color: var(--text); font-weight: 600; }
.toast form { display: inline; }
.notice.error { color: var(--late); }
.page.banner { padding-top: 20px; padding-bottom: 0; }
.page.banner .notice { margin-top: 0; }
.page.banner + .page { padding-top: 20px; }

/* opportunity rows */
.group { margin-top: 34px; }
.group h3 { margin: 0 0 4px; display: flex; gap: 8px; align-items: baseline; }
.group h3 .n { font-size: 12px; color: var(--faint); font-weight: 500; letter-spacing: 0; }
.group-note { font-size: 13px; color: var(--faint); margin: 2px 0 6px; }
.row { position: relative; display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr) 140px; gap: 24px; align-items: start; padding: 18px 0; border-top: 1px solid var(--line); }
.row:hover { background: linear-gradient(90deg, transparent, var(--raised) 6%, var(--raised) 94%, transparent); }
.row:target { background: var(--raised); }
.row.gone { align-items: center; }
.row.gone .co { color: var(--faint); }
.row.gone .btn { padding: 4px 14px; font-size: 13px; }
.who { text-decoration: none; display: flex; flex-direction: column; min-width: 0; }
.who::after { content: ""; position: absolute; inset: 0; }
.co { font-size: 18px; font-weight: 650; letter-spacing: -.01em; line-height: 1.3; }
.role { font-size: 15px; line-height: 1.4; margin-top: 2px; }
.who .src { font-size: 12px; color: var(--faint); margin-top: 6px; }
.step { font-size: 14px; line-height: 1.45; color: var(--muted); padding-top: 3px; }
.step .when { display: block; font-size: 12px; color: var(--faint); margin-top: 2px; }
.step .when.today { color: var(--text); font-weight: 600; }
.step .when.late { color: var(--late); }
.step.suggested .txt { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-style: italic; color: var(--faint); font-size: 13px; }
.step.suggested .tag { display: block; font-size: 11px; color: var(--faint); margin-top: 2px; }
.step.none { color: var(--faint); font-size: 13px; }
.pick { justify-self: end; position: relative; z-index: 1; }
.pick:has(.interest[open]), .title:has(.interest[open]) { z-index: 6; }
.title { position: relative; }
.foot { margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 13px; color: var(--muted); display: flex; gap: 22px; flex-wrap: wrap; }

/* interest control */
.interest { position: relative; display: inline-block; }
.interest summary { list-style: none; }
.interest summary::-webkit-details-marker { display: none; }
.pill { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 500; padding: 4px 10px 4px 9px; border-radius: 999px; border: 1px solid var(--line); white-space: nowrap; user-select: none; color: var(--muted); background: var(--surface); }
summary.pill { cursor: pointer; }
summary.pill::after { content: ""; width: 5px; height: 5px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg) translateY(-2px); margin-left: 2px; opacity: .6; }
.dot { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--faint); flex: none; }
.interest.is-interested .pill { color: var(--ok); border-color: var(--ok-bg); background: var(--ok-bg); }
.is-interested .dot { background: var(--ok); border-color: var(--ok); }
.is-not .dot { background: linear-gradient(135deg, transparent 43%, var(--faint) 43%, var(--faint) 57%, transparent 57%); }
.menu { position: absolute; right: 0; top: calc(100% + 6px); z-index: 5; width: 250px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,.12); padding: 6px; }
.menu button { display: flex; width: 100%; align-items: flex-start; gap: 10px; padding: 8px 10px; border: 0; background: none; border-radius: 6px; text-align: left; cursor: pointer; font-size: 14px; }
.menu button .dot { margin-top: 6px; }
.menu button:hover, .menu button:focus-visible, .menu button.cur { background: var(--raised); outline: none; }
.menu small { display: block; color: var(--muted); font-size: 12px; }
.menu .cur::after { content: "✓"; margin-left: auto; color: var(--muted); }

/* follow-ups */
aside { position: sticky; top: 24px; padding-top: 6px; }
aside h3 { margin: 0 0 14px; }
.fu { list-style: none; margin: 0; padding: 0; }
.fu .day { font-size: 12px; color: var(--muted); margin: 16px 0 6px; }
.fu .day:first-child { margin-top: 0; }
.fu .day.today { color: var(--text); font-weight: 600; }
.fu .day.late { color: var(--late); font-weight: 600; }
.fu .item a { display: block; padding: 6px 0 6px 12px; border-left: 2px solid var(--line); font-size: 14px; line-height: 1.4; text-decoration: none; }
.fu .item.today a { border-left-color: var(--text); }
.fu .item.late a { border-left-color: var(--late); }
.fu .item b { display: block; font-weight: 600; font-size: 13px; }
.fu .item span { color: var(--muted); }
.fu .item a:hover span { color: var(--text); }
.aside-note { font-size: 12px; color: var(--faint); margin-top: 18px; line-height: 1.45; }
.fu-mini { display: none; margin-top: 16px; border: 1px solid var(--line); border-radius: 10px; font-size: 14px; }
.fu-mini summary { list-style: none; padding: 11px 14px; display: flex; gap: 8px; align-items: baseline; cursor: pointer; }
.fu-mini summary::-webkit-details-marker { display: none; }
.fu-mini summary .label { flex: none; }
.fu-mini summary .t { color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.fu-mini summary b { color: var(--text); font-weight: 600; }
.fu-mini summary::after { content: "›"; margin-left: auto; color: var(--faint); }
.fu-mini[open] summary::after { transform: rotate(90deg); }
.fu-mini .fu { padding: 0 14px 14px; }

/* detail */
.title { display: flex; gap: 20px; align-items: flex-start; justify-content: space-between; }
.title h2 { font-size: 34px; line-height: 1.1; letter-spacing: -.025em; margin: 0; font-weight: 700; }
.title .role { font-size: 18px; color: var(--muted); margin-top: 6px; }
.title .meta { margin-top: 10px; font-size: 13px; color: var(--faint); }
.glance { margin: 14px 0 0; display: grid; gap: 4px; font-size: 15px; }
.glance div { display: flex; gap: 10px; align-items: baseline; }
.glance dt { width: 76px; flex: none; font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--muted); }
.glance dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.glance b { font-weight: 650; }
.glance a { color: var(--link); }
.fit-note { display: block; margin-top: 10px; }
.fit-head { display: block; font-size: 14px; color: var(--muted); }
.fit-head b { color: var(--text); font-weight: 650; }
.note.small { min-height: 72px; font-size: 15px; padding: 12px 16px; margin-top: 6px; }
.fit-note + .fit-note { margin-top: 16px; }
.fit-note .note { margin-top: 6px; }
.title .meta a { color: var(--faint); }
.callout { margin-top: 24px; padding: 12px 16px; border-radius: 10px; background: var(--raised); font-size: 14px; }
.callout a { color: var(--link); }
.callout ul { margin-top: 6px; }
form.mine { margin-top: 36px; }
.block { display: block; }
.block + .block { margin-top: 30px; }
.note { display: block; margin-top: 10px; border-color: transparent; border-radius: 10px; background: var(--raised); padding: 16px 18px; font-size: 16px; line-height: 1.6; resize: vertical; min-height: 180px; field-sizing: content; }
.note:hover { border-color: var(--line); }
.note:focus { background: var(--surface); }
.next { margin-top: 10px; display: grid; grid-template-columns: minmax(0, 1fr) 170px; gap: 10px; }
.mine .next input { padding: 12px 14px; font-size: 16px; border-radius: 10px; }
.mine .next input[name=nextAction] { font-weight: 600; }
.mine .next input[name=nextAction]::placeholder { font-weight: 400; }
.suggest { margin-top: 8px; font-size: 13px; color: var(--faint); }
.suggest i { color: var(--muted); }
.actions { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; font-size: 13px; }
.actions a { color: var(--muted); font-size: 14px; }

.more { margin-top: 52px; border-top: 1px solid var(--line); }
.sect { border-bottom: 1px solid var(--line); }
.sect > summary { list-style: none; cursor: pointer; padding: 16px 0; display: flex; align-items: baseline; gap: 12px; }
.sect > summary::-webkit-details-marker { display: none; }
.sect > summary::before { content: "›"; color: var(--faint); width: 10px; display: inline-block; flex: none; transition: transform .15s; }
.sect[open] > summary::before { transform: rotate(90deg); }
.sect > summary b { font-size: 15px; font-weight: 600; flex: none; }
.sect > summary span { font-size: 13px; color: var(--faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.sect > :not(summary) { margin-left: 22px; }
.sect > :last-child { margin-bottom: 22px; }
.facts { margin: 0; display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 8px 20px; font-size: 14px; }
.facts div { display: contents; }
.facts dt { color: var(--muted); padding-top: 7px; }
.facts dd { margin: 0; overflow-wrap: anywhere; }
.facts input, .facts select { font-size: 14px; padding: 6px 9px; }
.facts input.num { width: 110px; }
.sect h4 { font-size: 13px; margin: 18px 0 4px; font-weight: 600; }
.research { font-size: 14px; color: var(--muted); line-height: 1.55; }
.research h4 { color: var(--text); }
.scores { display: flex; flex-wrap: wrap; gap: 14px 30px; }
.scores div { font-size: 13px; }
.scores b { display: block; font-size: 20px; color: var(--text); font-weight: 600; font-variant-numeric: tabular-nums; }
details.file summary { cursor: pointer; font-size: 13px; padding: 4px 0; }
.plain { list-style: none; margin: 0; padding: 0; }
.plain li { padding: 9px 0; border-top: 1px solid var(--line); font-size: 15px; overflow-wrap: break-word; }
.plain li:first-child { border-top: 0; }
.plain.small li { font-size: 13px; color: var(--muted); padding: 6px 0; border: 0; }
.plain.small b { color: var(--text); font-weight: 600; }
.plain .conflict b { color: var(--late); }
.history { list-style: none; margin: 0; padding: 0; font-size: 13px; color: var(--muted); }
.history li { padding: 4px 0; display: grid; grid-template-columns: 110px 1fr; gap: 8px; }
.history time { color: var(--faint); }

/* search activity */
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; color: var(--muted); }
th, td { text-align: left; padding: 7px 14px 7px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
td.co { color: var(--text); font-weight: 600; }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* add */
.sheet { margin-top: 28px; display: grid; gap: 18px; }
.sheet label { display: grid; gap: 6px; font-size: 13px; font-weight: 600; }
.sheet label em { font-style: normal; font-weight: 400; color: var(--faint); }
.sheet .two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.sheet .next { margin-top: 0; }
.sheet textarea { min-height: 130px; resize: vertical; line-height: 1.55; }
.extra summary { cursor: pointer; font-size: 14px; color: var(--muted); }
.extra[open] summary { margin-bottom: 14px; }
.extra .two + .two { margin-top: 18px; }

/* sign in / messages */
form.login { display: grid; gap: 12px; margin-top: 24px; max-width: 320px; }
.error { color: var(--late); }

@media (max-width: 900px) {
  .page.list { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .page.list aside { display: none; }
  .fu-mini { display: block; }
}
@media (max-width: 700px) {
  .bar { padding: 14px 16px; flex-wrap: wrap; gap: 12px 20px; }
  .bar nav { order: 3; width: 100%; }
  .signout { display: none; }
  .page { padding: 24px 16px 56px; }
  .row { grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; }
  .row .step { grid-column: 1; grid-row: 2; padding-top: 0; }
  .row .pick { grid-row: 1; grid-column: 2; }
  .title { flex-direction: column; gap: 14px; }
  .title h2 { font-size: 28px; }
  .next, .sheet .two { grid-template-columns: 1fr; }
  .facts { grid-template-columns: 1fr; gap: 2px; }
  .facts dd { margin-bottom: 10px; }
  .sect > :not(summary) { margin-left: 0; }
  .history li { grid-template-columns: 96px 1fr; }
}
`;

/** Closes other interest menus when one opens, and all of them on an outside click or Escape. */
const SCRIPT = `
// Interest changes save in the background and swap the page in place, so you stay where you were.
// Without this script the forms still work as normal posts.
document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement) || !form.matches("form.menu, form.undo")) return;
  e.preventDefault();
  const data = new URLSearchParams(new FormData(form));
  const button = e.submitter;
  if (button && button.name) data.set(button.name, button.value);
  const y = window.scrollY;
  try {
    // getAttribute: a field named "action" shadows form.action
    const res = await fetch(form.getAttribute("action") || "/jobs", { method: "POST", body: data, credentials: "same-origin" });
    if (!res.ok) throw new Error(String(res.status));
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const script = document.body.querySelector("script");
    [...document.body.children].forEach((n) => n !== script && n.remove());
    [...doc.body.children].forEach((n) => n.tagName !== "SCRIPT" && document.body.insertBefore(document.importNode(n, true), script));
    document.title = doc.title;
    history.replaceState(null, "", res.url);
    window.scrollTo(0, y);
  } catch {
    // Fall back to an ordinary post (form.submit is shadowed the same way, so call the prototype's).
    if (button && button.name) {
      const input = document.createElement("input");
      input.type = "hidden"; input.name = button.name; input.value = button.value;
      form.append(input);
    }
    HTMLFormElement.prototype.submit.call(form);
  }
});
document.addEventListener("toggle", (e) => {
  const d = e.target;
  if (d.classList && d.classList.contains("interest") && d.open)
    document.querySelectorAll("details.interest[open]").forEach((x) => x !== d && x.removeAttribute("open"));
}, true);
document.addEventListener("click", (e) => {
  document.querySelectorAll("details.interest[open]").forEach((x) => !x.contains(e.target) && x.removeAttribute("open"));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll("details.interest[open]").forEach((x) => x.removeAttribute("open"));
});
`;

function page(pageTitle: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(pageTitle)}</title>
<style>${STYLE}</style>
</head>
<body>${body}<script>${SCRIPT}</script></body>
</html>`;
}

function header(active: View | "detail", archiveCount: number, signOut: boolean, editable: boolean) {
  const link = (view: View, label: string, extra = "") =>
    `<a href="/jobs${view === "list" ? "" : `?view=${view}`}"${active === view || (view === "list" && active === "detail") ? ` class="on"` : ""}>${label}${extra}</a>`;
  return `<div class="top"><div class="bar">
<h1><a href="/jobs">Job search</a></h1>
<nav>${link("list", "Opportunities")}${link("archive", "Archive", archiveCount ? `<span class="n">${archiveCount}</span>` : "")}${link("search", "Search activity")}</nav>
<span class="grow"></span>
${editable ? `<a class="btn" href="/jobs?view=add">+ Add opportunity</a>` : ""}
${signOut ? `<form method="post" action="/jobs"><input type="hidden" name="logout" value="1"><button type="submit" class="signout">Sign out</button></form>` : ""}
</div></div>`;
}

const NOTICES: Record<string, string> = {
  added: "Added.",
  saved: "Saved.",
  merged: "This matches a role the search found, so they're one opportunity now. Everything you entered is kept.",
  possible: "Added. The search found something similar; confirm below whether it's the same role.",
  reverted: "Back to the search's value.",
  stale: "Not saved: this was changed somewhere else (another tab or device) after you opened it. These are the current values; make your change again.",
};

export function renderMessage(text: string) {
  return page("Job search", `<div class="page narrow"><div class="head"><h2>Job search</h2></div><p class="empty">${esc(text)}</p></div>`);
}

export function renderLogin(error = "") {
  return page(
    "Job search · Sign in",
    `<div class="page narrow"><div class="head"><h2>Job search</h2></div>
<form class="login" method="post" action="/jobs">
<label for="password" class="label">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
${error ? `<p class="error">${esc(error)}</p>` : ""}
<div><button class="btn" type="submit">Sign in</button></div>
</form></div>`,
  );
}

export function renderJobs(opts: {
  snapshot: Snapshot | null;
  query: Query;
  signOut: boolean;
  csrf?: string;
  editable?: boolean;
  manualError?: boolean;
}) {
  const { snapshot, query, signOut } = opts;
  const ctx: EditContext = { csrf: opts.csrf ?? "", editable: Boolean(opts.editable && !opts.manualError) };
  if (!snapshot) {
    return renderMessage("No snapshot yet. Run npm run jobs:sync on your Mac to publish your job search here.");
  }
  const roles = snapshot.roles;
  const archiveCount = roles.filter(archived).length;
  const active = query.role ? "detail" : query.view;
  const notice = NOTICES[query.notice]
    ? `<p class="notice${query.notice === "stale" ? " error" : ""}">${esc(NOTICES[query.notice])}</p>`
    : "";
  const warn = opts.manualError
    ? `<p class="notice error">Couldn't load your own notes and decisions, so editing is off. The search's data below is current.</p>`
    : "";
  const body = query.role
    ? detailView(roles, query.role, ctx)
    : query.view === "archive"
      ? archiveView(roles, query, ctx)
      : query.view === "search"
        ? searchView(snapshot)
        : query.view === "add"
          ? addView(ctx)
          : listView(snapshot, roles, query, ctx);
  const wide = !query.role && query.view === "list";
  const banner = notice || warn ? `<div class="page${wide ? "" : " narrow"} banner">${warn}${notice}</div>` : "";
  const name = query.role ? roles.find((r) => r.id === query.role)?.company : null;
  return page(name ? `${name} · Job search` : "Job search", `${header(active, archiveCount, signOut, ctx.editable)}${banner}${body}`);
}
