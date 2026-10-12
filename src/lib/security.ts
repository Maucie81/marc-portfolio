import { createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";

/**
 * Shared guards for the endpoints that send email (/api/contact and
 * /api/proof): request checks, input cleaning, and Redis-backed rate limits.
 * Redis is the same Upstash instance the proof notes and analytics use;
 * without it (local dev, Preview) an in-memory map stands in, like the proof
 * store does.
 */

/* ---------- request checks ---------- */

export const MAX_BODY_BYTES = 16 * 1024;

const json = (error: string, status: number) =>
  Response.json({ error }, { status });

/** Hosts a browser may legitimately post from: this deployment and the
 * configured public site. */
function allowedHosts(request: Request): Set<string> {
  const hosts = new Set<string>();
  for (const h of [request.headers.get("x-forwarded-host"), request.headers.get("host")]) {
    if (h) hosts.add(h.toLowerCase());
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      hosts.add(new URL(site).host.toLowerCase());
    } catch {
      /* ignore a malformed value */
    }
  }
  return hosts;
}

/**
 * The checks every posting endpoint shares. Returns the parsed JSON object,
 * or the error Response to send instead:
 *  - a cross-site browser request (Sec-Fetch-Site, or an Origin that isn't
 *    this site) → 403. A request with no Origin at all (curl, server-side)
 *    passes here; the rate limits are what bound those.
 *  - not JSON → 415 (so a plain-text cross-site form post can't slip past
 *    the CORS preflight)
 *  - body over 16 KB → 413
 */
export async function readGuardedJson(
  request: Request,
): Promise<Record<string, unknown> | Response> {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return json("Request not allowed.", 403);
  }
  const origin = request.headers.get("origin");
  if (origin) {
    let host = "";
    try {
      host = new URL(origin).host.toLowerCase();
    } catch {
      /* falls through to the rejection */
    }
    if (!host || !allowedHosts(request).has(host)) {
      return json("Request not allowed.", 403);
    }
  }

  const type = request.headers.get("content-type") ?? "";
  if (!/^application\/json\b/i.test(type)) {
    return json("Invalid request.", 415);
  }

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return json("That message is too large.", 413);
  }
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return json("That message is too large.", 413);
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    return json("Invalid request body.", 400);
  }
}

/* ---------- input cleaning ---------- */

// C0/C1 controls (minus tab + newline, handled per field), zero-width and
// bidi-override characters used to disguise text.
const CONTROLS = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩﻿]/g;

/** Single-line field (name, email): no control characters at all, runs of
 * whitespace collapsed, trimmed. */
