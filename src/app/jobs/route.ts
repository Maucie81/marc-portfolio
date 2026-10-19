import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  isDecision,
  isManualField,
  logDecision,
  withCurrent,
  type FormInput,
  matchManual,
  mergeRoles,
  nextOverlay,
  parseFields,
  parseIdentity,
  revertField,
  todayET,
} from "@/lib/jobs/merge";
import { parseQuery, renderJobs, renderLogin, renderMessage } from "@/lib/jobs/render";
import { getManual, getSnapshot, putManual, type ManualKind } from "@/lib/jobs/store";
import type { ManualData, ManualRole, Overlay, Role, Snapshot } from "@/lib/jobs/types";

/**
 * The private job-search dashboard. Same pattern as /analytics (a bare HTML
 * route handler, one env-var password, an httpOnly HMAC cookie scoped to the
 * path, fail-closed in production) but fully independent of it: its own
 * password (JOBS_PASSWORD), its own cookie and its own signing label, so
 * access to analytics never grants access to job-search data, and vice
 * versa. Changing JOBS_PASSWORD signs every browser out.
 *
 * Not linked from the site, not in any sitemap, noindex everywhere. The
 * data is never in this repo (it's public): see src/lib/jobs/store.ts.
 */

const COOKIE = "mf-jobs";
const MAX_AGE = 60 * 60 * 24 * 30;

export const dynamic = "force-dynamic";

const password = () => process.env.JOBS_PASSWORD || null;

const token = (secret: string) =>
  createHmac("sha256", secret).update("mf-jobs-session").digest();

