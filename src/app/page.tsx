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
        {/* Scaling strategy: below 1024px this is a normal stacked flow
            layout (Figma has no small-viewport frame, so that treatment is
            my own call). From 1024px up, every child below is positioned
            with absolute pixel coordinates lifted straight from Figma's
            1328×426.857 frame — there's no sensible way to "reflow" that,
            so instead of jumping straight to full size at some arbitrary
            width, the whole fixed layout is scaled down as one rigid unit
            to fit anything from 1024px up to the frame's true 1328px, and
            only reaches scale 1 (full size) once the content box is that
            wide. That's what `hero-scale` is doing.

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
          className="relative hero:[--hero-scale:min(1,calc(100cqi/1328px))] hero:[height:calc(434px*var(--hero-scale))]"
        >
          {/* The fixed-size "canvas": Figma's exact 1328×434 box, scaled
              down by --hero-scale (1 at full size, shrinking down to 1024px)
              rather than resized — a transform keeps every child's absolute
              coordinate correct relative to every other one, which resizing
              the box itself wouldn't. Below 1024px this is a plain static
              div (no absolute/transform), so it's a no-op wrapper around the
              normal stacked flow. */}
          <div className="hero:absolute hero:left-0 hero:top-0 hero:h-[434px] hero:w-[1328px] hero:origin-top-left hero:[transform:scale(var(--hero-scale))]">
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

            {/* Below 1024px the portrait and the three text layers stack in
                normal flow, centered (spacing between them is a first pass —
                revisit once there's real content); at and above it, each
                takes its Figma coordinate inside the 434px body (now reached
                via the scale wrapper above rather than directly by the
                viewport). */}
            <div className="relative flex flex-col items-center gap-6 py-10 text-center hero:block hero:py-0 hero:text-left">
            {/* Portrait · 685:67539 — 274×366, left is 116.5 (raw Figma,
                never rule-derived, so the new grid doesn't touch it — this
                frame moved the whole lockup right by ~2 rules from the
                previous one's 55). Its top IS rule-derived: the hard crop
                edge at the bottom lands on the same rule as the subhead's
                baseline (31 × 12 = 372, unchanged from before), so
                top = 372 − 366 = 6, also unchanged. */}
            {/* Sub-hero size is fluid rather than a `sm:` step: a built-in
                breakpoint would override `hero:` on the same property (see
                --breakpoint-hero in globals.css). */}
            <span className="relative block aspect-[274/366] w-[clamp(143px,18vw,274px)] overflow-hidden hero:absolute hero:left-[116.5px] hero:top-[6px] hero:h-[366px] hero:w-[274px]">
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
                this declaratively. */}

            {/* Eyebrow · 685:67538 — 45.657/68.587 SemiBold #ef5c2d, font
                unchanged from the previous frame. top = 105.5 (unchanged).
                left = 434 − 3.46 = 430.54. */}
            <p className="font-semibold text-accent [font-family:var(--font-display)] text-[clamp(1.5rem,4vw,2.85rem)] leading-[1.25] hero:absolute hero:left-[430.54px] hero:top-[105.5px] hero:whitespace-nowrap hero:text-[45.657px] hero:leading-[68.587px]">
              Hello and welcome
            </p>

            {/* Headline · 685:67537 — 181.671/166.573 Bold #4f3f3b,
                letter-spacing −1.8167px (that's the same −0.01em ratio as
                before, still has to override .display's −0.02em). Smaller
                than the previous frame's 217.62/199.534/−2.1762 — same
                relative treatment, uniformly scaled down ~0.8347×.
                top = 341 − 145 = 196. left = 434 − 13.4 = 420.6. */}
            <h1 className="display text-[clamp(2.5rem,9vw,6.7rem)] leading-[0.92] hero:absolute hero:left-[420.6px] hero:top-[196px] hero:whitespace-nowrap hero:text-[181.671px] hero:leading-[166.573px] hero:tracking-[-1.8167px]">
              I’m Marc
            </h1>

            {/* Subhead · 685:67540 — 31.14/41.521 Regular #444440, font
                unchanged from the previous frame. Placeholder copy, left
                as-is. top = 341 (unchanged). left = 434 − 2.49 = 431.51. */}
            <p className="text-ink-2 [font-family:var(--font-display)] text-[clamp(1rem,2.2vw,1.35rem)] leading-[1.35] hero:absolute hero:left-[431.51px] hero:top-[341px] hero:whitespace-nowrap hero:text-[31.14px] hero:leading-[41.521px]">
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
                  // Neutral card, per Figma 643:52558/643:52618: a 711×402
                  // #eaeae5 card (border #d2d2d2, top corners radius 4)
                  // with the device mockup inset at that row's own
                  // confirmed box — Yahoo/Headspace and Airbnb aren't the
                  // same size/shape in Figma, so each carries its own
                  // `inset` rather than sharing one (a shared box left the
                  // code-drawn shadow tracing a rectangle that didn't
                  // match Airbnb's actual mockup bounds).
                  <div
                    className="relative w-full overflow-hidden rounded-t-[4px] border-l border-r border-t border-[#d2d2d2] bg-[#eaeae5]"
                    style={{ aspectRatio: "711 / 402" }}
                  >
                    <div
                      className={
                        project.image.bezel
                          ? "absolute overflow-hidden rounded-[12px] border-8 border-[#4f453b]"
                          : // Asset already has its own border baked in
                            // (Figma export, 643:52702) — inset only, no
                            // second code-drawn border.
                            "absolute overflow-hidden rounded-[12px]"
                      }
                      style={{
                        inset: project.image.inset,
                        // Drop shadow, read from Figma's own effect values
                        // (SVG filter for 643:52558/643:52618's screenshot
                        // frame; box-shadow for Airbnb's 643:52702) — kept
                        // in code rather than baked into the asset so it
                        // isn't clipped by the inset/overflow treatment.
                        boxShadow: project.image.bezel
                          ? "19px 25px 26px 0px rgba(0,0,0,0.25)"
                          : "19px 14px 46px 0px rgba(0,0,0,0.25)",
                      }}
                    >
                      <Image
                        src={project.image.src}
                        alt={project.image.alt}
                        width={project.image.width}
                        height={project.image.height}
                        className={
                          project.image.bezel
                            ? "h-full w-full object-cover"
                            : // object-contain: the asset's aspect ratio
                              // matches this inset box almost exactly, but
                              // contain guards against 1px rounding so the
                              // baked-in border never gets clipped.
                              "h-full w-full object-contain"
                        }
                      />
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

      <footer className="mx-auto border-t border-line px-6 py-10 lg:w-[min(1376px,calc(100%-4rem))] lg:px-8 lg:pb-8">
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
