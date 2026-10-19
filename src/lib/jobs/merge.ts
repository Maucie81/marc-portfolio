import {
  END_STATUSES,
  SOURCES,
  STATUSES,
  type ManualData,
  type ManualField,
  type ManualFields,
  type ManualRole,
  type Overlay,
  type Role,
  type SourceKey,
} from "./types";

/**
 * Combines the automated snapshot (owned by jobs:sync, replaced wholesale on every
 * publish) with manual data (owned by the dashboard, stored separately) at render
 * time. Nothing here writes anywhere: the snapshot is never modified, so an
 * automated publish can't erase manual work and manual work can't corrupt the
 * routine's data.
 *
 * Layers, lowest first: snapshot role → merged manual entry → overlay.
 * An automated Role Fit is never replaced; a manual one only fills a missing score.
 */

export const MANUAL_KEYS: ManualField[] = [
  "source",
  "status",
  "url",
  "location",
  "compensation",
  "recruiter",
  "roleFit",
  "interest",
  "notes",
  "nextAction",
  "nextActionDate",
];

type Value = string | number | null;

/* ---------- matching ---------- */

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

export function normCompany(s: string) {
  const w = words(s);
  if (w[0] === "the") w.shift();
  while (w.length > 1 && /^(inc|llc|ltd|corp|corporation|co|company|plc|gmbh)$/.test(w[w.length - 1])) w.pop();
  return w.join(" ");
}

export function normTitle(s: string) {
  return words(s)
    .map((w) => (w === "sr" ? "senior" : w))
    .join(" ");
}

export function normUrl(s: string | null | undefined) {
  if (!s) return null;
  try {
    const u = new URL(s);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return null;
  }
}

const STOP = new Set(["the", "a", "an", "of", "and", "for", "to", "in", "at", "with"]);
function overlap(a: string, b: string) {
  const x = new Set(normTitle(a).split(" ").filter((w) => w && !STOP.has(w)));
  const y = new Set(normTitle(b).split(" ").filter((w) => w && !STOP.has(w)));
  if (!x.size || !y.size) return 0;
  let both = 0;
  for (const w of x) if (y.has(w)) both++;
  return both / (x.size + y.size - both);
}

const relatedCompany = (a: string, b: string) => {
  const x = normCompany(a);
  const y = normCompany(b);
  return !!x && !!y && (x === y || x.startsWith(`${y} `) || y.startsWith(`${x} `));
};

/**
 * Deterministic match of a manual entry against automated roles.
 * - Confirmed link → merge.
 * - Exactly one certain match (same posting URL, or same company and title after
 *   normalising) → merge.
 * - Several certain matches, or only near matches (related company name and a
 *   similar title) → no merge; listed as `possible` for a person to confirm.
 * Roles marked "not the same" are skipped.
 */
export function matchManual(m: ManualRole, auto: Role[]): { merge: Role | null; possible: Role[] } {
  if (m.linkedTo) {
    const linked = auto.find((a) => a.id === m.linkedTo);
    if (linked) return { merge: linked, possible: [] };
  }
  const pool = auto.filter((a) => !(m.notSame ?? []).includes(a.id));
  const url = normUrl(m.url);
  const company = normCompany(m.company);
  const title = normTitle(m.role);
  const certain = pool.filter(
    (a) => (url && normUrl(a.url) === url) || (normCompany(a.company) === company && normTitle(a.role) === title),
  );
  if (certain.length === 1) return { merge: certain[0], possible: [] };
  if (certain.length > 1) return { merge: null, possible: certain };
  return {
    merge: null,
    possible: pool.filter((a) => relatedCompany(a.company, m.company) && overlap(a.role, m.role) >= 0.5),
  };
}

/* ---------- merging ---------- */

const autoValue = (orig: Role, k: ManualField): Value =>
  k === "source" ? "automated" : k === "recruiter" ? null : (orig[k] as Value);

const same = (a: Value | undefined, b: Value | undefined) => (a ?? null) === (b ?? null);

function setField(r: Role, k: ManualField, v: Value) {
  (r as Record<string, unknown>)[k] = v;
}

