"use client";

import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import HorizontalTrack from "@/components/case-study/HorizontalTrack";
import LazyVideo from "@/components/case-study/LazyVideo";
import ExpandCollapse from "@/components/case-study/ExpandCollapse";
import CaseStudyClosing from "@/components/case-study/CaseStudyClosing";
import CaseStudyFooter from "@/components/case-study/CaseStudyFooter";
import ArrowIcon from "@/components/site/ArrowIcon";
import { closingLinksFor } from "@/lib/case-studies";
import type { Block, ImageSpec, SectionImage, StepIcon } from "@/lib/ypp";

/**
 * Shared shell + block renderers for every horizontal-scroll case study
 * (Airbnb Account Creation & Onboarding, Headspace Admin Portal, Yahoo
 * Partner Portal). Previously
 * each page.tsx duplicated this entire file with only the brand chrome and
 * data source differing — three copies that had already drifted from each
 * other. Living in one place now so a type/color update only has to happen
 * once. Headspace Unified Main Door has a deliberately smaller block set
 * (cover, Context, walkthrough, closing) and keeps its own page.tsx, but
 * composes it from the exported `CoverBlock`, `IntroStackBlock` and
 * `PlainMedia` below so its geometry can't drift from the other three.
 */

export type Meta = {
  title: string;
  subtitle: string;
  company: string;
  years: string;
  /** The outlined-title opening's lines (Figma 917:129483), uppercased by
   * CSS — every case study sets these. Leaving it out falls back to the
   * grid hero (CaseStudyHero), kept on purpose for later embellishment
   * work. The company name stays in the <h1> for screen readers only. */
  heroLines?: string[];
};

export type SidebarGroup = { label: string; items: string[] };
export type Sidebar = {
  groups: SidebarGroup[];
  highlights: string[];
  highlightsLabel?: string;
};

/** Standard media-area box for `MediaPlaceholder` and `PlainMedia` —
 * 1440×1024 (≈1.406:1), per explicit direct instruction superseding the
 * previous 857×609 value (which had been confirmed via Figma nodes
 * 594:122135 "Overview" and 594:122465 "User Management"; that Figma
 * citation no longer applies to this new value — flagging rather than
 * re-citing a source that wasn't re-checked). Shared by both `MediaPlaceholder`
 * and `PlainMedia` so a section's shape doesn't shift the moment a
 * placeholder gets swapped for real footage — `object-contain` on
 * `PlainMedia`'s `<img>` fits real recordings (captured at ~1440:905,
 * ≈1.59) inside this box rather than letting them dictate their own,
 * differently-shaped box; without a shared box like this, `MediaPlaceholder`
 * and `PlainMedia` panels in the same row (e.g. Overview next to Top
 * Content) render at different heights and their captions land at
 * different depths. */
const PLACEHOLDER_ASPECT = "aspect-[1440/1024]";

/* Every box built on this shape is sized as 857px × var(--cs-media-scale)
 * wide (609px tall at 1:1) — the height-driven scale set on .cs-track in
 * globals.css that shrinks ONLY the media on short viewports, leaving the
 * text columns (--cs-scale) alone. */

function Frame({ image }: { image: ImageSpec }) {
  return (
    <figure>
      <div className="cs-frame product-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="eager"
          decoding="async"
        />
      </div>
      <figcaption className="cs-caption">{image.caption}</figcaption>
    </figure>
  );
}

function MediaPlaceholder({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={`product-media ${PLACEHOLDER_ASPECT} flex w-full items-center justify-center overflow-hidden rounded-lg bg-white shadow-[0_18px_40px_-28px_rgba(25,23,19,0.45)] ${className}`}
    >
      {children}
    </div>
  );
}

/** A single interaction, staged on its own dark canvas — one component,
 * generous negative space, no browser chrome. Same gallery move as
 * `StepsPanel` (a dark card standing out against the light page) but for
 * a recording instead of text; --ink is the site's warm near-black, not
 * true black. Distinct from `MediaPlaceholder` (mock browser chrome) and
 * `Frame` (bordered card + caption for standalone `image` blocks). */
