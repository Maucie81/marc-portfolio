/**
 * Checks shared by /api/visit and /api/event: who gets ignored, how the
 * JSON body is read, and how untrusted strings are cleaned. Ignored requests
 * still get a 204 so the browser has nothing to retry.
 */

const OWNER_COOKIE = /(?:^|;\s*)excludeAnalytics=true(?:;|$)/;
const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|embedly|vercel-screenshot|curl|wget|python|httpclient|axios|node-fetch/i;

export const PATH = /^\/(?!\/)[A-Za-z0-9\-._~%/]*$/;

export const done = () => new Response(null, { status: 204 });

/** True for the owner's browsers (the excludeAnalytics=true cookie /owner
 * sets), obvious bots, and anything posted from another site. */
export function ignored(request: Request): boolean {
  if (OWNER_COOKIE.test(request.headers.get("cookie") ?? "")) return true;
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return true;
  const ua = request.headers.get("user-agent") ?? "";
  return !ua || BOT_UA.test(ua);
}

/** The JSON object body, or the error Response to send instead. */
export async function readBody(
  request: Request,
): Promise<Record<string, unknown> | Response> {
  const raw = await request.text();
  if (raw.length > 4096) return new Response(null, { status: 413 });
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    return new Response(null, { status: 400 });
  }
}

/** Trimmed, control characters removed, capped; empty → null. */
export function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\p{C}/gu, "").trim().slice(0, max);
  return text || null;
}
