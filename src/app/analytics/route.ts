import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { renderDashboard, renderLogin, renderMessage } from "@/lib/analytics/dashboard";
import { buildReport, fetchFrom, isRange, rangeStart } from "@/lib/analytics/metrics";
import { getVisitStore } from "@/lib/analytics/store";

/**
 * The private analytics dashboard. A route handler rather than a page (like
 * /owner) so it's a bare HTML response: none of the site's chrome, motion or
 * trackers, and it works without JavaScript.
 *
 * Protected by one password in the ANALYTICS_PASSWORD env var. Signing in
 * sets an httpOnly cookie holding an HMAC derived from that password —
 * never the password itself — scoped to /analytics, for 90 days. Changing
 * the env var signs every browser out. With no password set in production
 * the page stays locked (fails closed); `next dev` without one is open,
 * since it only ever shows local in-memory test visits.
 */

const COOKIE = "mf-analytics";
const MAX_AGE = 60 * 60 * 24 * 90;

export const dynamic = "force-dynamic";

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

/** 303 back to the dashboard so a refresh never re-posts the form. */
const backToDashboard = () =>
  new NextResponse(null, {
    status: 303,
    headers: { Location: "/analytics", "Cache-Control": "private, no-store" },
  });

const locked = () =>
  html(
    renderMessage("Locked: set ANALYTICS_PASSWORD in Vercel, then redeploy."),
    503,
  );

export async function GET(request: Request) {
  const secret = password();
  if (!secret && process.env.NODE_ENV === "production") return locked();
  if (secret && !signedIn(request, secret)) return html(renderLogin());

  const asked = new URL(request.url).searchParams.get("range");
  const range = isRange(asked) ? asked : "7d";
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

  return html(
    renderDashboard({
      report: buildReport({ visits, events, engaged, depth, range, nowMs }),
      allTime,
      signOut: Boolean(secret),
    }),
  );
}

export async function POST(request: Request) {
  const secret = password();
  if (!secret) return process.env.NODE_ENV === "production" ? locked() : backToDashboard();

  const form = await request.formData().catch(() => null);

  if (form?.get("logout")) {
    const res = backToDashboard();
    res.cookies.delete({ name: COOKIE, path: "/analytics" });
    return res;
  }

  const attempt = form?.get("password");
  if (typeof attempt !== "string" || !matches(token(attempt), token(secret))) {
    // A beat before answering slows down guessing.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return html(renderLogin("Wrong password."), 401);
  }

  const res = backToDashboard();
  res.cookies.set(COOKIE, token(secret).toString("base64url"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/analytics",
    maxAge: MAX_AGE,
  });
  return res;
}
