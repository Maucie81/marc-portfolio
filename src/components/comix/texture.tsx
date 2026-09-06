"use client";

import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import { COMIX_INK } from "./palette";

/** Deterministic PRNG (mulberry32) — dot/line jitter must be stable between
 * server and client render, so no Math.random() here. */
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

/**
 * Repeating crosshatch tile — two crossing line sets, the actual tonal
 * mechanism Crumb builds shading from. Used as a `fill="url(#id)"` on any
 * shape (panel corners, card grounds) for large-area ink texture, since
 * hand-drawing thousands of individual crossing lines per instance would be
 * both unreadable at scale and prohibitively heavy in the DOM.
 */
export function CrosshatchDef({
  id,
  density = "medium",
}: {
  id: string;
  density?: "sparse" | "medium" | "dense";
}) {
  const size = density === "dense" ? 7 : density === "medium" ? 10 : 14;
  const opacity = density === "dense" ? 0.9 : density === "medium" ? 0.7 : 0.5;
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
      <rect width={size} height={size} fill="none" />
      <line x1="0" y1="0" x2="0" y2={size} stroke={COMIX_INK} strokeWidth="0.9" strokeOpacity={opacity} transform={`rotate(45 ${size / 2} ${size / 2})`} />
      <line x1="0" y1="0" x2="0" y2={size} stroke={COMIX_INK} strokeWidth="0.9" strokeOpacity={opacity} transform={`rotate(-45 ${size / 2} ${size / 2})`} />
    </pattern>
  );
}

/**
 * A field of stippled dots, jittered off-grid so it reads as ink stippling
 * rather than a printed halftone screen. `animate` staggers each dot's
 * opacity in on scroll — sparse-to-dense, "being drawn in real time" per
 * the motion brief — rather than fading the whole field as one block.
 * Kept to a moderate dot count (bounded by area/spacing) since this renders
 * one real DOM node per dot, not a tiled pattern.
 */
export function StippleField({
  width,
  height,
  seed = 1,
  count = 220,
  color = COMIX_INK,
  minR = 0.5,
  maxR = 1.6,
  animate = false,
  className,
}: {
  width: number;
  height: number;
  seed?: number;
  count?: number;
  color?: string;
  minR?: number;
  maxR?: number;
  animate?: boolean;
  className?: string;
}) {
  const dots = useMemo(() => {
    const rand = mulberry32(seed * 104729 + 7);
    return Array.from({ length: count }, () => ({
      x: rand() * width,
      y: rand() * height,
      r: minR + rand() * (maxR - minR),
      d: rand(),
    }));
  }, [width, height, seed, count, minR, maxR]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      {dots.map((dot, i) =>
        animate ? (
          <motion.circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill={color}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.01, delay: dot.d * 0.9 }}
          />
        ) : (
          <circle key={i} cx={dot.x} cy={dot.y} r={dot.r} fill={color} />
        )
      )}
    </svg>
  );
}

/** Convenience hook so callers can get a stable unique pattern id without
 * fighting React's SSR id mismatch rules. */
export function usePatternId(prefix: string) {
  const id = useId();
  return `${prefix}-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
}
