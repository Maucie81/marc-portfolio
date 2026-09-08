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

export function Crosshair({
  className = "",
  src = "/icons/crosshair.svg",
}: {
  className?: string;
  src?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={12}
      height={12}
      className={`pointer-events-none block size-3 ${className}`}
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
 * (it marks the nav-strip/page boundary, which only exists at the top).
 * Exported: the top band's pair now renders inside #hero's own scaled
 * container (see page.tsx) instead of here, so it scales with
 * --hero-scale — this component is shared across that boundary. */
export function DoubleLineIcon({ className = "" }: { className?: string }) {
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

/** Center crosshair + corner crosshairs, shared by the top and bottom bands
 * — all three are the same shared circle-crosshairs mark (confirmed via
 * get_design_context on 499:54149: every registration mark in the file,
 * center and corner alike, resolves to the same circle-crosshairs asset).
 * The center mark uses a distinct center-mark.svg glyph (matches the rail
 * treatment); the corner marks use the full circular crosshair.svg.
 * No continuous rule line here — real offset-print proofing marks are
 * short, isolated marks with clear white space on every side, never a
 * ruled line spanning the full band/rail. The earlier long inset-y-0
 * divider (and the rail borders, and the band's own top/bottom rules)
 * were exactly that mistake and have been removed; DividerTicks below is
 * the actual (short) divider mark.
 * Crosshair centered within the 32px-wide rail (left-[10px]: a 12px icon
 * centered in 32px sits at (32-12)/2=10px from the edge, true center at
 * x=16 — the rail's own midpoint), not just flush with an arbitrary
 * edge offset.
 * left-[10px]/right-[10px]: briefly frozen at the 1440px design width to
 * match the hero section, then reverted per direct correction — the
 * white rails stay a fixed 32px wide forever (never capped, never
 * growing), and the grey content area keeps growing with the viewport
 * indefinitely instead of freezing. With content never frozen, these
 * icons are correctly plain viewport-edge-relative again: the rail (and
 * everything in it) never moves regardless of viewport width. */
function BandOrnaments() {
  return (
    <>
      <Crosshair
        src="/icons/center-mark.svg"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <Crosshair className="absolute left-[10px] top-1/2 -translate-y-1/2" />
      <Crosshair className="absolute right-[10px] top-1/2 -translate-y-1/2" />
    </>
  );
}

/** Divider-tick pair flanking each crosshair — marks where the CONTENT
 * COLUMN begins (rail width, 32px). Briefly frozen against the content
 * column's own width so it wouldn't drift on wide screens — reverted per
 * direct correction: the content column no longer freezes at all (it
 * grows with the viewport indefinitely; only the 32px rails are fixed),
 * so the content edge is always exactly 32px from the viewport edge and
 * a plain fixed value is correct again, with zero drift risk.
 * The 32px itself is a true, single, mirrored value — not two guessed
 * numbers: measured each tick's distance from its own crosshair's edge
 * (not from any frame-width figure, which was inconsistent across pulls),
 * using local coordinates shared with the crosshair so the parent offset
 * cancels out. Left crosshair (node 751:48604, x=10, width=12) → right
 * edge=22; Line 197 (627:51831, x=32) → distance=10. Right crosshair
 * (751:48608, x=1418, width=12) → left edge=1418; Line 209 (627:51833)
 * was x=1408.5 → distance=9.5, a 0.5px mismatch against the left side's
 * clean 10; corrected to x=1408 so both distances equal 10 exactly.
 * That confirmed 10px gap, applied to this component's own crosshair
 * (edge at 22), lands the tick at 22+10=32 on both sides — which is also
 * exactly the rail width, so the mark sits flush with the content edge
 * at any viewport width. */
function BandTicks() {
  return (
    <>
      <DividerTicks className="left-[32px]" />
      <DividerTicks className="right-[32px]" />
    </>
  );
}

/** Top band — 42px tall, full width, white. Nav content lives in
 * PersistentHeader.tsx (pathname-aware); this is just the ornamental
 * overlay decorating that same header shell.
 *
 * The double-line mark was previously anchored flush to the band's own
 * bottom edge (`bottom-0`), which put its first line at y=30 — but
 * `/icons/crosshair.svg`'s own cross strokes are drawn full-bleed across
 * the whole 20×20 viewBox (`M10 0V20`, `M0 10H20`), not just inside the
 * circle, so the icon's real footprint (centered here, spans y=11–31)
 * extends a few px past the circle on every side. y=30 lands inside that
 * stroke, so the first line rendered directly on top of — indistinguishable
 * from — the crosshair's own downward tick: only the second line ever
 * read as a separate mark, which is what looked like a single line at
 * every corner. Confirmed by cloning the rendered chrome into an isolated,
 * scaled-up overlay and reading both elements' actual boundingClientRects
 * side by side — not visible from the code diff alone.
 * The double-line marks moved to #hero's own scaled container for a
 * while (registering them to the hero box's corners so they'd scale with
 * --hero-scale), but that was wrong: they belong to the white margin
 * column, not the hero box, and living inside #hero made them a
 * descendant of <main> — which now carries the page's grey background
 * (see page.tsx) — so they'd render on grey instead of the white margin.
 * Moved back here, stacked below BandOrnaments/BandTicks in the same
 * white column (`left-2`/`right-2`, matching BandOrnaments' left/right
 * crosshairs' horizontal position), not registered to the hero box at
 * all. `top-[42px]` sits flush with the header's own bottom edge (its
 * rendered height is exactly 42px) — per direct user correction, the
 * mark should sit right at that boundary, not floated further down with
 * a gap.
 * left-2/right-2 (8px): briefly frozen at the 1440px design width, then
 * reverted per direct correction — content no longer freezes at all, so
 * plain viewport-edge-relative is correct again (the rail these marks
 * sit in front of never moves). */
export function TopBandChrome() {
  return (
    <>
      <BandOrnaments />
      <BandTicks />
      <DoubleLineIcon className="top-[42px] left-2" />
      <DoubleLineIcon className="top-[42px] right-2" />
    </>
  );
}

/** Bottom band — 32px tall, full width, white. The double-line mark used
 * to sit at `top-0` (flush with the band's own top edge), which — same
 * root cause as TopBandChrome — put its second line at y=11, inside the
 * crosshair's real 6–26 footprint (`/icons/crosshair.svg` draws its cross
 * full-bleed across the 20×20 viewBox, not just inside the circle), so it
 * rendered inside the crosshair's own ink instead of reading as a second,
 * separate line. `-top-3` (-12px) moves the whole mark above the band
 * instead, clearing the crosshair's true top edge (6) by the same 6px gap
 * TopBandChrome now keeps below its crosshair — mirrored, not re-guessed.
 * Confirmed by cloning the rendered band into an isolated, scaled-up
 * overlay with the crosshair hidden, then shown, and comparing.
 * Campaign badge anchored here (Figma: 627:51854, sits just left of the
 * bottom-right divider/crosshair) instead of floating mid-page. */
export function BottomBand() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 hidden lg:block">
      <div className="relative h-8 bg-white">
        <BandOrnaments />
        <BandTicks />
        <DoubleLineIcon className="-top-3 left-2" />
        <DoubleLineIcon className="-top-3 right-2" />
        {/* Campaign badge — plain text, no card treatment (Figma: no
            border/bg on 627:51854), anchored left of the right crosshair.
            Single line per Figma node 752:48622 — "2026 get a new job
            campaign • M.Favro / ... " joined with a bullet, not stacked.
            right-16 (64px): briefly frozen at the 1440px design width,
            then reverted per direct correction — plain viewport-edge-
            relative, since content no longer freezes and this badge sits
            in the never-moving 32px rail's band. */}
        <div className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 text-right">
          <span className="t-frame-mono whitespace-nowrap normal-case">
            2026 get a new job campaign • M.Favro / {contact.phone} /{" "}
            {contact.email}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Left rail — 32px wide, full viewport height, white. Sits behind the
 * top/bottom bands (lower z-index, and the bands span the full width) so
 * the corners have no seam. Holds the CMYK strip, anchored so its own
 * bottom edge sits 32px above the top line of BottomBand's double-line
 * mark (that mark's top line sits at -top-3/-12px above the 32px band,
 * i.e. 44px above the viewport bottom — so the strip's bottom needs
 * 44+32=76px clearance from the viewport bottom), not vertically centered. */
export function LeftRail() {
  return (
    <div className="fixed inset-y-0 left-0 z-40 hidden w-8 bg-white lg:flex">
      <img
        src="/icons/center-mark.svg"
        alt=""
        aria-hidden
        width={12}
        height={12}
        className="pointer-events-none absolute left-1/2 top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-[76px] flex flex-col items-center gap-2">
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
                  className="block size-2.5"
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
    <div className="fixed inset-y-0 right-0 z-40 hidden w-8 bg-white lg:flex">
      <img
        src="/icons/center-mark.svg"
        alt=""
        aria-hidden
        width={12}
        height={12}
        className="pointer-events-none absolute left-1/2 top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}
