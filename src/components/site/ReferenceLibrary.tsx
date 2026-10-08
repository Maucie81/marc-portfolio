"use client";

import Image from "next/image";
import { type RefObject, type UIEvent, useCallback, useEffect, useRef, useState } from "react";
import { LIBRARY_TILES, SHEET_HEIGHT, SHEET_WIDTH, TILE_OUTLINE } from "@/lib/reference-library";

/**
 * 03 My personal reference library · Figma Photos frame 263:280507.
 *
 * A dark #433835 shell (23.56px padding, 12px corners, 3/4/7 shadow) holds
 * a fixed window; inside it the Figma's own contact sheet — mixed sizes,
 * square corners, white 11.3px outlines, ~12px gutters — scrolls
 * vertically, exactly as the Figma prototype does. The window keeps a white
 * frame the width of a gutter on the left and right; the top and bottom
 * gutters scroll away with the sheet.
 *
 * Plain native scrolling (wheel, trackpad, touch, and the arrow keys once
 * the window has focus). Nothing moves or resizes on hover. Clicking a
 * photo opens it enlarged inside the window itself — only the window dims,
 * the page around it doesn't. ← → (buttons or keys) step through the
 * sheet in reading order; Esc, the × or a click on the dimmed area closes
 * it.
 *
 * Motion: once, as it scrolls in, the whole panel — shell, window and
 * sheet together — softly becomes visible like every card on the page
 * (.rv-soft), following the title. No tile animates by itself, and
 * scrolling works throughout.
 *
 * Then the sheet drifts down on its own, slowly, so it reads as something
 * with more in it (per direct request): it starts AUTO_DELAY after the
 * window is mostly on screen, moves one window height every
 * AUTO_WINDOW_SECONDS, pauses while a mouse is over it or it's off screen,
 * and stops for good at the bottom or the moment the visitor scrolls, taps,
 * clicks or uses a key in it. Never with reduced motion.
 */

/** Wait after the window comes into view — the panel's own reveal (250ms
 * behind the title, 850ms) has finished by then. */
const AUTO_DELAY = 1200;
/** Drift speed: one window height in this many seconds. */
const AUTO_WINDOW_SECONDS = 25;

function useAutoDrift(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = 0;
    let startAt = 0;
    let pos = el.scrollTop;
    let inView = false;
    let hovered = false;
    let done = false;

    const tick = (t: number) => {
      raf = 0;
      if (done || !inView || hovered) {
        last = 0;
        return;
      }
      if (t >= startAt) {
        if (last) {
          // Clamped, so a frame after a long pause (background tab) can't jump.
          const dt = Math.min(t - last, 100) / 1000;
          const max = el.scrollHeight - el.clientHeight;
          pos = Math.min(max, pos + (el.clientHeight / AUTO_WINDOW_SECONDS) * dt);
          el.scrollTop = pos;
          if (pos >= max) return stop();
        }
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      if (!raf && !done) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (!inView) return;
        if (!startAt) startAt = performance.now() + AUTO_DELAY;
        run();
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovered = true;
    };
    const onLeave = () => {
      hovered = false;
      run();
    };
    const userInput = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

    function stop() {
      done = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      userInput.forEach((type) => el!.removeEventListener(type, stop));
      el!.removeEventListener("pointerenter", onEnter);
      el!.removeEventListener("pointerleave", onLeave);
    }

    userInput.forEach((type) => el.addEventListener(type, stop, { passive: true }));
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return stop;
  }, [ref]);
}

export default function ReferenceLibrary() {
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useAutoDrift(scrollRef);
  const [open, setOpen] = useState<number | null>(null);
  const [edges, setEdges] = useState({ top: true, bottom: false });

  // Which ends of the sheet are in view — drives the edge shadows.
  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const top = el.scrollTop <= 1;
    const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setEdges((p) => (p.top === top && p.bottom === bottom ? p : { top, bottom }));
  }, []);

  const close = useCallback(() => setOpen(null), []);

  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? i : (i + dir + LIBRARY_TILES.length) % LIBRARY_TILES.length)),
    [],
  );

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  const tile = open === null ? null : LIBRARY_TILES[open];

  return (
    <div data-reveal="view" className="lib-panel rv-soft">
      <div
        className="lib-window"
        data-at-top={edges.top || undefined}
        data-at-bottom={edges.bottom || undefined}
      >
        <div
          ref={scrollRef}
          className="lib-scroll"
          onScroll={onScroll}
          role="region"
          aria-label="My personal reference library — scrolls to show more"
          tabIndex={0}
        >
          <ul
            className="lib-sheet"
            style={{
              width: `calc(${SHEET_WIDTH} * var(--u))`,
              height: `calc(${SHEET_HEIGHT} * var(--u))`,
            }}
          >
            {LIBRARY_TILES.map((t, i) => (
              <li
                key={t.slug}
                className="lib-tile"
                style={{
                  left: `calc(${t.x} * var(--u))`,
                  top: `calc(${t.y} * var(--u))`,
                  width: `calc(${t.w} * var(--u))`,
                  height: `calc(${t.h} * var(--u))`,
                  // Figma's outside stroke, stacked in Figma's layer order:
                  // where tiles overlap, the upper one's edge covers the
                  // seam, so every gutter reads as one clean band (white;
                  // the shell's ink on phones).
                  zIndex: t.z,
                  outline: `calc(${TILE_OUTLINE} * var(--u)) solid var(--lib-gutter)`,
                }}
              >
                <button
                  type="button"
                  className="lib-open"
                  data-track="library"
                  aria-label={`Enlarge: ${t.alt}`}
                  onClick={() => setOpen(i)}
                >
                  <Image
                    src={`/reference-library/${t.slug}.webp`}
                    alt=""
                    width={Math.round(t.w * 2)}
                    height={Math.round(t.h * 2)}
                    // Pre-cropped to the tile at 2x — served as is rather
                    // than re-encoded.
                    unoptimized
                    className="block size-full"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {tile && (
          <div
            className="lib-viewer"
            role="dialog"
            aria-label={tile.alt}
            // A click on the dimmed area itself (not the photo) closes it.
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={tile.slug}
              src={`/reference-library/full/${tile.slug}.webp`}
              alt={tile.alt}
              width={tile.full[0]}
              height={tile.full[1]}
              className="lib-viewer-img"
              // As large as the window allows, but never past the file's
              // own width, so it's never upscaled into blur.
              style={{
                aspectRatio: `${tile.full[0]} / ${tile.full[1]}`,
                width: `min(100cqw - 136px, (100cqh - 72px) * ${tile.full[0] / tile.full[1]}, ${tile.full[0]}px)`,
              }}
            />
            <span className="lib-viewer-count">
              {open! + 1} / {LIBRARY_TILES.length}
            </span>
            <button ref={closeRef} type="button" className="lib-viewer-close" aria-label="Close" onClick={close}>
              ×
            </button>
            <button type="button" className="lib-viewer-btn lib-viewer-prev" aria-label="Previous photo" onClick={() => step(-1)}>
              ←
            </button>
            <button type="button" className="lib-viewer-btn lib-viewer-next" aria-label="Next photo" onClick={() => step(1)}>
              →
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
