import { Redis } from "@upstash/redis";
import { PROOF_TTL_SECONDS, type ProofPin } from "./types";

/**
 * Server-side storage for proof notes. Uses Upstash Redis when its env vars
 * are present (the Vercel Marketplace integration sets KV_REST_API_URL /
 * KV_REST_API_TOKEN; a direct Upstash setup sets UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN — both accepted). Redis key expiry is what makes
 * "notes disappear after 30 days" a setting rather than a cleanup job.
 *
 * Without those vars (local dev, or before the integration is added) it
 * falls back to an in-memory map so the feature still works end to end —
 * notes just don't survive a server restart.
 *
 * Keys:
 *   proof:pin:{id}       → the pin (JSON), TTL 30d
 *   proof:visitor:{vid}  → set of that visitor's pin ids, TTL 30d
 */

export interface ProofStore {
  getPin(id: string): Promise<ProofPin | null>;
  putPin(pin: ProofPin): Promise<void>;
  deletePin(pin: ProofPin): Promise<void>;
  listVisitorPins(visitorId: string): Promise<ProofPin[]>;
  /** Re-arm the visitor's TTL on activity so an engaged reader's notes
   * don't vanish mid-conversation. */
  touchVisitor(visitorId: string): Promise<void>;
}

const pinKey = (id: string) => `proof:pin:${id}`;
const visitorKey = (vid: string) => `proof:visitor:${vid}`;

function redisStore(redis: Redis): ProofStore {
  return {
    async getPin(id) {
      return (await redis.get<ProofPin>(pinKey(id))) ?? null;
    },
    async putPin(pin) {
      await redis.set(pinKey(pin.id), pin, { ex: PROOF_TTL_SECONDS });
      await redis.sadd(visitorKey(pin.visitorId), pin.id);
      await redis.expire(visitorKey(pin.visitorId), PROOF_TTL_SECONDS);
    },
    async deletePin(pin) {
      await redis.del(pinKey(pin.id));
      await redis.srem(visitorKey(pin.visitorId), pin.id);
    },
    async listVisitorPins(visitorId) {
      const ids = await redis.smembers(visitorKey(visitorId));
      if (ids.length === 0) return [];
      const pins = await redis.mget<(ProofPin | null)[]>(...ids.map(pinKey));
      // A pin can expire before its id leaves the visitor set — drop those.
      return pins
        .filter((p): p is ProofPin => Boolean(p))
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    async touchVisitor(visitorId) {
      await redis.expire(visitorKey(visitorId), PROOF_TTL_SECONDS);
    },
  };
}

type MemoryEntry = { pin: ProofPin; expiresAt: number };
type MemoryState = { pins: Map<string, MemoryEntry>; warned: boolean };

function memoryStore(): ProofStore {
  // Hang off globalThis so Next's dev HMR doesn't wipe notes on every edit.
  const g = globalThis as unknown as { __proofMemory?: MemoryState };
  const state = (g.__proofMemory ??= { pins: new Map(), warned: false });
  if (!state.warned) {
    state.warned = true;
    console.warn(
      "[proof] No Redis configured (KV_REST_API_URL / KV_REST_API_TOKEN) — notes are in memory only.",
    );
  }

  const live = (entry: MemoryEntry | undefined) =>
    entry && entry.expiresAt > Date.now() ? entry.pin : null;

  return {
    async getPin(id) {
      return live(state.pins.get(id));
    },
    async putPin(pin) {
      state.pins.set(pin.id, {
        pin,
        expiresAt: Date.now() + PROOF_TTL_SECONDS * 1000,
      });
    },
    async deletePin(pin) {
      state.pins.delete(pin.id);
    },
    async listVisitorPins(visitorId) {
      return [...state.pins.values()]
        .map(live)
        .filter((p): p is ProofPin => Boolean(p) && p!.visitorId === visitorId)
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    async touchVisitor() {},
  };
}

let cached: ProofStore | null = null;

export function getProofStore(): ProofStore {
  if (cached) return cached;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  cached = url && token ? redisStore(new Redis({ url, token })) : memoryStore();
  return cached;
}
