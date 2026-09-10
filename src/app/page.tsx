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
            the min() falls through to the fluid calc(100%-4rem) term
            (unchanged, still shrinks with --hero-scale as before) — this
            stops the CONTENT (not the grey background, which stays on
            the outer wrapper and fills the full width regardless) from
            growing past its real design size once the viewport exceeds
            it, with mx-auto keeping it centered rather than pinned to
            either rail. */}
        {/* Hero · 627:46433 (supersedes the earlier 540:112651 spec — Figma
            revised this frame to a denser grid). Figma's box is 1312×468,
            built as a mosaic of 30px #e4e4df tiles on a #b0b0b0 background
            with a 1px flex gap — the gap is the "grid line", still the same
            --line color as before, just drawn as negative space instead of
            a stroke. Tile + gap = 31px pitch, confirmed exact on both axes
            (get_metadata's row/column coordinates land on exact multiples
            of 31, no fractional drift this time).

            Per spec this update is density- and radius-only: the box's own
            outer width/height stay whatever this content box renders at
            full size (1328×426.857, see the scale wrapper below for how
            that survives narrower screens) rather than being re-derived to
            tile the new pitch evenly — so the grid closes on a partial cell
            at the right/bottom edges, same as it would in Figma at a
            non-multiple width.

            The corner radius is 8px, confirmed via the corner tile's own
            `rounded-tl-[8px]` in Figma's source and cross-checked against a
            screenshot showing all four corners rounded — applied here via
            `overflow-hidden rounded-[8px]` on this background layer.

            The perimeter is a real `border`, not the old "closing rule"
            background layers. Those were two flat linear-gradients pinned
            to the right/bottom edges to fake a border without the `border`
            property — fine on square corners, but a straight painted line
            doesn't know about the corner radius, so it got clipped off
            partway through the arc instead of curving with it, reading as
            a chopped-off corner. An actual CSS border is drawn together
            with border-radius and always follows the curve correctly, so
            it replaces those two layers (the two repeating gradients stay,
            for the internal grid lines only). */}
        {/* Scaling strategy: every child below is positioned with absolute
            pixel coordinates lifted straight from Figma's 1328×426.857
            frame — there's no sensible way to "reflow" that, so instead of
            jumping straight to full size at some arbitrary width, the whole
            fixed layout is scaled down as one rigid unit at every viewport
            width, down to the smallest phone, and only reaches scale 1
            (full size) once the content box hits the frame's true 1328px.
            That's what `hero-scale` is doing — running it unconditionally
            (rather than only above some breakpoint, as it used to) keeps
            the headline's ink width and the 31px grid pitch shrinking
            together, so glyphs stay grid-locked at every size instead of
            only on desktop.

            `--hero-scale` reads `100cqi` — the available content-box inline
            size — rather than assuming a fixed viewport-minus-padding
            formula, via `[container-type:inline-size]` on `<main>` above.
            Querying the real rendered width instead of guessing at it means
            this keeps working if the surrounding padding/max-width ever
            changes, without a second number to keep in sync.

            The container lives on `<main>`, not on this section: a query
            container's own box is excluded from its own cqi (only
            descendants can use it) — putting it here instead made `#hero`'s
            *width*-derived transform resolve fine (its width comes from a
            child, a true descendant) but its own *height* rule silently
            fell back to some other containing block and came out wrong.

            Box height is 434 (14 × 31), not the content's incidental
            426.857 — that number was inherited from the OLD grid's row
            count (9 × 47.428571) and left an unfinished 14th row (~22px)
            sliced off at the bottom. 14 full rows is the nearest whole
            multiple of 31 to the old height, so it grows the box by only
            ~7px rather than resizing it to Figma's own 468 (15 rows), which
            would've shifted everything below the hero more than this
            content actually needed. */}
        <section
          id="hero"
          className="relative [--hero-scale:min(1,calc(100cqi/1328px))] [height:calc(434px*var(--hero-scale))]"
        >
          {/* The fixed-size "canvas": Figma's exact 1328×434 box, scaled
              down by --hero-scale (1 at full size, continuing to shrink all
              the way to mobile widths) rather than resized — a transform
              keeps every child's absolute coordinate correct relative to
              every other one, which resizing the box itself wouldn't. This
              scaling now runs unconditionally (no `hero:` gate) so the
              headline stays locked to the grid at every width — the ink
              width of a glyph and the 31px grid pitch shrink by the same
              factor together. */}
          <div className="absolute left-0 top-0 h-[434px] w-[1328px] origin-top-left [transform:scale(var(--hero-scale))]">
            {/* Background grid · 627:46434/46435-47051 (15 rows × 42 cols of
                30px tiles). Reproduced as a painted layer rather than actual
                tiles — same repeating-linear-gradient technique as before,
                just at the new 31px pitch. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[8px] border border-line"
              style={{
                backgroundImage: [
                  "repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px 31px)",
                  "repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px 31px)",
                ].join(","),
              }}
            />

            {/* Every child takes its Figma coordinate inside the 434px body,
                reached via the scale wrapper above rather than directly by
                the viewport — this now applies at all widths. */}
            <div className="relative block">
            {/* Portrait · 685:67539 — 274×366, left is 116.5 (raw Figma,
                never rule-derived, so the new grid doesn't touch it — this
                frame moved the whole lockup right by ~2 rules from the
                previous one's 55). Its top IS rule-derived: the hard crop
                edge at the bottom lands on the same rule as the subhead's
                baseline (31 × 12 = 372, unchanged from before), so
                top = 372 − 366 = 6, also unchanged. */}
            <span className="absolute left-[116.5px] top-[6px] block h-[366px] w-[274px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marc/hero-illustration.png"
                alt="Illustrated portrait of Marc Favro"
                className="absolute left-[-12.95%] top-[0.26%] h-[99.48%] w-[132.49%] max-w-none"
              />
            </span>

            {/* The three text layers are aligned by their INK, not their
                boxes. This frame (685:66888) shrinks only the headline —
                eyebrow and subhead are byte-for-byte the same font-size/
                leading/color as the previous frame — and shifts the whole
                lockup (portrait included) right by ~2 grid rows. So:

                Eyebrow and subhead keep their EXACT old baseline rule and
                top (unchanged font ⇒ unchanged baseline-offset-from-top ⇒
                no reason for top to move). Headline's font shrunk
                (217.62→181.671 / 199.534→166.573 / −2.1762→−1.8167px, all
                the same ~0.8347 ratio — it's a uniform scale-down, not a
                new treatment), so its baseline-offset-from-top shrinks too;
                re-measured live the same way as before (a zero-size
                vertical-align:baseline probe) rather than trusting the
                ratio, since the fallback stack's metrics don't necessarily
                scale identically: 145px (was 173.5). Left ink bearing
                re-measured the same way: 13.4px (was 16.05).

                Horizontal: all three ink-align to rule 14 (31 × 14 = 434,
                was rule 12/372) — this frame's raw Figma x's (424–432)
                cluster tightly around it, and the +2-row shift matches the
                portrait's own move almost exactly (61.5px raw ≈ 2 × 31).
                Each `left` is 434 − that element's bearing.

                Vertical: eyebrow stays on rule 5 (155, top 105.5, unchanged).
                Headline stays on rule 11 (341) — SAME rule as before, only
                its offset changed, confirmed by this frame's raw box
                bottom (169 + 167 = 336) landing close to it; top =
                341 − 145 = 196. Subhead stays on rule 12 (372, top 341,
                unchanged) — this frame's raw y (342) lands almost exactly
                on it once you add its own 31px offset back (342 + 31 ≈
                372), so nothing here moved either.

                Re-measure both probes if the font file is ever updated;
                CSS has no ink-edge or baseline alignment primitive to do
                this declaratively.

                CORRECTION (supersedes the "corrected via canvas pixel scan"
                pass below the old values had): that pass was wrong. It
                pixel-scanned a fillText() render at a low alpha threshold,
                which overshoots the true ink edge by a few px of
                antialiasing fuzz, and it misattributed the resulting gap to
                DOM Range under-measuring. Re-verified with
                CanvasRenderingContext2D.measureText(char).actualBoundingBoxLeft
                (the spec-correct ink-edge metric, no rasterization/alpha
                threshold involved) at each element's own computed font: the
                true left bearings are 3.46 / 13.4 / 2.49 (eyebrow/headline/
                subhead) — exactly the ORIGINAL uncorrected figures above,
                not the "corrected" 9.81 / 6.93 / 8.8 that had been baked
                into the `left` values. Confirmed visually too: an absolutely
                positioned 31px-wide marker painted at x=434 inside the same
                scaled wrapper sits flush against each glyph's ink only at
                the original bearings — the "corrected" values shift all
                three ~6px right of rule 14. */}

            {/* Eyebrow · 685:67538 — 45.657/68.587 SemiBold #ef5c2d, font
                unchanged from the previous frame. top = 105.5 (unchanged).
                left = 434 − actualBoundingBoxLeft(−3.46) = 437.46. */}
            <p className="absolute left-[430.54px] top-[74.5px] font-semibold text-accent [font-family:var(--font-display)] whitespace-nowrap text-[45.657px] leading-[68.587px]">
              Hello and welcome
            </p>

            {/* Headline · 685:67537 — 181.671/166.573 Bold #4f3f3b,
                letter-spacing −1.8167px (that’s the same −0.01em ratio as
                before, still has to override .display’s −0.02em). Smaller
                than the previous frame’s 217.62/199.534/−2.1762 — same
                relative treatment, uniformly scaled down ~0.8347×.
                top = 134 (moved up one grid row). left = 420.6. */}
            <h1 className="display absolute left-[420.6px] top-[134px] whitespace-nowrap text-[200px] leading-[183.2px] tracking-[-1.8167px]">
              I’m Marc
            </h1>

            {/* Subhead · 685:67540 — 31.14/41.521 Regular #444440, font
                unchanged from the previous frame. Placeholder copy, left
                as-is. top = 310. left = 431.51. */}
            <p className="absolute left-[431.51px] top-[310px] text-ink-2 [font-family:var(--font-display)] whitespace-nowrap text-[31.14px] leading-[41.521px]">
              Lorem ipsum dolor sit amet consect
            </p>
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
                  // Two-layer structure, both tiers' numbers pulled
                  // directly from Figma (784:121621/791:129913/784:121479)
                  // via two guide rectangles the design added to each node
                  // (get_design_context) plus the real DROP_SHADOW effect
                  // on each "Mask group" layer (read via the Plugin API,
                  // node.effects — not visible in the get_design_context
                  // hint output, so it has to be read directly).
                  //
                  // Outer = the red guide frame: 714×404, the total space
                  // Figma allots per card including shadow bleed. No
                  // overflow-hidden here — the shadow needs room to render
                  // inside these bounds, not get clipped at them.
                  //
                  // Inner = the green guide frame: 520×302 positioned at
                  // (94, 49) within the outer 714×404 — i.e. inset
                  // 12.13% top / 14.01% right / 13.12% bottom / 13.17% left,
                  // identical on all three nodes. This carries the exact
                  // Figma shadow (offset 19/14, blur 46, spread 0,
                  // rgba(0,0,0,0.24)) and, one level deeper, the
                  // overflow-hidden crop for the image — kept separate from
                  // the shadow layer so clipping the image never clips the
                  // shadow with it (the earlier bug).
                  <div
                    className="relative w-full rounded-t-[4px] border-l border-r border-t border-[#d2d2d2] bg-[#eaeae5]"
                    style={{ aspectRatio: "714 / 404" }}
                  >
                    <div
                      className="absolute inset-[12.13%_14.01%_13.12%_13.17%]"
                      style={{ boxShadow: "19px 14px 46px 0px rgba(0,0,0,0.24)" }}
                    >
                      {/* object-cover, not contain: measured via
                          getBoundingClientRect that this crop box and its
                          shadow-layer parent are pixel-identical (no drift
                          between those two) — the visible line at the
                          bottom edge was object-contain letterboxing,
                          since none of the exported assets' aspect ratios
                          exactly match this box's own (~1.726 vs
                          1.746–1.755), leaving a thin gap where the
                          (transparent) crop layer showed the outer card's
                          background through. cover guarantees full
                          coverage on every edge by definition — no aspect
                          match required — at the cost of cropping a
                          negligible sliver (~1–2%) off the mockup's own
                          edges, which already carry their own margin.

                          No rounded-[12px] here: the exported asset's own
                          bezel corners are already baked in at that exact
                          radius (verified pixel-for-pixel symmetric on all
                          four corners). A second CSS radius on this
                          wrapper doesn't align with the image's own arc
                          once object-cover rescales it to the display
                          size — two independently-computed roundings at
                          slightly different effective radii, landing a
                          pixel or two apart and showing as a seam/notch at
                          each corner. overflow-hidden stays only as a
                          plain rectangular safety clip. */}
                      <div className="h-full w-full overflow-hidden">
                        <Image
                          src={project.image.src}
                          alt={project.image.alt}
                          width={project.image.width}
                          height={project.image.height}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
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

                      {/* Link · 177:111993 — text + icon, no pill */}
                      {isLinked ? (
                        <Link
                          href={project.href!}
                          className="t-link group inline-flex items-center gap-1.5 self-start"
                        >
                          Case study
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/diagonal-right-up.svg"
                            alt=""
                            width={11}
                            height={11}
                            className="block h-[11px] w-[11px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
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
                          corners instead of rounding each piece separately. */}
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

        {/* 02 — Additional Work · 499:55119 — deliberately lighter than the
            primary case studies: headline + intro on the left, a carousel
            list on the right. No images, label only, no case-study link.
            Its own numbered section per Figma, not folded into Recent Work. */}
        <section id="additional-work" className="sec border-t border-line py-12">
          <SectionRail />
          <SectionNumber number="02" label="Additional work" />
          <div>
            {/* 499:55129 — small label above the headline, same pattern as
                every other section (was missing here, which is why the
                number never lined up with anything). */}
            <h2 className="t-section-title">Additional work</h2>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,392px)_minmax(0,1fr)]">
              <div className="flex flex-col gap-4">
                <h3 className="display text-[clamp(1.75rem,3.4vw,2.5rem)]">
                  Additional Work
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
          <SectionNumber number="03" label="Experience" />
          <div>
            {/* 177:112118 — label line. Figma's copy here is the placeholder
                "LABEL TITLE"; this wording is mine, swap it freely. */}
            <p className="t-section-title">Career history</p>
            {/* 177:112121 — Playfair headline */}
            <h2 className="display text-[clamp(2rem,4vw,2.5rem)]">
              Experience
            </h2>
            <div className="mt-8">
              <Experience roles={roles} />
            </div>
          </div>
        </section>

        {/* 04 — Personal Interests */}
        <section id="interests" className="sec border-t border-line py-12">
          <SectionRail />
          <SectionNumber number="04" label="Interests" />
          <div>
            <p className="t-section-title">Personal interests</p>
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
            <p className="t-section-title">
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
