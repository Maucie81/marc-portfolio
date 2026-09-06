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
      <button type="button" onClick={handleClick} aria-expanded={expanded}>
        <ExpandGlyph
          ref={glyphRef}
          expanded={expanded}
          className={expanded ? "text-accent" : "text-ink"}
        />
      </button>

      {/* grid-template-rows 0fr/1fr, not a fixed max-height — see
          Experience.tsx's copy of this same reveal for why (a flat max
          value makes the easing run against an arbitrary distance instead
          of the real content height, which reads as a glitch). */}
      <div
        className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-[350ms] ease-out"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 pt-4">
            {points.map((point) => (
              <div key={point.label}>
                <p className="cs-sub-label">{point.label}</p>
                <p className="mt-1 text-sm leading-[20px] text-ink-2">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
