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

export default function Home() {
  return (
    <div className="bg-bg">
      {/* Header now lives in the root layout as PersistentHeader, outside
          PageTransition's fade — see that component for why.
          bg-bg here (not bg-white): the grey needs to fill all space
          between the two 32px white rails unconditionally, independent of
          <main>'s own width — LeftRail/RightRail are opaque, fixed,
          higher z-index, so they still paint white over their own 32px
          regardless of what color sits behind them. Previously this
          wrapper was white with grey moved onto <main> itself so the
          grey could be capped separately from the white margin outside
          it — but capping <main> also capped the actual CONTENT (hero
          grid, work-card images), which must stay pinned at its real
          design size, not grow. Splitting the concerns here (background
          color vs. content sizing) fixes both without trading one bug
          for the other. */}
      <main
        id="home"
        className="mx-auto px-6 [container-type:inline-size] lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:pt-[82px]"
      >
        {/* max-w equivalent via w-[min(1376px,...)], centered (mx-auto):
            1376 = confirmed 1440px design width (get_metadata, node
            627:49704) minus the 32px rail on each side. Below that width
            the min() falls through to the fluid calc(100%-4rem) term —
            this stops the CONTENT (not the grey background, which stays on
            the outer wrapper and fills the full width regardless) from
            growing past its real design size once the viewport exceeds
            it, with mx-auto keeping it centered rather than pinned to
            either rail. */}
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
        {/* lg:-mx-8 cancels <main>'s own lg:px-8 — the hero needs to reach
            the white perimeter (LeftRail/RightRail, PerimeterFrame.tsx),
            not just <main>'s already-inset content column that every other
            section stops at. main's box is already capped at the rails'
            inner edge (lg:w-[min(1376px,...)] = 1440 design width minus
            the 32px rail on each side, per the comment on <main> above),
            so pulling out by exactly its own horizontal padding lands the
            hero flush against that edge without overlapping the rails
            themselves. lg-only: below that width there's no rail/perimeter
            chrome to reach, so mobile keeps the ordinary px-6 inset. */}
        <section id="hero" className="flex flex-col lg:-mx-8 lg:flex-row lg:items-stretch lg:-mt-10">
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
            <div className="relative mt-3 w-[78%] max-w-[300px]">
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
            {/* Percentage pitch, not px: a fixed-px repeating-gradient tiles
                from the box's origin and simply gets cut off wherever the
                box's actual size isn't a whole multiple of that px value —
                every real render left a visibly narrower partial column at
                the right edge and a partial row at the bottom, since this
                box's size is fluid (40% of the row, organic panel height),
                never an exact multiple of any fixed px. 34 columns × 20
                rows divides both axes exactly (100%/34 and 100%/20), so
                there's always a whole number of cells edge to edge with no
                remainder — chosen to land close to the previous ~16px
                density at the 1440 anchor width (550×322px ≈ 16.2px
                cells) while staying near-square (not just non-clipped)
                across the lg range; re-measure both if the column split
                (currently 40%) or the row-vs-dark-block split (55/45)
                ever change, since those drive this box's own aspect. */}
            <div
              aria-hidden
              className="flex-[55_1_0%] bg-white"
              style={{
                backgroundImage: [
                  "repeating-linear-gradient(to right, var(--accent) 0 1px, transparent 1px calc(100% / 34))",
                  "repeating-linear-gradient(to bottom, var(--accent) 0 1px, transparent 1px calc(100% / 20))",
                ].join(","),
              }}
            />
            <div className="flex flex-[45_1_0%] items-center justify-center bg-ink">
              <span className={HERO_LABEL_CLASS}>Portfolio 2026</span>
            </div>
          </div>
        </section>

        {/* 01 — Recent Work. No border-t: the hero grid's bottom rule sits
            directly above it and already divides the two. */}
        <section id="work" className="sec py-12">
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
                  <div
                    className="product-media relative isolate w-full overflow-hidden rounded-[4px] bg-bg"
                    style={{ aspectRatio: "714 / 402" }}
                  >
                    {/* Texture · Figma frame 26:2683, the hand-exported SVG
                        used as-is (Dev Mode MCP guest access blocks
                        inspect/export), multiply-blended against the page
                        grey exactly as the frame sits on the Figma canvas —
                        the ground here has to be --bg, not white (multiply
                        over white is an identity and left it far too
                        bright). The export carries a few stray colored
                        pixels at two corners (Figma's selection handles,
                        visible in the source screenshot too) and a ~2px
                        fade from its blur filter, all within the outer
                        ~2.5%, so it's scaled 6% and the overflow-hidden
                        parent crops them off. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/case-study-texture.svg"
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute inset-0 h-full w-full scale-[1.06] mix-blend-multiply"
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

                return (
                  <article
                    key={project.company + project.title}
                    className="grid gap-6 lg:grid-cols-[minmax(0,392px)_minmax(0,1fr)]"
                  >
                    {/* Project Info · 177:111987 */}
                    <div className="flex flex-col gap-5 lg:pt-3">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <p className="t-label text-ink-2">{project.company}</p>
                          <h3 className="display t-title">
                            {project.title}
                          </h3>
                        </div>
                        <p className="t-body max-w-[375px] text-ink-2">
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
                          className="t-link group inline-flex items-center gap-1.5 self-start"
                        >
                          Project preview
                          <ArrowIcon className="text-current transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ) : (
                        <span className="t-link self-start text-muted">
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
                      <div className="overflow-hidden rounded-[4px]">
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
                        <div className="flex flex-wrap items-center justify-center gap-2.5 bg-bg pb-0 pl-5 pr-1 pt-4">
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
                              <span className="t-meta-sm whitespace-nowrap">
                                {skill}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 02 — additional work · 499:55119 — deliberately lighter than the
            primary case studies: headline + intro on the left, a carousel
            list on the right. No images, label only, no case-study link.
            Its own numbered section per Figma, not folded into Recent Work. */}
        <section id="additional-work" className="sec border-t border-line py-12">
          <SectionRail />
          <SectionNumber number="02" label="Additional work" />
          <div>
            {/* 499:55129 — small label above the headline. Distinct wording
                from the h3 below it ("A little bit more" vs. "Additional
                work") — previously both said "Additional work", the exact
                redundant-eyebrow pattern flagged in review. */}
            <h2 className="t-section-title">A little bit more</h2>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,392px)_minmax(0,1fr)]">
              <div className="flex flex-col gap-4">
                <h3 className="display text-[clamp(1.75rem,3.4vw,2.5rem)]">
                  Additional work
                </h3>
                <p className="t-body max-w-[343px] text-ink-2">
                  {additionalWorkIntro}
                </p>
              </div>

              <div className="flex flex-col gap-12">
                {additionalWork.map((item) => {
                  const isDone = Boolean(item.href) && !item.draft;

                  const content = (
                    <>
                      {/* company | title on one label line, trailing arrow —
                          shared ArrowIcon, same style as the case-study
                          "Back" link (rotated the other way). */}
                      <p className="t-label inline-flex items-center gap-2.5 text-ink-2">
                        <span>
                          {item.company}
                          <span aria-hidden className="px-2 font-normal text-muted">
                            |
                          </span>
                          {item.title}
                        </span>
                        <ArrowIcon
                          className={`text-ink-2${
                            isDone
                              ? " transition-transform group-hover:translate-x-0.5"
                              : ""
                          }`}
                        />
                      </p>
                      <p className="t-body max-w-[581px] text-muted">
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

        {/* 03 — Experience */}
        <section
          id="experience"
          className="sec border-t border-line py-12"
        >
          <SectionRail />
          <SectionNumber number="03" label="Career history" />
          <div>
            {/* 177:112118 — label line. Distinct wording from the h2 below
                it ("Where I've been" vs. "Career history") — previously
                both said "Career history", the same redundant-eyebrow
                pattern as Additional Work above. */}
            <p className="t-section-title">Where I&apos;ve been</p>
            {/* 177:112121 — Playfair headline */}
            <h2 className="display text-[clamp(2rem,4vw,2.5rem)]">
              Career history
            </h2>
            <div className="mt-8">
              <Experience roles={roles} />
            </div>
          </div>
        </section>

        {/* 04 — Personal inspo */}
        <section id="interests" className="sec border-t border-line py-12">
          <SectionRail />
          <SectionNumber number="04" label="Personal inspo" />
          {/* min-w-0 lets this grid item shrink to the column instead of being
              propped open by content; the ScrollStrip inside clips its own
              overflow. */}
          <div className="min-w-0">
            {/* Accent section eyebrow, same as every other section header. */}
            <p className="t-section-title">Personal inspo</p>
            <p className="t-body mt-4 max-w-[720px] text-muted">
              Personal list of things that I love, dive deep into, and get
              inspiration from
            </p>
            <div className="mt-8">
              <InterestGallery />
            </div>
          </div>
        </section>

        {/* 05 — Contact */}
        <section id="contact" className="sec border-t border-line py-12">
          <SectionRail />
          <SectionNumber number="05" label="Contact" />
          {/* The email address is the headline. */}
          <div>
            <p className="t-section-title" style={{ marginBottom: "0.75rem" }}>
              We should probably chat, right?
            </p>
            <h2 className="display text-[clamp(2rem,4vw,2.5rem)] break-words">
              <a
                href={`mailto:${contact.email}`}
                className="transition-colors hover:text-accent"
              >
                {contact.email}
              </a>
            </h2>

            <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm tracking-wide text-ink-2">
              <a
                href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                className="t-mark transition-colors hover:text-accent"
              >
                {contact.phone}
              </a>
              <span aria-hidden className="text-line">
                |
              </span>
              <a
                href={contact.resume}
                target="_blank"
                rel="noreferrer"
                className="t-mark transition-colors hover:text-accent"
              >
                Resume
              </a>
              <span aria-hidden className="text-line">
                |
              </span>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="t-mark transition-colors hover:text-accent"
              >
                LinkedIn
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto border-t border-line px-6 py-10 lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:pb-16">
        {/* lg:pb-16 (64px): the fixed BottomBand (32px tall, position:fixed
            so it doesn't occupy document flow) overlays the page's last
            32px of padding rather than pushing content up above it — the
            previous lg:pb-8 (32px) was entirely hidden underneath the
            band, leaving 0px of actual visible clearance (confirmed via
            direct measurement: text bottom and band top were flush, gap
            0). 64px = 32px to clear the band + 32px of real breathing
            room above it, per direct correction. */}
        <p className="flex flex-wrap items-center justify-end gap-1.5 text-sm leading-[1.125rem] text-ink-2 [font-family:var(--font-display)]">
          Built &amp; designed using Claude Code in Brooklyn, New York
          <span aria-hidden className="text-xs">
            🕺
          </span>
          <span aria-hidden className="text-xs">
            🪩
          </span>
          <span aria-hidden className="text-xs">
            🤦‍♂️
          </span>
        </p>
      </footer>
    </div>
  );
}
