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

const V = 300; // viewBox units, square — non-scaling-stroke keeps line weight
// constant even when the real box isn't square.

function jitteredRectPath(rand: () => number, inset: number, wobble: number) {
  const a = inset;
  const b = V - inset;
  const j = () => (rand() - 0.5) * wobble;
  // Each corner and each edge midpoint gets its own jitter, so a straight
  // CSS-perfect rule becomes a line that bows and overshoots like a hand
  // pass — real press lines vary with pressure, they don't stay at one
  // uniform weight and perfectly square corners.
  const pts = [
    [a + j(), a + j()],
    [(a + b) / 2 + j(), a + j() * 0.6],
    [b + j(), a + j()],
    [b + j() * 0.6, (a + b) / 2 + j()],
    [b + j(), b + j()],
    [(a + b) / 2 + j(), b + j() * 0.6],
    [a + j(), b + j()],
    [a + j() * 0.6, (a + b) / 2 + j()],
  ];
  return (
    `M ${pts[0][0]} ${pts[0][1]} ` +
    pts
      .slice(1)
      .map((p) => `L ${p[0]} ${p[1]}`)
      .join(" ") +
    " Z"
  );
}

/**
 * A hand-drawn panel border: two independently-jittered passes at
 * different widths/opacities (simulating ink pooling on a re-traced line)
 * plus an optional third rust "ghost" pass offset behind the black one —
 * genuine plate misregistration, not a uniform CSS border-color swap.
 */
export default function InkRect({
  seed = 1,
  inset = 8,
  wobble = 5,
  color = COMIX_INK,
  ghostColor,
  ghostOffset = { x: 5, y: -3.5 },
  className = "",
}: {
  seed?: number;
  inset?: number;
  wobble?: number;
  color?: string;
  ghostColor?: string;
  ghostOffset?: { x: number; y: number };
  className?: string;
}) {
  const rand1 = useMemo(() => mulberry32(seed * 7919 + 3), [seed]);
  const rand2 = useMemo(() => mulberry32(seed * 7919 + 101), [seed]);
  const pathA = useMemo(() => jitteredRectPath(rand1, inset, wobble), [rand1, inset, wobble]);
  const pathB = useMemo(() => jitteredRectPath(rand2, inset, wobble), [rand2, inset, wobble]);

  return (
    <svg
      viewBox={`0 0 ${V} ${V}`}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    >
      {ghostColor && (
        <path
          d={pathA}
          fill="none"
          stroke={ghostColor}
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.85}
          transform={`translate(${ghostOffset.x} ${ghostOffset.y})`}
        />
      )}
      <path
        d={pathA}
        fill="none"
        stroke={color}
        strokeWidth={5.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.55}
      />
      <path
        d={pathB}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
