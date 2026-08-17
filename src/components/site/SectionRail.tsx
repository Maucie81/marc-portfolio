/**
 * The left rail from the Figma frame — three outlined circles per section,
 * evenly distributed across that section's own height (nodes 177:111954,
 * 177:111975, 177:112109, 177:112224, 177:112251).
 *
 * Distribution is `justify-between` on a stretched flex column rather than
 * fixed offsets, so the circles reflow when a section grows or shrinks.
 * Stroke-only, per the exported asset: circle r=5.5 stroke #686868, no fill.
 */
export default function SectionRail() {
  return (
    <div
      aria-hidden
      className="hidden self-stretch py-2 lg:flex lg:flex-col lg:items-center lg:justify-between"
    >
      <span className="rail-dot" />
      <span className="rail-dot" />
      <span className="rail-dot" />
    </div>
  );
}
