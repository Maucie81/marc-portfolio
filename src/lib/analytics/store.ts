import { Redis } from "@upstash/redis";

/**
 * Private, first-party visit log behind /analytics. Sits beside Vercel Web
 * Analytics (untouched) to answer what it doesn't: approximate city/region,
 * page, and traffic source per page view.
 *
 * One record per page view, nothing that identifies a person: no IP, no
 * user agent, no cookie or visitor id. `id` is random per record — it only
 * keeps two identical views in the same millisecond from collapsing into
 * one sorted-set member, and never links one view to another.
 *
 * Storage is the same Upstash Redis the proof notes use (Vercel Marketplace
 * sets KV_REST_API_URL / KV_REST_API_TOKEN), but only on the production
 * deployment: local dev, `next start` and preview deployments keep visits
 * in memory so testing never mixes into the real numbers.
 *
 * Key:
 *   analytics:visits → sorted set, score = epoch ms, member = Visit (JSON)
 *
 * To remove the whole feature: delete src/lib/analytics, src/app/analytics,
 * src/app/api/visit, src/components/site/VisitTracker.tsx and its line in
 * layout.tsx, then DEL analytics:visits in the Upstash console.
 */

export type Device = "mobile" | "tablet" | "desktop";

export type Visit = {
  id: string;
  /** ISO 8601, UTC. */
  ts: string;
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
};

export interface VisitStore {
  add(visit: Visit): Promise<void>;
  /** Every visit at or after `sinceMs`, oldest first. */
  since(sinceMs: number): Promise<Visit[]>;
  total(): Promise<number>;
}

const KEY = "analytics:visits";
// Reads page through the set so a long "All time" never becomes one huge
// Upstash response.
const PAGE = 5000;

function redisStore(redis: Redis): VisitStore {
  return {
    async add(visit) {
      await redis.zadd(KEY, { score: Date.parse(visit.ts), member: visit });
    },
    async since(sinceMs) {
      const visits: Visit[] = [];
      for (let offset = 0; ; offset += PAGE) {
        const page = await redis.zrange<Visit[]>(KEY, sinceMs, "+inf", {
          byScore: true,
          offset,
          count: PAGE,
        });
        visits.push(...page);
        if (page.length < PAGE) return visits;
      }
    },
    async total() {
      return redis.zcard(KEY);
    },
  };
}

function memoryStore(): VisitStore {
  // Hang off globalThis so Next's dev HMR doesn't wipe visits on every edit.
  const g = globalThis as unknown as { __analyticsMemory?: Visit[] };
  const visits = (g.__analyticsMemory ??= []);
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
