"use client";

import { usePatternId, CrosshatchDef, StippleField } from "./texture";
import { COMIX_INK } from "./palette";

/**
 * A press sheet's ink-density color bar, repurposed as the system's
 * structural tone reference: five swatches walking from bare paper to
 * full crosshatch saturation. This is the "texture as the actual way
 * surfaces are rendered" requirement made explicit and legible as an
 * object, not scattered as background decoration — and it's the fix for a
 * page that reads as too much bare paper next to a claim of ink density.
 */
export default function DensityStrip({
  orientation = "vertical",
  className = "",
}: {
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  const sparseId = usePatternId("dstrip-sparse");
  const medId = usePatternId("dstrip-med");
  const denseId = usePatternId("dstrip-dense");

  const cells = [
    { fill: "none" as const, label: "00" },
    { fill: sparseId, label: "25" },
    { fill: medId, label: "50" },
    { fill: denseId, label: "75" },
    { fill: "solid" as const, label: "99" },
  ];

  return (
    <div
      className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} ${className}`}
    >
      <svg width="0" height="0" aria-hidden>
        <defs>
          <CrosshatchDef id={sparseId} density="sparse" />
          <CrosshatchDef id={medId} density="medium" />
          <CrosshatchDef id={denseId} density="dense" />
        </defs>
      </svg>
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="border-comix-ink relative h-8 w-8 border"
          style={{
            background:
              cell.fill === "solid"
                ? COMIX_INK
                : cell.fill === "none"
                  ? "transparent"
                  : `url(#${cell.fill})`,
          }}
        >
          <span className="font-comix-body text-comix-ink absolute -bottom-4 left-0 text-[0.55rem] tracking-wide opacity-70">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export { StippleField };
