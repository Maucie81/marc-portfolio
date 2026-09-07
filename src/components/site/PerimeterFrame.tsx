import { contact } from "@/lib/home";

/**
 * Fixed outer "print registration" frame for the homepage — a continuous
 * white border around the whole viewport (top band 42px, right/bottom/left
 * 32px), not just floating top/bottom bars. Sourced from Figma fileKey
 * AWMKNoAFrxViMhBaGRfWbZ, node 627:49704 ("Final Homepage - Cropped"), with
 * the 42/32 measurements given directly by the user (their own build).
 * Desktop-only (lg+, this codebase's existing "hide the ornamental rail"
 * breakpoint — see SectionRail/.t-section-title in globals.css) —
 * position:fixed already keeps it out of mobile flow, `hidden lg:flex` just
 * stops it rendering.
 */

export const FRAME_TOP = 42;
export const FRAME_SIDE = 32;

// C/M/Y/K hex + 5-step opacity ramp (100/80/60/40/20%), confirmed via
// get_design_context on 643:52825 — full saturation first, fading to tint.
const CMYK_GROUPS = [
  { label: "C", color: "#00AEEF" },
  { label: "M", color: "#EC008C" },
  { label: "Y", color: "#FFF200" },
  { label: "K", color: "#000000" },
];
const CMYK_OPACITIES = [1, 0.8, 0.6, 0.4, 0.2];

export function Crosshair({ className = "" }: { className?: string }) {
  return (
    <img
      src="/icons/crosshair.svg"
      alt=""
      aria-hidden
      width={20}
      height={20}
      className={`pointer-events-none block h-5 w-5 ${className}`}
    />
  );
}

function Diamond({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none block h-2.5 w-2.5 rotate-45 border border-line bg-white ${className}`}
    />
  );
}

/** Short 16px vertical tick pair, stroke #666666 1px — confirmed via the
 * Line 190/209 assets (both just a plain `stroke="#666666"` <line>, no
 * explicit stroke-width so default 1px). Figma positions these as two
 * separate ticks 10px apart, not one continuous rule spanning the band. */
function DividerTicks({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-1/2 flex h-4 -translate-y-1/2 gap-2.5 ${className}`}
    >
      <span className="block h-full w-px bg-[#666666]" />
      <span className="block h-full w-px bg-[#666666]" />
    </span>
  );
}

/** Two 16px-wide horizontal lines, 10px apart, stroke #666666 1px — sits
 * right under a crosshair, at the nav strip's own bottom edge (confirmed
 * via Line 174/196/198, same stroke as DividerTicks and the crosshair
 * icon itself). Figma only shows this under the top band's crosshairs
 * (it marks the nav-strip/page boundary, which only exists at the top). */
function DoubleLineIcon({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute flex w-4 flex-col gap-2.5 ${className}`}
    >
      <span className="block h-px w-full bg-[#666666]" />
      <span className="block h-px w-full bg-[#666666]" />
    </span>
  );
}

/** Center diamond + corner crosshairs, shared by the top and bottom bands.
 * No continuous rule line here — real offset-print proofing marks are
 * short, isolated marks with clear white space on every side, never a
 * ruled line spanning the full band/rail. The earlier long inset-y-0
 * divider (and the rail borders, and the band's own top/bottom rules)
 * were exactly that mistake and have been removed; DividerTicks below is
 * the actual (short) divider mark.
 * Crosshair centered within the 32px-wide rail (left-[6px]: a 20px icon
 * centered in 32px sits at (32-20)/2=6px from the edge, true center at
 * x=16 — the rail's own midpoint), not just flush with an arbitrary
 * edge offset. */
function BandOrnaments() {
  return (
    <>
      <Diamond className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <Crosshair className="absolute left-[6px] top-1/2 -translate-y-1/2" />
      <Crosshair className="absolute right-[6px] top-1/2 -translate-y-1/2" />
    </>
  );
}

/** Tick marks flanking each crosshair — a small 8px gap after the
 * crosshair's own right/left edge (26px) before the divider-tick pair
 * starts, and the double-line icon at whichever band edge borders the
 * page content (bottom edge for the top band, top edge for the bottom
 * band — that boundary line is what the double-line marks). */
function BandTicks({ doubleLineEdge }: { doubleLineEdge: "top" | "bottom" }) {
  return (
    <>
      <DividerTicks className="left-[34px]" />
      <DividerTicks className="right-[34px]" />
      <DoubleLineIcon className={`${doubleLineEdge}-0 left-2`} />
      <DoubleLineIcon className={`${doubleLineEdge}-0 right-2`} />
    </>
  );
}

/** Top band — 42px tall, full width, white. Nav content lives in
 * PersistentHeader.tsx (pathname-aware); this is just the ornamental
 * overlay decorating that same header shell. */
export function TopBandChrome() {
  return (
    <>
      <BandOrnaments />
      <BandTicks doubleLineEdge="bottom" />
    </>
  );
}

/** Bottom band — 32px tall, full width, white. Mirrors the top band's
 * tick/double-line marks (previously missing here). Campaign badge
 * anchored here (Figma: 627:51854, sits just left of the bottom-right
 * divider/crosshair) instead of floating mid-page. */
export function BottomBand() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 hidden lg:block">
      <div className="relative h-8 bg-white">
        <BandOrnaments />
        <BandTicks doubleLineEdge="top" />
        {/* Campaign badge — plain text, no card treatment (Figma: no
            border/bg on 627:51854), anchored left of the right crosshair. */}
        <div className="pointer-events-none absolute right-16 top-1/2 flex -translate-y-1/2 flex-col items-end gap-0.5 text-right">
          <span className="t-frame-mono whitespace-nowrap">
            2026 get a new job campaign
          </span>
          <span className="t-frame-mono whitespace-nowrap normal-case">
            M.Favro / {contact.phone} / {contact.email}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Left rail — 32px wide, full viewport height, white. Sits behind the
 * top/bottom bands (lower z-index, and the bands span the full width) so
 * the corners have no seam. Holds the CMYK strip, centered in the rail. */
export function LeftRail() {
  return (
    <div className="fixed inset-y-0 left-0 z-40 hidden w-8 flex-col items-center justify-center bg-white lg:flex">
      <div aria-hidden className="flex flex-col gap-2">
        {CMYK_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col items-center gap-0.5">
            <span
              className="font-display text-[8px] font-semibold leading-none"
              style={{ color: group.color }}
            >
              {group.label}
            </span>
            <div className="flex flex-col gap-px">
              {CMYK_OPACITIES.map((opacity) => (
                <span
                  key={opacity}
                  className="block h-2.5 w-2.5"
                  style={{ backgroundColor: group.color, opacity }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Right rail — 32px wide, full viewport height, white. Mirrors the left
 * rail's frame treatment; no CMYK content (that's left-margin only). */
export function RightRail() {
  return (
    <div className="fixed inset-y-0 right-0 z-40 hidden w-8 bg-white lg:block" />
  );
}
