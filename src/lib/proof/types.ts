/** Figma-style "proof notes": a visitor drops a pin anywhere on a page,
 * writes a note, and the note is saved server-side under an anonymous
 * visitor id (cookie) so it's still there when they come back. Every new
 * note also emails Marc with a deep link that opens the page with that pin
 * highlighted. */

/** How long a visitor's notes (and their cookie) live. Matches the copy
 * in ProofPanel — change both together. */
export const PROOF_TTL_DAYS = 30;
export const PROOF_TTL_SECONDS = PROOF_TTL_DAYS * 24 * 60 * 60;

/** Cap per visitor — a light spam guard, not a product limit. */
export const PROOF_MAX_PINS = 25;
export const PROOF_MAX_TEXT = 1000;
export const PROOF_MAX_NAME = 80;

export const PROOF_COOKIE = "proof_vid";

export type ProofPin = {
  id: string;
  visitorId: string;
  /** Route the pin lives on, e.g. "/work/airbnb-hotels". */
  path: string;
  /** CSS selector for the element the pin is glued to — see anchor.ts. */
  anchor: string;
  /** Position inside that element as fractions of its width/height, so the
   * pin stays put when the page reflows at a different width. */
  ax: number;
  ay: number;
  /** Fallback if the anchor can't be found (page changed): fraction of the
   * document width + absolute page y in px. */
  px: number;
  py: number;
  text: string;
  name?: string;
  email?: string;
  createdAt: number;
};

/** What a deep link (`?pin=id`) may reveal to whoever opens it — never the
 * visitor id or email. */
export type PublicPin = Omit<ProofPin, "visitorId" | "email">;

export function toPublicPin(pin: ProofPin): PublicPin {
  const { visitorId: _v, email: _e, ...rest } = pin;
  void _v;
  void _e;
  return rest;
}
