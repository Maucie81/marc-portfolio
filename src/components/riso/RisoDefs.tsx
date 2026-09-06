import { RISO_ORANGE, RISO_PINK } from "./palette";

/**
 * Mount ONCE per page (before any other Riso component renders) — every
 * other component in this system references these ids via `filter:
 * url(#...)` / `fill="url(#...)"`. Not per-component because SVG filters
 * are expensive to duplicate and ids must stay stable across instances.
 *
 * Two real print details baked in on purpose:
 * - riso-halftone-* screen angles are offset (15°/75°), same reason color
 *   separations are shot at offset angles on a real press: same-angle
 *   dot grids moiré against each other.
 * - riso-rough perturbs vector edges with feDisplacementMap so fills read
 *   as hand-cut, not machine-vector — the #1 tell of a "Riso filter" vs.
 *   the real thing is edges that are too clean.
 */
export default function RisoDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <pattern
          id="riso-halftone-pink"
          width={9}
          height={9}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(15)"
        >
          <circle cx={4.5} cy={4.5} r={2.1} fill={RISO_PINK} />
        </pattern>
        <pattern
          id="riso-halftone-orange"
          width={9}
          height={9}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(75)"
        >
          <circle cx={4.5} cy={4.5} r={2.1} fill={RISO_ORANGE} />
        </pattern>

        {/* Displace the edge, then blur and re-sharpen its alpha rather than
            leaving it pin-crisp — a vector edge run through only
            feDisplacementMap is still a razor edge, just a wobblier one.
            The feComponentTransfer claws back most of the blur's softness
            so shapes stay legible while the outer rim keeps a slight
            feathered bleed, closer to ink sitting on paper fiber. */}
        <filter id="riso-rough" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.08" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" result="disp" />
          <feGaussianBlur in="disp" stdDeviation={0.55} result="soft" />
          <feComponentTransfer in="soft">
            <feFuncA type="linear" slope={1.7} intercept={-0.2} />
          </feComponentTransfer>
        </filter>

        <filter id="riso-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.85 0 0 0 0" />
        </filter>

        {/* Coarser, lower-frequency than riso-grain and pushed toward a hard
            black/white split — patches of coverage failure within a solid
            fill, not fine speckle. The color offsets bake in RISO_PAPER
            directly (feTurbulence ignores the element's own fill, same as
            riso-grain/riso-band below) so RisoInkBreak always punches
            paper-colored gaps regardless of what it's layered over. */}
        <filter id="riso-inkbreak" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.11 0.2" numOctaves={2} seed={4} stitchTiles="stitch" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.9608  0 0 0 0 0.9412  0 0 0 0 0.9098  0 0 0 2.4 -1.55"
          />
        </filter>

        {/* Roller banding — anisotropic turbulence (very low X frequency,
            higher Y) reads as faint streaks running one direction across
            the sheet, the way density actually varies on a drum press.
            Applied per-section (not per-shape): banding is a property of
            the paper feed, the same across everything on one sheet. */}
        <filter id="riso-band" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.25" numOctaves={2} seed={11} stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.55 0 0 0 0" />
        </filter>
      </defs>
    </svg>
  );
}
