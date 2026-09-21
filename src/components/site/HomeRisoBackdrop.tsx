/**
 * The homepage's Riso washes — the two "Gradient" plates in Figma's Final
 * Homepage - Full (Portfolio-Playground 20:41288): Gradient 23 (36:3561)
 * bleeding in from the LEFT edge of the interior column behind the hero and
 * Recent work, and Gradient 22 (36:3554) from the RIGHT edge, from Recent
 * work down through Experience. Both are the same artwork (the standalone
 * "Gradient 22" frame, 35:3480): three blurred vectors on a #E4E4DF sheet,
 * 3157×1048 (the 3324×2072 the inspector shows for that frame is its
 * rotated bounding box), each instance flipped and rotated into place.
 *
 * The exported SVGs are used as-is from /public/riso/home — each carries
 * its own 200px blur bleed and per-layer opacity — so only the blend modes
 * and the geometry live here. Layer geometry is Figma's, as percentages of
 * the 3157×1048 plate:
 *
 *   Vector 03 · 246.8, 141.7 · 2358.3×1591.4 · normal (α .5 in the SVG)
 *   Vector 02 · 187.2, 189.2 · 2818.0×1464.3 · darken
 *   Vector 01 · 553.2×1089.4 unrotated, centred at 1202.6, 703.9, then
 *               rotate(-57.83°) skewX(1.18°) · hard-light (α .6 in the SVG)
 *
 * Each plate clips at its own 1048px edge exactly like the Figma frame does
 * (that hard diagonal cut through the ink is in the design), paints the
 * sheet colour and isolates, so darken/hard-light blend against the sheet
 * and each other rather than the page. The plate itself is then darken-
 * blended onto the page: its sheet is the page's own colour so that's a
 * no-op on paper, but where the two plates overlap (they do below ~1024px)
 * the upper plate's sheet no longer masks the lower plate's ink with a
 * hard edge — the two inks union instead. The plate transforms are the
 * frames' relativeTransform matrices verbatim (both carry a flip — the
 * determinant is −1 — so they're matrix(), not rotate()), anchored to the
 * interior column (<main>): the left plate to its left edge, the right
 * plate to its right edge. The column caps at 1376px, so past 1440 the
 * plates stay put and the widening paper margins simply reveal more of
 * them; below that, OFFSETS slides each plate outward so the forms stay
 * full-size and get cropped rather than shrunk. The paper grain
 * (NoiseOverlay, z-38) and the fixed frame sit above like everything else.
 */

const PLATE_W = 3157;
const PLATE_H = 1048;

// Figma relativeTransform, Container-relative, translation stripped (the
// origin corner is positioned with left/top instead so it can be anchored
// to either edge). CSS matrix(a, b, c, d) ⇔ Figma [[a, c], [b, d]].
const LEFT_MATRIX = "matrix(0.2588190734, -0.9659258127, -0.9659258127, -0.2588190734, 0, 0)";
const RIGHT_MATRIX = "matrix(-0.1197612137, 0.9928027391, 0.9928027391, 0.1197612137, 0, 0)";

function Plate({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute isolate overflow-hidden bg-[#E4E4DF] mix-blend-darken ${className}`}
      style={{
        width: PLATE_W,
        height: PLATE_H,
        transformOrigin: "0 0",
        ...style,
      }}
    >
      {/* Vector 03 — the blue-grey wash, normal blend */}
      <div className="absolute left-[7.816%] top-[13.518%] h-[151.85%] w-[74.7%]">
        <div className="absolute inset-[-12.57%_-8.48%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/riso/home/vector-03.svg"
            alt=""
            className="block h-full w-full max-w-none"
          />
        </div>
      </div>

      {/* Vector 02 — the dark brown ink, darken */}
      <div className="absolute left-[5.929%] top-[18.055%] h-[139.72%] w-[89.263%] mix-blend-darken">
        <div className="absolute inset-[-13.66%_-7.1%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/riso/home/vector-02.svg"
            alt=""
            className="block h-full w-full max-w-none"
          />
        </div>
      </div>

      {/* Vector 01 — the warm highlight, hard-light. Placed by its unrotated
          box (Figma rotates about that box's centre), so the transform is
          applied directly instead of reconstructed from the rotated
          bounding box the export gives. */}
      <div
        className="absolute left-[29.33%] top-[15.19%] h-[103.955%] w-[17.525%] origin-center mix-blend-hard-light"
        style={{ transform: "rotate(-57.83deg) skewX(1.18deg)" }}
      >
        <div className="absolute inset-[-18.36%_-36.15%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/riso/home/vector-01.svg"
            alt=""
            className="block h-full w-full max-w-none"
          />
        </div>
      </div>
    </div>
  );
}

type HomeRisoBackdropProps = {
  className?: string;
};

// Where each plate's origin corner sits against the interior column
// (<main>), per breakpoint. lg+ is Figma verbatim: Container-relative x/y,
// with y including the 42px top band the column sits under, and the right
// plate's x measured from the column's right edge (1376 − 980.09) so it
// stays glued to that side and the widening margins past 1440 reveal more
// of it. Below lg the column is the whole viewport and the text runs
// edge to edge, so each plate slides outward until only its outer reach
// is left, and its darkest pass is lined up behind an opaque media card
// (the Yahoo card on the left, the Airbnb card on the right at phone
// width) rather than under copy — the forms never shrink, the crop just
// tightens. Tuned at 1440 / 1024 / 768 / 390.
const OFFSETS = [
  // ≤ 767 (phone)
  "[--riso-l-x:-60px] [--riso-l-y:1800px] [--riso-r-x:120px] [--riso-r-y:1250px]",
  // 768 – 1023 (tablet)
  "md:[--riso-l-x:60px] md:[--riso-l-y:1950px] md:[--riso-r-x:300px] md:[--riso-r-y:598.61px]",
  // ≥ 1024 (Figma)
  "lg:[--riso-l-x:213.87px] lg:[--riso-l-y:2152.67px] lg:[--riso-r-x:395.91px] lg:[--riso-r-y:598.61px]",
].join(" ");

export function HomeRisoBackdrop({ className = "" }: HomeRisoBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-[1] ${OFFSETS} ${className}`}
    >
      {/* Gradient 23 — left edge */}
      <Plate
        style={{
          left: "var(--riso-l-x)",
          top: "var(--riso-l-y)",
          transform: LEFT_MATRIX,
        }}
      />
      {/* Gradient 22 — right edge */}
      <Plate
        style={{
          left: "calc(100% - var(--riso-r-x))",
          top: "var(--riso-r-y)",
          transform: RIGHT_MATRIX,
        }}
      />
    </div>
  );
}
