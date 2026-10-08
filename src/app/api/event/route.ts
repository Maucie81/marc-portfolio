import { randomBytes } from "node:crypto";
import { projects } from "@/lib/home";
import { HERO_ID, SECTIONS, SESSION_ID, isAction, isExposure } from "@/lib/analytics/events";
import { PATH, clean, done, ignored, readBody } from "@/lib/analytics/request";
import { getVisitStore } from "@/lib/analytics/store";

/**
 * Records one portfolio action for /analytics — resume, LinkedIn, email,
 * phone, contact form, closing-link and additional-work clicks, reference
 * library photos (the list is ACTIONS in src/lib/analytics/events.ts).
 * Sent by src/lib/analytics/client.ts with the visit's session id, so an
 * action joins the pageviews of the same visit; location, device and source
 * come from those pageviews and aren't repeated here. Same exclusions as
 * /api/visit.
 *
 * Also takes what came into view (EXPOSURES: the hero edition, a homepage
 * section, a Recent work card), each with a target from a fixed list, so
 * nothing free-form is stored for them.
 */

/** Recent work cards, by case-study slug. */
const CARDS = new Set(projects.flatMap((p) => (p.href?.startsWith("/work/") ? [p.href.slice(6)] : [])));

function validExposure(type: string, target: unknown) {
  if (typeof target !== "string") return false;
  if (type === "hero") return HERO_ID.test(target);
  if (type === "section") return Object.hasOwn(SECTIONS, target);
  return CARDS.has(target);
}

export async function POST(request: Request) {
  if (ignored(request)) return done();

  const body = await readBody(request);
  if (body instanceof Response) return body;

  const { type, sid, path } = body;
  if (
    !(isAction(type) || (isExposure(type) && validExposure(type, body.target))) ||
    typeof sid !== "string" ||
    !SESSION_ID.test(sid) ||
    typeof path !== "string" ||
    path.length > 200 ||
    !PATH.test(path)
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    await getVisitStore().addEvent({
      id: randomBytes(6).toString("base64url"),
      ts: new Date().toISOString(),
      sid,
      type,
      path,
      target: clean(body.target, 100),
    });
  } catch (err) {
    console.error("[analytics] event store failed", err);
  }

  return done();
}