function matches(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

function signedIn(request: Request, secret: string) {
  const match = (request.headers.get("cookie") ?? "").match(
    new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_-]+)`),
  );
  return match ? matches(Buffer.from(match[1], "base64url"), token(secret)) : false;
}

function html(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY",
    },
  });
}

const backToDashboard = () =>
  new NextResponse(null, {
    status: 303,
    headers: { Location: "/jobs", "Cache-Control": "private, no-store" },
  });

const locked = () =>
  html(renderMessage("Locked: set JOBS_PASSWORD in Vercel, then redeploy."), 503);

export async function GET(request: Request) {
  const secret = password();
  if (!secret && process.env.NODE_ENV === "production") return locked();
  if (secret && !signedIn(request, secret)) return html(renderLogin());

  const query = parseQuery(new URL(request.url).searchParams);
  let snapshot = null;
  try {
    snapshot = await getSnapshot();
  } catch {
    return html(renderMessage("Couldn't read the job-search snapshot. Try again, or re-run npm run jobs:sync."), 502);
  }
  let manual: ManualData = { roles: [], overlays: {} };
  let manualError = false;
  try {
    manual = await getManual();
  } catch {
    manualError = true; // still show the automated data
  }
  if (snapshot) snapshot = { ...snapshot, roles: mergeRoles(snapshot.roles, manual) };
  return html(
    renderJobs({
      snapshot,
      query,
      signOut: Boolean(secret),
      csrf: secret ? csrfToken(secret) : "",
      manualError,
      // Without a password (local dev only) the page is read-only.
      editable: Boolean(secret),
    }),
  );
}

/* ---------- manual changes ---------- */

const csrfToken = (secret: string) =>
  createHmac("sha256", secret).update("mf-jobs-csrf").digest("base64url");

const go = (params: Record<string, string>, hash = "") => {
  const qs = new URLSearchParams(params).toString();
  return new NextResponse(null, {
    status: 303,
    headers: { Location: `/jobs${qs ? `?${qs}` : ""}${hash}`, "Cache-Control": "private, no-store" },
  });
};
const toRole = (id: string, notice: string) => go({ role: id, notice });

/** New entries get a status from how they came in, so adding one never asks for it. */
const withDefaultStatus = (form: FormInput): FormInput => ({
  get(name) {
    const v = form.get(name);
    if (name === "status" && !v) return form.get("source") === "recruiter" ? "Recruiter response" : "Discovered";
    return v;
  },
});

const invalid = (message: string, status = 400) =>
  html(renderMessage(`${message} Nothing was saved. Use your browser's Back button to fix it.`), status);

/**
 * Add / edit / revert / link. Every action needs the signed-in cookie, a same-origin
 * request and the per-password CSRF token. Writes only manual records: the automated
 * snapshot is read, never written, here.
 */
async function change(request: Request, form: FormData, secret: string) {
  if (!signedIn(request, secret)) return html(renderLogin("Sign in again to save changes."), 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== "null" && new URL(origin).host !== new URL(request.url).host) {
    return invalid("Cross-site request refused.", 403);
  }
  const given = form.get("csrf");
  if (typeof given !== "string" || !matches(Buffer.from(given), Buffer.from(csrfToken(secret)))) {
    return invalid("This page was out of date. Reload /jobs and try again.", 403);
  }

  const action = form.get("action");
  const id = String(form.get("id") ?? "");
  const rev = Number(form.get("rev") ?? 0);
  if (!Number.isInteger(rev) || rev < 0) return invalid("Bad request.");
  const now = new Date().toISOString();

  let snapshot: Snapshot | null;
  let manual: ManualData;
  try {
    [snapshot, manual] = await Promise.all([getSnapshot(), getManual()]);
  } catch {
    return invalid("Couldn't reach storage.", 502);
  }
  const autoRoles = snapshot?.roles ?? [];

  const save = async <T extends ManualRole | Overlay>(
    kind: ManualKind,
    record: T,
    expected: number,
    goTo: string,
    notice: string | (() => NextResponse),
  ) => {
    try {
      if (!(await putManual(kind, record, expected))) return toRole(goTo, "stale");
    } catch {
      return invalid("Couldn't save to storage.", 502);
    }
    return typeof notice === "string" ? toRole(goTo, notice) : notice();
  };

  if (action === "add") {
    const who = parseIdentity(form);
    if (!who.ok) return invalid(who.error);
    const fields = parseFields(withDefaultStatus(form));
    if (!fields.ok) return invalid(fields.error);
    const record: ManualRole = {
      ...fields.value,
      ...who.value,
      decisions: fields.value.decision ? logDecision([], fields.value.decision, now) : [],
      id: `m-${randomBytes(5).toString("hex")}`,
      added: todayET(),
      updated: now,
      rev: 0,
      linkedTo: null,
      notSame: [],
    };
    const { merge, possible } = matchManual(record, autoRoles);
    return save("roles", record, 0, merge ? merge.id : record.id, merge ? "merged" : possible.length ? "possible" : "added");
  }

  const m = manual.roles.find((r) => r.id === id);
  const merged = mergeRoles(autoRoles, manual);

  if (action === "decide") {
    const decision = form.get("decision");
    const kind = form.get("kind");
    if (!isDecision(decision)) return invalid("Choose interested, undecided or not interested.");
    const shown = merged.find((r) => r.edit?.kind === kind && r.edit.id === id);
    if (!shown) return invalid("That opportunity isn't here any more.", 404);
    const before = shown.decision ?? "undecided";
    const back = form.get("back");
    const done = () =>
      decision === "not" && before !== "not" && back === "list"
        ? go({ notice: "archived", undo: shown.id, prev: before })
        : back === "detail"
          ? toRole(shown.id, "")
          : back === "archive"
            ? go({ view: "archive", notice: "restored", restored: shown.id })
            : go({}, `#r-${encodeURIComponent(shown.id)}`);
    if (kind === "manual") {
      if (!m) return invalid("That entry no longer exists.", 404);
      const record: ManualRole = { ...m, decision, decisions: logDecision(m.decisions, decision, now), updated: now };
      return save("roles", record, rev, shown.id, done);
    }
    const prev = manual.overlays[id] ?? {
      id,
      label: { company: shown.company, role: shown.role },
      fields: {},
      base: {},
      updated: now,
      rev: 0,
    };
    const record: Overlay = {
      ...prev,
      fields: { ...prev.fields, decision },
      decisions: logDecision(prev.decisions, decision, now),
      updated: now,
    };
    return save("overlays", record, rev, shown.id, done);
  }

  if (action === "edit-manual") {
    if (!m) return invalid("That entry no longer exists.", 404);
    // Each form on the page sends only its own fields; everything else keeps its value.
    const current = merged.find((r) => r.edit?.kind === "manual" && r.edit.id === m.id) ?? ({ ...m } as unknown as Role);
    const input = withCurrent(form, current);
    const who = parseIdentity(input);
    if (!who.ok) return invalid(who.error);
    const fields = parseFields(input, m);
    if (!fields.ok) return invalid(fields.error);
    const record: ManualRole = { ...m, ...fields.value, ...who.value, updated: now };
    const { merge } = matchManual(record, autoRoles);
    return save("roles", record, rev, merge ? merge.id : m.id, merge ? "merged" : "saved");
  }

  if (action === "link" || action === "not-same") {
    if (!m) return invalid("That entry no longer exists.", 404);
    const target = String(form.get("target") ?? "");
    if (!autoRoles.some((r) => r.id === target)) return invalid("That automated role is no longer in the snapshot.", 404);
    const record: ManualRole =
      action === "link"
        ? { ...m, linkedTo: target, updated: now }
        : { ...m, notSame: [...new Set([...(m.notSame ?? []), target])], updated: now };
    return save("roles", record, rev, action === "link" ? target : m.id, action === "link" ? "merged" : "saved");
  }

  if (action === "edit" || action === "revert") {
    const shown = merged.find((r) => r.edit?.kind === "overlay" && r.edit.id === id);
    if (!shown) return invalid("That role isn't in the current snapshot.", 404);
    const prev = manual.overlays[id];
    if (action === "revert") {
      const field = form.get("field");
      if (!prev || !isManualField(field)) return invalid("Nothing to revert.");
      return save("overlays", revertField(prev, field, now), rev, shown.id, "reverted");
    }
    const fields = parseFields(withCurrent(form, shown), shown);
    if (!fields.ok) return invalid(fields.error);
    // Orphans (role gone from the snapshot) have no automated values left to protect.
    const orig = autoRoles.find((r) => r.id === shown.id) ?? { ...shown, roleFit: null };
    return save("overlays", nextOverlay(prev, orig, shown, fields.value, now), rev, shown.id, "saved");
  }

  return invalid("Unknown action.");
}

export async function POST(request: Request) {
  const secret = password();
  if (!secret) return process.env.NODE_ENV === "production" ? locked() : backToDashboard();

  const form = await request.formData().catch(() => null);

  if (form?.get("action")) return change(request, form, secret);

  if (form?.get("logout")) {
    const res = backToDashboard();
    res.cookies.delete({ name: COOKIE, path: "/jobs" });
    return res;
  }

  const attempt = form?.get("password");
  if (typeof attempt !== "string" || !matches(token(attempt), token(secret))) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return html(renderLogin("Wrong password."), 401);
  }

  const res = backToDashboard();
  res.cookies.set(COOKIE, token(secret).toString("base64url"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/jobs",
    maxAge: MAX_AGE,
  });
  return res;
}
