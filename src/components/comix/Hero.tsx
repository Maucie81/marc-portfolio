"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CaptionBox from "./CaptionBox";
import ComixDefs from "./ComixDefs";
import DensityStrip from "./DensityStrip";
import HandLetter from "./HandLetter";
import PanelBorder from "./PanelBorder";
import RegistrationMark from "./RegistrationMark";
import { panelReveal, stepIn } from "./motion";

const MASTHEAD =
  "font-comix-display block text-[clamp(3.4rem,10.5vw,9rem)] leading-[0.84] uppercase";

/**
 * The splash page. National Lampoon 1974, not a product hero: the masthead
 * and the illustrated portrait fight for the same space rather than sitting
 * in tidy columns, registration marks and a caption box do the framing
 * instead of a grid, and the portrait is the visual anchor everything else
 * extends from — not an image dropped into a layout built for something
 * else. Every rule on the panel is hand-jittered (InkRect) rather than a
 * CSS border, the masthead and the panel edge both carry a rust
 * misregistration ghost, and the portrait runs through a true two-flat-ink
 * duotone filter so the one continuous-tone asset on the page still
 * complies with the "no screen tint" claim in the colophon instead of
 * contradicting it.
 */
export default function Hero() {
  return (
    <section id="top" className="px-4 pt-6 pb-10 sm:px-8 sm:pt-10">
      <ComixDefs />
      <motion.div initial="hidden" animate="visible" variants={panelReveal}>
        <PanelBorder className="px-5 py-8 sm:px-10 sm:py-12" seed={11}>
          {/* Corner registration marks — true bleed-corner placement, not
              inline decoration; the print convention they're borrowed
              from. */}
          <RegistrationMark size={24} className="absolute top-2 left-2 z-30" />
          <RegistrationMark size={24} className="absolute top-2 right-2 z-30" />
          <RegistrationMark size={24} className="absolute bottom-2 left-2 z-30" />
          <RegistrationMark size={24} className="absolute right-2 bottom-2 z-30" />

          <div className="relative z-20 mb-8 flex flex-wrap items-center justify-between gap-3 pl-8">
            <span className="font-comix-body text-comix-ink text-[0.7rem] font-semibold tracking-[0.2em] uppercase">
              Press Proof &middot; Plate 00
            </span>
            <span className="font-comix-body text-comix-ink pr-8 text-[0.7rem] font-semibold tracking-[0.2em] uppercase">
              Principal Product Designer
            </span>
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.7fr_auto] lg:items-end">
            <div className="relative z-10">
              {/* Rust misregistration ghost — same glyph shapes (same
                  HandLetter jitter), offset and printed first, exactly how
                  a second color plate sits fractionally off the black
                  key-line on a hand-fed press. */}
              <HandLetter
                text="MARC FAVRO"
                aria-hidden="true"
                className={`text-comix-rust pointer-events-none absolute inset-0 ${MASTHEAD}`}
                style={{ transform: "translate(7px, -5px) rotate(-0.5deg)" }}
              />
              <HandLetter as="h1" text="MARC FAVRO" className={`text-comix-ink relative ${MASTHEAD}`} />

              <motion.p
                variants={stepIn}
                className="font-comix-hand text-comix-rust mt-5 -rotate-2 text-2xl sm:text-3xl"
                style={{ filter: "url(#comix-roughen)" }}
              >
                Systems that hold weight.
              </motion.p>
            </div>

            <motion.div variants={stepIn} className="relative z-0 justify-self-center lg:justify-self-end">
              <div className="relative w-[230px] rotate-1 sm:w-[300px] lg:w-[340px]">
                <PanelBorder seed={31} double={false} className="p-1.5">
                  <Image
                    src="/marc/portrait.webp"
                    alt="Illustrated crosshatch portrait of Marc Favro, run through a two-ink duotone"
                    width={600}
                    height={600}
                    className="block h-auto w-full"
                    style={{ filter: "url(#comix-duotone)" }}
                    priority
                  />
                </PanelBorder>
              </div>
            </motion.div>

            {/* Ink-density color bar — a real press sheet's calibration
                strip, repurposed as the structural proof of the tonal
                system: paper through full crosshatch saturation, not a
                decorative texture dropped in a corner. */}
            <div className="relative z-10 hidden justify-self-end pb-2 lg:block">
              <DensityStrip />
            </div>
          </div>

          <motion.div variants={stepIn} className="relative z-20 mt-12 max-w-md">
            <CaptionBox>
              <p className="font-comix-body text-sm leading-snug">
                Platform and B2B software &mdash; fifteen years building the
                load-bearing interface layer.
              </p>
            </CaptionBox>
          </motion.div>

          <div className="relative z-20 mt-8 flex items-center gap-3 pt-4 pl-8">
            <span className="font-comix-body text-comix-ink text-[0.62rem] font-semibold tracking-[0.16em] uppercase">
              Two spot colors + black &middot; duotone, not photo &middot; hand-set
            </span>
          </div>
        </PanelBorder>
      </motion.div>
    </section>
  );
}
