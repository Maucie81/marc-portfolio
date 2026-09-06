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
          PageTransition's fade — see that component for why. */}
      <main id="home" className="mx-auto max-w-[88rem] px-6 lg:px-10">
        {/* Hero · 540:112651. Figma's frame is 1344×484: a 50px Nav (rendered
            by PersistentHeader) plus a 434px body, anchored to this content
            box, whose left edge is the nav's left edge exactly as Figma
            anchors x=0. Coordinates come from get_metadata on the node.

            The one place this departs from Figma's literal numbers is the
            grid module. Figma's cells are 48 wide × 48.0694 tall — square in
            intent, the .0694 being its own frame-fitting rounding — and 28 ×
            48 = 1344 only tiles evenly because Figma's frame IS 1344. This
            content box is 1328 (max-w-88rem minus px-10), so a literal 48px
            module left a 32px stub column. The module is therefore 1328/28 =
            47.428571px, applied to BOTH axes: 28 × 9 exactly-square cells
            filling the box edge to edge, same cell count as Figma. The body
            height follows from it (9 × 47.428571 = 426.857) rather than
            Figma's 434.

            The fixed-scale composition is gated at min-[1408px] — the width
            at which max-w-[88rem] is fully realised and the box is exactly
            1328. Below that it was previously still applying at `lg`
            (1024px), where the 912px headline overflowed a 1200px box and
            forced a horizontal scrollbar on the whole page. */}
        <section id="hero" className="relative hero:h-[426.857px]">
          {/* Background grid · 540:112665. A painted element, not a layout
              guide: Figma builds it as a #b0b0b0 fill masked by 29 vertical
              and 10 horizontal 1px lines — i.e. 28 columns by 9 rows, closed
              on all four edges. Both repeats are the same 47.428571px, which
              is what makes the cells square. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: [
                "repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px 47.428571px)",
                // Closing rules on the right and bottom edges: each repeat's
                // final line falls exactly ON the edge and is clipped away,
                // so the frame needs both to read as closed.
                "linear-gradient(to left, var(--line) 0 1px, transparent 1px)",
                "repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px 47.428571px)",
                "linear-gradient(to top, var(--line) 0 1px, transparent 1px)",
              ].join(","),
              // No background-position offset. Shifting the horizontal layer
              // down by Figma's 1.375px made the repeating tile wrap, painting
              // a second line at y≈0 — that was the doubled top rule.
            }}
          />

          {/* Registration marks · 540:112714 / :112718 / :112722 / :112726.
              20×20, stroke #666666, centred in the four corner cells:
              47.428571/2 − 10 = 13.714px in from every edge. Figma's own
              14/13/17/15 insets were approximately centred against its 48px
              cells; centring them exactly is the point of the frame. */}
          {[
            "left-[13.714px] top-[13.714px]",
            "right-[13.714px] top-[13.714px]",
            "left-[13.714px] bottom-[13.714px]",
            "right-[13.714px] bottom-[13.714px]",
          ].map((pos) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={pos}
              src="/icons/crosshair.svg"
              alt=""
              aria-hidden
              width={20}
              height={20}
              className={`pointer-events-none absolute size-[20px] ${pos}`}
            />
          ))}

          {/* Below 1408px the portrait and the three text layers stack in
              normal flow (Figma has no small-viewport frame, so that ramp is
              my call); at and above it, each takes its Figma coordinate
              inside the 426.857px body. */}
          <div className="relative flex flex-col gap-6 py-10 hero:block hero:py-0">
            {/* Portrait · 540:112713 — 274×366, Figma's x=64. Same asset and
                the same inner crop offsets, untouched. Its top is 13.429
                rather than Figma's 17 so the illustration's bottom — a hard
                crop edge, unlike the soft hair at the top — lands on rule 8,
                the same rule the subhead's baseline sits on. Figma had those
                two within 2px of each other; this makes them exact. */}
            {/* Sub-hero size is fluid rather than a `sm:` step: a built-in
                breakpoint would override `hero:` on the same property (see
                --breakpoint-hero in globals.css). */}
            <span className="relative block aspect-[274/366] w-[clamp(143px,18vw,274px)] overflow-hidden hero:absolute hero:left-[64px] hero:top-[13.429px] hero:h-[366px] hero:w-[274px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marc/hero-illustration.png"
                alt="Illustrated portrait of Marc Favro"
                className="absolute left-[-12.95%] top-[0.26%] h-[99.48%] w-[132.49%] max-w-none"
              />
            </span>

            {/* The three text layers are aligned by their INK, not their
                boxes — this frame is a gridwork showcase, so the glyphs sit
                on the 8th vertical rule. Figma encodes that as
                `rule − side bearing`, which is why its node x values look
                arbitrary and all differ: 382 (bearing 2) for the eyebrow,
                371 (bearing 13) for the 217px headline, 381.977 (bearing
                2.02) for the subhead, all targeting its rule at 384.
                Two corrections are folded into the values below. The browser
                shapes this font with wider bearings than Figma (3.46 / 16.05
                / 2.49, measured via canvas actualBoundingBoxLeft), and the
                8th rule now sits at 8 × 47.428571 = 379.4286, not 384. So
                each `left` is 379.4286 − the browser's own bearing.

                Vertically the same idea: each `top` is set so the BASELINE
                lands on a horizontal rule, rather than the box floating
                between them with a rule striking through the letters. The
                three baselines sit on rules 3 (142.2857), 7 (332) and 8
                (379.4286) — four rows apart, then one. Tops were derived by
                measuring the rendered baseline with a zero-height
                vertical-align:baseline probe and subtracting the offset;
                font-metric maths disagrees with actual layout often enough
                not to trust it here.

                Re-measure both axes if the font file is ever updated; CSS has
                no ink-edge or baseline alignment primitive to do this
                declaratively. */}

            {/* Eyebrow · 540:112712 — 45.657/68.587 SemiBold #ef5c2d. */}
            <p className="font-semibold text-accent [font-family:var(--font-display)] text-[clamp(1.5rem,4vw,2.85rem)] leading-[1.25] hero:absolute hero:left-[375.97px] hero:top-[92.786px] hero:whitespace-nowrap hero:text-[45.657px] hero:leading-[68.587px]">
              Hello and welcome
            </p>

            {/* Headline · 540:112710 — 217.62/199.534 Bold #4f3f3b,
                letter-spacing −2.1762px (that's −0.01em, so it has to
                override .display's −0.02em). */}
            <h1 className="display text-[clamp(3rem,11vw,8rem)] leading-[0.92] hero:absolute hero:left-[363.38px] hero:top-[158.5px] hero:whitespace-nowrap hero:text-[217.62px] hero:leading-[199.534px] hero:tracking-[-2.1762px]">
              I’m Marc
            </h1>

            {/* Subhead · 540:112711 — 31.14/41.521 Regular #444440.
                Placeholder copy, left as-is. */}
            <p className="text-ink-2 [font-family:var(--font-display)] text-[clamp(1rem,2.2vw,1.35rem)] leading-[1.35] hero:absolute hero:left-[376.94px] hero:top-[348.429px] hero:whitespace-nowrap hero:text-[31.14px] hero:leading-[41.521px]">
              Lorem ipsum dolor sit amet consect
            </p>
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
                const image = (
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
                        <div className="flex flex-wrap items-center justify-end gap-2.5 bg-bg pb-0 pl-5 pr-1 pt-4">
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

      <footer className="mx-auto max-w-[88rem] border-t border-line px-6 py-10 lg:px-10">
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
