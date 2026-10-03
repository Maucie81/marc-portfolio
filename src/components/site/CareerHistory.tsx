import { Fragment } from "react";
import RevealLines from "@/components/site/motion/RevealLines";
import type { Role } from "@/lib/home";
import { MOTION, rvGroup } from "@/lib/motion";

/**
 * 04 Career history + Skills & Specializations · Figma 247:272775.
 * Compact provenance, not a résumé: company / title / dates in 220px
 * columns (56px apart, rows 36px apart), each marked by a numbered accent
 * dot; then the skills set in the Figma's four lines with accent "•"
 * dividers, 70px below.
 *
 * Motion: the heading sets as a masked line; each role fades up 8px as it
 * scrolls in (70ms apart when they arrive together), and the skills follow
 * a row at a time, 40ms apart, with only a 4px lift.
 */
export default function CareerHistory({
  roles,
  skills,
}: {
  roles: Role[];
  skills: string[][];
}) {
  return (
    <>
      <RevealLines
        as="h2"
        id="experience-title"
        className="text-[20px] font-bold tracking-[-0.01em] text-ink-deep"
        lines={["Career history"]}
        dur={MOTION.standard}
        trigger
      />

      <ol
        data-reveal-group
        style={rvGroup(70)}
        className="mt-[60px] grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-14 gap-y-9 lg:grid-cols-[repeat(3,220px)]"
      >
        {roles.map((role, i) => (
          <li key={role.company} data-reveal="view" className="rv-rise flex gap-2">
            {/* Ellipse 623 — 12px accent dot with the row number in white
                9px; the list's own numbering carries it for assistive
                tech. */}
            <span
              aria-hidden
              className="mt-[3px] flex size-3 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] leading-none text-white"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-[16px] font-semibold leading-6 text-ink-2">{role.company}</p>
              <p className="text-[16px] leading-6 text-ink-2">{role.title}</p>
              <p className="text-[14px] tracking-[-0.01em] text-muted">{role.period}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Indented 20px (the 12px dot + 8px gap) so the skills share the
          company lockups' text edge, per direct request. */}
      <div className="mt-[70px] pl-5">
        <h3 className="text-[16px] font-semibold leading-6 text-ink-2">
          Skills &amp; Specializations
        </h3>
        {/* md+: the designed rows. Phones: one continuous run, so a skill
            fills the line above when it fits; skills stay whole and each
            dot is glued to the skill before it (nbsp), so lines break
            after a dot, never before one. */}
        <div
          role="list"
          data-reveal-group
          style={rvGroup(40, { y: 4 })}
          className="pb-1 pt-2 leading-[30px] md:flex md:flex-col md:gap-1.5 md:leading-normal"
        >
          {skills.map((line, row) => (
            <div
              key={line.join()}
              data-reveal="view"
              className="rv-rise inline md:flex md:flex-wrap md:items-center md:gap-x-1.5"
            >
              {line.map((skill, i) => (
                <Fragment key={skill}>
                  {i > 0 || row > 0 ? (
                    <>
                      <span
                        aria-hidden
                        className={`text-[14px] leading-none text-accent md:w-1.5 md:text-center ${i === 0 ? "md:hidden" : ""}`}
                      >
                        <span className="md:hidden">{"\u00a0"}</span>•
                      </span>{" "}
                    </>
                  ) : null}
                  {/* Whole skills never split, except one too long for a
                      phone line. */}
                  <span
                    role="listitem"
                    className={`text-[16px] leading-6 text-ink-2 ${skill.length > 36 ? "" : "whitespace-nowrap"}`}
                  >
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
