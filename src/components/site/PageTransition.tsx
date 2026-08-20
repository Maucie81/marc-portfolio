"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

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

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
