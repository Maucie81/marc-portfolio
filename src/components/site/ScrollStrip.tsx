"use client";

import { useCallback, useEffect, useRef } from "react";

/* ============================================================================
 * Tunable constants — pulled to the top per spec. All the "feel" lives here.
 * ==========================================================================*/

/** Uniform rest height of every card, in px. */
const REST_HEIGHT = 150;
/** Rest width:height ratio. ~0.29:1 measured off the reference footage. */
const REST_ASPECT = 0.29;
/** Rest width, derived so rest cards are a uniform narrow portrait box. */
const REST_WIDTH = Math.round(REST_HEIGHT * REST_ASPECT);
/** Hairline gap between cards, in px. */
const GAP = 6;
/** Peak height the focused card grows to, as a fraction of viewport height.
 *  Kept modest so the focus reads without dominating the whole viewport. */
const PEAK_HEIGHT_VH = 0.42;
/** Half-width of the magnify zone, in px of rest-track distance. A card this
 *  far (in rest spacing) from center has t=0; at center t=1. Kept just over
 *  one card stride so the size ladder is only two rungs — the focus, then one
 *  step down for its immediate neighbors, then straight to the strip baseline
 *  (no long multi-step gradient). */
const ZONE_WIDTH = 110;
/** Color (grayscale) transition duration, in ms. Snappy, near-threshold. */
const COLOR_MS = 120;
/** Wheel/drag → offset scaling. */
const WHEEL_SPEED = 1;

const REST_STRIDE = REST_WIDTH + GAP;

export type StripImage = {
  src: string;
  /** Intrinsic width:height. Drives the per-image peak — each card magnifies
   *  toward its OWN natural ratio, so width and height don't scale together. */
  aspect: number;
  alt?: string;
};

type Props = {
  images: StripImage[];
};

/** Classic smoothstep — C1-continuous ease, no overshoot. */
function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Scroll Strip — a horizontal filmstrip of tall, narrow cards where the card
 * nearest the horizontal center continuously magnifies and turns from
 * grayscale to full color, macOS-dock / coverflow style.
 *
 * The magnifying card IS a strip card (it grows in its own slot; neighbors
 * reflow) — there is no separate preview pane. Size is a continuous function
 * of each card's distance from the center line (free glide, no snap), and each
 * peaks toward its OWN aspect ratio. Color is exclusive to the single card
 * nearest center — everything else stays grayscale — so there's always exactly
 * one focus, independent of the size math.
 *
 * Architecture: a manual scroll `offset` (fed by wheel/drag) is the single
 * stable input. Every frame we (1) size each card from its distance to the
 * playhead and (2) translate the whole track so the playhead stays pinned to
 * the viewport center. Doing the centering ourselves — rather than relying on
 * native flex flow, which anchors growth to the left and lets the peak drift
 * off-center — is what keeps the magnification symmetric about the center
 * line. Sizes are written straight to the DOM each frame, never as a CSS
 * transition, so they stay locked to scroll position; only color transitions.
 *
 * Rebuilt from reference footage of devouringdetails.com's paywalled "Scroll
 * Strip" prototype — confirmed behavior matched, timing details are our own.
 */
