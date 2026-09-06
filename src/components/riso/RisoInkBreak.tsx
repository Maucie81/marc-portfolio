import { RISO_PAPER } from "./palette";

/**
 * Speckled paper-color dropout INSIDE an ink shape — not a dark overlay on
 * top of everything. Paper doesn't gain texture from ink sitting on it;
 * ink loses coverage where it fails to fully wet the fiber, so the paper
 * shows through in tiny scattered gaps. Uses normal blending (not
 * multiply) and paints in the paper color specifically so it reads as
 * absence, not added density. Sized to whatever ink shape contains it —
 * drop inside a `position: relative`/`absolute` wrapper the same size as
 * the fill it's breaking up.
 */
export default function RisoInkBreak({ opacity = 0.16 }: { opacity?: number }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
      preserveAspectRatio="none"
    >
      <rect width="100%" height="100%" fill={RISO_PAPER} filter="url(#riso-inkbreak)" />
    </svg>
  );
}
