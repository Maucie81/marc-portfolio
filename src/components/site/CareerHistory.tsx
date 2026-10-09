import { Fragment } from "react";
import Link from "next/link";
import type { Role } from "@/lib/home";
import { rv, rvGroup } from "@/lib/motion";

/**
 * 04 Career history + Skills & Specializations · Figma 247:272775.
 * Compact provenance, not a résumé: company / title / dates in 220px
 * columns (56px apart, rows 36px apart), each marked by a numbered accent
 * dot, with small links to that company's case studies under it (any
 * Recent work or Additional work entry that's live); then the skills set in
 * the Figma's rows with accent "•" dividers, 70px below (not on phones).
 *
 * Motion: quieter than Additional work — closer to text becoming visible
 * than entering. The heading only fades; each role fades up 3px over
 * 500ms (100ms apart when they arrive together) once it's properly on
 * screen. The skills fade in as one block, without moving, as soon as they
 * cross the bottom of the screen.
 */
/** Any homepage project — Recent work or Additional work. */
type Work = {
  company: string;
  title: string;
  href: string | null;
  comingSoon?: boolean;
  careerLabel?: string;
};

export default function CareerHistory({
  roles,
  skills,
  work,
}: {
  roles: Role[];
  skills: string[][];
  work: Work[];
}) {
  return (
    <>
      <h2
        id="experience-title"
        data-reveal="view"
        className="phone-cap-trim rv-fade text-[18px] font-bold leading-6 tracking-[-0.01em] text-ink-deep md:text-[20px] md:leading-[1.5]"
        style={rv(0, { dur: 500, ease: "quiet" })}
      >
        Career history
      </h2>

      <ol
        data-reveal-group
        style={rvGroup(100, { y: 3, ease: "quiet" })}
        className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-14 gap-y-7 md:mt-[60px] md:gap-y-9 lg:grid-cols-[repeat(3,220px)]"
      >
        {roles.map((role, i) => {
          const links = work.filter((w) => w.company === role.company && w.href && !w.comingSoon);
          return (
            <li
              key={role.company}
              data-reveal="view"
              className="rv-rise flex gap-2.5 md:gap-2"
              style={rv(0, { dur: 500 })}
            >
              {/* Ellipse 623 — the accent dot (16px, up from the Figma's 12 so
                  the number reads): a plain disc with the number on it. The
                  list's own numbering carries it for assistive tech. */}
              <span
                aria-hidden
                className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold leading-none text-white"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-[16px] font-semibold leading-6 text-ink-2">{role.company}</p>
                <p className="text-[16px] leading-6 text-ink-2">{role.title}</p>
                <p className="text-[14px] tracking-[-0.01em] text-muted">{role.period}</p>
                {/* The company's case studies: plain underlined links a size
                    under the dates, in their grey. Not on phones (Figma
                    330:2645), where Recent work sits just above. */}
                {links.length ? (
                  <ul className="mt-2 hidden flex-col gap-1 text-[13px] leading-5 tracking-[-0.01em] text-muted md:flex">
                    {links.map((w) => (
                      <li key={w.href}>
                        <Link
                          href={w.href!}
                          className="underline decoration-1 underline-offset-[3px] transition-colors hover:text-ink-2"
                        >
                          {w.careerLabel ?? w.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Not on phones (per direct request). Indented 24px (the 16px dot
          + 8px gap) so the skills share the company lockups' text edge,
          per direct request. */}
      <div
        data-reveal="view"
        data-reveal-quiet
        className="rv-fade mt-[70px] hidden pl-6 md:block"
        style={rv(0, { dur: 350, ease: "quiet" })}
      >
        <h3 className="text-[16px] font-semibold leading-6 text-ink-2">
          Skills &amp; Specializations
        </h3>
        {/* The designed rows, an accent "•" between the skills in each. */}
        <div role="list" className="flex flex-col gap-1.5 pb-1 pt-2 leading-normal">
          {skills.map((line) => (
            <div key={line.join()} className="flex flex-wrap items-center gap-x-1.5">
              {line.map((skill, i) => (
                <Fragment key={skill}>
                  {i > 0 ? (
                    <span aria-hidden className="w-2 text-center text-[18px] leading-none text-accent">
                      •
                    </span>
                  ) : null}
                  <span role="listitem" className="whitespace-nowrap text-[16px] leading-6 text-ink-2">
                    {skill}
                  </span>
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
