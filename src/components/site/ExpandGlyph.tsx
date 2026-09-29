"use client";

import { forwardRef, useEffect, useRef } from "react";

/**
 * The circle-plus spin treatment shared with the case-study ExpandCollapse
 * glyph — this component owns the animation and its timing; ExpandCollapse
 * renders it too rather than keeping its own parallel copy, so the two
 * can't drift apart the way they had (Experience's copy was missing the
 * color fade entirely, snapping instead of easing).
 *
 * The badge is Figma's "Expand Icon" (15:34034): a solid circle with a
 * plus punched through it. The circle fills with `currentColor` (so the
 * caller's text-ink/text-accent className still drives its resting and
 * open colors exactly as it did for the old "+" glyph); the plus itself
 * stays the page's paper tone (--bg) regardless of the circle's color, per
 * the source asset (#444440 circle / #E4E4DF plus — the latter is --bg
 * exactly). The plus is drawn at 65% scale about the circle's center so it
 * reads as a mark inside the badge rather than filling it edge to edge.
 * Rotating the whole badge 45° on open turns the plus into an "×" the same
 * way the old text glyph did, so that half of the treatment carries over
 * unchanged.
 *
 * Hover (and keyboard focus) on the owning button shows a small label beside
 * the badge — "More" on ink, or "Less" on accent once open — with a caret
 * pointing at it, out to the badge's left (Portfolio-Playground 154:2923,
 * which hangs it underneath). The label sits beside the badge, not inside
 * it, so the spin doesn't turn it too. Clicking the button hides the label
 * at once, and it stays hidden until the pointer leaves (or focus moves) —
 * otherwise it lingered under the cursor and flipped to the new state's
 * word, per direct request.
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
  const controlRef = useRef<HTMLSpanElement | null>(null);

  // Listens on the owning button rather than the glyph, so a keyboard
  // Enter/Space (a click on the button itself) dismisses the label too.
  useEffect(() => {
    const control = controlRef.current;
    const button = control?.closest("button");
    if (!control || !button) return;
    const hide = () => control.setAttribute("data-tip-hidden", "");
    const reset = () => control.removeAttribute("data-tip-hidden");
    button.addEventListener("click", hide);
    button.addEventListener("pointerleave", reset);
    button.addEventListener("blur", reset);
    return () => {
      button.removeEventListener("click", hide);
      button.removeEventListener("pointerleave", reset);
      button.removeEventListener("blur", reset);
    };
  }, []);

  return (
    <span ref={controlRef} className="expand-control">
      <span
        ref={ref}
        aria-hidden
        className={`expand-glyph ${expanded ? "is-open" : ""} ${className}`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="8" fill="currentColor" />
          <g transform="translate(8 8) scale(0.65) translate(-8 -8)">
            <path
              d="M13.4 7.4H8.6V2.6C8.6 2.27 8.33 2 8 2C7.67 2 7.4 2.27 7.4 2.6V7.4H2.6C2.27 7.4 2 7.67 2 8C2 8.33 2.27 8.6 2.6 8.6H7.4V13.4C7.4 13.73 7.67 14 8 14C8.33 14 8.6 13.73 8.6 13.4V8.6H13.4C13.73 8.6 14 8.33 14 8C14 7.67 13.73 7.4 13.4 7.4Z"
              fill="var(--bg)"
            />
          </g>
        </svg>
      </span>

      {/* Also the button's accessible name where it has no aria-label of
          its own (the case-study ExpandCollapse). */}
      <span className={`expand-tip ${expanded ? "is-open" : ""}`}>
        {expanded ? "Less" : "More"}
      </span>

      <style jsx>{`
        /* As a grid/flex item (Experience's row button), "inline-block"
           alone still stretches to fill the track — width: fit-content
           keeps the box hugging the glyph itself, so the badge spins in
           place and the label centers under it. */
        .expand-control {
          position: relative;
          display: inline-block;
          width: fit-content;
          line-height: 1;
        }

        /* No delay on close, delayed on open so the color lands near the
           end of the spin instead of finishing while it's still tilting. */
        .expand-glyph {
          display: inline-block;
          line-height: 1;
          transform-origin: center;
          transition: color 150ms ease;
        }

        .expand-glyph.is-open {
          transform: rotate(45deg);
          transition: color 150ms ease 330ms;
        }

        /* 154:2923's label, moved to the badge's left per direct request
           (Figma hangs it underneath): 1px off the badge, a 4×9 caret
           pointing at it, then a 21px label — Google Sans Flex Medium
           12/16, white, 6px sides, 4px corners.
           Ink and accent rather than Figma's #444440 / #ff5841 so the label
           always matches the badge it hangs from. Its color changes on the
           same delay as the badge's. */
        .expand-tip {
          position: absolute;
          top: 50%;
          right: calc(100% + 5px);
          translate: 0 -50%;
          z-index: 10;
          display: flex;
          align-items: center;
          height: 21px;
          padding: 0 6px;
          border-radius: 4px;
          background-color: var(--ink);
          color: #fff;
          font-family: var(--font-display), system-ui, sans-serif;
          font-weight: 500;
          font-size: 12px;
          line-height: 16px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition:
            opacity 150ms ease,
            background-color 150ms ease;
        }

        .expand-tip::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 100%;
          translate: 0 -50%;
          width: 4px;
          height: 9px;
          background-color: inherit;
          clip-path: polygon(0 0, 100% 50%, 0 100%);
        }

        .expand-tip.is-open {
          background-color: var(--accent);
          transition:
            opacity 150ms ease,
            background-color 150ms ease 330ms;
        }

        /* Hover only where it's real, so a tap on a phone doesn't leave
           the label stuck open. */
        @media (hover: hover) {
          :global(.group:hover) .expand-tip {
            opacity: 1;
          }
        }

        :global(.group:focus-visible) .expand-tip {
          opacity: 1;
        }

        /* Just clicked: gone at once (no fade, so the new word never shows)
           until the pointer leaves or focus moves on. */
        .expand-control[data-tip-hidden] .expand-tip {
          opacity: 0;
          transition: none;
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
