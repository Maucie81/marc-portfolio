/**
 * The left rail from the Figma frame — outlined circles evenly distributed
 * across a section's own height (nodes 177:111954, 177:111975, 177:112109,
 * 177:112224, 177:112251).
 *
 * Distribution is `justify-between` on a stretched flex column rather than
 * fixed offsets, so the circles reflow when a section grows or shrinks.
 * Stroke-only, per the exported asset: circle r=5.5 stroke #686868, no fill.
 *
 * `dots`: the homepage redesign (215:205616) runs three circles down each
 * section (top, middle, bottom) and two down the contact footer; the
 * contact and coming-soon pages keep their original pair.
 * `flush`: the homepage's circles sit 4px into their 24px column (Figma
 * x = 4), not on the hero-mark line the original rail was nudged onto.
 */
export default function SectionRail({
  dots = 2,
  flush = false,
  className = "",
}: {
  dots?: number;
  flush?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`hidden self-stretch py-2 lg:flex lg:flex-col lg:justify-between ${
        flush ? "lg:items-start lg:pl-1" : "lg:items-center"
      } ${className}`}
    >
      {Array.from({ length: dots }, (_, i) => (
        <span key={i} className={`rail-dot${flush ? " rail-dot--flush" : ""}`} />
      ))}
    </div>
  );
}
