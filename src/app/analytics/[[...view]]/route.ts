import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  isView,
  renderDashboard,
  renderLogin,
  renderMessage,
  type ViewKey,
} from "@/lib/analytics/dashboard";
import { buildReport, fetchFrom, isRange, rangeStart, type RangeKey } from "@/lib/analytics/metrics";
import { renderReportPage } from "@/lib/analytics/report-page";
import { getVisitStore } from "@/lib/analytics/store";

/**
 * The private analytics dashboard: /analytics (Overview), one URL per view
 * (/analytics/acquisition, /behavior, /content, /audience, /activity) and
 * the printable /analytics/report, all taking ?range=. A route handler
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

/** Reads what the range needs from the store and works out the report. */
async function load(range: RangeKey) {
  const nowMs = Date.now();
  const from = fetchFrom(rangeStart(range, nowMs));

  const store = getVisitStore();
  const [visits, events, allTime] = await Promise.all([
    store.since(from),
    store.eventsSince(from),
    store.total(),
  ]);
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

  return { report: buildReport({ visits, events, engaged, depth, range, nowMs }), allTime };
}

export async function GET(request: Request, context: Context) {
  const view = await pageOf(context);
  if (!view) return notFound();

  const secret = password();
  if (!secret && process.env.NODE_ENV === "production") return locked();
  if (secret && !signedIn(request, secret)) return html(renderLogin());

  const asked = new URL(request.url).searchParams.get("range");
  const { report, allTime } = await load(isRange(asked) ? asked : "7d");

  return html(
    view === "report"
      ? renderReportPage(report)
      : renderDashboard({ report, allTime, signOut: Boolean(secret), view }),
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