function track(r: Role, orig: Role | null, k: ManualField) {
  if (!r.overridden) r.overridden = [];
  if (!r.overridden.includes(k)) r.overridden.push(k);
  if (orig) {
    r.autoValues = { ...r.autoValues, [k]: autoValue(orig, k) };
  }
}

/** A status set by hand decides the section: end states go to Closed, anything else to Active. */
const listFor = (status: string): Role["list"] => (END_STATUSES.has(status) ? "closed" : "active");

function applyManual(target: Role, orig: Role, m: ManualRole) {
  for (const k of MANUAL_KEYS) {
    const v = m[k];
    if (v === null || v === undefined) continue;
    if (k === "roleFit") {
      if (orig.roleFit === null) {
        target.roleFit = v as number;
        target.manualFit = true;
      }
      continue;
    }
    if (same(v, autoValue(orig, k))) continue;
    setField(target, k, v);
    track(target, orig, k);
  }
  if (target.overridden?.includes("status")) target.list = listFor(target.status);
  target.mergedManualId ??= m.id;
}

function applyOverlay(target: Role, orig: Role | null, ov: Overlay) {
  for (const k of MANUAL_KEYS) {
    if (!(k in ov.fields)) continue;
    const v = ov.fields[k] ?? null;
    if (k === "roleFit") {
      if (orig && orig.roleFit !== null) continue; // never replace an automated score
      target.roleFit = v as number | null;
      target.manualFit = v !== null;
      continue;
    }
    setField(target, k, v);
    track(target, orig, k);
    (target.overlayFields ??= []).push(k);
    if (orig && k in ov.base && !same(ov.base[k], autoValue(orig, k))) {
      (target.conflicts ??= []).push({ field: k, auto: autoValue(orig, k) });
    }
  }
  if ("status" in ov.fields) target.list = listFor(target.status);
}

function manualToRole(m: ManualRole, possible: Role[]): Role {
  return {
    id: m.id,
    list: listFor(m.status),
    exception: false,
    company: m.company,
    role: m.role,
    url: m.url,
    req: null,
    roleFit: m.roleFit,
    interest: m.interest,
    verification: null,
    status: m.status,
    discovered: m.added,
    applied: null,
    lastActivity: m.updated.slice(0, 10),
    nextAction: m.nextAction,
    nextActionDate: m.nextActionDate,
    compensation: m.compensation,
    location: m.location,
    whyItFits: null,
    concerns: null,
    caseStudy: null,
    notes: m.notes,
    materialsPath: null,
    materials: { resume: "Not started", cover: "Not started", outreach: "Not started" },
    files: [],
    source: m.source,
    recruiter: m.recruiter,
    manualFit: m.roleFit !== null,
    edit: { kind: "manual", id: m.id, rev: m.rev },
    possible: possible.map((p) => ({ id: p.id, company: p.company, role: p.role })),
  };
}

function orphanRole(ov: Overlay): Role {
  const r = manualToRole(
    {
      id: ov.id,
      company: ov.label.company,
      role: ov.label.role,
      added: "",
      updated: ov.updated,
      rev: 0,
      source: "automated",
      status: "Discovered",
      url: null,
      location: null,
      compensation: null,
      recruiter: null,
      roleFit: null,
      interest: null,
      notes: null,
      nextAction: null,
      nextActionDate: null,
    },
    [],
  );
  r.discovered = null;
  r.orphan = true;
  r.possible = undefined;
  applyOverlay(r, null, ov);
  r.edit = { kind: "overlay", id: ov.id, rev: ov.rev };
  return r;
}

