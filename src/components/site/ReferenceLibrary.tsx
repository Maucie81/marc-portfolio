"use client";

import Image from "next/image";
import { type UIEvent, useCallback, useEffect, useRef, useState } from "react";
import { rv } from "@/lib/motion";
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
 * Motion: once, as it scrolls in, the window is uncovered left to right and
 * the whole sheet settles 40px into place under it; then nothing moves on
 * its own again. No tile animates by itself, and scrolling works
 * throughout (the sheet is only translated, never scrolled).
 */
export default function ReferenceLibrary() {
  const closeRef = useRef<HTMLButtonElement>(null);
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
    <div data-reveal="view" className="lib-panel">
      <div
        className="lib-window rv-wipe rv-wipe-ltr"
        data-at-top={edges.top || undefined}
        data-at-bottom={edges.bottom || undefined}
      >
        <div
          className="lib-scroll"
          onScroll={onScroll}
          role="region"
          aria-label="My personal reference library — scrolls to show more"
          tabIndex={0}
        >
          <ul
            className="lib-sheet rv-drift"
            style={{
              ...rv(0, { dur: 600, dx: -40 }),
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
                  // where tiles overlap, the upper one's white edge covers
                  // the seam, so every gutter reads as one clean white band.
                  zIndex: t.z,
                  outline: `calc(${TILE_OUTLINE} * var(--u)) solid #fff`,
                }}
              >
                <button
                  type="button"
                  className="lib-open"
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
