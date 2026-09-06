import { RISO_BLACK, RISO_GRAIN_OPACITY } from "./palette";

/**
 * Fine ink-grain speckle via feTurbulence (see RisoDefs), not a texture
 * image. Real Riso solid fills are never perfectly flat — this is what
 * separates a fill from a "digital Riso filter" flat color swatch.
 *
 * Always uses the same default opacity so every component's paper reads
 * as one stock when several sit on the same page — override only for a
 * component that truly needs a different intensity, not as a per-page tweak.
 */
export default function RisoGrain({ opacity = RISO_GRAIN_OPACITY }: { opacity?: number }) {
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
      <rect width="100%" height="100%" fill={RISO_BLACK} filter="url(#riso-grain)" />
    </svg>
  );
}
