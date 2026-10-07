import { randomBytes } from "node:crypto";
import { getVisitStore, type Device } from "@/lib/analytics/store";

/**
 * Records one page view for /analytics. Called by
 * src/components/site/VisitTracker.tsx with only the page path, the
 * referrer and any UTM tags; everything else is derived here and nothing
 * else is kept.
 *
 * Location comes from the headers Vercel's edge adds to every request
 * (x-vercel-ip-country / -country-region / -city), looked up from the
 * visitor's IP before the request reaches this function. The IP itself is
 * never read here and never stored. Off Vercel (local dev) those headers
 * don't exist, so location is null.
 *
 * Skipped without an error, so the browser has nothing to retry: the owner's
 * browsers (the excludeAnalytics=true cookie /owner sets), obvious bots, and
 * anything posted from another site.
 */

const OWNER_COOKIE = /(?:^|;\s*)excludeAnalytics=true(?:;|$)/;
const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|embedly|vercel-screenshot|curl|wget|python|httpclient|axios|node-fetch/i;
const PATH = /^\/(?!\/)[A-Za-z0-9\-._~%/]*$/;
const HOST = /^[a-z0-9.-]+$/;

const done = () => new Response(null, { status: 204 });

/** Trimmed, control characters removed, capped; empty → null. */
function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\p{C}/gu, "").trim().slice(0, max);
  return text || null;
}

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

function deviceOf(ua: string, mobileHint: string | null): Device {
  // Android tablets drop "Mobile" from the UA; phones keep it.
  if (/iPad|Tablet|PlayBook|Silk|Kindle|Android(?!.*Mobile)/i.test(ua)) {
    return "tablet";
  }
  if (mobileHint === "?1" || /Mobi|iPhone|iPod|Android/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export async function POST(request: Request) {
  if (OWNER_COOKIE.test(request.headers.get("cookie") ?? "")) return done();

  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return done();

  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return done();

  const raw = await request.text();
  if (raw.length > 4096) return new Response(null, { status: 413 });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return new Response(null, { status: 400 });
  }

  const { path } = body;
  if (typeof path !== "string" || path.length > 200 || !PATH.test(path)) {
    return new Response(null, { status: 400 });
  }

  try {
    await getVisitStore().add({
      id: randomBytes(6).toString("base64url"),
      ts: new Date().toISOString(),
      path,
      referrer: referrerHost(body.referrer),
      utmSource: clean(body.utmSource, 100),
      utmMedium: clean(body.utmMedium, 100),
      utmCampaign: clean(body.utmCampaign, 100),
      country: header(request, "x-vercel-ip-country", 2),
      region: header(request, "x-vercel-ip-country-region", 3),
      city: header(request, "x-vercel-ip-city", 100),
      device: deviceOf(ua, request.headers.get("sec-ch-ua-mobile")),
    });
  } catch (err) {
    // A storage hiccup costs one data point, never the visitor's page.
    console.error("[analytics] store failed", err);
  }

  return done();
}