function IsolatedMedia({
  image,
  className = "",
}: {
  image: { src?: string; alt: string };
  className?: string;
}) {
  if (!image.src) {
    // No asset yet — same standard media box (aspect ratio, bg, shadow,
    // radius) as MediaPlaceholder/PlainMedia rather than an empty dark
    // pedestal with nothing sized inside it.
    return (
      <div
        className={`product-media ${PLACEHOLDER_ASPECT} w-full overflow-hidden rounded-lg bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${className}`}
      />
    );
  }
  return (
    <div
      className={`product-media flex w-full items-center justify-center rounded-lg bg-ink px-6 py-10 min-[901px]:px-14 min-[901px]:py-14 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        loading="eager"
        decoding="async"
        className="max-w-full rounded-md shadow-[0_18px_40px_-28px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
}

/** Full-bleed rounded image, just a drop shadow — no canvas, no chrome.
 * Figma's Search treatment (node 302:51676): a large, already-dense
 * recording reads fine on its own; it doesn't need the --ink pedestal
 * `IsolatedMedia` gives a small/odd-shaped crop. Exported so Headspace
 * Unified Main Door's page.tsx renders its walkthrough in this exact box
 * rather than a drifting local copy. */
export function PlainMedia({
  image,
  className = "",
}: {
  image: { src?: string; alt: string; type?: "video"; aspect?: string };
  className?: string;
}) {
  // `aspect` swaps the shared 1440:1024 box for the recording's own shape
  // (the caller sizes the width to match at 609px tall), so a clip cropped
  // to that shape fills the box with no bars — see SectionImage.
  return (
    <div
      className={`product-media ${image.aspect ? "" : PLACEHOLDER_ASPECT} w-full overflow-hidden rounded-lg bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] ${className}`}
      style={image.aspect ? { aspectRatio: image.aspect } : undefined}
    >
      {/* object-contain, not object-cover: real recordings are captured
          wider (~1440:905, ≈1.59) than this box's fixed 1440:1024 (≈1.41)
          shape, and object-cover would crop both side edges of the UI off —
          losing the nav rail on the left and the testimonial column on the
          right. Letterboxing (bg-white behind) keeps the full frame visible
          instead. */}
      {image.src ? (
        image.type === "video" ? (
          <LazyVideo src={image.src} label={image.alt} className="size-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.src} alt={image.alt} loading="eager" decoding="async" className="size-full object-contain" />
        )
      ) : null}
    </div>
  );
}

/** Dark step-by-step panel — Figma's "Steps" component (519:71878),
 * replacing the media placeholder for sections with no product to show
 * (e.g. the inherited manual flow, before any UI existed). Sized to match
 * Figma exactly: 500px background, 100px padding each side, 300px content
 * column (500 - 100*2 = 300, so content just fills the padded box rather
 * than needing its own width). The list scrolls internally once it
 * outgrows the panel — bounded to the same ~687px content-height budget
 * every other section's media panel honors, so it never grows past what
 * the pinned viewport actually shows. Relies on native scroll chaining (no
 * custom wheel handling): the browser scrolls this element first and only
 * hands scroll off to the page once this hits its own bottom, so the
 * page's horizontal-scroll-jacking in HorizontalTrack is untouched. */
function StepsPanel({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <div className="flex w-full flex-col gap-10 overflow-y-auto rounded-lg bg-ink/80 px-8 py-10 text-bg min-[901px]:w-[calc(500px*var(--cs-scale,1))] min-[901px]:max-h-[calc(687.3px*var(--cs-media-scale,1))] min-[901px]:shrink-0 min-[901px]:px-[calc(100px*var(--cs-scale,1))] min-[901px]:py-16">
      {steps.map((step) => (
        <div key={step.title} className="flex flex-col gap-3">
          <p className="text-xl font-semibold leading-[26px] [font-family:var(--font-display)]">{step.title}</p>
          <p className="text-base leading-[27px]">{step.body}</p>
        </div>
      ))}
    </div>
  );
}

/** A step's line illustration. Vector-only icons with `labels` get their two
 * text marks set beneath them the way Figma lays out the transfer step
 * (917:130980): vector inset 5.67px, marks 44.58px down, "B." in the
 * icon's own orange. */
function StepIllustration({ icon }: { icon: StepIcon }) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={icon.src} alt="" width={icon.width} height={icon.height} className="block max-w-none" />;
  if (!icon.labels) return img;
  return (
    <div className="relative" style={{ width: icon.width + 5.67, height: 71 }}>
      <div className="absolute top-0" style={{ left: 5.67 }}>
        {img}
      </div>
      {icon.labels.map((label, i) => (
        <span
          key={label}
          className="absolute top-[44.58px] text-center text-[18.25px] font-bold leading-[24.7px] [font-family:var(--font-display)]"
          style={i === 0 ? { left: 0, color: "#5a5857" } : { left: 62.17, color: "#fc5710" }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

/** Illustrated step list — Airbnb's inherited flow (Figma 917:130955): two
 * 558px columns 80px apart, filled top-to-bottom (1–4 left, 5–7 right) so
 * each row shares a baseline across both columns. Every icon centers in a
 * 98px cell (the widest illustration) with the copy 24px after it. */
function IllustratedSteps({ steps }: { steps: { title: string; body: string; icon?: StepIcon }[] }) {
  const rows = Math.ceil(steps.length / 2);
  return (
    <div
      className="flex w-full flex-col gap-10 min-[901px]:grid min-[901px]:w-auto min-[901px]:grid-flow-col min-[901px]:grid-cols-[repeat(2,calc(558px*var(--cs-scale,1)))] min-[901px]:gap-x-[calc(80px*var(--cs-scale,1))] min-[901px]:gap-y-11"
      style={{ gridTemplateRows: `repeat(${rows}, auto)` }}
    >
      {steps.map((step) => (
        <div key={step.title} className="flex items-start gap-6">
          <div className="flex w-[98px] shrink-0 justify-center">
            {step.icon ? <StepIllustration icon={step.icon} /> : null}
          </div>
          <div className="flex flex-col gap-3">
            <p className="cs-section-title">{step.title}</p>
            <p className="text-sm leading-6 text-ink-2 [font-family:var(--font-display)]">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full-bleed dark chapter panel — Figma's "Design Principles" section
 * (518:70506). The whole block goes dark edge-to-edge (not just a media
 * panel like `StepsPanel`), so it overrides `.cs-track`'s default
 * vertical centering with `self-stretch` to fill the pinned viewport
 * height, then paints that full height `bg-ink`. */
function PrinciplesBlock({
  sectionNumber,
  heading,
  intro,
  items,
}: {
  sectionNumber?: string;
  heading: string;
  intro: string;
  items: { number: string; title: string; body: string }[];
}) {
  return (
    <div
      className="cs-block relative bg-ink"
      style={{ ["--w" as string]: "calc(109.4375rem * var(--cs-scale, 1))" }}
    >
      <div className="relative flex w-full flex-col gap-10 px-6 py-14 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(3rem*var(--cs-scale,1))] min-[901px]:px-[calc(100px*var(--cs-scale,1))] min-[901px]:py-0">
        <div className="flex w-full flex-col gap-3 min-[901px]:w-[calc(19rem*var(--cs-scale,1))] min-[901px]:shrink-0">
          <div className="relative">
            {sectionNumber ? <SectionNum number={sectionNumber} titleLineHeight="40px * 1.04" /> : null}
            <h2 className="display text-[28px] leading-none text-bg min-[901px]:text-[40px]">{heading}</h2>
          </div>
          <p className="text-[20px] font-semibold leading-[26px] text-bg [font-family:var(--font-display)]">
            {intro}
          </p>
        </div>

        <div className="flex w-full flex-col min-[901px]:w-[calc(25.5rem*var(--cs-scale,1))]">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`flex gap-6 py-8 ${i < items.length - 1 ? "border-b border-bg/20" : ""}`}
            >
              <p className="cs-kicker w-10 shrink-0">{item.number}</p>
              <div className="flex flex-col gap-3">
                <p className="text-[20px] font-semibold leading-[26px] text-bg [font-family:var(--font-display)]">
                  {item.title}
                </p>
                <p className="text-sm leading-[22px] text-bg/85">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Three registration dots down the left edge of the story. Inset by the
 * perimeter frame's white rails (left-8 / top-[42px] — see PerimeterFrame.tsx
 * FRAME_TOP/FRAME_SIDE) so the column sits just inboard of the left rail on
 * the grey, not underneath it. The bottom inset is the 32px band PLUS the
 * 32px progress scrubber stacked on it (bottom-16 = 64px, the same
 * --cs-chrome-bottom the track uses) — per direct correction: with only
 * the band excluded, the bottom dot sat 30px off the scrubber while the
 * top dot had its full 56px (py-14) off the top band, so the three read as
 * shoved down. Now both end dots clear their chrome by the same 56px and
 * justify-between puts the middle one at the true midpoint — which is also
 * exactly the hero's own vertical center, since the track centers between
 * the same two edges. Rendered INSIDE the track (see .cs-rail-dots) so the
 * dots slide away with the opening section rather than staying pinned
 * beside every block, per direct request. Exported so
 * headspace-umd/page.tsx shares this exact element. */
export function RailDots() {
  return (
    <div aria-hidden className="cs-rail-dots">
      <span className="rail-dot" />
      <span className="rail-dot" />
      <span className="rail-dot" />
    </div>
  );
}

/** Hairline along the bottom of the viewport. On the vertical/mobile
 * layout it's the only bottom rule; in horizontal mode the scrubber's own
 * border-top normally covers it, so it lifts 32px to sit on the frame's
 * bottom band (same edge the scrubber sits on) for the moments the
 * scrubber is hidden. */
export function BottomRule() {
  return (
    <div aria-hidden className="fixed inset-x-0 bottom-0 z-30 border-t border-line min-[901px]:bottom-8" />
  );
}

/** Width of a section's copy column: Figma's "Project Info" frame — 39px
 * left inset + 295px of text (was 19rem, i.e. 265px of text). Widened per
 * direct request so expanded points fit on shorter laptop windows; titles
 * like "KPI deep-dives" also hold one line again. Blocks add the 30px to
 * their own width so the 650px run to the next section doesn't shrink. */
const COPY_COL = "calc(334px*var(--cs-scale,1))";
const COPY_COL_EXTRA = 30;

/** Small orange section number ("01", "02", ...) beside a section's title.
 * Positioned against the title's first line only via an explicit
 * `titleLineHeight`, not the ancestor's full height, so a two-line title
 * doesn't pull the number down to the block's center. */
function SectionNum({ number, titleLineHeight }: { number: string; titleLineHeight: string }) {
  return (
    <span
      aria-hidden
      className="cs-kicker cs-section-num hidden w-10 -translate-y-1/2 min-[901px]:absolute min-[901px]:-left-16 min-[901px]:block"
      style={{ top: `calc((${titleLineHeight}) / 2 + 1.3px)` }}
    >
      {number}
    </span>
  );
}

/**
 * Case-study hero — grid graphic AND text share ONE fixed-dimension design
 * canvas, scaled uniformly, same technique as the homepage's `--hero-scale`
 * (page.tsx). Third pass: the grid-only version from the previous two
 * passes let the text sit outside the scaled canvas at a fixed size, so
 * (a) padding/max-width numbers pulled from Figma had no consistent 714px
 * frame of reference to be measured against, and (b) the grid could shrink
 * to fit while the text next to it couldn't, which is what caused the
 * clipping .cs-pin was blamed for last time — the real defect was the two
 * pieces never sharing a scale in the first place, not .cs-pin's own
 * height. Growing .cs-pin itself would make it worse: GSAP's `pin:true`
 * (HorizontalTrack.tsx) freezes this section at its own box for the whole
 * scroll range, so anything past 100vh in a taller-than-viewport pin isn't
 * "clipped," it's permanently unreachable for that entire range — 100vh is
 * load-bearing, not the bug. Content has to fit inside it instead.
 *
 * All values below are cited to the specific Figma property they came
 * from — fileKey AWMKNoAFrxViMhBaGRfWbZ, hero frame 594:122022:
 *   - Grid (679:59867 "Background grid"): 714×914, 30px cells + 1px gap =
 *     31px pitch (get_metadata XML), cell fill #e4e4df / gap #b0b0b0
 *     (get_design_context on row 679:59868: `bg-[#b0b0b0] ... gap-px`,
 *     children `bg-[#e4e4df]`) — exact matches for --bg/--line, texture
 *     unchanged. ~8px corner radius measured off the rendered screenshot's
 *     antialiasing arc (679:59867's own get_design_context exceeded the
 *     tool's size limit, so this one number is NOT a pulled token).
 *   - Text inset (594:122066 "Copy lockup", the real auto-layout frame
 *     wrapping both the eyebrow/title and the paragraph): get_design_context
 *     returns its own Tailwind classes directly — `pl-[93px] pr-[27px]
 *     pt-[250px]`. Applied as ONE inset to the whole text block (eyebrow +
 *     title + paragraph + scroll hint together), not two different values —
 *     see below for why.
 *   - Paragraph max-width: the paragraph's immediate wrapping frame
 *     (679:61221, which also holds the scroll-hint line) has its own
 *     `w-[555px]` in that same get_design_context pull. The <p> node itself
 *     (594:122070) separately carries a conflicting `w-[591px]` — Figma
 *     staleness (the text's last-recorded resize width vs. its parent's
 *     current auto-layout width, common when a fixed-width text node sits
 *     inside a later-resized auto-layout parent) — used the wrapping
 *     frame's 555px instead since it's the deliberately-authored column
 *     width shared with the scroll hint below it, not a stale text-node
 *     leftover.
 *   - NOT applied: 679:61221's own absolute position (`left-[60px]
 *     top-[467px]`), which is 33px to the LEFT of the title's 93px inset
 *     and only vertically clears Yahoo's specific 2-line title. Airbnb's
 *     and Headspace's longer titles wrap taller at the same 594px content
 *     width, so a fixed top:467px would overlap their titles. Kept the
 *     paragraph in normal flow after the title instead (as before), so it
 *     always clears whatever height the title actually renders at, and
 *     left it at the same 93px inset as the title rather than the
 *     Figma-literal 60px, since introducing a stagger nobody asked for
 *     isn't part of this pass's scope. Flagging this rather than silently
 *     matching the raw number.
 *
 * Airbnb and Headspace have no hero frame of their own in this Figma file
 * ("Case Studies" page entries there are flat legacy screenshots, not
 * editable frames) — all three share Yahoo's 714×914 canvas and padding
 * via CoverBlock below.
 */

/** Grid top offset. The Figma reference is 31: per get_metadata on
 * 594:122065 ("Frame 74", the hero's shared coordinate space), "Background
 * grid" (679:59867) sits at y:31 while "Copy lockup" (594:122066) starts at
 * y:0, and the grid's bottom already meets the frame's own bottom (31+914 =
 * 945 = Frame 74's full height) — so only the top needed extending. But
 * 945 isn't a whole number of 31px rows (30.48): the container's top edge
 * landed ON a rule and its bottom edge cut through a 15px sliver of a row.
 * Per direct request, trimmed to the nearest whole row count below (30 rows
 * = 930px → extend by 16, not 31) and, with GRID_ROW_PHASE below, arranged
 * so a row's CENTER — not a rule — sits exactly on both the top and bottom
 * edges. The bottom edge stays at the canvas's own bottom (y:914) either
 * way; only the top moves, by the 15px that was the cut-off sliver.
 * Applied as a separate overlay `<div>` (its own top/height, own viewBox)
 * rather than growing `width`/`height` above, which also size `scaledBox`
 * and would re-center the text lockup inside a taller box. */
const GRID_TOP_EXTEND = 16;

/** Half the 31px pitch — every horizontal rule is drawn this far below
 * where a 0-based pattern would put it, so the rules fall BETWEEN row
 * centers and the row centers themselves land on whole multiples of the
 * pitch from the container's top edge (0, 31, … 930 — i.e. the top and
 * bottom edges included, which is the point). Column rules are unaffected:
 * the request was about rows, and the lockup's left edge still snaps to a
 * column rule (see leftOffset). */
const GRID_ROW_PHASE = 15.5;

/** How far the grid pattern insets from the top and bottom of its
 * (unchanged) container, applied after the extension above — given
 * directly (not a Figma lookup). The container's own size/border/rounding
 * stays put; only the drawn pattern stops this far short of its edges,
 * leaving plain background showing in the gap. Zero means the pattern runs
 * flush to the container's own top/bottom edges. */
const GRID_PADDING = 0;
function CaseStudyHero({
  meta,
  width = 714,
  height = 914,
}: {
  meta: Meta;
  width?: number;
  height?: number;
}) {
  const scaledBoxRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  // Measured, not guessed: CSS `width:fit-content` computes its "max-content"
  // size assuming NO soft-wrapping (only forced <br> breaks count) — there's
  // no native CSS primitive for "shrink to the widest line that results
  // AFTER wrapping." Range.getClientRects() gets the title's real per-line
  // rendered widths after the browser has wrapped it at the 625 cap below.
  // Rects are post-transform (visual) pixels since this whole canvas sits
  // inside `transform:scale(--hero-scale)`, so the measured width is divided
  // by the actual applied scale (read off the computed transform matrix) to
  // get back to this canvas's native px.
  //
  // ONE box for the whole lockup (eyebrow + title + paragraph + scroll-hint
  // together), sized to the wider of the title's measured widest line or
  // the paragraph's fixed 555px column — per direct correction: splitting
  // title and paragraph into two independently-centered boxes (the previous
  // version) made them stop sharing a left edge, which read as broken even
  // though each individually measured as centered. Back to one shared box,
  // text left-aligned throughout, the box itself centered on both axes via
  // the flex parent below.
  const [lockupWidth, setLockupWidth] = useState<number | null>(null);
  // Snapped so the lockup's own left edge always lands on a grid line
  // instead of wherever flex-centering happens to put it — computed below
  // as (available space)/2 rounded to the nearest 31px, then applied as an
  // explicit offset in place of `justify-center`.
  const [leftOffset, setLeftOffset] = useState<number | null>(null);
  // The title font's own left ink bearing — Google Sans Flex Bold draws its
  // glyphs starting a few px left of the box's edge, which otherwise makes
  // "Yahoo"/"Headspace"/etc. overhang the grid line every other line in the
  // lockup sits flush against. Measured (not guessed) via
  // actualBoundingBoxLeft on the title's own first character at its actual
  // computed font, then applied as a compensating negative margin so the
  // INK — not the box — lines up with the grid.
  const [h1InkBearing, setH1InkBearing] = useState<number | null>(null);
  // Vertical nudge (canvas px, ≤ half a row either way) applied to the
  // whole lockup so the scroll hint's midline lands on a grid-row center —
  // see the effect below. Nudging the lockup as a unit rather than the hint
  // alone keeps the designed spacing between paragraph and hint intact;
  // the lockup still reads as centered since the shift is under 16px.
  const hintRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [lockupNudge, setLockupNudge] = useState(0);

  useLayoutEffect(() => {
    const scaledBox = scaledBoxRef.current;
    const h1 = h1Ref.current;
    if (!scaledBox || !h1) return;

    const measure = () => {
      const transform = getComputedStyle(scaledBox).transform;
      const match = /matrix\(([^,]+),/.exec(transform);
      const scale = match ? parseFloat(match[1]) || 1 : 1;

      const range = document.createRange();
      range.selectNodeContents(h1);
      const widestLine = Array.from(range.getClientRects()).reduce(
        (max, rect) => Math.max(max, rect.width),
        0,
      );

      // Floor at 555 (the paragraph's own column width, node 679:61221) so a
      // short title never shrinks the lockup narrower than the paragraph
      // actually needs.
      const width_ = Math.max(Math.round(widestLine / scale), 555);
      setLockupWidth(width_);
      setLeftOffset(Math.round((width - width_) / 2 / 31) * 31);

      const h1Style = getComputedStyle(h1);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = `${h1Style.fontWeight} ${h1Style.fontSize} ${h1Style.fontFamily}`;
        const bearing = ctx.measureText(meta.company.charAt(0)).actualBoundingBoxLeft;
        setH1InkBearing(bearing);
      }
    };

    measure();
    // Google Sans Flex is `display: swap` — if it lands after first paint
    // the title re-wraps at different widths, so measure again then.
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(scaledBox);
    return () => ro.disconnect();
  }, [meta.company, meta.title, width]);

  // Snap the scroll hint to a grid row. The lockup is flex-centered
  // vertically, so where the hint lands depends on how tall the title and
  // paragraph above it wrap — different per case study, and the old fixed
  // -15.5px translate only held for one of them. Measured instead: the
  // hint's midline in canvas px, versus the nearest row center, and the
  // difference applied to the whole lockup as translateY. Row centers sit
  // at every whole pitch from the grid container's top edge (see
  // GRID_ROW_PHASE), which is GRID_TOP_EXTEND above canvas y:0.
  useLayoutEffect(() => {
    const hint = hintRef.current;
    const canvas = canvasRef.current;
    if (!hint || !canvas) return;
    const snap = () => {
      // offsetTop is layout-only — it ignores the translateY this sets —
      // so re-running never compounds on a previous nudge. Summed up the
      // chain to the canvas rather than read once: a transformed lockup
      // becomes its own offsetParent, which would otherwise re-base the
      // hint's offsetTop to the lockup on every run after the first.
      let top = 0;
      for (let el: HTMLElement | null = hint; el && el !== canvas; el = el.offsetParent as HTMLElement | null) {
        top += el.offsetTop;
      }
      const center = top + hint.offsetHeight / 2;
      const row = Math.round((center + GRID_TOP_EXTEND) / 31);
      setLockupNudge(row * 31 - GRID_TOP_EXTEND - center);
    };
    snap();
    document.fonts?.ready.then(snap);
    // Re-run once the width/bearing measurements above have re-wrapped the
    // text — those change the hint's position.
  }, [lockupWidth, h1InkBearing]);

  return (
    <div className="cs-only-horizontal relative [container-type:inline-size] min-[901px]:w-[calc(591px*var(--cs-scale,1))] min-[901px]:shrink-0">
      {/* --hero-scale takes the smaller of: how much width the column
          actually has (100cqi vs. the native 714px), and how much vertical
          room is actually free inside .cs-pin's fixed 100vh once the fixed
          chrome is excluded — the perimeter frame's 42px top band, and the
          32px bottom band + 32px progress scrubber stacked on it
          (--cs-chrome-top/--cs-chrome-bottom, set on .cs-track in
          globals.css; 0px fallbacks only matter below 901px, where this
          column is display:none anyway) — plus 2 × --cs-pad so the canvas
          keeps the same 40px of air off the band and the scrubber that
          every media row gets via --cs-media-scale. Computed once
          here; both this element's own height and the inner canvas's
          transform read the SAME variable, so wrapper and content can't
          drift apart the way they did last pass.

          Sized and centered on the GRID's extent (height + GRID_TOP_EXTEND),
          not the text canvas's: the grid overlay pokes GRID_TOP_EXTEND
          above the canvas, so fitting/centering the canvas alone left the
          grid with that much less air above it than below (28px vs 40px
          at a typical laptop height) — per direct correction, the padding
          above and below the grid must match. This wrapper's box IS the
          grid's box now; the canvas sits GRID_TOP_EXTEND (scaled) down
          inside it so the overlay's top lands flush with this box's top. */}
      <div
        className="relative"
        style={{
          ["--hero-scale" as string]: `min(1, calc(100cqi / ${width}px), calc((100vh - var(--cs-chrome-top, 0px) - var(--cs-chrome-bottom, 0px) - 2 * var(--cs-pad, 0px)) / ${height + GRID_TOP_EXTEND}px))`,
          height: `calc(${height + GRID_TOP_EXTEND}px * var(--hero-scale))`,
        }}
      >
        <div
          ref={scaledBoxRef}
          className="absolute left-0 origin-top-left"
          style={{
            top: `calc(${GRID_TOP_EXTEND}px * var(--hero-scale))`,
            width: `${width}px`,
            height: `${height}px`,
            transform: "scale(var(--hero-scale))",
          }}
        >
          <div
            aria-hidden
            className="absolute overflow-hidden rounded-[8px] border border-line"
            style={{
              left: 0,
              top: -GRID_TOP_EXTEND,
              width,
              height: height + GRID_TOP_EXTEND,
            }}
          >
            {/* Grid pattern insets 32px from this container's top/bottom —
                own position, not the container's padding — per direct
                correction: padding on the container (or background-clip
                tricks) still reads as "the pattern, just contained," where
                what's wanted is the pattern stopping short and plain
                background showing in the gap. Container itself (size,
                border, rounding) is untouched by this inset. */}
            <svg
              className="absolute left-0"
              style={{ top: GRID_PADDING, width: "100%", height: `calc(100% - ${GRID_PADDING * 2}px)` }}
              viewBox={`0 0 ${width} ${height + GRID_TOP_EXTEND - GRID_PADDING * 2}`}
              preserveAspectRatio="none"
            >
              {/* Hairlines drawn as real SVG strokes with vector-effect
                  "non-scaling-stroke" rather than a repeating-linear-gradient,
                  because the whole canvas sits inside `transform:scale
                  (--hero-scale)` (a fractional value, e.g. ~0.58 at common
                  viewport widths). A 1px CSS gradient line scaled by a
                  fractional, non-pixel-aligned factor rasterizes each of the
                  ~20+ repeated lines at a slightly different sub-pixel
                  position, so they anti-alias to inconsistent widths/opacity
                  — reading as varying line weight and a color shimmer across
                  the grid. non-scaling-stroke pins every stroke to a true 1
                  device-pixel width regardless of the ambient scale. */}
              {Array.from({ length: Math.floor(width / 31) + 1 }, (_, i) => i * 31).map((x) => (
                <line
                  key={`v-${x}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={height + GRID_TOP_EXTEND - GRID_PADDING * 2}
                  stroke="var(--line)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {Array.from(
                { length: Math.floor((height + GRID_TOP_EXTEND - GRID_PADDING * 2 - GRID_ROW_PHASE) / 31) + 1 },
                (_, i) => i * 31 + GRID_ROW_PHASE,
              ).map((y) => (
                <line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="var(--line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </div>
          <div
            // The canvas itself is the centering context now: flex +
            // items-center (vertical) centers the lockup vertically;
            // horizontal position is no longer justify-center (that landed
            // the box at whatever fractional offset happened to center it,
            // rarely a grid line) but an explicit marginLeft on the box
            // itself, snapped to the nearest 31px rule — see leftOffset
            // above. Per direct correction: the lockup is one unit (eyebrow
            // + title + paragraph + scroll-hint together), not two
            // separately-centered pieces — splitting them made title and
            // paragraph stop sharing a left edge, which read as broken even
            // though each piece individually measured as centered.
            ref={canvasRef}
            className="absolute inset-0 flex items-center"
          >
            <div
              className="flex flex-col"
              style={{
                width: lockupWidth != null ? `${lockupWidth}px` : "fit-content",
                marginLeft: leftOffset != null ? `${leftOffset}px` : "auto",
                marginRight: leftOffset != null ? undefined : "auto",
                // The paper at 40% — genuinely in the Figma data
                // (get_design_context on 679:61221: `bg-[rgba(228,228,223,0.4)]`,
                // i.e. the then-#E4E4DF sheet) though Figma only applied it
                // to the paragraph+scroll-hint group; applied across the
                // whole lockup per earlier request to cover all the text.
                // Derived from --bg so it follows the sheet colour.
                backgroundColor: "color-mix(in srgb, var(--bg) 40%, transparent)",
                // See lockupNudge: lands the scroll hint on a row center.
                transform: lockupNudge ? `translateY(${lockupNudge}px)` : undefined,
              }}
            >
              {/* Eyebrow "2024 - 2026" (594:122068): Roboto Mono SemiBold,
                  16px/24px, uppercase, `--accent`. var(--font-mono) is this
                  exact typeface (Roboto_Mono, layout.tsx) — an earlier pass
                  used var(--font-body) (DM Sans) at 20px, matching the
                  unrelated .cs-quote role instead of this node's own spec. */}
              <p
                className="font-semibold uppercase text-accent [font-family:var(--font-mono)]"
                style={{ fontSize: 16, lineHeight: "24px" }}
              >
                {meta.years}
              </p>
              {/* Title (594:122069): Google Sans Flex Bold, 90px/80px —
                  var(--font-display) is this exact font (self-hosted,
                  layout.tsx), already wired via `.display`. maxWidth:625 is
                  just the wrap boundary (without SOME cap, Airbnb's
                  unbroken "Account Creation & Onboarding" — no internal
                  <br> — wouldn't wrap at all before being measured); the
                  lockup's actual width above comes from the measured widest
                  line (or 555, whichever is bigger), not this cap. */}
              <h1
                ref={h1Ref}
                className="display mt-2"
                style={{
                  fontSize: 90,
                  lineHeight: "80px",
                  maxWidth: 625,
                  marginLeft: h1InkBearing != null ? `-${h1InkBearing}px` : undefined,
                }}
              >
                {meta.company}
                <br />
                {meta.title}
              </h1>
              {/* Paragraph (594:122070): Google Sans Flex SemiBold,
                  20px/28px, #444440 (= --ink-2 exactly). An earlier pass
                  inherited the page's default body font (DM Sans) at
                  14px/20px instead of this node's own spec — that mismatch
                  is most of why line lengths read wrong (a 14px paragraph
                  wraps far more words per line at the same 555px width
                  than a 20px one does). Left-aligned, flush with the
                  lockup's own left edge — the lockup handles centering as
                  a unit, not this element individually. */}
              <p
                // mt-11 (44px) moved up one grid row (31px) per earlier
                // direct request: 44 - 31 = 13.
                className="font-semibold text-ink-2 [font-family:var(--font-display)]"
                style={{ fontSize: 20, lineHeight: "32px", maxWidth: 555, marginTop: 13 }}
              >
                {meta.subtitle}
              </p>
              {/* Scroll hint (594:122073): Google Sans Flex SemiBold, 14px/22px.
                  Exactly one row tall (h-[31px]) with its content centered
                  in that box, and the whole lockup is nudged (translateY —
                  see lockupNudge) so this box's midline sits on a grid-row
                  center, per direct request, however tall the title and
                  paragraph above it wrap. Replaces a fixed -15.5px translate
                  that aimed for a RULE instead and only held for one
                  title/paragraph height. */}
              <p
                ref={hintRef}
                className="mt-11 flex h-[31px] items-center gap-3 font-semibold text-ink-2 [font-family:var(--font-display)]"
                style={{ fontSize: 14, lineHeight: "22px" }}
              >
                <span className="inline-block h-[3px] w-10 bg-accent" />
                Scroll to move through the story
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mobile/tablet (<901px) fallback — plain stacked text, no grid canvas
    (same `cs-only-vertical` split every other horizontal-track-only
    treatment on this page already uses). */
function CoverBlockMobileText({ meta }: { meta: Meta }) {
  return (
    <div className="cs-only-vertical flex w-full flex-col gap-2">
      <div className="flex flex-col gap-2">
        {/* Same font roles as the desktop canvas (Roboto Mono eyebrow,
            Google Sans Flex title) — sized down for the narrow viewport
            rather than at their native desktop px, since mobile has no
            scaled canvas to inherit sizing from. */}
        <p
          className="font-semibold uppercase text-accent [font-family:var(--font-mono)]"
          style={{ fontSize: 14, lineHeight: "20px" }}
        >
          {meta.years}
        </p>
        <h1 className="display text-[2.5rem] leading-none">
          {meta.company} {meta.title}
        </h1>
      </div>
      <p
        className="max-w-[calc(571px*var(--cs-scale,1))] font-semibold text-ink-2 [font-family:var(--font-display)]"
        style={{ fontSize: 16, lineHeight: "24px" }}
      >
        {meta.subtitle}
      </p>
    </div>
  );
}

/** The outlined title lines, uppercased by `.cs-outline-title`. Drawn the
 * way Figma draws it — a paper-colored fill over an outside stroke — as two
 * stacked copies: a thick coral stroke behind, the fill on top covering its
 * inner half. A plain text-stroke would also trace the variable font's
 * overlapping contours, putting stray lines inside R, E, A and &. The
 * company leads the <h1> for screen readers; on screen it's the line above. */
function OutlineTitle({ meta, className = "" }: { meta: Meta; className?: string }) {
  const lines = (meta.heroLines ?? []).map((line, i, all) => (
    <Fragment key={line}>
      {line}
      {i < all.length - 1 ? <br /> : null}
    </Fragment>
  ));
  return (
    <h1 className={`cs-outline-title relative ${className}`}>
      <span aria-hidden className="cs-outline-title-stroke absolute inset-0">
        {lines}
      </span>
      <span className="relative">
        <span className="sr-only">{meta.company} </span>
        {lines}
      </span>
    </h1>
  );
}

/** How much the outlined opening shrinks on short windows: 1 wherever its
 * ~600px of copy fits between the fixed chrome with --cs-pad to spare.
 * (Scaling it down with window width too, like the grid hero, was tried
 * and rejected — it stays at Figma size.) */
const OUTLINE_FIT =
  "min(1, calc((100vh - var(--cs-chrome-top, 0px) - var(--cs-chrome-bottom, 0px) - 2 * var(--cs-pad, 0px)) / 600px))";

/** Outlined-title opening — Figma "Project Opening" (917:129483): a 16/24
 * line above the title (Figma's date line; the company name instead, per
 * direct request — the dates live in the metadata column), the title 32px
 * below its top (80/92, 4px tracking, 2px coral outline), the 20/34
 * subtitle 16px after, and the scroll hint 241px below the subtitle's top.
 * At least the title frame's 703px wide; wider when a title line is (each
 * line holds on one line here — "Partner Portal" runs 741px). `zoom` (not a
 * transform) shrinks it on short windows so the box it takes up shrinks
 * too, keeping the cover centered on what's actually drawn. */
function OutlineHero({ meta }: { meta: Meta }) {
  return (
    <div className="cs-only-horizontal relative w-max min-w-[703px] shrink-0" style={{ zoom: "var(--outline-fit)" }}>
      <p className="ml-[6px] text-[16px] font-semibold leading-6 text-[#433835] [font-family:var(--font-display)]">
        {meta.company}
      </p>
      <OutlineTitle meta={meta} className="mt-2 whitespace-nowrap" />
      {/* 555px, not Figma's 695: the same measure as the grid hero's
          paragraph (Yahoo's live cover), per direct request. */}
      <p className="mt-4 max-w-[555px] text-[20px] font-medium leading-[34px] text-ink-2 [font-family:var(--font-display)]">
        {meta.subtitle}
      </p>
      {/* 241px from the subtitle's top in Figma = 71px after its five
          lines; kept as a gap so a longer subtitle can't run into it. Hung
          below the lockup (absolute) rather than in its flow, so the box
          ends at the paragraph — CoverBlock bottom-aligns that edge with
          the metadata column, per direct request. */}
      <p className="absolute left-0 top-full mt-[71px] flex items-center gap-3 whitespace-nowrap text-[14px] font-semibold leading-[22px] text-accent [font-family:var(--font-display)]">
        <span aria-hidden className="h-[3px] w-[50px] bg-accent" />
        Scroll to move through the story
      </p>
    </div>
  );
}

/** Phone/tablet version of the outlined opening — same roles, sized down,
 * in normal flow (see CoverBlockMobileText for the grid hero's). */
function OutlineHeroMobileText({ meta }: { meta: Meta }) {
  return (
    <div className="cs-only-vertical flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-[14px] font-semibold leading-5 text-[#433835] [font-family:var(--font-display)]">
          {meta.company}
        </p>
        <OutlineTitle meta={meta} />
      </div>
      <p className="text-[16px] font-medium leading-[26px] text-ink-2 [font-family:var(--font-display)]">
        {meta.subtitle}
      </p>
    </div>
  );
}

/** Space between the outlined opening and the metadata column: Figma's
 * 468px where the viewport has room, otherwise whatever keeps the column's
 * right edge the track's own 129.6px lead-in from the viewport edge
 * (1257.2 = 2 × 129.6 + the 703px opening + the 295px column), floored at
 * 120px — Figma's frame is wider than a 1440px window, and at its literal
 * spacing the column would start the page half off-screen. */
const OUTLINE_COVER_GAP = "clamp(120px, 100vw - 1257.2px, 468px)";

/** Exported (with `IntroStackBlock` and `PlainMedia`) so Headspace Unified
 * Main Door's own page.tsx composes the same cover — grid hero, tinted
 * lockup, scroll hint on the rule — instead of a plain-text local copy. */
export function CoverBlock({ meta, sidebar }: { meta: Meta; sidebar: Sidebar }) {
  const outline = Boolean(meta.heroLines?.length);
  return (
    <div
      className={outline ? "cs-block" : "cs-block cs-block-centered"}
      style={{
        // Outlined opening: sized to its content, since the opening
        // widens for a long title line (see OutlineHero).
        ["--w" as string]: outline ? "max-content" : "calc(76rem * var(--cs-scale, 1))",
        ["--cover-gap" as string]: outline ? OUTLINE_COVER_GAP : "calc(300px * var(--cs-scale, 1))",
        ["--outline-fit" as string]: OUTLINE_FIT,
      }}
    >
      {/* The outlined opening hangs from the story's shared top line like
          every section, its two columns aligned on their last baselines —
          the paragraph's last line sitting on the same line as the
          metadata's, per direct request (Figma top-aligns them); the scroll
          hint hangs below (see OutlineHero). The grid hero is sized to fill the height on its
          own, so that cover centers instead (.cs-block-centered) with the
          list centered beside the grid. */}
      <div
        className={`flex flex-col gap-16 min-[901px]:flex-row min-[901px]:gap-0 ${
          outline ? "min-[901px]:[align-items:last_baseline]" : "min-[901px]:items-center"
        }`}
      >
        {outline ? <OutlineHeroMobileText meta={meta} /> : <CoverBlockMobileText meta={meta} />}
        {outline ? <OutlineHero meta={meta} /> : <CaseStudyHero meta={meta} />}

        <div
          className="w-full min-[901px]:ml-[var(--cover-gap)] min-[901px]:w-[calc(295px*var(--cs-scale,1))] min-[901px]:shrink-0"
        >
          {/* A <dl> may only hold dt/dd (optionally one <div> per pair), so
              the arrow lives inside the <dt> and both are indented by the
              arrow + gap — same layout as an arrow column beside a dt/dd
              stack. The arrow is absolute so its 17px (16 + mt-px) can't
              make the 16px label line taller. */}
          <dl className="flex flex-col gap-5">
            {[
              ...sidebar.groups,
              { label: sidebar.highlightsLabel ?? "Highlights", items: sidebar.highlights },
            ].map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <dt className="cs-label relative pl-[calc(16px+21px*var(--cs-scale,1))]">
                  <ArrowIcon className="text-muted absolute left-0 top-0" />
                  {group.label}
                </dt>
                <dd className="flex flex-col gap-2 cs-meta pl-[calc(16px+21px*var(--cs-scale,1))]">
                  {group.items.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function CopyBlock({
  heading,
  eyebrow,
  body,
  width,
  accent,
  sectionNumber,
}: {
  heading?: string;
  eyebrow?: string;
  body: string[];
  width?: string;
  accent?: boolean;
  sectionNumber?: string;
}) {
  // A sectionNumber means this copy block is standing in as a numbered
  // section header (e.g. the Research/Key Decisions group heading) — give
  // it the same 40px title size every other numbered header uses.
  return (
    <div
      className={`cs-block ${accent ? "border-l-2 border-accent pl-5" : ""}`}
      style={{ ["--w" as string]: width ?? "27rem" }}
    >
      {heading ? (
        <div className="relative mb-5">
          {sectionNumber ? (
            <SectionNum number={sectionNumber} titleLineHeight="40px * 1.04" />
          ) : null}
          <h2
            className={`display ${
              sectionNumber ? "text-[2rem] min-[901px]:text-[40px]" : "text-[clamp(1.6rem,2.4vw,2.25rem)]"
            } ${accent ? "text-accent" : "text-ink"}`}
          >
            {heading}
          </h2>
          {eyebrow ? <p className="cs-section-title mt-2">{eyebrow}</p> : null}
        </div>
      ) : null}
      <div className="t-body-sans space-y-4">
        {body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

/** A numbered section whose items each get their own text column + media
 * panel (Block kind "panel-group") — Figma's Research (519:72601) and Key
 * Decisions (520:72979). Per Figma the group heading shares the first
 * item's column, sitting above that item's numeral; later columns carry
 * the same heading lockup invisibly so every item numeral lands on the
 * same row. Each item is its own `.cs-block` on `SectionBlock`'s geometry
 * (COPY_COL text column, 3rem gap, 857px media, 108.75rem block) so the
 * group scrolls with the same rhythm as the plain sections around it —
 * Figma's own per-item pitch (758 + 957 = 1715px) is within 25px of it. */
function PanelGroupBlocks({
  sectionNumber,
  heading,
  eyebrow,
  items,
}: {
  sectionNumber?: string;
  heading: string;
  eyebrow?: string;
  items: {
    number: string;
    title: string;
    body: string;
    caption: string;
    image?: SectionImage;
  }[];
}) {
  const mediaClass =
    "min-[901px]:w-[calc(857px*var(--cs-media-scale,1))] min-[901px]:shrink-0 min-[901px]:self-start";
  return (
    <>
      {items.map((item, i) => {
        const first = i === 0;
        const HeadingTag = first ? "h2" : "p";
        return (
          <div
            key={item.number}
            className="cs-block"
            style={{
              ["--w" as string]: `calc((108.75rem + ${COPY_COL_EXTRA}px) * var(--cs-scale, 1))`,
              ["--cs-copy-col" as string]: COPY_COL,
            }}
          >
            <div className="flex flex-col gap-10 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(3rem*var(--cs-scale,1))]">
              <div
                className={`flex w-full flex-col min-[901px]:w-[var(--cs-copy-col)] min-[901px]:shrink-0 min-[901px]:pl-[calc(39px*var(--cs-scale,1))] ${
                  eyebrow ? "gap-8" : "gap-6"
                }`}
              >
                {/* Figma puts the heading 24px above the item (32px when an
                    eyebrow is present). After the first column the lockup
                    is kept but invisible, purely to hold the numeral row —
                    and dropped on mobile, where columns stack. */}
                <div
                  aria-hidden={!first}
                  className={`flex flex-col gap-2 ${first ? "" : "invisible hidden min-[901px]:flex"}`}
                >
                  <div className="relative">
                    {first && sectionNumber ? (
                      <SectionNum number={sectionNumber} titleLineHeight="40px * 1.04" />
                    ) : null}
                    <HeadingTag className="display text-[2rem] min-[901px]:text-[40px]">{heading}</HeadingTag>
                  </div>
                  {eyebrow ? <p className="cs-section-title">{eyebrow}</p> : null}
                </div>
                <div className="flex flex-col gap-3">
                  {/* Figma 521:73526: 40px numeral on a 50px line, 18px to
                      the 20px title, 12px to the body. */}
                  <div className="flex flex-col gap-[18px]">
                    <p className="display text-[40px] leading-[50px] text-accent">{item.number}</p>
                    <p className="cs-section-title">{item.title}</p>
                  </div>
                  <p className="t-body-sans">{item.body}</p>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                {item.image ? (
                  item.image.frame === "plain" ? (
                    <PlainMedia image={item.image} className={mediaClass} />
                  ) : (
                    <IsolatedMedia image={item.image} className={mediaClass} />
                  )
                ) : (
                  <MediaPlaceholder className={mediaClass} />
                )}
                <div className="flex w-full justify-center min-[901px]:w-[calc(857px*var(--cs-media-scale,1))]">
                  <p className="cs-caption text-center">{item.caption}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function StatBlock({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "24rem" }}>
      <p className="display text-[clamp(4rem,9vw,7rem)] leading-none text-accent">{value}</p>
      <p className="cs-quote mt-5">{label}</p>
      {note ? (
        <p className="mt-5 border-t border-line pt-5 text-xs leading-4 text-muted">{note}</p>
      ) : null}
    </div>
  );
}

function StatGroupBlock({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "44rem" }}>
      <div className="grid grid-cols-2 gap-x-10 gap-y-10">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="display text-[clamp(2.25rem,4vw,3.5rem)] leading-none text-accent">{stat.value}</p>
            <p className="mt-3 text-sm leading-[20px] text-ink-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClosingBlock({
  sectionNumber,
  heading,
  body,
  stats,
  caption,
  cta,
}: {
  sectionNumber?: string;
  heading: string;
  body: string[];
  stats: { value: string; label: string }[];
  caption?: string;
  cta?: { text: string; href: string };
}) {
  const hasStats = stats.length > 0;
  const hasCaption = Boolean(caption);
  return (
    <div
      className="cs-block"
      style={{
        ["--w" as string]:
          hasStats || hasCaption
            ? "calc(88.3125rem * var(--cs-scale, 1))"
            : "calc(35rem * var(--cs-scale, 1))",
      }}
    >
      <div className="flex flex-col gap-10 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(293px*var(--cs-scale,1))]">
        <div className="flex w-full flex-col gap-4 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
          <div className="relative">
            {sectionNumber ? <SectionNum number={sectionNumber} titleLineHeight="40px" /> : null}
            <h2 className="display text-[28px] leading-none min-[901px]:text-[40px]">{heading}</h2>
          </div>
          {/* Figma 594:122506 "Description": the .t-body-sans role (Google Sans
              14/22, like every section body), 16px between paragraphs. */}
          <div className="t-body-sans flex flex-col text-ink-2">
            {body.map((p, i) => (
              <p key={i} className={i < body.length - 1 ? "mb-4" : ""}>
                {p}
              </p>
            ))}
          </div>
          {cta ? (
            // CTA default button (Portfolio-Playground 100:209186, whose
            // sheet lists this exact label), 92px below the copy per
            // 837:64875. Sentence case kept — see .cta in globals.css.
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="cta mt-4 self-start min-[901px]:mt-[calc(92px*var(--cs-scale,1)-1rem)]"
            >
              {cta.text}
            </a>
          ) : null}
        </div>

        {hasStats ? (
          <div className="flex w-full flex-col gap-5 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex items-center gap-6 border-line py-5 ${i === 0 ? "border-y" : "border-b"}`}
              >
                <p className="cs-quote flex-1">{stat.label}</p>
                <p className="display -translate-y-[2.6px] shrink-0 text-right text-[44px] leading-none text-accent min-[901px]:text-[60px]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        ) : hasCaption ? (
          <div className="flex w-full flex-col gap-6 min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0">
            <MediaPlaceholder />
            <p className="cs-caption text-center">{caption}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** One or more pull quotes (Figma 43:3729 / 43:3730, without that card's
 * grid backdrop) — 299px wide (the Figma quote frame: 330px less its 31px
 * left inset), stacked 58px apart, each quote and its attribution sharing
 * a single 3px accent rule. */
function PullQuoteStack({
  quotes,
  className = "",
}: {
  quotes: { text: string; attribution: string }[];
  className?: string;
}) {
  return (
    <div className={`flex w-full flex-col gap-[58px] min-[901px]:w-[calc(299px*var(--cs-scale,1))] ${className}`}>
      {quotes.map((q) => (
        <figure key={q.text} className="flex flex-col gap-2 border-l-[3px] border-accent pl-6">
          <blockquote>
            <p className="cs-pull-quote-alt">{'"' + q.text + '"'}</p>
          </blockquote>
          <figcaption className="cs-quote-attr">— {q.attribution}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function QuoteBlock({ text, attribution }: { text: string; attribution: string }) {
  return (
    <div className="cs-block" style={{ ["--w" as string]: "31rem" }}>
      <PullQuoteStack quotes={[{ text, attribution }]} />
    </div>
  );
}

/** "The Problem" stack on every CaseStudyPage case study — 560px column,
 * 200/300px problem inset, anchored to the shared 687px row. `quote` is
 * optional only for Headspace Unified Main Door's "Context", which reuses
 * this exact geometry with copy alone (no stat, no quote, so no rule). */
export function IntroStackBlock({
  heading,
  body,
  stat,
  quote,
  sectionNumber,
}: {
  heading: string;
  body: string[];
  stat?: { value: string; label: string };
  quote?: { text: string; attribution: string };
  sectionNumber?: string;
}) {
  return (
    <div
      className="cs-block cs-problem-inset min-[901px]:pl-[calc(3rem*var(--cs-scale,1))]"
      style={{ ["--w" as string]: "calc(38rem * var(--cs-scale, 1))" }}
    >
      <div className="flex w-full flex-col gap-8 min-[901px]:w-[calc(560px*var(--cs-scale,1))]">
        <div className="flex flex-col gap-4">
          <div className="relative">
            {sectionNumber ? <SectionNum number={sectionNumber} titleLineHeight="41.6px" /> : null}
            <h2 className="display text-[28px] leading-none min-[901px]:text-[40px]">{heading}</h2>
          </div>
          {/* .t-body-sans (Google Sans 14/22), same role and color as every
              other section's body copy. */}
          <div className="t-body-sans">
            {body.map((p, i) => (
              <p key={i} className={i === 0 ? "mb-4" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Label left, number right — Figma's Problem stat on both the
            Airbnb (917:129463) and Headspace (917:127726) studies, and the
            same order as every other stat row on these pages. */}
        {stat ? (
          <div className="flex items-center gap-6 border-y border-line py-5">
            <p className="cs-quote flex-1">{stat.label}</p>
            <p className="display -translate-y-[2.6px] shrink-0 text-right text-[44px] leading-none text-accent min-[901px]:text-[60px]">
              {stat.value}
            </p>
          </div>
        ) : quote ? (
          <div className="border-t border-line" />
        ) : null}

        {quote ? (
          <div className="flex flex-col gap-2">
            <blockquote>
              <p className="cs-quote cs-pull-quote">{'"' + quote.text + '"'}</p>
            </blockquote>
            <p className="text-sm leading-[20px] text-ink-2">— {quote.attribution}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SectionBlock({
  eyebrow,
  title,
  subhead,
  body,
  bullets,
  caption,
  pullQuotes,
  pullQuotePosition,
  stats,
  sectionNumber,
  expandedPoints,
  steps,
  image,
  statsInMedia,
}: {
  eyebrow: string;
  title: string;
  subhead?: string;
  body: string | string[];
  bullets: { title: string; body: string }[];
  caption: string;
  pullQuotes?: { quote: string; attribution: string }[];
  pullQuotePosition?: "top" | "middle" | "bottom";
  stats?: { value: string; label: string }[];
  sectionNumber?: string;
  expandedPoints?: { label: string; text: string }[];
  steps?: { title: string; body: string; icon?: StepIcon }[];
  image?: SectionImage;
  statsInMedia?: boolean;
}) {
  const position = pullQuotePosition ?? "bottom";
  const hasQuotes = Boolean(pullQuotes?.length);
  // Stats set inside the media box don't get their own column beside it.
  const hasStats = Boolean(stats?.length) && !statsInMedia;
  const hasMediaStats = Boolean(stats?.length) && Boolean(statsInMedia);
  const hasSteps = Boolean(steps?.length);
  const hasIllustratedSteps = hasSteps && steps!.every((s) => s.icon);
  const hasImage = Boolean(image);
  const isPlainImage = hasImage && image!.frame === "plain";
  // Media column width: the shared 857px box, or the recording's own shape
  // at the same 609px height when `image.aspect` is set. One variable so the
  // media and the caption centered under it stay the same width.
  const mediaWidth = image?.aspect
    ? `calc(609px * ${image.aspect} * var(--cs-media-scale, 1))`
    : "calc(857px * var(--cs-media-scale, 1))";
  // How much narrower an `aspect` box is than the standard 857px one. Taken
  // off the block width below so the empty run to the next section stays
  // the same 650px Yahoo's sections leave, not 650px plus the difference.
  const narrowerBy = image?.aspect
    ? 857 - 609 * image.aspect.split("/").map(Number).reduce((w, h) => w / h)
    : 0;

  const renderQuotes = () =>
    pullQuotes ? (
      <PullQuoteStack
        quotes={pullQuotes.map((pq) => ({ text: pq.quote, attribution: pq.attribution }))}
      />
    ) : null;

  const statRows = () =>
    stats?.map((stat, i) => (
      <div
        key={stat.label}
        className={`flex items-center gap-6 border-line py-5 ${i === 0 ? "border-y" : "border-b"}`}
      >
        <p className="cs-quote flex-1">{stat.label}</p>
        <p className="display -translate-y-[2.6px] shrink-0 text-right text-[44px] leading-none text-accent min-[901px]:text-[60px]">
          {stat.value}
        </p>
      </div>
    ));

  const renderStats = () => (
    <div className="flex flex-col min-[901px]:w-[calc(560px*var(--cs-scale,1))] min-[901px]:shrink-0 min-[901px]:ml-[calc(200px*var(--cs-scale,1))] min-[901px]:self-center">
      {statRows()}
    </div>
  );

  const justifyClass =
    position === "top" ? "justify-start" : position === "bottom" ? "justify-end" : "justify-center";

  const renderPanelArea = () =>
    hasIllustratedSteps ? (
      <IllustratedSteps steps={steps!} />
    ) : hasSteps ? (
      <StepsPanel steps={steps!} />
    ) : (
      <div className="flex flex-col gap-6">
        {/* Phone: `contents` lifts media, quotes and caption into the
            outer column so `order` can put the caption straight under the
            image and the quotes/stats after it. */}
        <div className="contents min-[901px]:flex min-[901px]:h-[calc(609px*var(--cs-media-scale,1))] min-[901px]:flex-row min-[901px]:items-stretch min-[901px]:gap-6">
          {hasImage ? (
            isPlainImage ? (
              <PlainMedia
                image={image!}
                className="min-[901px]:w-[var(--cs-media-w)] min-[901px]:shrink-0 min-[901px]:self-start"
              />
            ) : (
              <IsolatedMedia
                image={image!}
                className="min-[901px]:w-[var(--cs-media-w)] min-[901px]:shrink-0 min-[901px]:self-start"
              />
            )
          ) : hasMediaStats ? (
            <>
              {/* Laid out at the box's 1:1 size (560px rows in the 857px
                  box) and scaled with it, so the rows keep their place in
                  the box when short windows shrink the media. */}
              <MediaPlaceholder className="min-[901px]:w-[var(--cs-media-w)] min-[901px]:shrink-0 min-[901px]:self-start">
                <div className="hidden w-[560px] shrink-0 flex-col min-[901px]:flex min-[901px]:scale-[var(--cs-media-scale,1)]">
                  {statRows()}
                </div>
              </MediaPlaceholder>
              <div className="order-2 mt-4 flex flex-col min-[901px]:hidden">{statRows()}</div>
            </>
          ) : (
            <MediaPlaceholder className="min-[901px]:w-[var(--cs-media-w)] min-[901px]:shrink-0 min-[901px]:self-start" />
          )}
          {hasQuotes ? (
            <div
              className={`order-2 mt-4 flex flex-col gap-10 min-[901px]:order-none min-[901px]:mt-0 min-[901px]:w-[calc(907px*var(--cs-scale,1))] min-[901px]:shrink-0 ${justifyClass}`}
            >
              {renderQuotes()}
            </div>
          ) : hasStats ? (
            <div className="contents [&>*]:order-2 [&>*]:mt-4 min-[901px]:[&>*]:order-none min-[901px]:[&>*]:mt-0">{renderStats()}</div>
          ) : null}
        </div>
        {/* Matches the image column's own 857px width (not the full row,
            which also includes the 907px quotes/stats column) so the
            caption centers under the image itself instead of under the
            whole wider row. */}
        {caption ? (
          <div className="order-1 flex w-full justify-center min-[901px]:order-none min-[901px]:w-[var(--cs-media-w)]">
            <p className="cs-caption text-center">{caption}</p>
          </div>
        ) : null}
      </div>
    );

  return (
    <div
      className="cs-block"
      style={{
        // Illustrated steps (Figma 917:129573): 374px copy column, 120px
        // lead-in, the 1196px two-column list, then trailing space trimmed
        // by the ~31px the right column's copy stops short of its box — so
        // the empty run to the next section is the same 650px Yahoo's
        // sections leave, measured from the last word, per direct request.
        ["--w" as string]: hasIllustratedSteps
          ? "calc(139.3125rem * var(--cs-scale, 1))"
          : `calc((${hasStats ? "133.75rem" : hasQuotes ? "121.25rem" : "108.75rem"} + ${COPY_COL_EXTRA}px) * var(--cs-scale, 1) - ${narrowerBy}px)`,
        ["--cs-media-w" as string]: mediaWidth,
        ["--cs-copy-col" as string]: COPY_COL,
      }}
    >
      <div className="flex flex-col gap-10 min-[901px]:flex-row min-[901px]:items-start min-[901px]:gap-[calc(3rem*var(--cs-scale,1))]">
        {/* h-0 on desktop: the copy hangs from the row's top without adding
            to its height, so the block's measured height is the media's —
            and opening the expand-to-read points can't make this the
            tallest block and shift the whole story's top line while you
            read (see HorizontalTrack's --cs-content-h). */}
        <div
          className={`flex w-full flex-col gap-5 min-[901px]:h-0 min-[901px]:shrink-0 min-[901px]:pl-[calc(39px*var(--cs-scale,1))] ${
            hasIllustratedSteps ? "min-[901px]:w-[calc(413px*var(--cs-scale,1))]" : "min-[901px]:w-[var(--cs-copy-col)]"
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="relative">
              {sectionNumber ? <SectionNum number={sectionNumber} titleLineHeight="40px * 1.04" /> : null}
              <h2 className="display text-[2rem] min-[901px]:text-[40px]">{title}</h2>
            </div>
            <p className="cs-section-title">{eyebrow}</p>
          </div>
          {subhead ? <p className="cs-section-title">{subhead}</p> : null}
          <div className="t-body-sans -mt-2 flex flex-col gap-3">
            {(Array.isArray(body) ? body : [body]).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {hasSteps ? null : expandedPoints ? (
            <ExpandCollapse points={expandedPoints} />
          ) : (
            <div className="flex flex-col gap-4">
              {bullets.map((bullet) => (
                <div key={bullet.title}>
                  <p className="cs-sub-label">{bullet.title}</p>
                  <p className="t-body-sans mt-1">{bullet.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`flex w-full flex-col gap-6 ${hasIllustratedSteps ? "min-[901px]:ml-[calc(72px*var(--cs-scale,1))] min-[901px]:w-auto" : hasStats ? "min-[901px]:w-[calc(111.75rem*var(--cs-scale,1))]" : hasQuotes ? "min-[901px]:w-[calc(99.25rem*var(--cs-scale,1))]" : "min-[901px]:w-[calc(86.75rem*var(--cs-scale,1))]"}`}
        >
          {renderPanelArea()}
        </div>
      </div>
    </div>
  );
}

function renderBlock(block: Block, i: number) {
  switch (block.kind) {
    case "cover":
      return null; // rendered separately by CaseStudyPage, which owns meta/sidebar
    case "copy":
      return (
        <CopyBlock
          key={i}
          heading={block.heading}
          eyebrow={block.eyebrow}
          body={block.body}
          width={block.width}
          accent={block.accent}
          sectionNumber={block.sectionNumber}
        />
      );
    case "panel-group":
      return (
        <PanelGroupBlocks
          key={i}
          sectionNumber={block.sectionNumber}
          heading={block.heading}
          eyebrow={block.eyebrow}
          items={block.items}
        />
      );
    case "stat":
      return <StatBlock key={i} value={block.value} label={block.label} note={block.note} />;
    case "stat-group":
      return <StatGroupBlock key={i} stats={block.stats} />;
    case "quote":
      return <QuoteBlock key={i} text={block.text} attribution={block.attribution} />;
    case "image":
      return (
        <div key={i} className="cs-block" style={{ ["--w" as string]: block.image.w }}>
          <Frame image={block.image} />
        </div>
      );
    case "intro-stack":
      return (
        <IntroStackBlock
          key={i}
          heading={block.heading}
          body={block.body}
          stat={block.stat}
          quote={block.quote}
          sectionNumber={block.sectionNumber}
        />
      );
    case "section":
      return (
        <SectionBlock
          key={i}
          eyebrow={block.eyebrow}
          title={block.title}
          subhead={block.subhead}
          body={block.body}
          bullets={block.bullets}
          caption={block.caption}
          pullQuotes={block.pullQuotes}
          pullQuotePosition={block.pullQuotePosition}
          stats={block.stats}
          sectionNumber={block.sectionNumber}
          expandedPoints={block.expandedPoints}
          steps={block.steps}
          image={block.image}
          statsInMedia={block.statsInMedia}
        />
      );
    case "closing":
      return (
        <ClosingBlock
          key={i}
          sectionNumber={block.sectionNumber}
          heading={block.heading}
          body={block.body}
          stats={block.stats}
          caption={block.caption}
          cta={block.cta}
        />
      );
    case "principles":
      return (
        <PrinciplesBlock
          key={i}
          sectionNumber={block.sectionNumber}
          heading={block.heading}
          intro={block.intro}
          items={block.items}
        />
      );
  }
}

export function CaseStudyPage({
  slug,
  meta,
  sidebar,
  blocks,
}: {
  /** case-studies.ts slug for this page — picks its "Want to see more?"
   * pair via closingLinksFor, which excludes this page by construction. */
  slug: string;
  meta: Meta;
  sidebar: Sidebar;
  blocks: Block[];
}) {
  return (
    <main className="bg-bg">
      <BottomRule />
      <HorizontalTrack>
        <RailDots />
        <CoverBlock meta={meta} sidebar={sidebar} />
        {blocks.map((block, i) => renderBlock(block, i))}
        <CaseStudyClosing links={closingLinksFor(slug)} />
      </HorizontalTrack>
      <CaseStudyFooter />
    </main>
  );
}
