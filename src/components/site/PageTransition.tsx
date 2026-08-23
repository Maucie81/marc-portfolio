"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fade + slide-up transition between routes — same shape as pierregeorges.ch
 * (built on the Animsition jQuery plugin there: fade-out-up-sm on exit,
 * fade-in-up-sm on enter, 500ms each way). Next's App Router already does
 * client-side navigation, so this is the same effect without the full page
 * reload the reference site relies on to sequence exit → enter.
 */
const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * The enter animation is triggered imperatively (via `controls`, inside a
 * cleanup-guarded effect) instead of Framer Motion's declarative `animate`
 * prop. That's not stylistic — it's the fix for a real double-fade-in bug.
 *
 * `animate="animate"` fires directly off the render/commit cycle with no
 * cancel-first step. React 18 StrictMode (dev only) double-invokes render,
 * and Framer Motion doesn't discard the throwaway pass the way pure
 * rendering does — it genuinely starts the enter animation, gets
 * re-triggered by the second render a couple ms later, and the two
 * overlapping tweens are exactly what reads as "fades in, disappears
 * quickly, fades in again and stays." Confirmed with a production build
 * (`next build && next start`): there StrictMode's double-invoke doesn't
 * happen and the animation fires exactly once — so this only ever showed
 * up in local dev, but that's what's actually being tested against.
 *
 * `useEffect` cleanup gives the fix a natural home: StrictMode's double
 * mount there really is mount → cleanup → mount, so `controls.stop()`
 * cancels the first (spurious) start before the second, real one begins —
 * same guard already used for HorizontalTrack's GSAP setup. `initial` and
 * `exit` stay on the declarative variants prop since AnimatePresence's own
 * exit-detection lifecycle already fired cleanly once in testing — only
 * the mount-triggered enter needed this.
 */
function TransitionChild({ children }: { children: React.ReactNode }) {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start("animate");
    return () => {
      controls.stop();
    };
  }, [controls]);

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate={controls}
      exit="exit"
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <TransitionChild key={pathname}>{children}</TransitionChild>
    </AnimatePresence>
  );
}
