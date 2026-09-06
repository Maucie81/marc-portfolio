import { RISO_ORANGE, RISO_PINK } from "./palette";

/**
 * A printer's registration target (crosshair-in-circle), drawn TWICE — once
 * per ink, offset by the system's own drift convention — instead of once in
 * flat black. A perfectly aligned reg mark is a sticker; the whole point of
 * the device is to show the plates didn't line up, so this one has to show
 * its own small error or it undercuts every other misregistered element on
 * the page. Two locked inks only, same as everywhere else in this system.
 */
export default function RegistrationMark({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      focusable="false"
      style={{ overflow: "visible" }}
    >
      <g stroke={RISO_PINK} strokeWidth={1} style={{ mixBlendMode: "multiply", transform: "translate(1.6px, -1.6px)" }}>
        <circle cx={12} cy={12} r={7} />
        <line x1={12} y1={0} x2={12} y2={24} />
        <line x1={0} y1={12} x2={24} y2={12} />
      </g>
      <g stroke={RISO_ORANGE} strokeWidth={1} style={{ mixBlendMode: "multiply", transform: "translate(-1.6px, 1.6px)" }}>
        <circle cx={12} cy={12} r={7} />
        <line x1={12} y1={0} x2={12} y2={24} />
        <line x1={0} y1={12} x2={24} y2={12} />
      </g>
    </svg>
  );
}
