import { Redis } from "@upstash/redis";
import type { ActionType } from "./events";

/**
 * Private, first-party visit log behind /analytics. Sits beside Vercel Web
 * Analytics (untouched) to answer what it doesn't: approximate city/region,
 * page, traffic source, the path a visit takes and whether it reached the
 * resume, LinkedIn or a way to get in touch.
 *
 * Nothing that identifies a person: no IP, no user agent, no cookie. `sid`
 * groups one visit's pageviews and actions — a random id the browser keeps
 * in sessionStorage (that tab only) and replaces after 30 idle minutes, so
 * it never links one visit to the next. `id` is random per record and only
 * keeps two identical records in the same millisecond from collapsing into
 * one sorted-set member.
 *
 * Storage is the same Upstash Redis the proof notes use (Vercel Marketplace
 * sets KV_REST_API_URL / KV_REST_API_TOKEN), but only on the production
 * deployment: local dev, `next start` and preview deployments keep visits
 * in memory so testing never mixes into the real numbers.
 *
 * Keys:
 *   analytics:visits → sorted set, score = epoch ms, member = Visit (JSON)
 *   analytics:events → sorted set, score = epoch ms, member = ActionEvent
 *
 * Pageviews recorded before 2026-10-07 have no sid, browser or os.
 *
 * To remove the whole feature: delete src/lib/analytics, src/app/analytics,
 * src/app/api/visit, src/app/api/event, src/components/site/VisitTracker.tsx
 * and its line in layout.tsx, the trackAction call in ContactForm.tsx, then
 * DEL analytics:visits analytics:events in the Upstash console.
 */

export type Device = "mobile" | "tablet" | "desktop";

export type Visit = {
  id: string;
  /** ISO 8601, UTC. */
  ts: string;
  /** The visit (tab session) this pageview belongs to. */
  sid?: string;
  path: string;
  /** Referring hostname only (never the full URL); null for direct. */
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  /** ISO 3166-1 alpha-2, e.g. "US". */
  country: string | null;
  /** ISO 3166-2 subdivision code without the country, e.g. "CA". */
  region: string | null;
  city: string | null;
  device: Device | null;
  browser?: string | null;
  os?: string | null;
};

export type ActionEvent = {
  id: string;
  ts: string;
  sid: string;
  type: ActionType;
  /** The page the action happened on. */
  path: string;
  /** What it pointed at, where that matters (e.g. the case study opened). */
  target: string | null;
};

export interface VisitStore {
  add(visit: Visit): Promise<void>;
  /** Every visit at or after `sinceMs`, oldest first. */
  since(sinceMs: number): Promise<Visit[]>;
  total(): Promise<number>;
  addEvent(event: ActionEvent): Promise<void>;
  /** Every action at or after `sinceMs`, oldest first. */
  eventsSince(sinceMs: number): Promise<ActionEvent[]>;
}

const VISITS = "analytics:visits";
const EVENTS = "analytics:events";
// Reads page through the set so a long "All time" never becomes one huge
// Upstash response.
const PAGE = 5000;

function redisStore(redis: Redis): VisitStore {
  async function range<T>(key: string, sinceMs: number) {
    const out: T[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const page = await redis.zrange<T[]>(key, sinceMs, "+inf", {
        byScore: true,
        offset,
        count: PAGE,
      });
      out.push(...page);
      if (page.length < PAGE) return out;
    }
  }
  return {
    async add(visit) {
      await redis.zadd(VISITS, { score: Date.parse(visit.ts), member: visit });
    },
    since: (sinceMs) => range<Visit>(VISITS, sinceMs),
    async total() {
      return redis.zcard(VISITS);
    },
    async addEvent(event) {
      await redis.zadd(EVENTS, { score: Date.parse(event.ts), member: event });
    },
    eventsSince: (sinceMs) => range<ActionEvent>(EVENTS, sinceMs),
  };
}

function memoryStore(): VisitStore {
  // Hang off globalThis so Next's dev HMR doesn't wipe visits on every edit.
  const g = globalThis as unknown as {
    __analyticsMemory?: Visit[];
    __analyticsEvents?: ActionEvent[];
  };
  const visits = (g.__analyticsMemory ??= []);
  const events = (g.__analyticsEvents ??= []);
  return {
    async add(visit) {
      visits.push(visit);
    },
    async since(sinceMs) {
      return visits.filter((v) => Date.parse(v.ts) >= sinceMs);
    },
    async total() {
      return visits.length;
    },
    async addEvent(event) {
      events.push(event);
    },
    async eventsSince(sinceMs) {
      return events.filter((e) => Date.parse(e.ts) >= sinceMs);
    },
  };
}

let cached: VisitStore | null = null;

export function getVisitStore(): VisitStore {
  if (cached) return cached;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  cached =
    process.env.VERCEL_ENV === "production" && url && token
      ? redisStore(new Redis({ url, token }))
      : memoryStore();
  return cached;
}