/** Snapshot roles plus manual data, as the dashboard shows them. Pure. */
export function mergeRoles(snapshotRoles: Role[], manual: ManualData): Role[] {
  const out: Role[] = snapshotRoles.map((r) => ({
    ...r,
    source: "automated",
    recruiter: null,
    edit: { kind: "overlay", id: r.id, rev: 0 },
  }));
  const byId = new Map(out.map((r) => [r.id, r]));
  const origById = new Map(snapshotRoles.map((r) => [r.id, r]));

  const manualRoles = [...manual.roles].sort((a, b) =>
    a.added === b.added ? (a.id < b.id ? -1 : 1) : a.added < b.added ? -1 : 1,
  );
  for (const m of manualRoles) {
    const { merge, possible } = matchManual(m, snapshotRoles);
    if (merge) applyManual(byId.get(merge.id)!, merge, m);
    else out.push(manualToRole(m, possible));
  }

  for (const ov of Object.values(manual.overlays).sort((a, b) => (a.id < b.id ? -1 : 1))) {
    let target = byId.get(ov.id);
    if (!target) {
      // The role's id changed (e.g. moved under Closed in pipeline.md): re-attach by name if unique.
      const c = normCompany(ov.label.company);
      const t = normTitle(ov.label.role);
      const hits = snapshotRoles.filter((r) => normCompany(r.company) === c && normTitle(r.role) === t);
      if (hits.length === 1 && !manual.overlays[hits[0].id]) target = byId.get(hits[0].id);
    }
    if (target) {
      applyOverlay(target, origById.get(target.id) ?? null, ov);
      target.edit = { kind: "overlay", id: ov.id, rev: ov.rev };
    } else out.push(orphanRole(ov));
  }
  return out;
}

/* ---------- form input ---------- */

export type FormInput = { get(name: string): FormDataEntryValue | null };
export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const LIMITS = {
  company: 120,
  role: 160,
  url: 500,
  location: 160,
  compensation: 160,
  recruiter: 200,
  notes: 4000,
  nextAction: 300,
} as const;

function text(form: FormInput, name: keyof typeof LIMITS, multiline = false, current?: unknown): Parsed<string | null> {
  const raw = form.get(name);
  if (raw !== null && typeof raw !== "string") return { ok: false, error: `${name} must be text.` };
  let v = (raw ?? "").replace(/\r\n?/g, "\n");
  v = multiline ? v.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "") : v.replace(/[\u0000-\u001f\u007f]/g, " ");
  v = v.trim();
  if (v && v === current) return { ok: true, value: v }; // unchanged automated text is never rejected
  if (v.length > LIMITS[name]) return { ok: false, error: `${name} is too long (max ${LIMITS[name]} characters).` };
  return { ok: true, value: v || null };
}

function int(form: FormInput, name: string, max: number): Parsed<number | null> {
  const raw = form.get(name);
  if (raw === null || raw === "") return { ok: true, value: null };
  if (typeof raw !== "string" || !/^\d{1,3}$/.test(raw.trim())) return { ok: false, error: `${name} must be a whole number.` };
  const n = Number(raw.trim());
  return n <= max ? { ok: true, value: n } : { ok: false, error: `${name} must be between 0 and ${max}.` };
}

const LABELS: Record<string, string> = {
  roleFit: "Role Fit",
  interest: "Interest",
  nextActionDate: "Next-action date",
  url: "Job posting URL",
  company: "Company",
  role: "Position",
  nextAction: "Next action",
  recruiter: "Recruiter / contact",
};
const human = (e: string) => e.replace(/^(\w+)/, (k) => LABELS[k] ?? k[0].toUpperCase() + k.slice(1));

/**
 * Validates the manual fields from a form. Values equal to `current` always pass, so an
 * automated role keeps whatever the routine wrote (an unlisted status, a long note, a
 * non-URL link) when other fields are edited.
 */
