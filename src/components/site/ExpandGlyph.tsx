"use client";

import { forwardRef } from "react";

/**
 * The "+" spin/pulse treatment shared with the case-study ExpandCollapse
 * glyph — this component owns the animation and its timing; ExpandCollapse
 * renders it too rather than keeping its own parallel copy, so the two can't
 * drift apart the way they had (Experience's copy was missing the color
 * fade entirely, snapping instead of easing).
 *
 * Experience's row button owns the click and the open/close state for the
 * whole row (not just this icon), so the spin itself is triggered by the
 * caller via the forwarded ref, synchronously inside its click handler, so
 * the animation always starts from the visually-current rotation instead of
 * racing a post-render effect. Color is left to the caller's `className`
 * (icons rest at different colors in different contexts) — only the fade
 * timing lives here, so it applies no matter which color classes are passed.
 */
const ExpandGlyph = forwardRef<
  HTMLSpanElement,
  { expanded: boolean; className?: string }
>(function ExpandGlyph({ expanded, className = "" }, ref) {
  return (
    <span
      ref={ref}
      aria-hidden
      className={`expand-glyph ${expanded ? "is-open" : ""} ${className}`}
    >
      <span className="expand-glyph-pulse">+</span>

      <style jsx>{`
        /* No delay on close, delayed on open so the color lands near the
           end of the spin instead of finishing while it's still tilting. */
        .expand-glyph {
          display: inline-block;
          /* As a grid/flex item (Experience's row button), "inline-block"
             alone still stretches to fill the track — width: fit-content
             keeps the box hugging the glyph itself so rotation spins it in
             place instead of orbiting around the stretched box's center. */
          width: fit-content;
          font-size: 1.25rem;
          line-height: 1;
          font-weight: 500;
          transform-origin: center;
          transition: color 150ms ease;
        }

        .expand-glyph.is-open {
          transform: rotate(45deg);
          transition: color 150ms ease 330ms;
        }

        .expand-glyph-pulse {
          display: inline-block;
          animation: expand-glyph-pulse 2.2s ease-in-out infinite;
        }

        .expand-glyph:hover .expand-glyph-pulse,
        .expand-glyph.is-open .expand-glyph-pulse {
          animation-play-state: paused;
        }

        @keyframes expand-glyph-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.15);
          }
        }
      `}</style>
    </span>
  );
});

export default ExpandGlyph;

/** Spins one glyph to `next`'s resting angle — call synchronously from the
 * click handler that also flips the open/close state, before that state
 * update re-renders. */
export function spinExpandGlyph(el: HTMLSpanElement | null, next: boolean) {
  if (!el) return;
  el.getAnimations().forEach((a) => a.cancel());
  el.animate(
    [
      { transform: next ? "rotate(0deg)" : "rotate(45deg)" },
      { transform: next ? "rotate(405deg)" : "rotate(-360deg)" },
    ],
    {
      duration: 480,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "none",
    }
  );
}
