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
        {/* Hero — per 499:54498. Figma leaves this unnumbered (numbering
            starts at Recent Work, 01), and sets it as a single continuous
            headline with the portrait absolutely positioned inside it,
            overlapping "Marc" and "I'm" — not a label + two-line title +
            side-by-side portrait. */}
        <section id="hero" className="pb-8 pt-2 lg:pt-6">
          <h1 className="display text-[clamp(1.75rem,3.5vw,3.25rem)] leading-[1.35] sm:leading-[1.15] lg:leading-[1.05]">
            Welcome, I&apos;m Marc
            {/* Portrait — cropped the same way as the Figma source
                (132.49% width, offset -12.95%/0.26%) so it fills the frame
                without distortion. The outer span is an inline-block "slot"
                sized to the crop box, sitting in the text flow; the image
                is absolutely positioned inside it so it interrupts the
                headline rather than flowing with it. Tight margin (2px) —
                Figma butts the image almost directly against the text.
                Below lg it's a fixed fallback size; at lg+ its width scales
                continuously with the same vw rate as the headline (not a
                fixed size at the lg breakpoint) — a fixed size only stayed
                in proportion at the one viewport width it was tuned for and
                wrapped the headline to 3 lines at any other width. */}
            <span className="relative mx-0.5 inline-block h-[168px] w-[126px] shrink-0 align-middle sm:h-[240px] sm:w-[180px] lg:h-auto lg:w-[clamp(11.5rem,18vw,16.75rem)] lg:aspect-[268/357]">
              <span className="absolute inset-0 overflow-hidden rounded-[4px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marc/hero-illustration.png"
                  alt="Illustrated portrait of Marc Favro"
                  className="absolute left-[-12.95%] top-[0.26%] h-[99.48%] w-[132.49%] max-w-none"
                />
              </span>
            </span>
            I&apos;m a Product Designer
          </h1>
          <p className="ml-auto mt-4 max-w-sm text-right text-sm leading-[32px] text-ink-2 [font-family:var(--font-display)]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </section>

        {/* 01 — Recent Work */}
        <section id="work" className="sec border-t border-line py-12">
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

                        <div className="flex flex-wrap items-center justify-end gap-2.5 bg-bg pb-0 pl-5 pr-1 pt-4 text-xs leading-5 [font-family:var(--font-alt)]">
                          {project.skills.map((skill, i) => (
                            <span key={skill} className="flex items-center gap-2.5">
                              {i > 0 ? (
                                <span aria-hidden="true" className="text-accent">
                                  •
                                </span>
                              ) : null}
                              <span className="whitespace-nowrap font-normal text-muted">
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
