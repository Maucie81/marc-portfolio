import { SESSION_ID } from "@/lib/analytics/events";
import { PATH, done, ignored, readBody } from "@/lib/analytics/request";
import { getVisitStore } from "@/lib/analytics/store";

/**
 * Adds engaged time to /analytics. src/lib/analytics/client.ts counts time
 * only while the page is on screen and someone has interacted within the
 * last minute, and sends what it has counted since its last checkpoint —
 * every 30 seconds while running, and whenever the tab is hidden or the
 * page changes (by sendBeacon, so a closing tab still gets it out). Each
 * request is a delta, so a repeat can only add time that was really spent,
 * and a lost one only undercounts.
 *
 * Stored as a running total per visit and page per day; same exclusions as
 * /api/visit.
 */

// Well above one checkpoint's worth; anything bigger isn't from the tracker.
const MAX_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (ignored(request)) return done();

  const body = await readBody(request);
  if (body instanceof Response) return body;

  const { sid, path, ms } = body;
  if (
    typeof sid !== "string" ||
    !SESSION_ID.test(sid) ||
    typeof path !== "string" ||
    path.length > 200 ||
    !PATH.test(path) ||
    typeof ms !== "number" ||
    !Number.isInteger(ms) ||
    ms < 1 ||
    ms > MAX_MS
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    await getVisitStore().addEngaged({ sid, path, ms }, Date.now());
  } catch (err) {
    console.error("[analytics] engaged store failed", err);
  }

  return done();
}
