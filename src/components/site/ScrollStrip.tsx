"use client";

import { useCallback, useEffect, useRef } from "react";

/* ============================================================================
 * Tunable constants — all the "feel" lives here.
 * ==========================================================================*/

/** Idle height of every slice, in px. */
const REST_HEIGHT = 120;
/** Floor for a slice's width when many are fit across the width. */
const MIN_REST_WIDTH = 10;
/** Hairline gap between slices, in px. */
const GAP = 4;
/** Hovered card's max height, as a fraction of viewport height. */
const PEAK_HEIGHT_VH = 0.34;
/** Hovered card's max width, as a fraction of the container width. The card
 *  grows toward its OWN aspect ratio, capped here so a wide landscape can't run
 *  off the edge; at full size the box matches the image, so it shows uncropped. */
const PEAK_MAX_WIDTH_FRAC = 0.4;
/** Half-width of the magnify zone, in multiples of the (width-dependent) slice
 *  stride — so the dock feels the same at any screen width. ~1.6 means the
 *  hovered slice peaks, its immediate neighbors lift a little, and everything
 *  past that stays flat, so one image clearly dominates. */
const ZONE_STRIDES = 1.6;
/** Per-frame easing (0–1). LOWER = slower, floatier response as the focus
 *  follows the cursor and the magnification fades in/out. Higher = snappier.
 *  With a curated set (wide slices), it can track the cursor cleanly without
 *  feeling twitchy — the flip rate is set by slice width, not this. */
const SMOOTHING = 0.15;
/** Grayscale transition duration, in ms. Snappy. */
const COLOR_MS = 120;
/** Minimum breathing room, in px, between the focused image and either edge —
 *  it's held fully in view rather than being pushed off by the cursor anchor. */
const EDGE_PAD = 8;

export type StripImage = {
  src: string;
  /** Intrinsic width:height — sets the hovered card's shape (capped by
   *  PEAK_MAX_WIDTH_FRAC) so the whole image shows without cropping. */
  aspect: number;
  alt?: string;
};

type Props = {
  images: StripImage[];
};

function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}
function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Interest strip — a macOS-dock-style filmstrip. At rest it's a flat line of
 * thin, grayscale slices fit across the full width, with NOTHING magnified.
 * When the pointer is over it, the slice under the cursor blooms to full size
 * and color (and its neighbors lift a little), following the cursor; move away
 * and it settles back to the flat line. There is no scrolling — the whole set
 * is always visible as one line.
 *
 * The cursor position and an overall "intensity" (0 idle → 1 hovering) are both
 * eased by SMOOTHING each frame, so the focus glides toward the cursor and the
 * whole effect fades in and out rather than snapping — that's what keeps the
 * motion slow and calm. Sizes are written straight to the DOM; the track is
 * translated so the point under the cursor stays under the cursor as the row
 * bulges. The hovered card grows to its own aspect ratio (capped by width) so
 * it shows uncropped.
 */
