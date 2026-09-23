import Image from "next/image";
import Link from "next/link";
import SectionNumber from "@/components/site/SectionNumber";
import SectionRail from "@/components/site/SectionRail";
import Placeholder from "@/components/site/Placeholder";
import CompanyLogo from "@/components/site/CompanyLogo";
import Experience from "@/components/site/Experience";
import InterestGallery from "@/components/site/InterestGallery";
import ArrowIcon from "@/components/site/ArrowIcon";
import {
  additionalWork,
  additionalWorkIntro,
  contact,
  projects,
  roles,
} from "@/lib/home";

// Hero eyebrow / "Portfolio 2026" label — shared role (16/24 Medium, white),
// confirmed identical on both via get_design_context (Portfolio-Playground
// 66:118321, "Hello & welcome" and the subline share the exact same style).
const HERO_LABEL_CLASS =
  "text-[16px] font-medium leading-[24px] text-white [font-family:var(--font-display)]";

/* The content column, applied per band instead of once on <main>.
   w-[min(1376px,...)], centered (mx-auto): 1376 = confirmed 1440px design
   width (get_metadata, node 627:49704) minus the 32px rail on each side.
   Below that width the min() falls through to the fluid calc(100%-4rem)
   term, so the column always stops exactly at the rails' inner edge.
   Each band owns its own copy because the paper fill now belongs to the
   BAND (full-bleed, uncapped) while the content inside it stays capped —
   the two used to be the same element, which is why they couldn't be
   separated by a white gutter. */
const SHELL = "mx-auto px-6 lg:w-[min(1376px,calc(100%-4rem))] lg:px-8";

/* 32px of bare white between bands, matching the perimeter rails' own
   width — the Figma separates every section this way (72:151644) except
   Personal inspo → Contact, which run flush into each other. Full-bleed by
   construction: it sits outside SHELL, so the white it exposes is the
   <body> itself rather than a strip drawn to some computed width. */
function BandGap() {
  return <div aria-hidden className="h-8" />;
}

