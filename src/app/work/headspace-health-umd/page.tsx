import type { Metadata } from "next";
import HorizontalTrack from "@/components/case-study/HorizontalTrack";
import CaseStudyClosing from "@/components/case-study/CaseStudyClosing";
import {
  BottomRule,
  CoverBlock,
  IntroStackBlock,
  RailDots,
} from "@/components/case-study/CaseStudyPage";
import { caseStudies } from "@/lib/case-studies";
import { context, meta, PROTOTYPE_URL, sidebar } from "@/lib/headspace-umd";

export const metadata: Metadata = {
  title: `${meta.company} ${meta.title} — Marc Favro`,
  description: meta.subtitle,
};

// The fixed top bar ("← Back · Headspace Unified Main Door · Home /
// Contact / Resume") is rendered by PersistentHeader in the root layout,
// same as the three CaseStudyPage case studies — see CASE_STUDY_TITLES there.

/** "Want to see more?" pair for this page only — Yahoo Partner Portal and
 * Airbnb, per direct request, rather than the site-wide default pair
 * (Airbnb + Headspace Admin Portal) CaseStudyClosing falls back to. */
const CLOSING_LINKS = ["yahoo-partner-portal", "airbnb-hotels"].map(
  (slug) => caseStudies.find((cs) => cs.slug === slug)!,
);

/** Recorded prototype walkthrough, anchored to the same 687px row as every
 * YPP section's media (and as the Context stack before it, so the two tops
 * line up). Same treatment as the shared `PlainMedia` box — bg-white,
 * rounded-lg, drop shadow, 609px tall — but NOT the shared 1440:1024 shape:
 * this prototype was built at a wider 1.6:1 frame (2982×1862 after cropping
 * the recording to the frame's interior), and holding it in the 4:3 box
 * letterboxed it with white bars top and bottom, which read as sloppy.
 * Per direct correction the bars matter more than the width matching the
 * other case studies, so the box takes the recording's own ratio at the
 * shared height (609 × 2982/1862 ≈ 975px wide, both × --cs-media-scale so
 * it shrinks with every other media box on short viewports) and the video
 * fills it edge to edge. Kept local rather than adding a ratio override to `PlainMedia`,
 * which stays a fixed box on purpose.
 *
 * Mirrors SectionBlock's panel column — 609px media row, gap-6, 80px bottom
 * pad — with the Figma link taking the caption's slot, left-aligned to the
 * media's own left edge. Block width is the media width, so the 144px
 * track gap plus CaseStudyClosing's own 149px margin-left gives the same
 * 293px run-in to "Thank you." that YPP has. */
const WALKTHROUGH_ASPECT = "2982/1862";
const WALKTHROUGH_WIDTH = `calc(609px * ${WALKTHROUGH_ASPECT} * var(--cs-media-scale, 1))`;

function WalkthroughBlock({ href }: { href: string }) {
  return (
    <div
      className="cs-block cs-anchor-687"
      style={{ ["--w" as string]: WALKTHROUGH_WIDTH }}
    >
      <div className="flex flex-col gap-6 min-[901px]:pb-[calc(80px*var(--cs-scale,1))]">
        <div
          className="product-media w-full overflow-hidden rounded-lg bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] min-[901px]:h-[calc(609px*var(--cs-media-scale,1))]"
          style={{ aspectRatio: WALKTHROUGH_ASPECT }}
        >
          {/* object-cover, not object-contain: the box already has the
              recording's exact ratio, so cover only ever trims sub-pixel
              rounding — and can never leave a hairline of bg-white showing
              along an edge the way contain could. playsInline is required
              for autoplay to fire on iOS Safari. */}
          <video
            src="/headspace/videos/UMDWalkthrough.webm"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Headspace Unified Main Door prototype walkthrough"
            className="size-full object-cover"
          />
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
        >
          Open in Figma →
        </a>
      </div>
    </div>
  );
}

export default function HeadspaceUmdPage() {
  return (
    <main className="bg-bg">
      <BottomRule />

      <HorizontalTrack>
        <RailDots />
        <CoverBlock meta={meta} sidebar={sidebar} />
        <IntroStackBlock heading="Context" body={context} />
        <WalkthroughBlock href={PROTOTYPE_URL} />
        <CaseStudyClosing links={CLOSING_LINKS} />
      </HorizontalTrack>
    </main>
  );
}
