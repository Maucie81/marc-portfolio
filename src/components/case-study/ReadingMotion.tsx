"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { SIDEWAYS } from "@/components/case-study/HorizontalTrack";
import RevealObserver from "@/components/site/motion/RevealObserver";
import { READING, reading, rvGroup, type ReadingRole } from "@/lib/motion";

/**
 * Case-study motion (READING in src/lib/motion.ts), switched on per case
 * study: wrap its page in <ReadingMotion> and the block renderers below it
 * start emitting reveals; anywhere else useReading() returns nothing, so
 * the page stays exactly as it was.
 */
const On = createContext(false);

/** Trigger lines: 20% in from whichever edge content arrives from. */
const STACKED_MARGIN = "0px 0px -20% 0px";
const SIDEWAYS_MARGIN = "0px -20% 0px 0px";

export default function ReadingMotion({ children }: { children: ReactNode }) {
  return (
    <On.Provider value>
      {children}
      <RevealObserver margin={STACKED_MARGIN} sideways={{ query: SIDEWAYS, margin: SIDEWAYS_MARGIN }} />
    </On.Provider>
  );
}

/** Props for an element that moves; `trigger` also makes it its own trigger. */
export type Reveal = { className: string; style?: CSSProperties; "data-reveal"?: "view" };

const STILL: Reveal = { className: "" };

export function useReading() {
  const on = useContext(On);
  return {
    /** How `role` arrives, on the element that moves. */
    reveal(role: ReadingRole, { delay = 0, trigger = false } = {}): Reveal {
      if (!on) return STILL;
      const r = reading(role, delay);
      return trigger ? { ...r, "data-reveal": "view" } : r;
    },
    /** A container that plays the reveals inside it, without moving itself. */
    trigger: on ? ({ "data-reveal": "view" } as const) : {},
    /** A section's columns: triggers in it that arrive together step
     * READING.stagger apart, in reading order. */
    group: on ? { "data-reveal-group": "", style: rvGroup(READING.stagger) } : {},
  };
}
