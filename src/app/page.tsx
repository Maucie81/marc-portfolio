import Link from "next/link";
import SectionNumber from "@/components/site/SectionNumber";
import SectionRail from "@/components/site/SectionRail";
import Placeholder from "@/components/site/Placeholder";
import CompanyLogo from "@/components/site/CompanyLogo";
import Experience from "@/components/site/Experience";
import Interests from "@/components/site/Interests";
import {
  additionalWork,
  additionalWorkIntro,
  contact,
  interestCategories,
  projects,
  roles,
} from "@/lib/home";

export default function Home() {
  return (
    <div className="bg-bg">
      <header className="sticky top-0 z-50 bg-bg">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between px-6 pb-3 pt-6 lg:px-10">
          <span className="flex items-center gap-3 text-sm font-medium tracking-tight text-ink">
            <span
              aria-hidden
              className="inline-block h-6 w-6 rounded-full bg-accent"
            />
            Marc Favro
          </span>
          <nav className="flex gap-8 text-xs leading-[18px] text-ink">
            <a href="#hero" className="transition-colors hover:text-accent">
              Home
            </a>
            <a href="#work" className="transition-colors hover:text-accent">
              Work
            </a>
            <a href="#contact" className="transition-colors hover:text-accent">
              Contact
            </a>
            <a
              href={contact.resume}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-accent"
            >
              Resume
            </a>
          </nav>
        </div>
      </header>

      <main id="home" className="mx-auto max-w-[88rem] px-6 lg:px-10">
        {/* 01 — Hero */}
        <section id="hero" className="sec pb-8">
          {/* Bespoke rail for this section only: dot 1 is pinned to "01"'s
              vertical center (the tall portrait would otherwise pull the
              standard evenly-spaced rail well past it), dot 3 stays at its
              natural bottom position, and dot 2 sits at the exact midpoint
              between them — equal gaps, same as the shared SectionRail. */}
          <div
            aria-hidden
            className="relative hidden w-6 self-stretch py-2 lg:block"
          >
            <span
              className="rail-dot absolute left-1/2 -translate-x-1/2"
              style={{ top: "109px" }}
            />
            <span
              className="rail-dot absolute left-1/2 -translate-x-1/2"
              style={{ top: "237.5px" }}
            />
            <span
              className="rail-dot absolute left-1/2 -translate-x-1/2"
              style={{ top: "366px" }}
            />
          </div>
          <SectionNumber number="01" label="Intro" className="lg:mt-[103.6px]" />
          {/* Name is the small mark; the role is the headline. Eyebrow lives
              in the text column, next to the (taller) portrait, rather than
              spanning full width above it. Row is vertically centered so the
              text lockup sits at the correct Figma position; the "01" marker
              is nudged down to match it instead (see className above). */}
          <div className="-ml-[36px] flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Illustrated portrait — cropped the same way as the Figma
                source (132.49% width, offset -12.95%/0.26%) so it fills the
                frame without distortion. */}
            <div className="relative h-[386px] w-[290px] shrink-0 overflow-hidden rounded-[4px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marc/hero-illustration.png"
                alt="Illustrated portrait of Marc Favro"
                className="absolute left-[-12.95%] top-[0.26%] h-[99.48%] w-[132.49%] max-w-none"
              />
            </div>

            <div className="flex flex-1 flex-col pt-12">
              <p className="pb-2 text-sm font-semibold uppercase tracking-[0.56px] text-accent [font-family:var(--font-alt)]">
                Welcome, I&apos;m Marc
              </p>
              <h1 className="display text-[clamp(2.5rem,6vw,3.75rem)]">
                I&apos;m a Principal
                <br />
                Product Designer
              </h1>
              {/* 16px between headline and body copy — matches the
                  heading-to-body gap used by every other title lockup
                  (Recent Work cards, Additional Work). Kept short on
                  purpose — full background lives in About Me. */}
              <p className="t-body mt-4 max-w-[392px] text-ink-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>
        </section>

        {/* 02 — Recent Work */}
        <section id="work" className="sec border-t border-line py-12">
          <SectionRail />
          <SectionNumber number="02" label="Recent work" />
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
                    className="grid gap-6 lg:grid-cols-[minmax(0,392px)_minmax(0,1fr)] lg:gap-10"
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
                      {isLinked ? (
                        <Link
                          href={project.href!}
                          aria-label={`Open the ${project.title} case study`}
                          className="block rounded-[4px] transition-opacity hover:opacity-90"
                        >
                          {image}
                        </Link>
                      ) : (
                        image
                      )}

                      {/* 177:112000 — four columns, 19px gutter */}
                      <div className="grid gap-[19px] sm:grid-cols-4">
                        {project.meta.map((item) => (
                          <div key={item.label} className="flex flex-col gap-1">
                            {/* Meta Data Label role (Google Sans Flex Medium
                                14/16, muted, uppercase) — same role as the
                                case-study sidebar's group labels. */}
                            <h4 className="cs-label">{item.label}</h4>
                            {/* Matches the Tooling/Category list copy in the
                                Experience section (.t-meta, text-muted). */}
                            <p className="t-meta">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Additional work · 177:112062 — deliberately lighter than the
                primary case studies: headline + intro on the left, a 2x2 grid
                of small cards on the right. Label only, no serif title, no link. */}
            <div className="mt-24 grid gap-6 lg:mt-32 lg:grid-cols-[minmax(0,392px)_minmax(0,1fr)]">
              <div className="flex flex-col gap-4">
                <h3 className="display text-[clamp(1.75rem,3.4vw,2.5rem)]">
                  Additional Work
                </h3>
                <p className="t-body max-w-[343px] text-ink-2">
                  {additionalWorkIntro}
                </p>
              </div>

              <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2">
                {additionalWork.map((item) => {
                  // "Done" = real destination and not a placeholder — gets a
                  // logo cue and becomes clickable. Draft/no-href entries stay
                  // exactly as before: label only, no link (per 177:112062).
                  const isDone = Boolean(item.href) && !item.draft;

                  const content = (
                    <>
                      <div className="relative">
                        <Placeholder ratio="377 / 190" />
                        {isDone ? (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <CompanyLogo
                              company={item.company}
                              className="text-xl md:text-2xl"
                            />
                          </div>
                        ) : null}
                      </div>
                      {/* 177:112076 — company | title on one label line */}
                      <p className="t-label text-ink">
                        {item.company}
                        <span aria-hidden className="px-2 font-normal text-muted">
                          |
                        </span>
                        {item.title}
                      </p>
                      <p className="t-body text-ink-2">{item.description}</p>
                    </>
                  );

                  return isDone ? (
                    <Link
                      key={item.company + item.title}
                      href={item.href!}
                      className="flex flex-col gap-3 transition-opacity hover:opacity-90"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={item.company + item.title}
                      className="flex flex-col gap-3"
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
        <section
          id="interests"
          className="sec border-t border-line py-12"
        >
          <SectionRail />
          <SectionNumber number="04" label="Interests" />
          <div>
            <h2 className="t-section-title">
              Personal interests
            </h2>
            <div>
              <Interests categories={interestCategories} />
            </div>
          </div>
        </section>

        {/* 05 — Contact */}
        <section id="contact" className="sec border-t border-line py-12">
          <SectionRail />
          <SectionNumber number="05" label="Contact" />
          {/* The email address is the headline. */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:items-stretch lg:gap-16">
            <div>
              <p className="t-section-title">
                We should probably work together, right?
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
                  className="t-mark uppercase transition-colors hover:text-accent"
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
                  className="t-mark uppercase transition-colors hover:text-accent"
                >
                  LinkedIn
                </a>
              </p>
            </div>

            <div className="lg:justify-self-end lg:w-full">
              <Placeholder label="Contact image — to come" ratio="auto" className="h-full w-full" />
            </div>
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
