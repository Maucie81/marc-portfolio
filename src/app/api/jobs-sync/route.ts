import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { saveSnapshot } from "@/lib/jobs/store";
import type { Snapshot } from "@/lib/jobs/types";

/**
 * Receives the job-search snapshot from `npm run jobs:sync` and writes it to
 * the site's own Redis, so the sync never needs Redis credentials locally
 * (Vercel won't hand those out). Authenticated with JOBS_PASSWORD as a Bearer
 * token; fail-closed if it isn't set. The data itself is never logged.
 */
export const dynamic = "force-dynamic";

const MAX_BYTES = 3_000_000;
const h = (v: string) => createHash("sha256").update(v).digest();
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const reply = (status: number, error: string) =>
  NextResponse.json({ ok: false, error }, { status, headers });

export async function POST(request: Request) {
  const secret = process.env.JOBS_PASSWORD;
  if (!secret) return reply(503, "Not configured.");

  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!timingSafeEqual(h(given), h(secret))) {
    await new Promise((r) => setTimeout(r, 1000));
    return reply(401, "Unauthorized.");
  }

  const text = await request.text();
  if (text.length > MAX_BYTES) return reply(413, "Snapshot too large.");
  let body: Snapshot;
  try {
    body = JSON.parse(text) as Snapshot;
  } catch {
    return reply(400, "Invalid JSON.");
  }
  if (!body || !Array.isArray(body.roles) || typeof body.generatedAt !== "string") {
    return reply(400, "Not a snapshot.");
  }

  try {
    if (!(await saveSnapshot(body))) return reply(503, "Redis not configured on the server.");
  } catch {
    return reply(502, "Could not write to Redis.");
  }
  return NextResponse.json({ ok: true, roles: body.roles.length }, { headers });
}
