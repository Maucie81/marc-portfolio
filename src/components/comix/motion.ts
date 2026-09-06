import type { Transition, Variants } from "framer-motion";

/**
 * "Mechanical and deliberate" per the motion brief — no bounce, no spring,
 * no standard ease-in-out curve. A steep, near-linear cubic-bezier reads as
 * a press coming down or a page being turned, not an interface easing in.
 */
export const MECHANICAL: Transition["ease"] = [0.83, 0, 0.17, 1];

/**
 * Panel reveal — a hard clip-path wipe (like a page turning, or a panel
 * being uncovered) rather than a fade or slide. Never used with spring.
 */
export const panelReveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", opacity: 1 },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    opacity: 1,
    transition: { duration: 0.7, ease: MECHANICAL },
  },
};

/** For elements that shouldn't clip (text, thin rules) — a hard cut
 * opacity/position step instead of an eased fade. */
export const stepIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: MECHANICAL },
  },
};

export const staggerChildren = (stagger = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  },
});