export function parseFields(form: FormInput, current?: Partial<ManualFields>): Parsed<ManualFields> {
  const currentStatus = current?.status;
  const source = form.get("source");
  if (typeof source !== "string" || !(source in SOURCES)) return { ok: false, error: "Choose a source." };
  const status = form.get("status");
  if (typeof status !== "string" || !((STATUSES as readonly string[]).includes(status) || status === currentStatus)) {
    return { ok: false, error: "Choose a status." };
  }
  const out: Partial<ManualFields> = { source: source as SourceKey, status };
  for (const [k, multi] of [
    ["url", false],
    ["location", false],
    ["compensation", false],
    ["recruiter", false],
    ["notes", true],
    ["nextAction", false],
  ] as const) {
    const r = text(form, k, multi, current?.[k]);
    if (!r.ok) return { ok: false, error: human(r.error) };
    out[k] = r.value;
  }
  if (out.url && out.url !== current?.url) {
    let ok = false;
    try {
      ok = /^https?:$/.test(new URL(out.url).protocol);
    } catch {}
    if (!ok) return { ok: false, error: "Job posting URL must start with http:// or https://." };
  }
  const fit = int(form, "roleFit", 100);
  if (!fit.ok) return { ok: false, error: human(fit.error) };
  const interest = int(form, "interest", 10);
  if (!interest.ok) return { ok: false, error: human(interest.error) };
  out.roleFit = fit.value;
  out.interest = interest.value;
  const date = form.get("nextActionDate");
  if (date === null || date === "") out.nextActionDate = null;
  else if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date))) {
    out.nextActionDate = date;
  } else return { ok: false, error: "Next-action date must be a date." };
  return { ok: true, value: out as ManualFields };
}

/**
 * For edits: a field missing from the request keeps its current value instead of being
 * cleared. (A browser always sends every field; an empty input arrives as "".)
 */
export function withCurrent(form: FormInput, current: Role): FormInput {
  return {
    get(name) {
      const v = form.get(name);
      if (v !== null) return v;
      const cur = (current as Record<string, unknown>)[name];
      if (name === "source") return current.source ?? "automated";
      if (name === "nextActionDate") return firstDateOf(current.nextActionDate);
      return typeof cur === "string" || typeof cur === "number" ? String(cur) : null;
    },
  };
}
const firstDateOf = (s: string | null) => s?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;

export function parseIdentity(form: FormInput): Parsed<{ company: string; role: string }> {
  const company = text(form, "company");
  if (!company.ok) return { ok: false, error: human(company.error) };
  const role = text(form, "role");
  if (!role.ok) return { ok: false, error: human(role.error) };
  if (!company.value) return { ok: false, error: "Company is required." };
  if (!role.value) return { ok: false, error: "Position is required." };
  return { ok: true, value: { company: company.value, role: role.value } };
}

/**
 * Next overlay for an automated role after an edit. Only fields that differ from what the
 * card currently shows are recorded (overlays stay sparse); `base` keeps the automated
 * value at the time of each edit, for conflict detection. Never records a Role Fit when the
 * automation already scored the role.
 */
export function nextOverlay(
  prev: Overlay | undefined,
  orig: Role,
  shown: Role,
  submitted: ManualFields,
  now: string,
): Overlay {
  const fields: Partial<ManualFields> = { ...prev?.fields };
  const base = { ...prev?.base };
  for (const k of MANUAL_KEYS) {
    if (k === "roleFit" && orig.roleFit !== null) continue;
    let current = (shown[k] ?? (k === "source" ? "automated" : null)) as Value;
    // The date input can only show a plain date; "2026-10-21 (after the call)" or free text
    // the routine wrote must not count as edited just because the input couldn't hold it.
    if (k === "nextActionDate") current = firstDateOf(current as string | null);
    if (same(submitted[k], current)) continue;
    (fields as Record<string, Value>)[k] = submitted[k];
    base[k] = autoValue(orig, k);
  }
  return {
    id: prev?.id ?? orig.id,
    label: { company: orig.company, role: orig.role },
    fields,
    base,
    updated: now,
    rev: prev?.rev ?? 0,
  };
}

/** Removes one field from an overlay, so the automated value shows again. */
export function revertField(ov: Overlay, field: ManualField, now: string): Overlay {
  const fields = { ...ov.fields };
  const base = { ...ov.base };
  delete fields[field];
  delete base[field];
  return { ...ov, fields, base, updated: now };
}

export const isManualField = (v: unknown): v is ManualField =>
  typeof v === "string" && (MANUAL_KEYS as string[]).includes(v);

/** Today's date in New York, where the routine runs. */
export const todayET = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
