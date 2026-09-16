import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PROOF_COOKIE, PROOF_TTL_SECONDS, type ProofPin } from "./types";

/** Server helpers shared by the /api/proof routes. */

export const TO_EMAIL = "marcfavro@gmail.com";

export function readVisitorId(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${PROOF_COOKIE}=([A-Za-z0-9_-]+)`));
  return match ? match[1] : null;
}

/** Sets (or re-arms) the visitor cookie: httpOnly so scripts can't read it,
 * 30-day maxAge matching the notes' own TTL. */
export function withVisitorCookie<T>(res: NextResponse<T>, visitorId: string) {
  res.cookies.set(PROOF_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: PROOF_TTL_SECONDS,
    path: "/",
  });
  return res;
}

export function newId(bytes = 6): string {
  return randomBytes(bytes).toString("base64url");
}

/** Public origin for deep links. Vercel puts the real host in
 * x-forwarded-host; request.url can be the internal one. */
export function requestOrigin(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

/** Emails Marc about a new note. Never throws — a mail hiccup shouldn't
 * cost the visitor their note. Same Resend setup as the contact form. */
export async function notifyNewPin(
  pin: ProofPin,
  origin: string,
  countForVisitor: number,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const who = pin.name?.trim() || "Someone";
  const link = `${origin}${pin.path}?pin=${pin.id}`;
  const lines = [
    `${who} left a note on ${pin.path}:`,
    "",
    pin.text,
    "",
    pin.email ? `Reply to: ${pin.email}` : "No email left — reply lands nowhere.",
    `Note ${countForVisitor} from this visitor.`,
    "",
    `See it in place: ${link}`,
  ];

  try {
    await new Resend(apiKey).emails.send({
      from: "Portfolio Proof Notes <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: pin.email || undefined,
      subject: `Proof note · ${pin.path}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("[proof] email failed", err);
  }
}
