import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  CONTACT_EMAIL_DAILY,
  CONTACT_LIMITS,
  MAX_EMAIL,
  MAX_MESSAGE,
  MAX_NAME,
  cleanLine,
  cleanText,
  hit,
  hitGlobal,
  readGuardedJson,
  tooMany,
  visitorKey,
} from "@/lib/security";

const TO_EMAIL = "marcfavro@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await readGuardedJson(request);
  if (body instanceof Response) return body;

  const { name, email, message, ref_code: trap } = body;

  // Honeypot: people never see this field, so anything in it is a bot.
  // Answer as if it worked so the bot has nothing to learn from.
  if (typeof trap === "string" && trap.trim()) {
    return NextResponse.json({ success: true });
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return NextResponse.json(
      { error: "Name, email, and message are all required." },
      { status: 400 },
    );
  }

  const cleanName = cleanLine(name);
  const cleanEmail = cleanLine(email);
  const cleanMessage = cleanText(message);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return NextResponse.json(
      { error: "Name, email, and message are all required." },
      { status: 400 },
    );
  }
  if (cleanName.length > MAX_NAME) {
    return NextResponse.json(
      { error: `Keep your name under ${MAX_NAME} characters.` },
      { status: 400 },
    );
  }
  if (cleanEmail.length > MAX_EMAIL || !EMAIL_PATTERN.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (cleanMessage.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: `Keep your message under ${MAX_MESSAGE.toLocaleString("en-US")} characters.` },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email delivery isn't configured yet." },
      { status: 500 },
    );
  }

  // Per-visitor limit first, then the contact form's own daily email
  // budget (separate from proof notes').
  const visitor = await hit("contact", visitorKey(request), CONTACT_LIMITS);
  if (!visitor.allowed) {
    return tooMany(
      visitor,
      "You've sent a few messages already. Please try again a little later.",
    );
  }
  const budget = await hitGlobal("email:contact", CONTACT_EMAIL_DAILY);
  if (!budget.allowed) {
    return tooMany(
      budget,
      "I can't take more messages through the form right now. Please email me directly.",
    );
  }

  const resend = new Resend(apiKey);

  try {
    // onboarding@resend.dev is Resend's shared sandbox sender — works with
    // no setup but only delivers to the account's own verified address.
    // Swap to an address on a domain you've verified in Resend to send to
    // anyone else.
    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact Form <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: cleanEmail,
      subject: `New message from ${cleanName}`,
      text: `From: ${cleanName} <${cleanEmail}>\n\n${cleanMessage}`,
    });

    // Success only once Resend has accepted the message and given it an id.
    if (error || !data?.id) {
      console.error("[contact] Resend did not accept the message", error?.name);
      return NextResponse.json({ error: "Failed to send message." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] send failed", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 502 });
  }
}
