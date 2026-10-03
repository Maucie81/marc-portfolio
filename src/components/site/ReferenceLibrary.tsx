"use client";

import Image from "next/image";
import { type UIEvent, useCallback, useEffect, useRef, useState } from "react";
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
 * photo opens it enlarged in a modal <dialog> (Esc / backdrop / × close it;
 * ← → step through the sheet in reading order).
 */
export default function ReferenceLibrary() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [edges, setEdges] = useState({ top: true, bottom: false });

  // Which ends of the sheet are in view — drives the edge shadows.
  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const top = el.scrollTop <= 1;
    const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setEdges((p) => (p.top === top && p.bottom === bottom ? p : { top, bottom }));
  }, []);

  const show = useCallback((i: number) => {
    setOpen(i);
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? i : (i + dir + LIBRARY_TILES.length) % LIBRARY_TILES.length)),
    [],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const tile = open === null ? null : LIBRARY_TILES[open];

  return (
    <div className="lib-panel">
      <div
        className="lib-window"
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
                  onClick={() => show(i)}
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
      </div>

      <dialog
        ref={dialogRef}
        className="lib-lightbox"
        aria-label={tile?.alt ?? "Enlarged photo"}
        onClose={() => setOpen(null)}
        // A click on the dialog itself (not its contents) is the backdrop.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {tile && (
          <figure className="lib-lightbox-figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={tile.slug}
              src={`/reference-library/${tile.slug}.webp`}
              alt={tile.alt}
              width={Math.round(tile.w * 2)}
              height={Math.round(tile.h * 2)}
              className="lib-lightbox-img"
              // As large as the viewport allows, but no more than 1.5x the
              // file (the crops are 2x the tile), so small photos stay sharp.
              style={{
                aspectRatio: `${tile.w} / ${tile.h}`,
                width: `min(88vw, ${(78 * tile.w) / tile.h}dvh, ${Math.round(tile.w * 3)}px)`,
              }}
            />
            <figcaption className="lib-lightbox-caption">
              <span>{tile.alt}</span>
              <span className="lib-lightbox-count">
                {open! + 1} / {LIBRARY_TILES.length}
              </span>
            </figcaption>
          </figure>
        )}
        <button type="button" className="lib-lightbox-btn lib-lightbox-close" aria-label="Close" onClick={close}>
          ×
        </button>
        <button type="button" className="lib-lightbox-btn lib-lightbox-prev" aria-label="Previous photo" onClick={() => step(-1)}>
          ←
        </button>
        <button type="button" className="lib-lightbox-btn lib-lightbox-next" aria-label="Next photo" onClick={() => step(1)}>
          →
        </button>
      </dialog>
    </div>
  );
}
