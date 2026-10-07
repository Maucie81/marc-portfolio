import { readFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Snapshot } from "./types";

/**
 * Where the /jobs snapshot lives. Production reads one JSON value from the
 * same Upstash Redis the analytics use (key below), pushed by
 * `npm run jobs:sync`. Everywhere else (local dev, `next start`, previews)
 * reads .jobs-data/snapshot.json, which the same script writes and git
 * ignores. The snapshot is personal data: it is never committed or bundled.
 */
export const SNAPSHOT_KEY = "jobs:snapshot";

export async function getSnapshot(): Promise<Snapshot | null> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (process.env.VERCEL_ENV === "production") {
    if (!url || !token) return null;
    const value = await new Redis({ url, token }).get<Snapshot | string>(SNAPSHOT_KEY);
    if (!value) return null;
    return typeof value === "string" ? (JSON.parse(value) as Snapshot) : value;
  }

  try {
    const file = path.join(process.cwd(), ".jobs-data", "snapshot.json");
    return JSON.parse(await readFile(file, "utf8")) as Snapshot;
  } catch {
    return null;
  }
}

/** Writes the snapshot to the site's existing Redis (used by /api/jobs-sync). */
export async function saveSnapshot(snapshot: Snapshot): Promise<boolean> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  await new Redis({ url, token }).set(SNAPSHOT_KEY, JSON.stringify(snapshot));
  return true;
}
