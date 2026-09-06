"use client";

import { motion } from "framer-motion";
import RisoBanding from "./RisoBanding";
import RisoGrain from "./RisoGrain";
import RisoInkBreak from "./RisoInkBreak";
import {
  RISO_INK_OPACITY,
  RISO_ORANGE,
  RISO_PAPER,
  RISO_PAPER_KNOCKOUT,
  RISO_PINK,
  RISO_PLATE_ORANGE_PX,
  RISO_PLATE_ORANGE_ROTATE,
  RISO_PLATE_PINK_PX,
  RISO_PLATE_PINK_ROTATE,
  riso_plateTransform,
} from "./palette";
import { containerStyle, stampLabel } from "./type";

interface SectionDividerRisoProps {
  label: string;
  index?: string;
}

/**
 * Full-width divider built as two diagonal-cut color fields (not a rule) —
 * the overlap band in the middle is where orange and pink genuinely
 * multiply into a third, muddier color; the label sits reversed out of the
 * fields as unprinted paper, the same trick real Riso designers use for
 * "highlights" since there's no white ink.
 *
 * Requires <RisoDefs /> mounted once elsewhere on the page.
 */
export default function SectionDividerRiso({ label, index = "02" }: SectionDividerRisoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
      viewport={{ once: true, amount: 0.5 }}
      style={{
        position: "relative",
        width: "100%",
        height: "clamp(120px, 16vw, 168px)",
        overflow: "hidden",
        background: RISO_PAPER,
      }}
    >
      <RisoGrain />
      <RisoBanding />

      {/* Both diagonal edges share the same slope (parallel, not mirrored)
          so orange [0, line2(y)] and pink [line1(y), 100%] union to full
          coverage at every y — a crossing (mirrored) pair leaves a gap at
          one edge where neither field reaches, which showed as a raw-paper
          notch cutting into the halftone strip below. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: RISO_ORANGE,
          opacity: RISO_INK_OPACITY,
          clipPath: "polygon(0 0, 78% 0, 62% 100%, 0 100%)",
          transform: riso_plateTransform(RISO_PLATE_ORANGE_PX, RISO_PLATE_ORANGE_ROTATE),
          filter: "url(#riso-rough)",
        }}
      >
        <RisoInkBreak />
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: RISO_PINK,
          opacity: RISO_INK_OPACITY,
          clipPath: "polygon(58% 0, 100% 0, 100% 100%, 42% 100%)",
          transform: riso_plateTransform(RISO_PLATE_PINK_PX, RISO_PLATE_PINK_ROTATE),
          mixBlendMode: "multiply",
          filter: "url(#riso-rough)",
        }}
      >
        <RisoInkBreak />
      </div>
      {/* Screened rule, not a CSS dotted border — real angled patterns
          (15°/75°, defined once in RisoDefs), pink under the orange field
          and orange under the pink field, so the strip itself carries the
          overprint idea instead of a neutral third texture. */}
      <svg
        aria-hidden
        focusable="false"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 22 }}
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" width="50%" height="100%" fill="url(#riso-halftone-pink)" opacity={RISO_INK_OPACITY} />
        <rect x="50%" y="0" width="50%" height="100%" fill="url(#riso-halftone-orange)" opacity={RISO_INK_OPACITY} />
      </svg>

      <div
        style={{
          ...containerStyle,
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* A clean paper-colored knockout implies both plates were cut in
            perfect register, which is exactly what a two-drum press never
            does. Two faint ink-colored copies of the same word, offset by
            the same plate vectors as everything else, peek out from behind
            the paper-colored top layer — a thin colored fringe wherever
            the two "holes" don't quite land on each other. */}
        <div style={{ display: "grid" }}>
          <span
            style={{
              ...stampLabel,
              gridArea: "1 / 1",
              fontSize: "clamp(1.25rem, 3.4vw, 2.25rem)",
              color: RISO_ORANGE,
              opacity: 0.75,
              transform: riso_plateTransform(RISO_PLATE_ORANGE_PX, RISO_PLATE_ORANGE_ROTATE),
            }}
          >
            {label}
          </span>
          <span
            style={{
              ...stampLabel,
              gridArea: "1 / 1",
              fontSize: "clamp(1.25rem, 3.4vw, 2.25rem)",
              color: RISO_PINK,
              opacity: 0.75,
              transform: riso_plateTransform(RISO_PLATE_PINK_PX, RISO_PLATE_PINK_ROTATE),
            }}
          >
            {label}
          </span>
          <span
            style={{
              ...stampLabel,
              gridArea: "1 / 1",
              fontSize: "clamp(1.25rem, 3.4vw, 2.25rem)",
              color: RISO_PAPER_KNOCKOUT,
            }}
          >
            {label}
          </span>
        </div>
        <span style={{ ...stampLabel, fontSize: "1rem", color: RISO_PAPER_KNOCKOUT }}>{index}</span>
      </div>
    </motion.div>
  );
}
