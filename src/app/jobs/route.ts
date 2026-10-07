import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { parseQuery, renderJobs, renderLogin, renderMessage } from "@/lib/jobs/render";
import { getSnapshot } from "@/lib/jobs/store";

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
  return html(renderJobs({ snapshot, query, signOut: Boolean(secret) }));
}

export async function POST(request: Request) {
  const secret = password();
  if (!secret) return process.env.NODE_ENV === "production" ? locked() : backToDashboard();

  const form = await request.formData().catch(() => null);

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