export function cleanLine(value: string): string {
  return value
    .replace(/[\t\n]/g, " ")
    .replace(CONTROLS, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** Multi-line field (message): keeps line breaks and tabs so formatting
 * survives, normalizes CRLF, removes everything else invisible, and caps
 * runs of blank lines at one. */
export function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(CONTROLS, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ---------- rate limiting ---------- */

export type Window = {
  name: string;
  limit: number;
  seconds: number;
  /** Counted across every visitor instead of per visitor — a ceiling on the
   * whole endpoint, whoever is calling. */
  shared?: boolean;
};

export type LimitResult = { allowed: true } | { allowed: false; retryAfter: number };

// One atomic step: if any counter is already at its limit, change nothing
// and report the longest wait; otherwise bump every counter. A counter
// that somehow has no expiry (TTL -1) gets one again, so none can outlive
// its window. KEYS = counters; ARGV = limit, seconds per key.
const SCRIPT = `
local wait = 0
for i, key in ipairs(KEYS) do
  local limit = tonumber(ARGV[i * 2 - 1])
  local count = tonumber(redis.call('GET', key) or '0')
  if count >= limit then
    local ttl = redis.call('TTL', key)
    if ttl < 1 then ttl = tonumber(ARGV[i * 2]) end
    if ttl > wait then wait = ttl end
  end
end
if wait > 0 then return {0, wait} end
for i, key in ipairs(KEYS) do
  redis.call('INCR', key)
  if redis.call('TTL', key) < 0 then redis.call('EXPIRE', key, tonumber(ARGV[i * 2])) end
end
return {1, 0}
`;

let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

type Memory = Map<string, { count: number; expiresAt: number }>;
function memory(): Memory {
  const g = globalThis as unknown as { __rateMemory?: Memory };
  return (g.__rateMemory ??= new Map());
}

function memoryHit(keys: string[], windows: Window[]): LimitResult {
  const map = memory();
  const now = Date.now();
  for (const [k, e] of map) if (e.expiresAt <= now) map.delete(k);
  let wait = 0;
  keys.forEach((key, i) => {
    const e = map.get(key);
    if (e && e.count >= windows[i].limit) {
      wait = Math.max(wait, Math.ceil((e.expiresAt - now) / 1000));
    }
  });
  if (wait > 0) return { allowed: false, retryAfter: wait };
  keys.forEach((key, i) => {
    const e = map.get(key);
    if (e) e.count += 1;
    else map.set(key, { count: 1, expiresAt: now + windows[i].seconds * 1000 });
  });
  return { allowed: true };
}

/**
 * Counts one hit against every window for `subject` and says whether it's
 * allowed. Fixed windows, atomic in Redis. If Redis errors the hit is
 * allowed (a Redis outage shouldn't swallow a real message) and logged.
 * `scope` namespaces the counters (e.g. "contact").
 */
export async function hit(
  scope: string,
  subject: string,
  windows: Window[],
): Promise<LimitResult> {
  const keys = windows.map((w) => `rl:${scope}:${w.name}:${w.shared ? "all" : subject}`);
  const client = getRedis();
  if (!client) return memoryHit(keys, windows);
  try {
    const args = windows.flatMap((w) => [w.limit, w.seconds]);
    const [ok, wait] = (await client.eval(SCRIPT, keys, args)) as [number, number];
    return ok === 1 ? { allowed: true } : { allowed: false, retryAfter: wait };
  } catch (err) {
    console.error("[security] rate limit unavailable, allowing", err);
    return { allowed: true };
  }
}

/** Same as `hit` for a single global counter (no subject). */
export const hitGlobal = (scope: string, window: Window) =>
  hit(scope, "all", [window]);

/* ---------- visitor identity ---------- */

/**
 * An opaque id for the requester's IP, for use in counter keys. The raw
 * address is never stored: it's HMAC'd with a server-side secret (an
 * IPv4 space is small enough that a plain hash could be reversed) and
 * truncated. Vercel overwrites x-forwarded-for / x-real-ip with the real
 * client address, so they can't be spoofed from outside. With no address
 * at all everything shares one "unknown" bucket — stricter, never open.
 */
export function visitorKey(request: Request): string {
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "";
  const secret =
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.RESEND_API_KEY ??
    "dev";
  return createHmac("sha256", secret)
    .update(ip.trim() || "unknown")
    .digest("hex")
    .slice(0, 24);
}

export function tooMany(result: { retryAfter: number }, message: string) {
  return Response.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
  );
}

/* ---------- limits ---------- */

const DAY = 24 * 60 * 60;
const TEN_MIN = 10 * 60;

export const CONTACT_LIMITS: Window[] = [
  { name: "10m", limit: 3, seconds: TEN_MIN },
  { name: "1d", limit: 8, seconds: DAY },
];
export const PROOF_LIMITS: Window[] = [
  { name: "10m", limit: 10, seconds: TEN_MIN },
  { name: "1d", limit: 30, seconds: DAY },
];

/**
 * Daily email budgets, counted separately so proof-note traffic can never
 * use up the contact form's share. The Resend quota couldn't be verified
 * from here (the account's plan isn't readable with the available key), so
 * these assume the smallest published plan — 100 emails a day — and stay
 * well under it: 25 + 15 = 40. Raise them once the real quota is confirmed.
 */
export const CONTACT_EMAIL_DAILY: Window = { name: "1d", limit: 25, seconds: DAY };
export const PROOF_EMAIL_DAILY: Window = { name: "1d", limit: 15, seconds: DAY };

export const MAX_NAME = 100;
export const MAX_EMAIL = 254;
export const MAX_MESSAGE = 5000;
