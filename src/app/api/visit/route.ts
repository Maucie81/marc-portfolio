import { randomBytes } from "node:crypto";
import { SESSION_ID } from "@/lib/analytics/events";
import { PATH, clean, done, ignored, readBody } from "@/lib/analytics/request";
import { getVisitStore } from "@/lib/analytics/store";
import { browserOf, deviceOf, osOf } from "@/lib/analytics/ua";

/**
 * Records one page view for /analytics. Called by
 * src/components/site/VisitTracker.tsx with only the page path, the
 * referrer, any UTM tags, the visit's random session id and whether the
 * screen takes touch; everything else is derived here and nothing else is
 * kept.
 *
 * Location comes from the headers Vercel's edge adds to every request
 * (x-vercel-ip-country / -country-region / -city), looked up from the
 * visitor's IP before the request reaches this function. The IP itself is
 * never read here and never stored. Off Vercel (local dev) those headers
 * don't exist, so location is null.
 *
 * Skipped without an error (see request.ts): the owner's browsers, obvious
 * bots, and anything posted from another site.
 */

const HOST = /^[a-z0-9.-]+$/;

/** Just the referring host — a full referrer URL can carry search terms or
 * other personal details in its path and query. */
function referrerHost(value: unknown): string | null {
  if (typeof value !== "string" || !value || value.length > 2048) return null;
  try {
    const url = new URL(value);
    // android-app://com.linkedin.android/ is how Android apps refer.
    if (!["http:", "https:", "android-app:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    return HOST.test(host) && host.length <= 253 ? host : null;
  } catch {
    return null;
  }
}

/** Vercel URL-encodes non-ASCII city names ("S%C3%A3o%20Paulo"). */
function header(request: Request, name: string, max: number): string | null {
  const raw = request.headers.get(name);
  if (!raw) return null;
  try {
    return clean(decodeURIComponent(raw), max);
  } catch {
    return clean(raw, max);
  }
}

export async function POST(request: Request) {
  if (ignored(request)) return done();

  const body = await readBody(request);
  if (body instanceof Response) return body;

  const { path, sid } = body;
  if (typeof path !== "string" || path.length > 200 || !PATH.test(path)) {
    return new Response(null, { status: 400 });
  }

  const ua = request.headers.get("user-agent") ?? "";
  const touch = body.touch === true;

  try {
    await getVisitStore().add({
      id: randomBytes(6).toString("base64url"),
      ts: new Date().toISOString(),
      // A tab still running the tracker from before visits existed sends
      // none; that pageview is kept, just outside visit-level numbers.
      ...(typeof sid === "string" && SESSION_ID.test(sid) ? { sid } : {}),
      path,
      referrer: referrerHost(body.referrer),
      utmSource: clean(body.utmSource, 100),
      utmMedium: clean(body.utmMedium, 100),
      utmCampaign: clean(body.utmCampaign, 100),
      country: header(request, "x-vercel-ip-country", 2),
      region: header(request, "x-vercel-ip-country-region", 3),
      city: header(request, "x-vercel-ip-city", 100),
      device: deviceOf(ua, request.headers.get("sec-ch-ua-mobile"), touch),
      browser: browserOf(ua),
      os: osOf(ua, touch),
      // From a tracker that also measures engaged time (see /api/engage).
      ...(body.timed === true ? { timed: true } : {}),
      // From a tracker that also records scroll depth (see /api/depth).
      ...(body.scroll === true ? { scroll: true } : {}),
    });
  } catch (err) {
    // A storage hiccup costs one data point, never the visitor's page.
    console.error("[analytics] store failed", err);
  }

  return done();
}