export default function ScrollStrip({ images }: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLUListElement | null>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Smoothed state the paint reads; target state the pointer writes.
  const stateRef = useRef({ x: 0, intensity: 0 });
  const targetXRef = useRef(0);
  const hoveringRef = useRef(false);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  const paint = useCallback(
    (hoverX: number, intensity: number) => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const N = images.length;
      if (N === 0) return;
      const W = viewport.clientWidth;
      const peakHeight = window.innerHeight * PEAK_HEIGHT_VH;
      const maxWidth = W * PEAK_MAX_WIDTH_FRAC;
      const restWidth = Math.max(MIN_REST_WIDTH, (W - (N - 1) * GAP) / N);
      const restStride = restWidth + GAP;
      const zone = restStride * ZONE_STRIDES;
      const cards = cardRefs.current;
      const active = intensity > 0.001;

      // Color goes only to the slice nearest the cursor, once the effect is
      // mostly faded in (its own CSS transition smooths the flip).
      const colorIdx =
        active && intensity > 0.4
          ? clamp(Math.round((hoverX - restWidth / 2) / restStride), 0, N - 1)
          : -1;

      const centers: number[] = [];
      const widths: number[] = [];
      let cx = 0;
      for (let i = 0; i < N; i++) {
        let t = 0;
        if (active) {
          const restCenter = i * restStride + restWidth / 2;
          const d = Math.abs(restCenter - hoverX);
          const base = d >= zone ? 0 : 1 - smoothstep(d / zone);
          t = base * intensity;
        }

        const aspect = images[i].aspect;
        const focusWidth = Math.min(peakHeight * aspect, maxWidth);
        const focusHeight = focusWidth / aspect;
        const width = restWidth + (focusWidth - restWidth) * t;
        const height = REST_HEIGHT + (focusHeight - REST_HEIGHT) * t;

        widths.push(width);
        centers.push(cx + width / 2);
        cx += width + GAP;

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
      let translate = 0;
      if (active) {
        const f = clamp(hoverX / restStride, 0, N - 1);
        const k = Math.floor(f);
        const actualFocusX =
          k >= N - 1
            ? centers[N - 1]
            : centers[k] + (centers[k + 1] - centers[k]) * (f - k);
        const desired = hoverX - actualFocusX;
        // Keep the focused card fully on screen: clamp the translate so its left
        // and right edges stay within the viewport (with a little padding),
        // rather than letting the cursor anchor push it off an edge.
        const fi = clamp(
          Math.round((hoverX - restWidth / 2) / restStride),
          0,
          N - 1,
        );
        const fLeft = centers[fi] - widths[fi] / 2;
        const fRight = centers[fi] + widths[fi] / 2;
        const lo = EDGE_PAD - fLeft;
        const hi = W - EDGE_PAD - fRight;
        translate = hi < lo ? (lo + hi) / 2 : clamp(desired, lo, hi);
      }
      track.style.transform = `translateX(${translate}px)`;
    },
    [images],
  );

  // Eased animation loop: glide x toward the cursor and intensity toward 1
  // (hovering) or 0 (idle). Runs only while there's motion left to resolve.
  const tick = useCallback(() => {
    const st = stateRef.current;
    st.x += (targetXRef.current - st.x) * SMOOTHING;
    const targetI = hoveringRef.current ? 1 : 0;
    st.intensity += (targetI - st.intensity) * SMOOTHING;
    paint(st.x, st.intensity);

    if (hoveringRef.current || st.intensity > 0.002) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      st.intensity = 0;
      paint(st.x, 0);
      runningRef.current = false;
    }
  }, [paint]);

  const ensureRunning = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    paint(stateRef.current.x, stateRef.current.intensity);
    const onResize = () =>
      paint(stateRef.current.x, stateRef.current.intensity);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paint]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX - viewport.getBoundingClientRect().left;
      targetXRef.current = x;
      // On first entry, snap position so the focus fades in AT the cursor
      // rather than gliding in from the left edge.
      if (!hoveringRef.current) stateRef.current.x = x;
      hoveringRef.current = true;
      ensureRunning();
    };
    const onLeave = () => {
      hoveringRef.current = false;
      ensureRunning();
    };
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerleave", onLeave);
    return () => {
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, [ensureRunning]);

  return (
    <div
      ref={viewportRef}
      className="relative h-[var(--strip-rest)] overflow-hidden [@media(hover:hover)]:h-[var(--strip-peak)]"
      style={
        {
          // Touch screens never magnify, so they get no headroom for it —
          // just the resting row.
          "--strip-rest": `${REST_HEIGHT}px`,
          "--strip-peak": `${PEAK_HEIGHT_VH * 100}vh`,
        } as React.CSSProperties
      }
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
            style={{ width: MIN_REST_WIDTH, height: REST_HEIGHT }}
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