export default function ScrollStrip({ images }: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLUListElement | null>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const maxOffset = Math.max(0, (images.length - 1) * REST_STRIDE);
  // Start mid-strip so cards flank the focus on both sides (no dead space to
  // the left on load), snapped to the nearest card so it opens on one clean
  // focus rather than blended between two.
  const midCard = Math.round(maxOffset / 2 / REST_STRIDE);
  const offsetRef = useRef(midCard * REST_STRIDE);
  const rafRef = useRef(0);

  const paint = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const offset = offsetRef.current;
    const viewportCenter = viewport.clientWidth / 2;
    const peakHeight = window.innerHeight * PEAK_HEIGHT_VH;
    const cards = cardRefs.current;
    // Exactly one card is in color: the one whose rest slot is nearest the
    // playhead. Snappy flip between neighbors as you glide past the midpoint.
    const colorIdx = clamp(
      Math.round(offset / REST_STRIDE),
      0,
      cards.length - 1,
    );

    // Pass 1: size each card from its rest-space distance to the playhead, and
    // accumulate actual (magnified) left/center positions.
    const widths: number[] = [];
    const centers: number[] = [];
    let cursor = 0;
    for (let i = 0; i < cards.length; i++) {
      const d = i * REST_STRIDE - offset; // signed distance from playhead
      const t =
        Math.abs(d) >= ZONE_WIDTH
          ? 0
          : 1 - smoothstep(Math.abs(d) / ZONE_WIDTH);

      const height = REST_HEIGHT + (peakHeight - REST_HEIGHT) * t;
      const peakWidth = peakHeight * images[i].aspect;
      const width = REST_WIDTH + (peakWidth - REST_WIDTH) * t;

      widths.push(width);
      centers.push(cursor + width / 2);
      cursor += width + GAP;

      const el = cards[i];
      if (el) {
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.zIndex = t > 0 ? String(Math.round(t * 1000)) : "0";
        const img = el.firstElementChild as HTMLElement | null;
        if (img)
          img.style.filter = i === colorIdx ? "grayscale(0)" : "grayscale(1)";
      }
    }

    // Where does the playhead land in actual (magnified) track space? Find the
    // rest interval it sits in and interpolate between those cards' actual
    // centers, then translate the track so that point is at viewport center.
    const k = Math.floor(offset / REST_STRIDE);
    let playheadX: number;
    if (k >= centers.length - 1) {
      playheadX = centers[centers.length - 1] ?? 0;
    } else if (k < 0) {
      playheadX = centers[0] ?? 0;
    } else {
      const frac = (offset - k * REST_STRIDE) / REST_STRIDE;
      playheadX = centers[k] + (centers[k + 1] - centers[k]) * frac;
    }

    track.style.transform = `translateX(${viewportCenter - playheadX}px)`;
  }, [images]);

  const schedulePaint = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      paint();
    });
  }, [paint]);

  useEffect(() => {
    paint();
    const onResize = () => paint();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paint]);

  // --- Input, isolated so it's easy to swap. A manual offset (not native
  // overflow scroll) is the input, so the track transform above can own
  // positioning outright. Wheel + trackpad + pointer-drag all just move offset.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const applyDelta = (delta: number) => {
      offsetRef.current = clamp(offsetRef.current + delta, 0, maxOffset);
      schedulePaint();
    };

    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      applyDelta(delta * WHEEL_SPEED);
      e.preventDefault();
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });

    let dragging = false;
    let lastX = 0;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      viewport.setPointerCapture(e.pointerId);
      viewport.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      applyDelta(-(e.clientX - lastX));
      lastX = e.clientX;
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      if (viewport.hasPointerCapture(e.pointerId))
        viewport.releasePointerCapture(e.pointerId);
      viewport.style.cursor = "grab";
    };
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);

    return () => {
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
    };
  }, [maxOffset, schedulePaint]);

  return (
    <div
      ref={viewportRef}
      className="relative overflow-hidden"
      style={{ height: `${PEAK_HEIGHT_VH * 100}vh`, cursor: "grab", touchAction: "pan-y" }}
    >
      <ul
        ref={trackRef}
        className="absolute left-0 top-0 flex h-full list-none items-center p-0"
        style={{ gap: `${GAP}px`, margin: 0, willChange: "transform" }}
      >
        {images.map((img, i) => (
          <li
            key={img.src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="relative shrink-0 overflow-hidden rounded-[2px]"
            style={{ width: REST_WIDTH, height: REST_HEIGHT }}
          >
            <img
              src={img.src}
              alt={img.alt ?? ""}
              draggable={false}
              className="h-full w-full object-cover"
              style={{
                filter: "grayscale(1)",
                transition: `filter ${COLOR_MS}ms linear`,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
