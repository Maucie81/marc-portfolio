"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { pageLabel } from "@/lib/page-titles";
import { placePin, timeAgo, type PinPlacement } from "@/lib/proof/anchor";
import { PROOF_MAX_TEXT } from "@/lib/proof/types";
import { useProof, type ClientPin, type Identity } from "./ProofProvider";

/**
 * Everything that floats over the page: the placing overlay + "+" cursor,
 * the numbered pins, and the card next to the active pin (composer for a
 * draft, the note itself otherwise). Pins are positioned by writing styles
 * straight to the DOM on scroll/resize rather than through React state —
 * a handful of elements moving every frame doesn't need a re-render.
 *
 * Every element here carries data-proof-ui so anchor.ts never anchors a
 * note to our own chrome and click-outside handling can tell us apart.
 */

type LayerPin = {
  id: string;
  anchor: string;
  ax: number;
  ay: number;
  px: number;
  py: number;
  kind: "own" | "foreign" | "draft";
};

const CARD_W = 304;

export default function ProofLayer() {
  const proof = useProof();
  const { mode, draft, pinsHere, foreignPin, activeId, jump, identity, error } = proof;

  const pinEls = useRef(new Map<string, HTMLElement>());
  const cardEl = useRef<HTMLDivElement | null>(null);
  const cursorEl = useRef<HTMLDivElement | null>(null);
  const placements = useRef(new Map<string, PinPlacement>());
  const [draftText, setDraftText] = useState("");

  useEffect(() => setDraftText(""), [draft]);

  const layerPins = useMemo<LayerPin[]>(() => {
    const list: LayerPin[] = pinsHere.map((p) => ({ ...p, kind: "own" }));
    if (foreignPin && !pinsHere.some((p) => p.id === foreignPin.id)) {
      list.push({ ...foreignPin, kind: "foreign" });
    }
    if (draft) list.push({ id: "draft", ...draft, kind: "draft" });
    return list;
  }, [pinsHere, foreignPin, draft]);

  const cardFor = draft ? "draft" : activeId;
  const activePin: ClientPin | null =
    !draft && activeId
      ? (pinsHere.find((p) => p.id === activeId) ??
        (foreignPin?.id === activeId ? foreignPin : null))
      : null;

  /** Re-place every pin (and the card) from its anchor element. */
  const layout = useCallback(() => {
    for (const pin of layerPins) {
      const el = pinEls.current.get(pin.id);
      if (!el) continue;
      const place = placePin(pin);
      placements.current.set(pin.id, place);
      el.style.position = place.fixed ? "fixed" : "absolute";
      el.style.left = `${place.left}px`;
      el.style.top = `${place.top}px`;
    }
    const card = cardEl.current;
    const place = cardFor ? placements.current.get(cardFor) : undefined;
    if (card && place) {
      const vx = place.fixed ? place.left : place.left - window.scrollX;
      const vy = place.fixed ? place.top : place.top - window.scrollY;
      const h = card.offsetHeight;
      // Default: to the right of the pin, top edges aligned (the pin's
      // 28px body sits above its anchor point). Flip left / above when
      // that would run off screen and the other side has room.
      const flipX = vx + 36 + CARD_W > window.innerWidth - 16 && vx - CARD_W - 8 > 16;
      const flipY = vy - 28 + h > window.innerHeight - 16 && vy - 36 - h > 8;
      card.style.position = place.fixed ? "fixed" : "absolute";
      card.style.left = `${flipX ? place.left - CARD_W - 8 : place.left + 36}px`;
      card.style.top = `${flipY ? place.top - 36 - h : place.top - 28}px`;
    }
  }, [layerPins, cardFor]);

  useLayoutEffect(() => {
    layout();
  }, [layout]);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        layout();
      });
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    if (cardEl.current) ro.observe(cardEl.current);
    // Late images/fonts and GSAP-driven layout right after a route change.
    const tick = window.setInterval(schedule, 400);
    const stop = window.setTimeout(() => window.clearInterval(tick), 4000);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      window.clearInterval(tick);
      window.clearTimeout(stop);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [layout]);

  // Jump: scroll a pin into the middle of the viewport once its anchor
  // exists (a freshly loaded page may still be rendering it).
  useEffect(() => {
    if (!jump) return;
    let tries = 0;
    let timer = 0;
    const attempt = () => {
      layout();
      const place = placements.current.get(jump.id);
      if (place && (!place.orphan || tries >= 15)) {
        if (!place.fixed) {
          window.scrollTo({
            top: Math.max(0, place.top - window.innerHeight / 2),
            behavior: "smooth",
          });
        }
        return;
      }
      tries += 1;
      timer = window.setTimeout(attempt, 120);
    };
    attempt();
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump]);

  // Click outside: close an open note, or drop an untouched draft.
  useEffect(() => {
    if (!cardFor) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest("[data-proof-ui]")) return;
      if (draft) {
        if (!draftText.trim()) proof.cancelDraft();
      } else {
        proof.setActive(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [cardFor, draft, draftText, proof]);

  const nextNumber = proof.pins.length + 1;

  return (
    <>
      {mode === "placing" ? (
        <div
          data-proof-ui=""
          className="fixed inset-0 z-[80] cursor-none"
          onMouseMove={(e) => {
            const c = cursorEl.current;
            if (!c) return;
            c.style.left = `${e.clientX}px`;
            c.style.top = `${e.clientY}px`;
            c.style.opacity = "1";
          }}
          onMouseLeave={() => {
            if (cursorEl.current) cursorEl.current.style.opacity = "0";
          }}
          onClick={(e) => proof.placeDraft(e.clientX, e.clientY)}
        >
          <div
            ref={cursorEl}
            aria-hidden
            className="pointer-events-none fixed opacity-0"
            style={{ left: -100, top: -100 }}
          >
            <PinGlyph tone="accent" className="-translate-y-full">
              +
            </PinGlyph>
          </div>
          <div className="t-frame-mono pointer-events-none fixed left-1/2 top-14 -translate-x-1/2 border border-line bg-white px-3 py-1 shadow-[0_2px_8px_rgba(0,0,0,.08)] lg:top-[54px]">
            Click anywhere to leave a note · Esc to cancel
          </div>
        </div>
      ) : null}

      <div data-proof-ui="" className="pointer-events-none absolute left-0 top-0 z-[45] h-0 w-0">
        {layerPins.map((pin) => {
          const isActive = cardFor === pin.id;
          const label =
            pin.kind === "draft"
              ? String(nextNumber)
              : pin.kind === "foreign"
                ? "•"
                : String(proof.numberOf(pin.id));
          return (
            <button
              key={pin.id}
              type="button"
              data-proof-ui=""
              ref={(el) => {
                if (el) pinEls.current.set(pin.id, el);
                else pinEls.current.delete(pin.id);
              }}
              aria-label={pin.kind === "draft" ? "New note" : `Note ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                if (pin.kind === "draft") return;
                proof.setActive(isActive ? null : pin.id);
              }}
              className="pointer-events-auto absolute -translate-y-full"
              style={{ left: -100, top: -100 }}
            >
              <PinGlyph
                tone={pin.kind === "foreign" ? "ink" : "accent"}
                className={`transition-transform ${isActive ? "scale-110 ring-ink-strong" : "hover:scale-110"}`}
              >
                {label}
              </PinGlyph>
            </button>
          );
        })}
      </div>

      {cardFor ? (
        <div data-proof-ui="" className="pointer-events-none absolute left-0 top-0 z-[75] h-0 w-0">
          <div
            ref={cardEl}
            data-proof-ui=""
            role="dialog"
            aria-label={draft ? "New note" : "Note"}
            className="pointer-events-auto absolute border border-line bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,.14)]"
            style={{ width: CARD_W, left: -1000, top: -1000 }}
          >
            {draft ? (
              <Composer
                number={nextNumber}
                page={pageLabel(draft.path)}
                text={draftText}
                setText={setDraftText}
                identity={identity}
                error={error}
                onCancel={proof.cancelDraft}
                onSubmit={proof.submitDraft}
              />
            ) : activePin ? (
              <NoteCard
                pin={activePin}
                own={pinsHere.some((p) => p.id === activePin.id)}
                number={proof.numberOf(activePin.id)}
                onClose={() => proof.setActive(null)}
                onDelete={() => proof.removePin(activePin.id)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Figma-style teardrop: a circle whose bottom-left corner is squared off —
 * that corner is the exact spot the note points at. */
export function PinGlyph({
  children,
  tone,
  className = "",
}: {
  children: React.ReactNode;
  tone: "accent" | "ink";
  className?: string;
}) {
  return (
    <span
      className={`flex size-7 items-center justify-center rounded-full rounded-bl-[3px] text-[11px] font-semibold leading-none text-white shadow-[0_1px_4px_rgba(0,0,0,.25)] ring-2 ring-white [font-family:var(--font-mono),ui-monospace,monospace] ${
        tone === "accent" ? "bg-accent" : "bg-ink-strong"
      } ${className}`}
    >
      {children}
    </span>
  );
}

const fieldClass =
  "t-body w-full border-b border-line bg-transparent pb-1.5 text-ink-2 transition-colors placeholder:text-line focus:border-accent focus-visible:outline-none!";

const closeClass =
  "-mr-1 -mt-1 flex size-6 items-center justify-center text-base leading-none text-muted transition-colors hover:text-accent";

function Composer({
  number,
  page,
  text,
  setText,
  identity,
  error,
  onCancel,
  onSubmit,
}: {
  number: number;
  page: string;
  text: string;
  setText: (v: string) => void;
  identity: Identity;
  error: string | null;
  onCancel: () => void;
  onSubmit: (input: { text: string; name: string; email: string; website: string }) => Promise<boolean>;
}) {
  const [name, setName] = useState(identity.name);
  const [email, setEmail] = useState(identity.email);
  const [website, setWebsite] = useState("");
  const [showWho, setShowWho] = useState(Boolean(identity.name || identity.email));
  const [busy, setBusy] = useState(false);
  const textarea = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textarea.current?.focus();
  }, []);

  const canPost = text.trim().length > 0 && !busy;

  async function submit() {
    if (!canPost) return;
    setBusy(true);
    await onSubmit({ text, name, email, website });
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="t-frame-mono flex items-center justify-between">
        <span>
          Note {number} · {page}
        </span>
        <button type="button" onClick={onCancel} aria-label="Cancel" className={closeClass}>
          ×
        </button>
      </div>
      <textarea
        ref={textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            void submit();
          }
        }}
        rows={3}
        maxLength={PROOF_MAX_TEXT}
        placeholder="What's on your mind? Be blunt."
        className={`${fieldClass} resize-none`}
      />
      {showWho ? (
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className={`${fieldClass} text-[13px]`}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className={`${fieldClass} text-[13px]`}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowWho(true)}
          className="t-meta-sm self-start text-left transition-colors hover:text-accent"
        >
          + Add your name or email (optional)
        </button>
      )}
      {/* Honeypot — hidden from people, filled by bots. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      {error ? <p className="t-meta-sm text-accent!">{error}</p> : null}
      <div className="flex items-center justify-between">
        <span className="t-frame-mono text-muted!">⌘↵ to post</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold leading-6 text-muted transition-colors [font-family:var(--font-display),system-ui,sans-serif] hover:text-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canPost}
            className="bg-accent px-3 py-0.5 text-xs font-semibold leading-6 text-white transition-opacity [font-family:var(--font-display),system-ui,sans-serif] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteCard({
  pin,
  own,
  number,
  onClose,
  onDelete,
}: {
  pin: ClientPin;
  own: boolean;
  number: number;
  onClose: () => void;
  onDelete: () => void;
}) {
  const who = pin.name?.trim() || (own ? "You" : "A visitor");
  return (
    <div className="flex flex-col gap-2">
      <div className="t-frame-mono flex items-center justify-between gap-3">
        <span className="truncate">
          {own ? `Note ${number}` : "Visitor note"} · {who} · {timeAgo(pin.createdAt)}
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className={closeClass}>
          ×
        </button>
      </div>
      <p className="t-body whitespace-pre-wrap break-words text-ink-2">{pin.text}</p>
      {own ? (
        <button
          type="button"
          onClick={onDelete}
          className="t-meta-sm self-start transition-colors hover:text-accent"
        >
          Delete note
        </button>
      ) : (
        <p className="t-meta-sm">Opened from a note link.</p>
      )}
    </div>
  );
}
