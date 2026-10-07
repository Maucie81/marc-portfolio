import { SESSION_ID } from "@/lib/analytics/events";
import { PATH, done, ignored, readBody } from "@/lib/analytics/request";
import { getVisitStore } from "@/lib/analytics/store";

/**
 * Records scroll milestones for /analytics: 25, 50, 75 and 90% of the page
 * having been on screen, or 100 when the whole page fit without scrolling
 * (see client.ts). Sent once per milestone per visit and page, and stored
 * set-if-absent, so a resend or a late, out-of-order request can't count
 * anything twice. Nothing about scroll position beyond these crossings is
 * sent or kept. Same exclusions as /api/visit.
 */

const MILESTONES = new Set([25, 50, 75, 90, 100]);

export async function POST(request: Request) {
  if (ignored(request)) return done();

  const body = await readBody(request);
  if (body instanceof Response) return body;

  const { sid, path, reached } = body;
  if (
    typeof sid !== "string" ||
    !SESSION_ID.test(sid) ||
    typeof path !== "string" ||
    path.length > 200 ||
    !PATH.test(path) ||
    !Array.isArray(reached) ||
    reached.length === 0 ||
    reached.length > MILESTONES.size ||
    !reached.every((m) => typeof m === "number" && MILESTONES.has(m))
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    await getVisitStore().addDepth(sid, path, [...new Set(reached as number[])], Date.now());
  } catch (err) {
    console.error("[analytics] depth store failed", err);
  }

  return done();
}
