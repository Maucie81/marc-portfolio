import { COMIX_INK, COMIX_RUST, PLATE_SHIFT_PX } from "./palette";

/**
 * Printer's registration mark — crosshair in a circle, the mark a press
 * operator lines the plates up on. The black ring and a rust ring sit at a
 * fixed relative offset (never perfectly stacked) — a real proof sheet
 * shows every separation's mark slightly apart; a mark with zero drift is
 * the one part of a press sheet that's supposed to prove alignment, so
 * showing it dead-on defeats the reference. Structural, not decorative:
 * this is what "registration held, not guaranteed" looks like.
 */
export default function RegistrationMark({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const dx = (PLATE_SHIFT_PX.x / 8) * (size / 22);
  const dy = (PLATE_SHIFT_PX.y / 8) * (size / 22);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <g transform={`translate(${dx} ${dy})`} opacity={0.75}>
        <circle cx="50" cy="50" r="42" fill="none" stroke={COMIX_RUST} strokeWidth="4" />
        <line x1="50" y1="4" x2="50" y2="96" stroke={COMIX_RUST} strokeWidth="4" />
        <line x1="4" y1="50" x2="96" y2="50" stroke={COMIX_RUST} strokeWidth="4" />
      </g>
      <g>
        <circle cx="50" cy="50" r="44" fill="none" stroke={COMIX_INK} strokeWidth="4" />
        <line x1="50" y1="2" x2="50" y2="98" stroke={COMIX_INK} strokeWidth="4" />
        <line x1="2" y1="50" x2="98" y2="50" stroke={COMIX_INK} strokeWidth="4" />
      </g>
    </svg>
  );
}
