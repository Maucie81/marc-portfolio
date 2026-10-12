import { hit, visitorKey, type Window } from "@/lib/security";

/**
 * Rate limits for the four analytics write endpoints (/api/visit, /event,
 * /engage, /depth). They keep one client — or a script — from fabricating
 * traffic or running up Upstash writes, and the shared daily ceilings cap
 * how fast the stored data can grow even if many addresses join in. Counted
 * per IP (hashed, never stored raw) with the same Redis limiter the contact
 * form uses, so it holds across serverless instances.
 *
 * Sized far above what one real visitor produces — a pageview per page,
 * engaged time every 30 s per open tab, a handful of events and scroll
 * milestones — so a recruiter, or a whole office behind one address, is
 * never cut off. Over a limit the request is refused (429) and nothing is
 * written; the tracker ignores the reply. If Redis can't be reached the
 * limiter lets the request through (see security.ts).
 */
const DAY = 24 * 60 * 60;
const TEN_MIN = 10 * 60;

const limits = (perTen: number, perDay: number, sharedDay: number): Window[] => [
  { name: "10m", limit: perTen, seconds: TEN_MIN },
  { name: "1d", limit: perDay, seconds: DAY },
  { name: "all-1d", limit: sharedDay, seconds: DAY, shared: true },
];

export const ANALYTICS_LIMITS = {
  visit: limits(100, 1000, 10_000),
  event: limits(60, 400, 10_000),
  engage: limits(120, 2000, 30_000),
  depth: limits(60, 600, 15_000),
} as const;

/** A 429 Response when this request is over its endpoint's limits, else null. */
export async function overLimit(
  request: Request,
  endpoint: keyof typeof ANALYTICS_LIMITS,
): Promise<Response | null> {
  const result = await hit(`analytics:${endpoint}`, visitorKey(request), ANALYTICS_LIMITS[endpoint]);
  if (result.allowed) return null;
  return new Response(null, {
    status: 429,
    headers: { "Retry-After": String(result.retryAfter) },
  });
}
