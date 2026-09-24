"use client";

import { useRef, useState, useCallback } from "react";
import ExpandGlyph, { spinExpandGlyph } from "@/components/site/ExpandGlyph";

interface Props {
  points: Array<{ label: string; text: string }>;
}

export default function ExpandCollapse({ points }: Props) {
  const [expanded, setExpanded] = useState(false);
  const glyphRef = useRef<HTMLSpanElement | null>(null);

  const handleClick = useCallback(() => {
    const next = !expanded;
    spinExpandGlyph(glyphRef.current, next);
    setExpanded(next);
  }, [expanded]);

  return (
    <div className="-mt-2">
      <button type="button" onClick={handleClick} aria-expanded={expanded} className="group">
        <ExpandGlyph
          ref={glyphRef}
          expanded={expanded}
          className={expanded ? "text-accent" : "text-ink"}
        />
      </button>

      {/* grid-template-rows 0fr/1fr, not a fixed max-height — see
          Experience.tsx's copy of this same reveal for why (a flat max
          value makes the easing run against an arbitrary distance instead
          of the real content height, which reads as a glitch). Height and
          opacity used to share one 350ms ease-out transition on this same
          element, fading the text fully in/out while the row was still
          mid-resize — see Experience.tsx for the same fix: opacity moved
          to the inner wrapper with its own delayed-on-open, immediate-on-
          close timing, and the height easing swapped to the standard
          "material" curve for a smoother deceleration. */}
      <div
        className="grid overflow-hidden transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div
          className={`overflow-hidden transition-opacity duration-300 ${
            expanded ? "opacity-100 delay-150" : "opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 pt-4">
            {points.map((point) => (
              <div key={point.label}>
                <p className="cs-sub-label">{point.label}</p>
                <p className="t-body mt-1">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
