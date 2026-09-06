"use client";

import { useMemo } from "react";

interface VariableHalftoneProps {
  width: number;
  height: number;
  color: string;
  /** Screen angle in degrees — real separations shoot each plate at a
   * different angle so the dot grids don't moiré against each other. */
  angle?: number;
  /** Distance between dot centers, in the unrotated grid. */
  cell?: number;
  maxR?: number;
  minR?: number;
  /** Where the tone is darkest (largest dots), in the same px space as width/height. */
  focusX?: number;
  focusY?: number;
  /** Distance over which tone fades from max dot size to nothing. */
  falloff?: number;
  /** Quantize tone into this many dot-size steps instead of a continuous
   * ramp. A screen at typical viewing distance reads as visibly different
   * dot sizes banding outward, not a smooth photographic gradient — cheap
   * duplicator stencils have a genuinely narrow, steppy tonal range. */
  steps?: number;
}

/**
 * A real halftone: dot RADIUS carries the tone (small dots vanish below a
 * threshold — a genuine dropout, the same as a screen running out of ink —
 * rather than a uniform grid of identical dots at 100% coverage, which is
 * a polka-dot fill, not a halftone). Screen angle is a prop so two plates
 * sharing one area can be shot at offset angles.
 */
export default function VariableHalftone({
  width,
  height,
  color,
  angle = 15,
  cell = 8,
  maxR = 3.1,
  minR = 0.3,
  focusX,
  focusY,
  falloff,
  steps = 5,
}: VariableHalftoneProps) {
  const fx = focusX ?? width * 0.5;
  const fy = focusY ?? height * 0.5;
  const fall = falloff ?? Math.max(width, height) * 0.65;

  const dots = useMemo(() => {
    const diag = Math.sqrt(width * width + height * height);
    const span = Math.ceil(diag / cell) + 4;
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const cx = width / 2;
    const cy = height / 2;
    const items: { x: number; y: number; r: number }[] = [];
    for (let row = -span / 2; row < span / 2; row++) {
      for (let col = -span / 2; col < span / 2; col++) {
        const lx = col * cell;
        const ly = row * cell;
        const x = cx + lx * cos - ly * sin;
        const y = cy + lx * sin + ly * cos;
        if (x < -maxR || x > width + maxR || y < -maxR || y > height + maxR) continue;
        const d = Math.hypot(x - fx, y - fy);
        let t = Math.max(0, Math.min(1, 1 - d / fall));
        if (steps > 1) t = Math.round(t * (steps - 1)) / (steps - 1);
        const r = minR + (maxR - minR) * t;
        if (r < 0.35) continue;
        items.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, r: Math.round(r * 100) / 100 });
      }
    }
    return items;
  }, [width, height, angle, cell, maxR, minR, fx, fy, fall, steps]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }} aria-hidden focusable="false">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} />
      ))}
    </svg>
  );
}
