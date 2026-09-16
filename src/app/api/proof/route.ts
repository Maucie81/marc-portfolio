import { NextResponse } from "next/server";
import { getProofStore } from "@/lib/proof/store";
import {
  newId,
  notifyNewPin,
  readVisitorId,
  requestOrigin,
  withVisitorCookie,
} from "@/lib/proof/server";
import {
  PROOF_MAX_NAME,
  PROOF_MAX_PINS,
  PROOF_MAX_TEXT,
  type ProofPin,
} from "@/lib/proof/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const stripVisitor = ({ visitorId: _v, ...pin }: ProofPin) => {
  void _v;
  return pin;
};

/** The current visitor's own notes, across every page. No cookie → none. */
export async function GET(request: Request) {
  const visitorId = readVisitorId(request);
  if (!visitorId) return NextResponse.json({ pins: [] });

  const store = getProofStore();
  const pins = await store.listVisitorPins(visitorId);
  await store.touchVisitor(visitorId);
  return withVisitorCookie(
    NextResponse.json({ pins: pins.map(stripVisitor) }),
    visitorId,
  );
}

const unit = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = ((await request.json()) ?? {}) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { path, anchor, ax, ay, px, py, text, name, email, website } = body;

  // Honeypot: real people never see this field. Pretend it worked.
  if (typeof website === "string" && website.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.length > 200 ||
    typeof anchor !== "string" ||
    anchor.length > 600 ||
    !unit(ax) ||
    !unit(ay) ||
    !unit(px) ||
    typeof py !== "number" ||
    !Number.isFinite(py) ||
    typeof text !== "string" ||
    !text.trim()
  ) {
    return NextResponse.json({ error: "Write a note first." }, { status: 400 });
  }
  if (text.trim().length > PROOF_MAX_TEXT) {
    return NextResponse.json(
      { error: `Keep it under ${PROOF_MAX_TEXT} characters.` },
      { status: 400 },
    );
  }

  const cleanName =
    typeof name === "string" ? name.trim().slice(0, PROOF_MAX_NAME) : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  if (cleanEmail && !EMAIL_PATTERN.test(cleanEmail)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  const store = getProofStore();
  const visitorId = readVisitorId(request) ?? newId(12);
  const existing = await store.listVisitorPins(visitorId);
  if (existing.length >= PROOF_MAX_PINS) {
    return NextResponse.json(
      { error: `That's the limit (${PROOF_MAX_PINS} notes). Delete one to add another.` },
      { status: 429 },
    );
  }

  const pin: ProofPin = {
    id: newId(),
    visitorId,
    path,
    anchor,
    ax,
    ay,
    px,
    py: Math.max(0, Math.round(py)),
    text: text.trim(),
    ...(cleanName ? { name: cleanName } : {}),
    ...(cleanEmail ? { email: cleanEmail } : {}),
    createdAt: Date.now(),
  };

  await store.putPin(pin);
  await notifyNewPin(pin, requestOrigin(request), existing.length + 1);

  return withVisitorCookie(NextResponse.json({ pin: stripVisitor(pin) }), visitorId);
}
