"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { RISO_INK_OPACITY, RISO_ORANGE, RISO_PINK } from "./palette";
import VariableHalftone from "./VariableHalftone";

function asteriskLines(spokes: number, length: number, cx: number, cy: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < spokes; i++) {
    const a = (Math.PI / spokes) * i;
    lines.push({
      x1: cx - length * Math.cos(a),
      y1: cy - length * Math.sin(a),
      x2: cx + length * Math.cos(a),
      y2: cy + length * Math.sin(a),
    });
  }
  return lines;
}

// 3 lines through center = a 6-point asterisk — a proofreader's reference
// mark, the same print-culture register as "STET" itself, rather than a
// generic star/sparkle icon.
const SPOKES = asteriskLines(3, 39, 50, 50);

const springHover = { type: "spring" as const, stiffness: 340, damping: 9 };
const springSettle = { type: "spring" as const, stiffness: 70, damping: 11, mass: 0.8 };

/**
 * Repeatable signature mark — a stamped asterisk (reference-mark, not
 * decoration) built from two misregistered, multiply-blended plates over a
 * real variable halftone disc. Small and cheap enough to use throughout
 * the site (section markers, list bullets, a footer stamp).
 *
 * Requires <RisoDefs /> mounted once elsewhere on the page.
 */
export default function SignatureMarkRiso({
  size = 56,
  title = "Riso signature mark",
  className,
}: {
  size?: number;
  title?: string;
  className?: string;
}) {
  const clipId = useId();

  return (
    <motion.svg
      role="img"
      aria-label={title}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ overflow: "visible", display: "block" }}
      initial={{ opacity: 0, scale: 0.7, rotate: -8, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)", transition: springSettle }}
      viewport={{ once: true, amount: 0.6 }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={50} cy={50} r={46} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} opacity={0.85}>
        <VariableHalftone
          width={100}
          height={100}
          color={RISO_ORANGE}
          angle={75}
          cell={9}
          maxR={3.6}
          minR={0.4}
          focusX={50}
          focusY={50}
          falloff={58}
        />
      </g>
      <motion.g
        stroke={RISO_ORANGE}
        strokeWidth={11}
        strokeLinecap="round"
        style={{ x: -3.5, y: 3, rotate: -4, opacity: RISO_INK_OPACITY, mixBlendMode: "multiply", filter: "url(#riso-rough)" }}
        whileHover={{ x: -8, y: 6, rotate: -9, transition: springHover }}
      >
        {SPOKES.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </motion.g>
      <motion.g
        stroke={RISO_PINK}
        strokeWidth={11}
        strokeLinecap="round"
        style={{ x: 3, y: -2.5, rotate: 4, opacity: RISO_INK_OPACITY, mixBlendMode: "multiply", filter: "url(#riso-rough)" }}
        whileHover={{ x: 7, y: -6, rotate: 9, transition: springHover }}
      >
        {SPOKES.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </motion.g>
    </motion.svg>
  );
}
