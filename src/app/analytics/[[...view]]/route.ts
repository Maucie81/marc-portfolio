import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  isView,
  renderDashboard,
  renderLogin,
  renderMessage,
  type ViewKey,
} from "@/lib/analytics/dashboard";
import { DEFAULT_QUERY, buildActivity, parseActivityQuery } from "@/lib/analytics/activity";
import { renderActivity } from "@/lib/analytics/activity-view";
import { activityData, buildReport, fetchFrom, isRange, rangeStart, type RangeKey } from "@/lib/analytics/metrics";
import { renderReportPage } from "@/lib/analytics/report-page";
import { getVisitStore } from "@/lib/analytics/store";

/**
 * The private analytics dashboard: /analytics (Overview), one URL per view
 * (/analytics/acquisition, /behavior, /content, /audience, /activity) and
 * the printable /analytics/report, all taking ?range=. Activity also takes
 * its filters, sort and page (activity.ts), and answers ?fragment=1 with
 * just its own content, for the dashboard's script. A route handler
 * rather than a page (like /owner) so it's a bare HTML response: none of
 * the site's chrome, motion or trackers, and it works without JavaScript.
 * Every view of a range is built from one buildReport call, so the
 * dashboard and the report can't disagree.
 *
 * Protected by one password in the ANALYTICS_PASSWORD env var. Signing in
 * sets an httpOnly cookie holding an HMAC derived from that password —
 * never the password itself — scoped to /analytics (so every view and the
 * report), for 90 days. Changing the env var signs every browser out. With
 * no password set in production the page stays locked (fails closed);
 * `next dev` without one is open, since it only ever shows local in-memory
 * test visits.
 */

const COOKIE = "mf-analytics";
const MAX_AGE = 60 * 60 * 24 * 90;

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ view?: string[] }> };

const password = () => process.env.ANALYTICS_PASSWORD || null;

const token = (secret: string) =>
  createHmac("sha256", secret).update("mf-analytics-session").digest();

function matches(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

function signedIn(request: Request, secret: string) {
  const match = (request.headers.get("cookie") ?? "").match(
    new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_-]+)`),
  );
  return match ? matches(Buffer.from(match[1], "base64url"), token(secret)) : false;
}

/** The dashboard view or the report a path asks for; null for anything
 * else under /analytics. */
async function pageOf(context: Context): Promise<ViewKey | "report" | null> {
  const segments = (await context.params).view ?? [];
  if (segments.length === 0) return "overview";
  if (segments.length > 1) return null;
  const [name] = segments;
  return name === "report" ? "report" : name !== "overview" && isView(name) ? name : null;
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

/** 303 back to the page that posted, so a refresh never re-posts the form
 * and signing in from /analytics/report lands on the report. */
const back = (request: Request) => {
  const { pathname, search } = new URL(request.url);
  return new NextResponse(null, {
    status: 303,
    headers: { Location: `${pathname}${search}`, "Cache-Control": "private, no-store" },
  });
};

const locked = () =>
  html(
    renderMessage("Locked: set ANALYTICS_PASSWORD in Vercel, then redeploy."),
    503,
  );

const notFound = () => html(renderMessage("No such view."), 404);

/** Everything recorded for the range's visits. */
async function read(range: RangeKey) {
  const nowMs = Date.now();
  const from = fetchFrom(rangeStart(range, nowMs));

  const store = getVisitStore();
  const [visits, events] = await Promise.all([store.since(from), store.eventsSince(from)]);
  // Engaged time and scroll depth are kept per day, so read only the days
  // that have visits.
  const firstDay = visits.length ? Math.max(from, Date.parse(visits[0].ts)) : null;
  const [engaged, depth] =
    firstDay === null
      ? [[], []]
      : await Promise.all([
          store.engagedBetween(firstDay, nowMs),
          store.depthBetween(firstDay, nowMs),
        ]);

  return { visits, events, engaged, depth, range, nowMs };
}

type ActivityData = ReturnType<typeof activityData>;

/** Activity's filter, sort and page changes each reload only its content,
 * often several in a row. Those reuse the range's visits from the last read
 * for up to a minute rather than reading the whole range again — so they
 * also match the rest of the page they were loaded with. A full page load
 * always reads fresh and refreshes this. Held in this server instance's
 * memory only, best effort. */
const REUSE_MS = 60_000;
const lastRead = new Map<RangeKey, { startMs: number; at: number; data: ActivityData }>();

function remember(range: RangeKey, nowMs: number, data: ActivityData) {
  lastRead.set(range, { startMs: rangeStart(range, nowMs), at: Date.now(), data });
}

function recalled(range: RangeKey): ActivityData | null {
  const hit = lastRead.get(range);
  const nowMs = Date.now();
  // A new day moves "Today" and the day ranges, so a read from before
  // midnight is never reused after it.
  return hit && nowMs - hit.at < REUSE_MS && hit.startMs === rangeStart(range, nowMs) ? hit.data : null;
}

export async function GET(request: Request, context: Context) {
  const view = await pageOf(context);
  if (!view) return notFound();

  const params = new URL(request.url).searchParams;
  const fragment = view === "activity" && params.get("fragment") === "1";

  const secret = password();
  if (!secret && process.env.NODE_ENV === "production") return locked();
  if (secret && !signedIn(request, secret)) {
    // The script falls back to a full page load, which shows the sign-in.
    return fragment ? html(renderMessage("Signed out."), 401) : html(renderLogin());
  }

  const asked = params.get("range");
  const range = isRange(asked) ? asked : "7d";
  const query = view === "activity" ? parseActivityQuery(params) : DEFAULT_QUERY;

  if (fragment) {
    let activity = recalled(range);
    if (!activity) {
      const data = await read(range);
      activity = activityData(data);
      remember(range, data.nowMs, activity);
    }
    return html(renderActivity(buildActivity(activity.sessions, query, activity.legacy), range));
  }

  const [data, allTime] = await Promise.all([read(range), getVisitStore().total()]);
  const report = buildReport(data);
  remember(range, data.nowMs, { sessions: report.sessions, legacy: report.legacy });

  return html(
    view === "report"
      ? renderReportPage(report)
      : renderDashboard({
          report,
          allTime,
          signOut: Boolean(secret),
          view,
          activity: buildActivity(report.sessions, query, report.legacy),
        }),
  );
}

export async function POST(request: Request, context: Context) {
  if (!(await pageOf(context))) return notFound();

  const secret = password();
  if (!secret) return process.env.NODE_ENV === "production" ? locked() : back(request);

  const form = await request.formData().catch(() => null);

  if (form?.get("logout")) {
    const res = back(request);
    res.cookies.delete({ name: COOKIE, path: "/analytics" });
    return res;
  }

  const attempt = form?.get("password");
  if (typeof attempt !== "string" || !matches(token(attempt), token(secret))) {
    // A beat before answering slows down guessing.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return html(renderLogin("Wrong password."), 401);
  }

  const res = back(request);
  res.cookies.set(COOKIE, token(secret).toString("base64url"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/analytics",
    maxAge: MAX_AGE,
  });
  return res;
}