export default function Home() {
  return (
    <div>
      {/* Header now lives in the root layout as PersistentHeader, outside
          PageTransition's fade — see that component for why.
          No bg here: the page is white (body), and each section paints its
          own full-bleed paper band, so the gaps between them read as the
          same white the rails and top/bottom chrome are drawn in. */}
      <main id="home">
        {/* ---------- Band · hero ---------- */}
        <div className="bg-bg pb-6 lg:pb-0 lg:pt-[82px]">
        {/* Hero · Portfolio-Playground (fileKey AwPcHO3ssXvBttxqrLdxlR),
            mobile frame node 66:118321 ("Mobile hero", 402×616) + written
            desktop spec — coral panel using the same case-study-texture
            multiply layer as the work cards below, replacing the old
            Figma-cloned grid hero.

            Mobile and desktop are two separate trees, each hidden at the
            other's breakpoint, rather than one shared layout reflowed with
            CSS: the headline overlaps the illustration only on desktop
            (coral text-stroke so it still reads over the linework where it
            crosses the face) and sits as two plain lines below the
            illustration on mobile (per 66:118321, no overlap there at
            all) — different enough treatments that one DOM structure
            forcing both was worse than the duplication. */}
        {/* SHELL's column, spelled out rather than interpolated, because
            this is the one section with NO horizontal padding at lg: the
            hero has to reach the white perimeter (LeftRail/RightRail,
            PerimeterFrame.tsx), not stop at the inset content column every
            other section uses. `${SHELL} lg:px-0` does not express that —
            lg:px-8 and lg:px-0 are the same property, so which one wins is
            decided by Tailwind's own output order, not by the order they
            appear in the class string, and px-8 won (visible as a 32px
            margin of paper between the coral and the rail). The width cap
            is the same as SHELL's: w-[min(1376px,calc(100%-4rem))] = the
            1440 design width minus the 32px rail on each side, so with no
            padding the hero lands flush against the rails' inner edge
            without overlapping them. Below lg there's no perimeter chrome
            to reach, so mobile keeps the ordinary px-6 inset. */}
        <section
          id="hero"
          className="mx-auto flex flex-col px-6 [container-type:inline-size] lg:w-[min(1376px,calc(100%-4rem))] lg:flex-row lg:items-stretch lg:-mt-10 lg:px-0"
        >
          {/* ---------- Phone (<640px): coral panel only, stacked headline ---------- */}
          {/* sm:hidden (was md:hidden, i.e. <768px): the switch to the
              overlap lockup was happening well before it needed to — there
              was still plenty of room for "I'M MARC FAVRO" on one line
              in the 640–767px range, per direct observation. 640px is
              close to where that line actually starts needing the extra
              room the overlap lockup's own width gives it; true phone
              widths below that keep this stacked, non-overlapping
              treatment, which is specifically what matches the Figma
              mobile frame (66:118321).
              Gaps tightened (mt-6/mt-6/mt-5 → mt-3/mt-3/mt-2, pt-9/pb-10 →
              pt-6/pb-7): read as too loose next to the 1440 lockup's own
              tight pt-[9%]/pb-[11%]/gap-2 — this block still uses fixed px
              (not %) since it's a fundamentally different, stacked
              composition rather than a scaled copy of the desktop one, so
              there's no single ratio to carry over exactly; tightened by
              feel to match that same compactness instead. */}
          <div className="relative isolate flex flex-col items-center overflow-hidden rounded-[8px] bg-accent px-6 pb-7 pt-6 text-center sm:px-10 sm:hidden">
            {/* Texture · same asset as the work-card lockups above
                (public/case-study-texture.svg), but applied as a CSS
                background with background-size:cover instead of an <img>
                with h-full/w-full: the SVG has its own intrinsic aspect
                ratio, and an <img> respects that via preserveAspectRatio
                even when its box is stretched to h-full/w-full, so on a
                panel shaped differently from the texture's native ratio it
                letterboxed — visible as flat, un-grained coral bands top
                and bottom. A background-image with background-size:cover
                fills the box edge to edge on any aspect ratio, cropping
                instead of letterboxing (same spirit as the work card's own
                scale-[1.06] overscale to crop the source's stray edge
                pixels). */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-multiply"
              style={{
                backgroundImage: "url(/case-study-texture.svg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <p className={`${HERO_LABEL_CLASS} relative`}>Hello &amp; welcome</p>
            <div className="relative mt-0 w-[78%] max-w-[300px]">
              <Image
                src="/marc/hero-illustration-2026.png"
                alt="Illustrated portrait of Marc Favro"
                width={1268}
                height={1241}
                priority
                sizes="(min-width: 1024px) 450px, 320px"
                className="relative block h-auto w-full"
              />
            </div>
            {/* 66:118338 — 53/59 Bold, hard-broken after "I'm" (not a
                reflow of one line): matches the two-line balance in the
                mobile frame at any width narrower than it. */}
            <h1 className="relative mt-3 text-[clamp(2.25rem,11vw,3.25rem)] leading-[0.95] font-bold tracking-tight text-white uppercase [font-family:var(--font-display)]">
              I&rsquo;m
              <br />
              Marc Favro
            </h1>
            <p className={`${HERO_LABEL_CLASS} relative mt-2 max-w-[22rem]`}>
              I&rsquo;m a Principal Product Designer, based in Brooklyn, New York
            </p>
          </div>

          {/* ---------- Tablet (640–1023px, capped width) + Desktop (≥1024px, 60%) ---------- */}
          {/* sm:block (was md:block, i.e. ≥768px): matches the phone
              block's breakpoint move above, for the same reason — this
              tier now starts at 640px. */}
          {/* Three levels, not two, and it matters which one gets which
              job:
              A (this div) — sizing within the row (sm:w-full → lg:w-[60%])
                  PLUS the full-bleed background/texture. Its width is
                  never capped, so the coral fill always reaches this
                  column's real edges — capping it here was what made the
                  background stop short and show bare page margin around
                  it, per direct request ("the red background should
                  remain full bleed").
              B (sm:mx-auto sm:max-w-[825.6px]) — caps and centers the
                  *content* only, independent of A's background. 825.6px is
                  the exact width the lockup renders at on desktop (60% of
                  main's capped 1376px content column) — per direct
                  request, the lockup should read as the same size as the
                  1440px version wherever there's room for it, not a
                  smaller tablet-specific approximation, since removing the
                  grid/dark column frees up exactly that space. This does
                  reintroduce a real jump right at 1024px (825.6px → 576px,
                  once the grid/dark column comes back and the lockup
                  actually has to share the row) — traded on purpose,
                  per that same request, against the smoother-but-smaller
                  620px this replaced. lg:max-w-none lets it go back to
                  filling A's full 60% at that point.
              C — the padding/flex-col/content div, identical to before.
                  It has to be a separate level from B: percentage padding
                  resolves against the *containing block's* width, and if
                  the padding lived on B directly, B's own max-w wouldn't
                  be its own containing block — that's the same bug the
                  OUTER/INNER split below this comment already fixed once
                  (px-[4%] etc. resolving against the whole row instead of
                  the panel). C sitting one level inside B, with no sizing
                  of its own beyond w-full, is what makes its percentages
                  finally resolve against B's capped width. */}
          <div className="hidden sm:block sm:w-full lg:w-[60%]">
            <div
              className="relative isolate h-full overflow-hidden bg-accent"
            >
              {/* Texture · see the mobile panel's comment above for why this
                  is a CSS background-size:cover layer, not an <img>. Lives
                  on A now (full-bleed), not on C (capped) — it has to cover
                  the same box the coral fill does. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-multiply"
                style={{
                  backgroundImage: "url(/case-study-texture.svg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              {/* h-full down through B: dormant today (A's own height is
                  always this content's organic height — the row's shorter
                  right column never forces A taller — see the OUTER/INNER
                  comment on the grid/dark column below), but without it a
                  future case where A *does* get stretched taller would
                  leave the coral fill and centering correct while the
                  content silently stopped actually centering inside it. */}
              {/* [container-type:inline-size] lives here, not on the
                  padded div one level in: cqw resolves against a
                  container's own CONTENT box, so putting it on the div
                  that has px-[4%] would make cqw measure the width AFTER
                  that 4%+4% padding is already subtracted — 92% of the
                  panel, not the panel itself, which is what the ratio
                  below (10.4cqw) was calibrated against (85.6px at
                  825.6px), and it silently came out ~8% small everywhere
                  until this was caught by comparing the measured value at
                  1440px against the pre-cqw baseline. */}
              <div className="h-full sm:mx-auto sm:max-w-[825.6px] lg:max-w-none [container-type:inline-size]">
                {/* pt-[9%]/pb-[11%] (was symmetric py-[10%]): measured
                    directly off a screenshot with a reference line at the
                    grid/dark-block split height (55% down the panel) — the
                    headline's ink center sat at ~56.35%, about 1.35% of
                    panel height (~1% of panel width, this padding's own
                    basis) low. A justify-center flex column shifts by
                    (pt−pb)/2 off true center, so trimming pt by 1% and
                    adding it to pb pushes the whole
                    eyebrow→illustration→subline stack up by that amount
                    without touching the headline's own top-[61%] position
                    within it — the headline moves only because it rides
                    with the illustration, not because its own rule
                    changed. */}
                <div className="relative flex h-full w-full flex-col justify-center gap-2 px-[4%] pt-[9%] pb-[11%] text-center">
                  <p className={`${HERO_LABEL_CLASS} relative`}>Hello &amp; welcome</p>
                  <div className="relative w-full">
                    <Image
                      src="/marc/hero-illustration-2026.png"
                      alt="Illustrated portrait of Marc Favro"
                      width={1268}
                      height={1241}
                      priority
                      sizes="(min-width: 1024px) 450px, 320px"
                      className="relative mx-auto block h-auto w-[47%]"
                    />
                    {/* Real h1, not an image. Coral stroke = the panel's own
                        background color, so it's invisible on flat coral and
                        only separates the letterforms from the linework
                        where they cross the face. paint-order keeps the
                        stroke from eating into the fill. top-[61%]: measured
                        headline-ink center off the reference sits ~61% down
                        the illustration, not 58%.
                        cqw, not vw: font-size used to be
                        clamp(3.7rem,5.95vw,5.35rem) — 5.95vw was reverse-
                        engineered from one specific relationship (this
                        panel = 60% of a ~1376px row at the 1440px anchor),
                        so it quietly stopped being correct anywhere that
                        relationship doesn't hold — which is exactly this
                        tier: the panel is capped at 825.6px or tracks the
                        row directly instead of "60% of 1376", so 5.95vw
                        was systematically wrong here. 10.4cqw reads the
                        *container's own width* (set two levels up) instead
                        of the viewport, so it's correct at every width this
                        lockup ever renders at, including ones no one has
                        tuned it against by hand — 10.4% is the same
                        85.6px-at-825.6px-container ratio the old constant
                        was calibrated to, so 1440px desktop is unchanged. */}
                    <h1
                      className="pointer-events-none absolute inset-x-[1.5%] top-[61%] -translate-y-1/2 whitespace-nowrap text-center text-[clamp(2rem,10.4cqw,5.35rem)] leading-[0.9] font-bold tracking-tight text-white uppercase [font-family:var(--font-display)]"
                      style={{
                        WebkitTextStroke: "0.05em var(--accent)",
                        paintOrder: "stroke fill",
                      }}
                    >
                      I&rsquo;m Marc Favro
                    </h1>
                  </div>
                  {/* No max-w: the reference has this on one line — capping
                      it narrower was what forced a second line that ate
                      into the height budget. */}
                  <p className={`${HERO_LABEL_CLASS} relative`}>
                    I&rsquo;m a Principal Product Designer, based in Brooklyn, New York
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Desktop: grid (55%) + dark block (45%), 40% column ---------- */}
          <div className="hidden lg:flex lg:w-[40%] lg:flex-col">
            {/* 16px cell, fixed — the same sheet the work cards and the
                Personal inspo band are drawn on, so the page reads as one
                piece of graph paper rather than three at different scales.
                This used to divide the box instead (34 × 20, ≈16.2px at
                the 1440 anchor) to guarantee whole cells edge to edge. The
                catch is that a divided cell is only 16px at the width it
                was calibrated against: this box is 40% of the row while a
                card's panel is a 1fr track after a fixed 392 + 72px, so
                the two scale at different rates and their cells drifted
                apart — 16.19 vs 12.53px at 1440, and further apart as the
                window narrowed. A fixed pitch can't drift.
                What it costs is the partial cell the divisors avoided.
                background-position handles where that lands: `top` starts
                the rows at this box's top edge so the first row is always
                full, pushing the remainder to the bottom, where the dark
                block's hard edge hides it; `center` splits the horizontal
                remainder into equal half-cells on both sides instead of
                dumping one narrow column at the right. */}
            <div
              aria-hidden
              className="flex-[55_1_0%] bg-white"
              style={{
                backgroundImage: [
                  "repeating-linear-gradient(to right, var(--accent) 0 1px, transparent 1px 16px)",
                  "repeating-linear-gradient(to bottom, var(--accent) 0 1px, transparent 1px 16px)",
                ].join(","),
                backgroundPosition: "center top",
              }}
            />
            {/* Figma 97:206178 — two centered lines: "Selected work | 2026"
                (Google Sans Flex Bold 16/24, cream) over the three companies
                (Roboto Mono 16/24, accent). */}
            <div className="flex flex-[45_1_0%] flex-col items-center justify-center gap-0.5 bg-ink-deep text-center">
              <p
                className="text-[16px] font-bold leading-[24px] text-bg [font-family:var(--font-display)]"
                style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}
              >
                Selected work
                <span aria-hidden className="px-2">
                  |
                </span>
                2026
              </p>
              <p className="text-[16px] leading-[24px] text-accent [font-family:var(--font-mono)]">
                Yahoo
                <span aria-hidden className="px-2">
                  •
                </span>
                Headspace
                <span aria-hidden className="px-2">
                  •
                </span>
                Airbnb
              </p>
            </div>
          </div>
        </section>
        </div>

        {/* Phone: no white gutter under the hero — the band's own pb-6 is
            the gap, in paper, matching the card's side inset. */}
        <div className="hidden lg:block">
          <BandGap />
        </div>

        {/* ---------- Band · 01 Recent work ---------- */}
        <div className="bg-bg">
        {/* No border-t any more: the 32px white gutter above this band is
            the divider now. */}
        <section id="work" className={`${SHELL} sec py-12`}>
          <SectionRail />
          <SectionNumber number="01" label="Recent work" />
          <div>
            <h2 className="t-section-title">
              Recent work
            </h2>

            {/* Two-column row: text left (392px), image right — per 177:111986.
                The three supporting blocks sit inside the image column, not
                full-width beneath it (177:112000 lives inside 177:111998). */}
            <div className="space-y-24 lg:space-y-32">
              {projects.map((project) => {
                const isLinked = Boolean(project.href);
                const image = project.image ? (
                  // Card = texture sheet with the device mockup sitting on
                  // it (Figma card frame 784:121621 / 784:121479 /
                  // 791:129913, node "Homepage artwork" 835:64874). The
                  // mockup is the original flattened export with its grey
                  // ground and shadow masked to transparent (same canvas,
                  // same position — see home.ts), so it lays over the
                  // texture without a matte. No border: the design has none.
                  // 93.333% = 56 of the old 60 columns, i.e. two cells off
                  // each side, with ml-auto pinning the right edge to the
                  // section's so the whole reduction comes off the left.
                  // The divisors below drop to match, which keeps the CELL
                  // the same size instead of just scaling the same
                  // 60-column sheet down into a narrower box.
                  <div
                    className="product-media relative isolate w-full overflow-hidden bg-bg lg:ml-auto lg:w-[93.333%] lg:rounded-[4px]"
                    style={{ aspectRatio: "714 / 402" }}
                  >
                    {/* Graph paper, replacing the halftone texture sheet
                        this card used to sit on (72:155197). Same 16px
                        cell as the hero column and the Personal inspo
                        band, only in --line rather than accent — two coral
                        grids on one screen read as competing, and the
                        Figma draws this one grey.
                        Fixed pitch, not divisors (56 × 32 before): see the
                        hero grid for why — a divided cell only holds its
                        intended size at the width it was calibrated
                        against, and this panel and the hero column scale
                        at different rates, so theirs drifted to 12.53 vs
                        16.19px at the 1440 anchor. `center top` places the
                        partial cells the divisors used to avoid: rows
                        start full at the top, and the horizontal remainder
                        splits evenly across both edges. The inset ring
                        below closes all four sides regardless. */}
                    {/* The inset ring closes the sheet. A repeating
                        gradient paints its line at the START of each cell,
                        so the grid gets a rule at 0% but none at 100% on
                        either axis — the last column and row ran off the
                        box with no edge, which read as a grid that had
                        been cropped rather than a sheet of paper. An inset
                        box-shadow rather than a border: a border would
                        shrink the background positioning area, and the
                        calc(100%/n) cell size is measured against it, so
                        every line would shift a fraction off. */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage: [
                          "repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px 16px)",
                          "repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px 16px)",
                        ].join(","),
                        backgroundPosition: "center top",
                        boxShadow: "inset 0 0 0 1px var(--line)",
                      }}
                    />
                    <Image
                      src={project.image.src}
                      alt={project.image.alt}
                      width={project.image.width}
                      height={project.image.height}
                      // 4x Figma export served as-is: the optimizer's q75
                      // re-encode of small UI text was visibly soft.
                      unoptimized
                      className="relative block h-full w-full"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Placeholder label={project.imageLabel} ratio="798 / 402" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <CompanyLogo
                        company={project.company}
                        className="text-3xl md:text-4xl"
                      />
                    </div>
                  </div>
                );

                // lg:gap-x-18 (72px, was 24) — the copy was crowding the
                // grid panel. Funded by the 48px cut from .sec's number
                // column (globals.css) rather than taken out of the panel:
                // 392 text + 72 gutter + 655 panel is exactly the widened
                // content column, so the image renders at the size it did
                // before. Column gap only; the row gap still applies below
                // lg, where the two stack.
                return (
                  <article
                    key={project.company + project.title}
                    className="grid gap-6 lg:grid-cols-[minmax(0,392px)_minmax(0,1fr)] lg:gap-x-18"
                  >
                    {/* Project Info · 177:111987 */}
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          {/* Company · small uppercase mono, one rung below
                              the title, per 72:155197 — was the same 16px
                              semibold sans as the title's own label role,
                              which made the two read as one stacked
                              headline instead of eyebrow + headline. */}
                          <p className="t-card-eyebrow">{project.company}</p>
                          {/* Measure, not the 392px column: at full column
                              width the titles set one-and-a-bit lines and
                              read as a run-on. 9.2em reproduces the Figma's
                              own breaks exactly — Partner portal 1 line,
                              Unified main door 2, Account creation &
                              onboarding 3. em, not px: the title is a
                              clamp() that changes size across the lg range,
                              and a px measure would flip a card's line count
                              partway along it. Measured window is
                              8.6em–9.7em, so this sits mid-range with slack
                              on both sides rather than on a break point. */}
                          {/* text-balance evens the lines instead of
                              filling each one before breaking: "Unified
                              main door" was setting as "UNIFIED MAIN /
                              DOOR" (241 / 107) and now breaks "UNIFIED /
                              MAIN DOOR" (138 / 209). Measured against all
                              three titles — Partner portal stays on one
                              line and Account creation & onboarding keeps
                              the same three breaks, so this only moves the
                              one that needed moving. Preferred over a
                              non-breaking space in the copy: the break
                              stays a typographic decision here rather than
                              riding along in the string that also feeds
                              aria-labels and page titles. */}
                          <h3 className="display t-title uppercase lg:max-w-[9.2em] lg:text-balance">
                            {project.title}
                          </h3>
                        </div>
                        <p className="t-body-alt max-w-[375px] text-ink-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Link · 177:111993 — text + icon, no pill. Shared
                          ArrowIcon (straight right, currentColor), same as
                          every other in-line link on the site — was a
                          diagonal up-right glyph baked into its own SVG
                          asset, the only place that arrow appeared. */}
                      {isLinked ? (
                        <Link
                          href={project.href!}
                          className="t-link group hidden items-center gap-1.5 self-start lg:inline-flex"
                        >
                          Project preview
                          <ArrowIcon className="text-current transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ) : (
                        <span className="t-link hidden self-start text-muted lg:inline">
                          Case study in progress
                        </span>
                      )}
                    </div>

                    {/* Body · 177:111997 */}
                    <div className="flex flex-col gap-6">
                      {/* Image and Skills row merged into one rounded card
                          (488:48637) — overflow-hidden clips both to shared
                          corners, though in practice only the top two ever
                          show: the skills row below shares this div's
                          bg-bg, so its corners have no visible edge against
                          the page to round. product-media rounds all four
                          of its own corners (not just the top) so the
                          image itself always reads as a complete rounded
                          rectangle regardless of what's below it. 4px,
                          matching product-media — was mismatched at 8px
                          briefly (top-only on the image, full on this
                          wrapper), which is what made the bottom corners
                          look unrounded. */}
                      <div className="-mx-6 overflow-hidden lg:mx-0 lg:rounded-[4px]">
                        {isLinked ? (
                          <Link
                            href={project.href!}
                            aria-label={`Open the ${project.title} case study`}
                            className="block transition-opacity hover:opacity-90"
                          >
                            {image}
                          </Link>
                        ) : (
                          image
                        )}

                        {/* Skill tags — meta-data role, 543:114278: same
                            .t-meta-sm typography as Experience's Skills/
                            Tooling list, plus the orange "•" divider (Google
                            Sans Flex, 13px, accent — a separate role from the
                            mono tag text, not part of .t-meta-sm). */}
                        {/* Right-aligned, flush to the grid panel's own
                            right edge — this row shares the panel's width,
                            so justify-end lands the last tag on the same x
                            the lockup ends at. No horizontal padding: the
                            old pl-5/pr-1 was optical centering for the
                            centered row this replaces, and any pr here
                            would break the alignment it's aligning to. */}
                        <div className="hidden flex-wrap items-center justify-end gap-2.5 bg-bg px-0 pb-0 pt-4 lg:flex">
                          {project.skills.map((skill, i) => (
                            <span key={skill} className="flex items-center gap-2.5">
                              {i > 0 ? (
                                <span
                                  aria-hidden="true"
                                  className="text-[13px] text-accent [font-family:var(--font-alt)]"
                                >
                                  •
                                </span>
                              ) : null}
                              <span className="t-meta-sm t-accent whitespace-nowrap">
                                {skill}
                              </span>
                            </span>
                          ))}
                        </div>

                      </div>
                      {/* Phone: the link sits under the image; tags are
                          dropped below lg. */}
                      {isLinked ? (
                        <Link
                          href={project.href!}
                          className="t-link group inline-flex items-center gap-1.5 self-start lg:hidden"
                        >
                          Project preview
                          <ArrowIcon className="text-current transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ) : (
                        <span className="t-link self-start text-muted lg:hidden">
                          Case study in progress
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        </div>

        <BandGap />

        {/* ---------- Band · 02 Additional work ----------
            Dark ink panel, full-bleed, per 72:157593 — the section used to
            sit on the same paper as everything above it and read as more
            Recent Work; inverting it is what separates "a little bit more"
            from the three real case studies. Same ink as the hero's
            "Portfolio 2026" block so the page has one dark, not two. */}
        {/* z-[39]: above the page grain sheet (.noise-overlay, z-38) and
            below the fixed chrome (z-40+), same as .cs-pin. The grain
            lightened this panel and buried the halftone; the Figma band
            (72:157593) carries only its own texture. */}
        <div className="on-dark relative isolate z-[39] overflow-hidden bg-ink-deep">
          {/* Halftone · the Figma's own texture (72:157596): a white sheet
              of diagonal blue-grey dots, multiplied over the fill (so the
              white drops out), rotated 180° and blurred 0.5px, exactly as
              the design layers it. Sized to the design's 1394px frame
              (source is 1071px, so ~9px between dots) — or the band's full
              width when wider, which covers the band's height at desktop.
              On phones it keeps that 1394px scale instead of stretching to
              the tall band, and the tile's corner marks crop out. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rotate-180 mix-blend-multiply blur-[0.5px]"
            style={{
              backgroundImage: "url(/additional-work-texture.png)",
              backgroundSize: "max(100%, 1394px) auto",
              backgroundPosition: "center top",
              backgroundRepeat: "repeat",
            }}
          />
        {/* 02 — additional work · 499:55119 — deliberately lighter than the
            primary case studies: headline + intro on the left, a carousel
            list on the right. No images, label only, no case-study link.
            Its own numbered section per Figma, not folded into Recent Work. */}
        <section id="additional-work" className={`${SHELL} sec relative py-12`}>
          <SectionRail />
          <SectionNumber number="02" label="Additional work" />
          <div>
            {/* 499:55129 — small label above the headline. Distinct wording
                from the h3 below it ("A little bit more" vs. "Additional
                work") — previously both said "Additional work", the exact
                redundant-eyebrow pattern flagged in review. */}
            <h2 className="t-section-title">A little bit more</h2>
            {/* Same 392px + 72px gutter as the Recent Work cards above, so
                this list's left edge lands on the exact x their grid panels
                start at — the two sections share a column structure, and at
                the old 24px gutter this one sat 48px inboard of it. */}
            {/* lg:items-baseline: the first list item's label sits on the
                "Additional work" headline's baseline instead of sharing its
                top edge (which left the label 17px high). */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,392px)_minmax(0,1fr)] lg:items-baseline lg:gap-x-18">
              <div className="flex flex-col gap-4">
                <h3 className="display t-accent text-[clamp(2rem,4vw,2.5rem)] uppercase">
                  Additional work
                </h3>
                <p className="t-body max-w-[343px]">
                  {additionalWorkIntro}
                </p>
              </div>

              {/* Same 93.333% + ml-auto inset the work cards' grid panels
                  carry, applied to this column for the same reason: both
                  sit in an identical 1fr track, so mirroring the inset —
                  rather than hard-coding the 44px it currently works out
                  to — keeps this list's left edge on the panels' left edge
                  at every width, including ones where that gap isn't 44px.
                  lg-only: below it the grid is one column and there's no
                  panel to line up with. */}
              <div className="flex flex-col gap-12 lg:ml-auto lg:w-[93.333%]">
                {additionalWork.map((item) => {
                  const isDone = Boolean(item.href) && !item.draft;

                  const content = (
                    <>
                      {/* company | title on one label line, trailing arrow —
                          shared ArrowIcon, same style as the case-study
                          "Back" link (rotated the other way). */}
                      <p className="t-label inline-flex items-center gap-2.5">
                        <span>
                          {item.company}
                          <span
                            aria-hidden
                            className="px-2 font-normal text-current opacity-60"
                          >
                            |
                          </span>
                          {item.title}
                        </span>
                        <ArrowIcon
                          className={`text-current${
                            isDone
                              ? " transition-transform group-hover:translate-x-0.5"
                              : ""
                          }`}
                        />
                      </p>
                      {/* 520px ≈ 62 characters at this mono's 14px — the
                          old 581px ran to ~69, past the point the eye
                          tracks comfortably from line to line, which is
                          what made this column read as a wall. */}
                      <p className="t-body max-w-[520px]">
                        {item.description}
                      </p>
                    </>
                  );

                  return isDone ? (
                    <Link
                      key={item.company + item.title}
                      href={item.href!}
                      className="group flex flex-col gap-4 transition-opacity hover:opacity-90"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={item.company + item.title}
                      className="flex flex-col gap-4"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        </div>

        <BandGap />

        {/* ---------- Band · 03 Career history ---------- */}
        <div className="bg-bg">
        <section id="experience" className={`${SHELL} sec py-12`}>
          <SectionRail />
          <SectionNumber number="03" label="Career history" />
          <div>
            {/* 177:112118 — label line. Distinct wording from the h2 below
                it ("Where I've been" vs. "Career history") — previously
                both said "Career history", the same redundant-eyebrow
                pattern as Additional Work above. */}
            <p className="t-section-title">Where I&apos;ve been</p>
            {/* 177:112121 — Playfair headline */}
            <h2 className="display text-[clamp(2rem,4vw,2.5rem)] uppercase">
              Career history
            </h2>
            <div className="mt-8">
              <Experience roles={roles} />
            </div>
          </div>
        </section>
        </div>

        <BandGap />

        {/* ---------- Band · 04 Personal inspo + 05 Contact ----------
            The only two bands with no white gutter between them: in the
            Figma the coral graph paper runs straight into the coral contact
            panel, so they read as one closing block. */}
        {/* Coral graph paper, per 72:179800. Fixed 16px pitch rather than
            the percentage divisors used inside fixed-ratio boxes elsewhere:
            this band is full-bleed and its height is content-driven, so
            there's no ratio to divide evenly — centering horizontally
            splits the leftover into equal half-cells on both edges instead
            of dumping one narrow partial column on the right. 16px matches
            the hero grid's own ~16.2px cell.
            The lines are drawn at 45% accent, not full: at full strength a
            grid this dense over a whole band competed with the photos it
            sits behind.
            Vertically the sheet starts at the band's own top edge, so the
            first row is a full 16px like every other one — an offset here
            (it was 14px, to put a rule through the header row) buys that
            rule at the cost of a short first row, which reads as a line
            spacing bug along the top edge. The rule is bought with the
            section's 50px top padding instead: that puts the header row's
            shared centre at 64px, which IS a multiple of 16, so a line
            lands on it with the sheet still starting at 0. Re-derive that
            padding if the rail's own py-2 or the type roles' nudge move
            the centre. */}
        <div
          className="bg-bg"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(to right, color-mix(in srgb, var(--accent) 45%, transparent) 0 1px, transparent 1px 16px)",
              "repeating-linear-gradient(to bottom, color-mix(in srgb, var(--accent) 45%, transparent) 0 1px, transparent 1px 16px)",
            ].join(","),
            backgroundPosition: "center top",
          }}
        >
        {/* pt-[50px], not py-12, and only here: 48 put the header row's
            centre at 62, which isn't a multiple of the 16px grid, so no
            rule could land on it without offsetting the whole sheet. 50
            moves that centre to 64. The 2px is invisible against the other
            sections; the alternative (offsetting the sheet) was visible as
            a short first row. */}
        <section id="interests" className={`${SHELL} sec sec-ink pb-8 pt-[50px]`}>
          <SectionRail />
          <SectionNumber number="04" label="Personal inspo" />
          {/* min-w-0 lets this grid item shrink to the column instead of being
              propped open by content; the ScrollStrip inside clips its own
              overflow. */}
          <div className="min-w-0">
            {/* Ink, not accent, here alone — see .sec-ink in globals.css:
                the band under it is already coral. --tight pulls the strip
                up under it; the wrapper below carries no top margin of its
                own, since an mt-* there would just collapse against this
                title's larger bottom margin and do nothing. */}
            <p className="t-section-title t-section-title--tight">
              Personal inspo
            </p>
            <InterestGallery />
          </div>
        </section>
        </div>

        {/* 05 — Contact · coral panel, full-bleed, per 72:179800, running
            flush off the graph-paper band above it. The footer credit line
            now lives inside this same panel rather than as its own white
            strip below it, which is how the Figma closes the page. */}
        <div className="on-dark relative isolate overflow-hidden bg-accent">
          {/* Texture · the same multiply sheet the hero's coral panel
              carries, so the page's two coral fields read as one ink. See
              the hero for why this is a background-size:cover layer rather
              than an <img>. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-multiply"
            style={{
              backgroundImage: "url(/case-study-texture.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <section id="contact" className={`${SHELL} sec relative py-12`}>
            <SectionRail />
            <SectionNumber number="05" label="Contact" />
            {/* The email address is the headline. */}
            <div>
              <p className="t-section-title" style={{ marginBottom: "0.75rem" }}>
                We should probably chat, right?
              </p>
              {/* hover drops to opacity, not accent: accent-on-accent is
                  invisible here. */}
              <h2 className="display text-[clamp(2rem,4vw,2.5rem)] break-words">
                <a
                  href={`mailto:${contact.email}`}
                  className="transition-opacity hover:opacity-75"
                >
                  {contact.email}
                </a>
              </h2>

              <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm tracking-wide">
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                  className="t-mark transition-opacity hover:opacity-75"
                >
                  {contact.phone}
                </a>
                <span aria-hidden className="text-white/50">
                  |
                </span>
                <a
                  href={contact.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="t-mark transition-opacity hover:opacity-75"
                >
                  Resume
                </a>
                <span aria-hidden className="text-white/50">
                  |
                </span>
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="t-mark transition-opacity hover:opacity-75"
                >
                  LinkedIn
                </a>
              </p>
            </div>
          </section>

          {/* lg:pb-16 (64px): the fixed BottomBand (32px tall, position:fixed
              so it doesn't occupy document flow) overlays the page's last
              32px of padding rather than pushing content up above it — the
              previous lg:pb-8 (32px) was entirely hidden underneath the
              band, leaving 0px of actual visible clearance (confirmed via
              direct measurement: text bottom and band top were flush, gap
              0). 64px = 32px to clear the band + 32px of real breathing
              room above it, per direct correction. */}
          <footer className={`${SHELL} relative pb-10 lg:pb-16`}>
            <p className="t-meta-sm font-bold border-t border-white/40 pt-5 text-center lg:text-right">
              Built &amp; designed using Claude Code
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
