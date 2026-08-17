import Link from "next/link";
import SectionNumber from "@/components/site/SectionNumber";
import SectionRail from "@/components/site/SectionRail";
import Placeholder from "@/components/site/Placeholder";
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
      <header className="mx-auto flex max-w-[88rem] items-center justify-between px-6 pb-3 pt-6 lg:px-10">
        <span className="text-sm font-medium tracking-tight text-ink">
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
      </header>

      <main id="home" className="mx-auto max-w-[88rem] px-6 lg:px-10">
        {/* 01 — Hero */}
        <section id="hero" className="sec pb-12 pt-4">
          <SectionRail />
          <SectionNumber number="01" label="Intro" />
          {/* Name is the small mark; the role is the headline. */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:items-start lg:gap-16">
            <div>
              <p className="t-mark flex items-center gap-3 text-ink">
                <span
                  aria-hidden
                  className="inline-block h-6 w-6 rounded-full bg-accent"
                />
                Marc Favro
              </p>
              <h1 className="display mt-6 text-[clamp(2.5rem,6vw,5.25rem)] text-ink">
                Principal product designer
              </h1>
              {/* 177:111966 — 48px between headline and body copy */}
              <p className="t-body mt-12 max-w-[392px] text-ink-2">
                I design enterprise ecosystems that scale — connecting partners,
                products and people through systems built to last. My work
                centers on partner portals, legacy modernization and the
                organizational dynamics that come with designing for B2B at
                scale.
              </p>
              <p className="t-body mt-5 max-w-[392px] text-muted">
                Research-grounded and cross-functional, working across product,
                engineering and business where the stakes are high and the
                constraints are real.
              </p>
            </div>

            {/* 177:111971 — blank box, nothing beneath it. Needs an explicit
                width: an aspect-ratio-only div has no intrinsic width and
                collapses to 0 when the grid item shrink-wraps. */}
            <div className="w-full lg:justify-self-end">
              <Placeholder ratio="389 / 288" className="w-full" />
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
                  <Placeholder label={project.imageLabel} ratio="798 / 402" />
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
                          <h3 className="display t-title text-ink">
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

                      {/* 177:112000 — three columns, 19px gutter */}
                      <div className="grid gap-[19px] sm:grid-cols-3">
                        {project.subFeatures.map((feature) => (
                          <div key={feature.title} className="flex flex-col gap-1">
                            {/* 177:112002 — DM Sans Medium 14/18 */}
                            <h4 className="text-sm font-medium leading-[18px] text-ink">
                              {feature.title}
                            </h4>
                            {/* 177:112003 — DM Sans Light 14 */}
                            <p className="text-sm font-light leading-normal text-ink">
                              {feature.description}
                            </p>
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
                <h3 className="display text-[clamp(1.75rem,3.4vw,2.75rem)] text-ink">
                  Additional work
                </h3>
                <p className="t-body max-w-[343px] text-ink-2">
                  {additionalWorkIntro}
                </p>
              </div>

              <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2">
                {additionalWork.map((item) => (
                  <div
                    key={item.company + item.title}
                    className="flex flex-col gap-3"
                  >
                    <Placeholder ratio="377 / 190" />
                    {/* 177:112076 — company | title on one label line */}
                    <p className="t-label text-ink">
                      {item.company}
                      <span aria-hidden className="px-2 font-normal text-muted">
                        |
                      </span>
                      {item.title}
                    </p>
                    <p className="t-body text-ink-2">{item.description}</p>
                  </div>
                ))}
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
            <h2 className="display text-[clamp(2rem,4vw,3.25rem)] text-ink">
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
              <h2 className="display text-[clamp(1.75rem,4.6vw,3.75rem)] break-words text-ink">
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
                  className="uppercase transition-colors hover:text-accent"
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
                  className="uppercase transition-colors hover:text-accent"
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
        <p className="text-xs tracking-wide text-muted">
          Built &amp; designed using Claude Code in Brooklyn, New York
        </p>
      </footer>
    </div>
  );
}
