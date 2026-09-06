import { RISO_BLACK } from "./palette";

/**
 * Faint roller-banding streaks (see riso-band in RisoDefs) — density drift
 * in the direction of the drum's rotation. One instance per SECTION, not
 * per shape: on a real sheet the banding runs the same way across
 * everything printed on it, so it has to sit above a whole section to read
 * as a property of the paper rather than a per-object effect.
 */
export default function RisoBanding({ opacity = 0.1 }: { opacity?: number }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        mixBlendMode: "multiply",
        opacity,
        pointerEvents: "none",
      }}
      preserveAspectRatio="none"
    >
      <rect width="100%" height="100%" fill={RISO_BLACK} filter="url(#riso-band)" />
    </svg>
  );
}
