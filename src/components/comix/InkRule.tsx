"use client";

import { useMemo } from "react";
import { COMIX_INK } from "./palette";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A single hand-drawn horizontal rule — used anywhere the system would
 * otherwise reach for a clean CSS border-bottom, so the ink logic actually
 * reaches the site's chrome (nav, dividers) and not just the hero panel. */
export default function InkRule({
  seed = 1,
  color = COMIX_INK,
  className = "",
}: {
  seed?: number;
  color?: string;
  className?: string;
}) {
  const d = useMemo(() => {
    const rand = mulberry32(seed * 6151 + 17);
    const pts = Array.from({ length: 6 }, (_, i) => {
      const x = (i / 5) * 1000;
      const y = 4 + (rand() - 0.5) * 5;
      return `${x} ${y}`;
    });
    return `M ${pts[0]} ` + pts.slice(1).map((p) => `L ${p}`).join(" ");
  }, [seed]);

  return (
    <svg
      viewBox="0 0 1000 8"
      preserveAspectRatio="none"
      className={`pointer-events-none block w-full ${className}`}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}
