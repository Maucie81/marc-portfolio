import { Redis } from "@upstash/redis";
import type { EventType } from "./events";

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
 *   analytics:events → sorted set, score = epoch ms, member = ActionEvent —
 *     actions, plus (from the tracker marking pageviews `seen`) what came
 *     into view: the hero edition, homepage sections, Recent work cards
 *   analytics:engaged:YYYY-MM-DD (UTC day) → hash, "sid|path" → engaged ms
 *     added up from the tracker's checkpoints; nothing finer is kept
 *   analytics:depth:YYYY-MM-DD (UTC day) → hash, "sid|path|milestone" →
 *     epoch ms it was first reached (25, 50, 75, 90, or 100 = the whole
 *     page fit on screen); set-if-absent, so a repeat changes nothing
 *
 * Pageviews recorded before 2026-10-07 have no sid, browser or os; only
 * pageviews marked `timed` come from a tracker that measures engaged time.
 *
 * To remove the whole feature: delete src/lib/analytics, src/app/analytics,
 * src/app/api/{visit,event,engage,depth}, src/components/site/VisitTracker.tsx
 * and its line in layout.tsx, the trackAction call in ContactForm.tsx, then
 * DEL analytics:visits, analytics:events, analytics:engaged:* and
 * analytics:depth:* in the Upstash console.
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
  /** Sent by a tracker that measures engaged time (from Oct 7, 2026), so a
   * visit without any is a real zero rather than "not measured". */
  timed?: boolean;
  /** Sent by a tracker that records scroll depth (from Oct 7, 2026). */
  scroll?: boolean;
  /** Sent by a tracker that records what came into view (hero edition,
   * homepage sections, Recent work cards) and Proof notes opens. */
  seen?: boolean;
};

export type ActionEvent = {
  id: string;
  ts: string;
  sid: string;
  /** An action, or something that came into view (events.ts EXPOSURES). */
  type: EventType;
  /** The page the action happened on. */
  path: string;
  /** What it pointed at, where that matters (e.g. the case study opened,
   * the hero edition or section seen). */
  target: string | null;
};

/** Engaged time one visit spent on one page. */
export type Engaged = { sid: string; path: string; ms: number };

/** A scroll milestone one visit reached on one page. */
export type Depth = { sid: string; path: string; milestone: number };

export interface VisitStore {
  add(visit: Visit): Promise<void>;
  /** Every visit at or after `sinceMs`, oldest first. */
  since(sinceMs: number): Promise<Visit[]>;
  total(): Promise<number>;
  addEvent(event: ActionEvent): Promise<void>;
  /** Every action at or after `sinceMs`, oldest first. */
  eventsSince(sinceMs: number): Promise<ActionEvent[]>;
  addEngaged(engaged: Engaged, atMs: number): Promise<void>;
  /** Engaged totals from the UTC days spanning fromMs → toMs. */
  engagedBetween(fromMs: number, toMs: number): Promise<Engaged[]>;
  addDepth(sid: string, path: string, milestones: number[], atMs: number): Promise<void>;
  /** Milestones from the UTC days spanning fromMs → toMs. */
  depthBetween(fromMs: number, toMs: number): Promise<Depth[]>;
}

const VISITS = "analytics:visits";
const EVENTS = "analytics:events";
const DAY = 24 * 60 * 60 * 1000;
const dayKey = (prefix: string, ms: number) =>
  `${prefix}:${new Date(ms).toISOString().slice(0, 10)}`;
const engagedKey = (ms: number) => dayKey("analytics:engaged", ms);
const depthKey = (ms: number) => dayKey("analytics:depth", ms);
const engagedField = (e: Engaged) => `${e.sid}|${e.path}`;

/** One key per UTC day the range touches. */
function dayKeys(toKey: (ms: number) => string, fromMs: number, toMs: number) {
  const keys: string[] = [];
  for (let d = fromMs - (fromMs % DAY); d <= toMs; d += DAY) keys.push(toKey(d));
  return keys;
}
const engagedKeys = (fromMs: number, toMs: number) => dayKeys(engagedKey, fromMs, toMs);
const depthKeys = (fromMs: number, toMs: number) => dayKeys(depthKey, fromMs, toMs);

function parseDepth(hashes: (Record<string, unknown> | null)[]): Depth[] {
  const out: Depth[] = [];
  for (const hash of hashes) {
    for (const field of Object.keys(hash ?? {})) {
      const [sid, path, milestone] = field.split("|");
      if (sid && path && milestone) out.push({ sid, path, milestone: Number(milestone) });
    }
  }
  return out;
}

function parseEngaged(hashes: (Record<string, unknown> | null)[]): Engaged[] {
  const out: Engaged[] = [];
  for (const hash of hashes) {
    for (const [field, ms] of Object.entries(hash ?? {})) {
      const bar = field.indexOf("|");
      if (bar > 0) out.push({ sid: field.slice(0, bar), path: field.slice(bar + 1), ms: Number(ms) || 0 });
    }
  }
  return out;
}
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
    async addEngaged(engaged, atMs) {
      await redis.hincrby(engagedKey(atMs), engagedField(engaged), engaged.ms);
    },
    async engagedBetween(fromMs, toMs) {
      const keys = engagedKeys(fromMs, toMs);
      if (keys.length === 0) return [];
      const pipe = redis.pipeline();
      for (const key of keys) pipe.hgetall(key);
      return parseEngaged((await pipe.exec()) as (Record<string, unknown> | null)[]);
    },
    async addDepth(sid, path, milestones, atMs) {
      const pipe = redis.pipeline();
      for (const m of milestones) pipe.hsetnx(depthKey(atMs), `${sid}|${path}|${m}`, atMs);
      await pipe.exec();
    },
    async depthBetween(fromMs, toMs) {
      const keys = depthKeys(fromMs, toMs);
      if (keys.length === 0) return [];
      const pipe = redis.pipeline();
      for (const key of keys) pipe.hgetall(key);
      return parseDepth((await pipe.exec()) as (Record<string, unknown> | null)[]);
    },
  };
}

function memoryStore(): VisitStore {
  // Hang off globalThis so Next's dev HMR doesn't wipe visits on every edit.
  const g = globalThis as unknown as {
    __analyticsMemory?: Visit[];
    __analyticsEvents?: ActionEvent[];
    __analyticsEngaged?: Map<string, Record<string, number>>;
    __analyticsDepth?: Map<string, Record<string, number>>;
  };
  const visits = (g.__analyticsMemory ??= []);
  const events = (g.__analyticsEvents ??= []);
  const engagedDays = (g.__analyticsEngaged ??= new Map());
  const depthDays = (g.__analyticsDepth ??= new Map());
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
    async addEngaged(engaged, atMs) {
      const key = engagedKey(atMs);
      const day = engagedDays.get(key) ?? {};
      const field = engagedField(engaged);
      day[field] = (day[field] ?? 0) + engaged.ms;
      engagedDays.set(key, day);
    },
    async engagedBetween(fromMs, toMs) {
      return parseEngaged(engagedKeys(fromMs, toMs).map((key) => engagedDays.get(key) ?? null));
    },
    async addDepth(sid, path, milestones, atMs) {
      const key = depthKey(atMs);
      const day = depthDays.get(key) ?? {};
      for (const m of milestones) day[`${sid}|${path}|${m}`] ??= atMs;
      depthDays.set(key, day);
    },
    async depthBetween(fromMs, toMs) {
      return parseDepth(depthKeys(fromMs, toMs).map((key) => depthDays.get(key) ?? null));
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
