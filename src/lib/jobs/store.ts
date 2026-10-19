import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { ManualData, ManualRole, Overlay, Snapshot } from "./types";

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

/* ---------- manual data ---------- */

/**
 * Manual entries and overlays live under their own keys, which jobs:sync and
 * /api/jobs-sync never touch, so a publish can't overwrite or delete them.
 * One Redis hash field per record; each write is a compare-and-set on the
 * record's `rev` (in a Lua script, so it's atomic), and the previous version
 * is pushed onto a short history list. Production uses Redis; everywhere else
 * uses .jobs-data/manual.json (git-ignored), same split as the snapshot.
 */
export const MANUAL_KEYS = {
  roles: "jobs:manual:roles",
  overlays: "jobs:manual:overlays",
  history: "jobs:manual:history",
} as const;
export type ManualKind = "roles" | "overlays";

const CAS = `
local cur = redis.call('HGET', KEYS[1], ARGV[1])
local rev = 0
if cur then rev = tonumber(cjson.decode(cur).rev) or 0 end
if rev ~= tonumber(ARGV[2]) then return 0 end
if cur then
  redis.call('LPUSH', KEYS[2], cur)
  redis.call('LTRIM', KEYS[2], 0, 199)
end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[3])
return 1`;

function redisClient() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (process.env.VERCEL_ENV !== "production") return null;
  if (!url || !token) throw new Error("Redis not configured");
  return new Redis({ url, token });
}

const manualFile = () => path.join(process.cwd(), ".jobs-data", "manual.json");
type FileData = { roles: Record<string, ManualRole>; overlays: Record<string, Overlay> };

async function readFileData(): Promise<FileData> {
  try {
    const data = JSON.parse(await readFile(manualFile(), "utf8")) as Partial<FileData>;
    return { roles: data.roles ?? {}, overlays: data.overlays ?? {} };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { roles: {}, overlays: {} };
    throw e;
  }
}

const parse = <T>(v: unknown): T => (typeof v === "string" ? (JSON.parse(v) as T) : (v as T));

export async function getManual(): Promise<ManualData> {
  const redis = redisClient();
  if (redis) {
    const [roles, overlays] = await Promise.all([
      redis.hgetall<Record<string, unknown>>(MANUAL_KEYS.roles),
      redis.hgetall<Record<string, unknown>>(MANUAL_KEYS.overlays),
    ]);
    return {
      roles: Object.values(roles ?? {}).map((v) => parse<ManualRole>(v)),
      overlays: Object.fromEntries(Object.entries(overlays ?? {}).map(([k, v]) => [k, parse<Overlay>(v)])),
    };
  }
  const data = await readFileData();
  return { roles: Object.values(data.roles), overlays: data.overlays };
}

let fileQueue: Promise<unknown> = Promise.resolve();

/**
 * Saves one record if its stored rev still equals `expectedRev` (0 = must not exist yet),
 * bumping rev by one. Returns false when someone else saved it first.
 */
export async function putManual<T extends ManualRole | Overlay>(
  kind: ManualKind,
  record: T,
  expectedRev: number,
): Promise<boolean> {
  const next = { ...record, rev: expectedRev + 1 };
  const redis = redisClient();
  if (redis) {
    const ok = await redis.eval(
      CAS,
      [MANUAL_KEYS[kind], MANUAL_KEYS.history],
      [record.id, String(expectedRev), JSON.stringify(next)],
    );
    return Number(ok) === 1;
  }
  const run = fileQueue.then(async () => {
    const data = await readFileData();
    const table = data[kind] as Record<string, ManualRole | Overlay>;
    if ((table[record.id]?.rev ?? 0) !== expectedRev) return false;
    table[record.id] = next;
    await mkdir(path.dirname(manualFile()), { recursive: true });
    const tmp = `${manualFile()}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2));
    await rename(tmp, manualFile());
    return true;
  });
  fileQueue = run.catch(() => {});
  return run;
}

/** Writes the snapshot to the site's existing Redis (used by /api/jobs-sync). */
export async function saveSnapshot(snapshot: Snapshot): Promise<boolean> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  await new Redis({ url, token }).set(SNAPSHOT_KEY, JSON.stringify(snapshot));
  return true;
}
