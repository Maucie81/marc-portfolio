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

      <div
        className="overflow-hidden transition-[max-height,opacity] duration-[350ms] ease-out"
        style={{
          maxHeight: expanded ? "500px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="flex flex-col gap-4 pt-4">
          {points.map((point) => (
            <div key={point.label}>
              <p className="cs-sub-label">{point.label}</p>
              <p className="mt-1 text-sm leading-[24px] text-ink-2">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
