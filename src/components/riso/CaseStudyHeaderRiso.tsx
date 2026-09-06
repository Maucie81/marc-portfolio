"use client";

import { motion } from "framer-motion";
import RegistrationMark from "./RegistrationMark";
import RisoBanding from "./RisoBanding";
import RisoGrain from "./RisoGrain";
import VariableHalftone from "./VariableHalftone";
import {
  RISO_INK_OPACITY,
  RISO_ORANGE,
  RISO_PAPER,
  RISO_PINK,
  RISO_PLATE_ORANGE_PX,
  RISO_PLATE_ORANGE_ROTATE,
  RISO_PLATE_PINK_PX,
  RISO_PLATE_PINK_ROTATE,
  RISO_TEXT_INK,
  riso_plateTransform,
} from "./palette";
import { condensedDisplay, containerStyle, editorialBody, stampLabel } from "./type";

const BLEED_D = 340;

interface CaseStudyHeaderRisoProps {
  runLabel?: string;
  index?: string;
  title: string;
  dek?: string;
}

const springSettle = { type: "spring" as const, stiffness: 55, damping: 13, mass: 0.9 };
const springHover = { type: "spring" as const, stiffness: 300, damping: 10 };

// Same variant KEYS across both ink layers so `whileInView`/`whileHover` on
// the ancestors propagate to each independently — that's what lets the two
// layers land at different moments and shift apart on hover as one gesture.
// x/y below are the ONE shared plate vector (RISO_PLATE_ORANGE_PX /
// RISO_PLATE_PINK_PX from palette.ts), not numbers invented for this
// headline — the same two values also move the divider fields and the
// bleed circle, verbatim.
const orangeVariant = {
  hidden: { opacity: 0, x: -34, y: 18, rotate: -3, filter: "blur(14px)" },
  visible: {
    opacity: RISO_INK_OPACITY,
    x: RISO_PLATE_ORANGE_PX.x,
    y: RISO_PLATE_ORANGE_PX.y,
    rotate: -0.5,
    filter: "blur(0px)",
    transition: { ...springSettle, delay: 0.05 },
  },
  hoverShift: { x: RISO_PLATE_ORANGE_PX.x * 1.7, y: RISO_PLATE_ORANGE_PX.y * 1.7, rotate: -1.6, transition: springHover },
};

const pinkVariant = {
  hidden: { opacity: 0, x: 30, y: -16, rotate: 3, filter: "blur(18px)" },
  visible: {
    opacity: RISO_INK_OPACITY,
    x: RISO_PLATE_PINK_PX.x,
    y: RISO_PLATE_PINK_PX.y,
    rotate: 0.4,
    filter: "blur(0px)",
    transition: { ...springSettle, delay: 0.18 },
  },
  hoverShift: { x: RISO_PLATE_PINK_PX.x * 1.7, y: RISO_PLATE_PINK_PX.y * 1.7, rotate: 1.3, transition: springHover },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 } },
};

/**
 * Full-width case study header. Two ink layers (pink/orange) render the
 * same headline offset a few px apart with mix-blend-mode: multiply — a
 * real overprint, not a filtered flat color. No separate "shadow" layer:
 * an offset duplicate behind the type reads as a drop shadow regardless of
 * which direction it's pushed, so the misregistration between the two real
 * ink layers is left to carry the whole effect on its own. On mount the two
 * layers ink-bleed in from blur at slightly different times, like two
 * separate press passes landing; hovering the headline nudges the plates
 * further out of register and lets them spring back.
 *
 * Requires <RisoDefs /> mounted once elsewhere on the page.
 */
export default function CaseStudyHeaderRiso({
  runLabel = "PRESS PROOF",
  index = "04",
  title,
  dek,
}: CaseStudyHeaderRisoProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      style={{
        position: "relative",
        overflow: "hidden",
        background: RISO_PAPER,
        padding: "6rem 1.5rem 5rem",
      }}
    >
      <RisoGrain />
      <RisoBanding />

      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <RegistrationMark />
      </div>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <RegistrationMark />
      </div>

      <div style={{ ...containerStyle, position: "relative" }}>
        <motion.div
          variants={fadeUp}
          style={{ ...stampLabel, fontSize: "0.75rem", color: RISO_TEXT_INK, marginBottom: "1.5rem" }}
        >
          {runLabel} — RUN {index}
        </motion.div>

        <motion.div style={{ display: "grid", cursor: "default" }} whileHover="hoverShift">
          <motion.h1
            variants={orangeVariant}
            style={{
              ...condensedDisplay,
              gridArea: "1 / 1",
              margin: 0,
              color: RISO_ORANGE,
              mixBlendMode: "multiply",
              fontSize: "clamp(3rem, 11vw, 9rem)",
            }}
          >
            {title}
          </motion.h1>
          <motion.h1
            variants={pinkVariant}
            style={{
              ...condensedDisplay,
              gridArea: "1 / 1",
              margin: 0,
              color: RISO_PINK,
              mixBlendMode: "multiply",
              fontSize: "clamp(3rem, 11vw, 9rem)",
            }}
          >
            {title}
          </motion.h1>
        </motion.div>

        {dek && (
          <motion.p
            variants={fadeUp}
            style={{
              ...editorialBody,
              marginTop: "2rem",
              maxWidth: 560,
              color: RISO_TEXT_INK,
            }}
          >
            {dek}
          </motion.p>
        )}
      </div>

      {/* Illustrative accent bleeding off the frame edge — misregistration
          visible at the actual page edge, not just on letterforms. Both
          plates are REAL halftones: dot radius carries tone (dense near the
          focus point, dropping out to nothing at the rim) and each screen
          sits at its own angle (15°/75°) so the two grids don't moiré —
          not a uniform 100%-coverage dot fill. Drifted per the shared
          convention: orange left+down, pink right+up. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-6%",
          bottom: "-20%",
          width: BLEED_D,
          height: BLEED_D,
          borderRadius: "50%",
          overflow: "hidden",
          transform: riso_plateTransform(RISO_PLATE_PINK_PX, RISO_PLATE_PINK_ROTATE),
          opacity: RISO_INK_OPACITY,
          filter: "url(#riso-rough)",
          mixBlendMode: "multiply",
        }}
      >
        <VariableHalftone
          width={BLEED_D}
          height={BLEED_D}
          color={RISO_PINK}
          angle={15}
          cell={7}
          maxR={3.1}
          minR={0.35}
          focusX={BLEED_D * 0.32}
          focusY={BLEED_D * 0.42}
          falloff={BLEED_D * 0.62}
        />
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-6%",
          bottom: "-20%",
          width: BLEED_D,
          height: BLEED_D,
          borderRadius: "50%",
          overflow: "hidden",
          transform: riso_plateTransform(RISO_PLATE_ORANGE_PX, RISO_PLATE_ORANGE_ROTATE),
          opacity: RISO_INK_OPACITY,
          filter: "url(#riso-rough)",
          mixBlendMode: "multiply",
        }}
      >
        <VariableHalftone
          width={BLEED_D}
          height={BLEED_D}
          color={RISO_ORANGE}
          angle={75}
          cell={7}
          maxR={3.1}
          minR={0.35}
          focusX={BLEED_D * 0.62}
          focusY={BLEED_D * 0.58}
          falloff={BLEED_D * 0.62}
        />
      </div>
    </motion.section>
  );
}
