import { NextResponse } from "next/server";
import { getProofStore } from "@/lib/proof/store";
import { readVisitorId } from "@/lib/proof/server";
import { toPublicPin } from "@/lib/proof/types";

type Ctx = { params: Promise<{ id: string }> };

/** One pin by id — what the `?pin=` deep link in Marc's email resolves.
 * Public but unguessable (48-bit random ids), and stripped of anything
 * identifying the visitor. */
export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const pin = await getProofStore().getPin(id);
  if (!pin) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ pin: toPublicPin(pin) });
}

/** Visitors can delete their own notes only. */
export async function DELETE(request: Request, { params }: Ctx) {
  const { id } = await params;
  const visitorId = readVisitorId(request);
  const store = getProofStore();
  const pin = await store.getPin(id);
  if (!pin || !visitorId || pin.visitorId !== visitorId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await store.deletePin(pin);
  return NextResponse.json({ ok: true });
}
